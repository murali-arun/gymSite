#!/usr/bin/env python3
"""
Exercise GIF Downloader Script

Download exercise GIFs from URLs and save them with proper naming

Usage:
    python scripts/download_gifs.py
    
Or edit the EXERCISE_URLS list below and run
"""

import os
import sys
import urllib.request
import urllib.error
from pathlib import Path
import time

# ===== CONFIGURATION =====
# Add your GIF URLs here with exercise names
EXERCISE_URLS = [
    # Example format:
    # ("Bench Press", "https://example.com/bench-press.gif"),
    # ("Squat", "https://example.com/squat.gif"),
    # ("Deadlift", "https://example.com/deadlift.gif"),
    
    # Add your URLs below:
    
]

# Output directory (relative to project root)
SCRIPT_DIR = Path(__file__).parent
PROJECT_ROOT = SCRIPT_DIR.parent
OUTPUT_DIR = PROJECT_ROOT / "public" / "exercise-gifs"

# ===== HELPER FUNCTIONS =====

def to_kebab_case(text):
    """Convert exercise name to kebab-case filename"""
    return text.lower().replace(' ', '-').replace('_', '-')

def download_file(url, filepath):
    """Download a file from URL with progress"""
    try:
        # Add headers to mimic a browser
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
        req = urllib.request.Request(url, headers=headers)
        
        with urllib.request.urlopen(req, timeout=30) as response:
            if response.status != 200:
                raise Exception(f"HTTP {response.status}")
            
            # Get file size if available
            total_size = response.headers.get('Content-Length')
            
            with open(filepath, 'wb') as f:
                f.write(response.read())
            
        return True
    except Exception as e:
        if filepath.exists():
            filepath.unlink()
        raise e

def format_size(size_bytes):
    """Format bytes to MB"""
    return f"{size_bytes / (1024 * 1024):.2f} MB"

def main():
    print("🎬 Exercise GIF Downloader\n")
    
    # Ensure output directory exists
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    print(f"✅ Output directory: {OUTPUT_DIR}\n")
    
    if not EXERCISE_URLS:
        print("⚠️  No URLs configured!\n")
        print("Please edit this file and add URLs to the EXERCISE_URLS list.\n")
        print("Example:")
        print('  ("Bench Press", "https://example.com/bench-press.gif"),')
        print('  ("Squat", "https://example.com/squat.gif"),\n')
        return
    
    print(f"📥 Downloading {len(EXERCISE_URLS)} exercise GIFs...\n")
    
    success_count = 0
    fail_count = 0
    skip_count = 0
    
    for name, url in EXERCISE_URLS:
        filename = f"{to_kebab_case(name)}.gif"
        filepath = OUTPUT_DIR / filename
        
        # Skip if file already exists
        if filepath.exists():
            size = filepath.stat().st_size
            print(f"  ⏭️  \"{name}\" → {filename}... Already exists ({format_size(size)})")
            skip_count += 1
            continue
        
        try:
            print(f"  Downloading \"{name}\"... ", end='', flush=True)
            download_file(url, filepath)
            
            size = filepath.stat().st_size
            print(f"✅ ({format_size(size)})")
            success_count += 1
            
            # Small delay to be nice to servers
            time.sleep(0.5)
            
        except Exception as e:
            print(f"❌ Failed: {e}")
            fail_count += 1
    
    print("\n" + "="*60)
    print(f"✅ Success: {success_count}")
    if skip_count > 0:
        print(f"⏭️  Skipped (already exist): {skip_count}")
    if fail_count > 0:
        print(f"❌ Failed: {fail_count}")
    print("="*60 + "\n")
    
    if success_count > 0:
        print(f"🎉 GIFs saved to: {OUTPUT_DIR}")
        print("\n💡 Next steps:")
        print("   1. Check the downloaded GIFs")
        print("   2. They should automatically work in your workouts!")
        print("   3. Update src/utils/exerciseMedia.js if needed\n")

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n\n⚠️  Download cancelled by user")
        sys.exit(1)
    except Exception as e:
        print(f"\n❌ Error: {e}")
        sys.exit(1)
