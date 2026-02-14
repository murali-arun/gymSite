#!/usr/bin/env node

/**
 * Exercise GIF Downloader Script
 * 
 * Download exercise GIFs from URLs and save them with proper naming
 * 
 * Usage:
 *   node downloadGifs.js
 * 
 * Then follow the prompts or edit the exerciseUrls array below
 */

const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

// ===== CONFIGURATION =====
// Add your GIF URLs here with exercise names
const exerciseUrls = [
  // Example format:
  // { name: 'Bench Press', url: 'https://example.com/bench-press.gif' },
  // { name: 'Squat', url: 'https://example.com/squat.gif' },
  // { name: 'Deadlift', url: 'https://example.com/deadlift.gif' },
  
  // Add your URLs below:
  
];

// Output directory (relative to project root)
const OUTPUT_DIR = path.join(__dirname, '..', '..', 'public', 'exercise-gifs');

// ===== HELPER FUNCTIONS =====

/**
 * Convert exercise name to kebab-case filename
 */
function toKebabCase(str) {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Download a file from URL
 */
function downloadFile(url, filepath) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    
    const file = fs.createWriteStream(filepath);
    
    protocol.get(url, (response) => {
      // Handle redirects
      if (response.statusCode === 301 || response.statusCode === 302) {
        file.close();
        fs.unlinkSync(filepath);
        return downloadFile(response.headers.location, filepath)
          .then(resolve)
          .catch(reject);
      }
      
      if (response.statusCode !== 200) {
        file.close();
        fs.unlinkSync(filepath);
        return reject(new Error(`Failed to download: ${response.statusCode} ${response.statusMessage}`));
      }
      
      response.pipe(file);
      
      file.on('finish', () => {
        file.close();
        resolve();
      });
    }).on('error', (err) => {
      file.close();
      fs.unlinkSync(filepath);
      reject(err);
    });
  });
}

/**
 * Main download function
 */
async function downloadGifs() {
  console.log('🎬 Exercise GIF Downloader\n');
  
  // Ensure output directory exists
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    console.log(`✅ Created directory: ${OUTPUT_DIR}\n`);
  }
  
  if (exerciseUrls.length === 0) {
    console.log('⚠️  No URLs configured!');
    console.log('\nPlease edit this file and add URLs to the exerciseUrls array.\n');
    console.log('Example:');
    console.log('  {');
    console.log('    name: "Bench Press",');
    console.log('    url: "https://example.com/bench-press.gif"');
    console.log('  },\n');
    return;
  }
  
  console.log(`📥 Downloading ${exerciseUrls.length} exercise GIFs...\n`);
  
  let successCount = 0;
  let failCount = 0;
  
  for (const exercise of exerciseUrls) {
    const filename = `${toKebabCase(exercise.name)}.gif`;
    const filepath = path.join(OUTPUT_DIR, filename);
    
    try {
      process.stdout.write(`  Downloading "${exercise.name}"... `);
      await downloadFile(exercise.url, filepath);
      
      const stats = fs.statSync(filepath);
      const sizeMB = (stats.size / (1024 * 1024)).toFixed(2);
      
      console.log(`✅ (${sizeMB} MB)`);
      successCount++;
      
      // Small delay to be nice to servers
      await new Promise(resolve => setTimeout(resolve, 500));
      
    } catch (error) {
      console.log(`❌ Failed: ${error.message}`);
      failCount++;
    }
  }
  
  console.log('\n' + '='.repeat(50));
  console.log(`✅ Success: ${successCount}`);
  if (failCount > 0) {
    console.log(`❌ Failed: ${failCount}`);
  }
  console.log('='.repeat(50) + '\n');
  
  if (successCount > 0) {
    console.log('🎉 GIFs saved to:', OUTPUT_DIR);
    console.log('\n💡 Next steps:');
    console.log('   1. Check the downloaded GIFs');
    console.log('   2. They should automatically work in your workouts!');
    console.log('   3. Update src/utils/exerciseMedia.js if needed\n');
  }
}

// Run the script
if (require.main === module) {
  downloadGifs().catch(error => {
    console.error('❌ Error:', error.message);
    process.exit(1);
  });
}

module.exports = { downloadGifs, toKebabCase };
