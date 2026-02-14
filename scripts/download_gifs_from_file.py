#!/usr/bin/env python3
"""
Bulk Exercise GIF Downloader from a list file

Usage:
    1. Create a file called 'gif-urls.txt' with format:
       Exercise Name | URL
       Bench Press | https://example.com/bench.gif
       Squat | https://example.com/squat.gif
    
    2. Run: python scripts/download_gifs_from_file.py
"""

import os
import sys
import urllib.request
import urllib.error
from pathlib import Path
import time

SCRIPT_DIR = Path(__file__).parent
PROJECT_ROOT = SCRIPT_DIR.parent
INPUT_FILE = SCRIPT_DIR / "gif-urls.txt"
OUTPUT_DIR = PROJECT_ROOT / "public" / "exercise-gifs"

def to_kebab_case(text):
    """Convert exercise name to kebab-case filename"""
    return text.lower().replace(' ', '-').replace('_', '-')

def format_size(size_bytes):
    """Format bytes to MB"""
    return f"{size_bytes / (1024 * 1024):.2f} MB"

def download_file(url, filepath):
    """Download a file from URL"""
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    }
    req = urllib.request.Request(url, headers=headers)
    
    with urllib.request.urlopen(req, timeout=30) as response:
        if response.status != 200:
            raise Exception(f"HTTP {response.status}")
        
        with open(filepath, 'wb') as f:
            f.write(response.read())

def create_template():
    """Create a template input file"""
    template = """# Exercise GIF URLs
# Format: Exercise Name | URL
# Lines starting with # are ignored

# Example:
# Bench Press | https://example.com/bench-press.gif
# Squat | https://example.com/squat.gif
# Deadlift | https://example.com/deadlift.gif

# Add your URLs below:

"""
    INPUT_FILE.write_text(template)
    print(f"✅ Created template: {INPUT_FILE}")
    print("\n💡 Edit this file and add your exercise URLs, then run the script again.\n")

def parse_input_file():
    """Parse the input file and return list of (name, url) tuples"""
    if not INPUT_FILE.exists():
        return None
    
    exercises = []
    
    with open(INPUT_FILE, 'r') as f:
        for line_num, line in enumerate(f, 1):
            line = line.strip()
            
            # Skip empty lines and comments
            if not line or line.startswith('#'):
                continue
            
            # Parse: Exercise Name | URL
            parts = [p.strip() for p in line.split('|')]
            
            if len(parts) != 2:
                print(f"⚠️  Skipping line {line_num}: Invalid format (use: Name | URL)")
                continue
            
            name, url = parts
            
            if not url.startswith('http'):
                print(f"⚠️  Skipping line {line_num}: URL must start with http:// or https://")
                continue
            
            exercises.append((name, url))
    
    return exercises

def main():
    print("📋 Bulk Exercise GIF Downloader\n")
    
    # Check if input file exists
    exercises = parse_input_file()
    
    if exercises is None:
        print("⚠️  Input file not found: gif-urls.txt\n")
        print("Creating a template file for you...\n")
        create_template()
        return
    
    if not exercises:
        print("⚠️  No valid URLs found in gif-urls.txt\n")
        print("Make sure each line has format: Exercise Name | URL\n")
        return
    
    print(f"Found {len(exercises)} exercises to download\n")
    
    # Create output directory
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    
    # Download each file
    success_count = 0
    fail_count = 0
    skip_count = 0
    
    for name, url in exercises:
        filename = f"{to_kebab_case(name)}.gif"
        filepath = OUTPUT_DIR / filename
        
        # Skip if file already exists
        if filepath.exists():
            size = filepath.stat().st_size
            print(f"  ⏭️  \"{name}\" → {filename}... Already exists ({format_size(size)})")
            skip_count += 1
            continue
        
        try:
            print(f"  📥 \"{name}\" → {filename}... ", end='', flush=True)
            download_file(url, filepath)
            
            size = filepath.stat().st_size
            print(f"✅ {format_size(size)}")
            success_count += 1
            
            # Be nice to servers
            time.sleep(0.5)
            
        except Exception as e:
            print(f"❌ {e}")
            fail_count += 1
            if filepath.exists():
                filepath.unlink()
    
    print("\n" + "="*60)
    print(f"✅ Successfully downloaded: {success_count}")
    if skip_count > 0:
        print(f"⏭️  Skipped (already exist): {skip_count}")
    if fail_count > 0:
        print(f"❌ Failed: {fail_count}")
    print("="*60 + "\n")
    
    if success_count > 0:
        print("🎉 GIFs saved to: public/exercise-gifs/")
        print("\n💡 Next steps:")
        print("   1. Open the app and start a workout")
        print("   2. The GIFs will appear automatically!")
        print("   3. If an exercise doesn't match, update src/utils/exerciseMedia.js\n")

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n\n⚠️  Download cancelled by user")
        sys.exit(1)
    except Exception as e:
        print(f"\n❌ Error: {e}")
        sys.exit(1)
