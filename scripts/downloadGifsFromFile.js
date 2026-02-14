#!/usr/bin/env node

/**
 * Bulk Exercise GIF Downloader from a list file
 * 
 * Usage:
 *   1. Create a file called 'gif-urls.txt' with format:
 *      Exercise Name | URL
 *      Bench Press | https://example.com/bench.gif
 *      Squat | https://example.com/squat.gif
 * 
 *   2. Run: node scripts/downloadGifsFromFile.js
 */

const fs = require('fs');
const path = require('path');
const { downloadGifs, toKebabCase } = require('./downloadGifs');

const INPUT_FILE = path.join(__dirname, 'gif-urls.txt');
const OUTPUT_DIR = path.join(__dirname, '..', 'public', 'exercise-gifs');

async function parseAndDownload() {
  console.log('📋 Bulk Exercise GIF Downloader\n');
  
  // Check if input file exists
  if (!fs.existsSync(INPUT_FILE)) {
    console.log('⚠️  Input file not found: gif-urls.txt\n');
    console.log('Creating a template file for you...\n');
    
    const template = `# Exercise GIF URLs
# Format: Exercise Name | URL
# Lines starting with # are ignored

# Example:
# Bench Press | https://example.com/bench-press.gif
# Squat | https://example.com/squat.gif
# Deadlift | https://example.com/deadlift.gif

# Add your URLs below:

`;
    
    fs.writeFileSync(INPUT_FILE, template);
    console.log(`✅ Created: ${INPUT_FILE}`);
    console.log('\n💡 Edit this file and add your exercise URLs, then run the script again.\n');
    return;
  }
  
  // Read and parse the file
  const content = fs.readFileSync(INPUT_FILE, 'utf-8');
  const lines = content.split('\n');
  
  const exercises = [];
  let lineNum = 0;
  
  for (const line of lines) {
    lineNum++;
    const trimmed = line.trim();
    
    // Skip empty lines and comments
    if (!trimmed || trimmed.startsWith('#')) continue;
    
    // Parse: Exercise Name | URL
    const parts = trimmed.split('|').map(s => s.trim());
    
    if (parts.length !== 2) {
      console.log(`⚠️  Skipping line ${lineNum}: Invalid format (use: Name | URL)`);
      continue;
    }
    
    const [name, url] = parts;
    
    if (!url.startsWith('http')) {
      console.log(`⚠️  Skipping line ${lineNum}: URL must start with http:// or https://`);
      continue;
    }
    
    exercises.push({ name, url });
  }
  
  if (exercises.length === 0) {
    console.log('⚠️  No valid URLs found in gif-urls.txt\n');
    console.log('Make sure each line has format: Exercise Name | URL\n');
    return;
  }
  
  console.log(`Found ${exercises.length} exercises to download\n`);
  
  // Create output directory
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }
  
  // Download each file
  const https = require('https');
  const http = require('http');
  
  let successCount = 0;
  let failCount = 0;
  
  for (const exercise of exercises) {
    const filename = `${toKebabCase(exercise.name)}.gif`;
    const filepath = path.join(OUTPUT_DIR, filename);
    
    try {
      process.stdout.write(`  📥 "${exercise.name}" → ${filename}... `);
      
      await new Promise((resolve, reject) => {
        const protocol = exercise.url.startsWith('https') ? https : http;
        const file = fs.createWriteStream(filepath);
        
        protocol.get(exercise.url, (response) => {
          if (response.statusCode === 301 || response.statusCode === 302) {
            file.close();
            fs.unlinkSync(filepath);
            protocol.get(response.headers.location, (redirectResponse) => {
              redirectResponse.pipe(file);
              file.on('finish', () => { file.close(); resolve(); });
            }).on('error', reject);
            return;
          }
          
          if (response.statusCode !== 200) {
            file.close();
            if (fs.existsSync(filepath)) fs.unlinkSync(filepath);
            reject(new Error(`HTTP ${response.statusCode}`));
            return;
          }
          
          response.pipe(file);
          file.on('finish', () => { file.close(); resolve(); });
        }).on('error', (err) => {
          file.close();
          if (fs.existsSync(filepath)) fs.unlinkSync(filepath);
          reject(err);
        });
      });
      
      const stats = fs.statSync(filepath);
      const sizeMB = (stats.size / (1024 * 1024)).toFixed(2);
      console.log(`✅ ${sizeMB} MB`);
      successCount++;
      
      // Be nice to servers
      await new Promise(resolve => setTimeout(resolve, 500));
      
    } catch (error) {
      console.log(`❌ ${error.message}`);
      failCount++;
    }
  }
  
  console.log('\n' + '='.repeat(60));
  console.log(`✅ Successfully downloaded: ${successCount}`);
  if (failCount > 0) {
    console.log(`❌ Failed: ${failCount}`);
  }
  console.log('='.repeat(60) + '\n');
  
  if (successCount > 0) {
    console.log('🎉 GIFs saved to: public/exercise-gifs/');
    console.log('\n💡 Next steps:');
    console.log('   1. Open the app and start a workout');
    console.log('   2. The GIFs will appear automatically!');
    console.log('   3. If an exercise doesn\'t match, update src/utils/exerciseMedia.js\n');
  }
}

parseAndDownload().catch(error => {
  console.error('❌ Error:', error);
  process.exit(1);
});
