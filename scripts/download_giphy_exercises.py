#!/usr/bin/env python3
"""
Download exercise GIFs from Giphy and other reliable sources

Usage:
    python3 scripts/download_giphy_exercises.py
"""

import os
import sys
from pathlib import Path
import urllib.request
import time

SCRIPT_DIR = Path(__file__).parent
PROJECT_ROOT = SCRIPT_DIR.parent
OUTPUT_DIR = PROJECT_ROOT / "public" / "exercise-gifs"

def to_kebab_case(text):
    return text.lower().replace(' ', '-').replace('_', '-')

def format_size(size_bytes):
    return f"{size_bytes / (1024 * 1024):.2f} MB"

def download_file(url, filepath):
    headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'}
    req = urllib.request.Request(url, headers=headers)
    with urllib.request.urlopen(req, timeout=15) as response:
        with open(filepath, 'wb') as f:
            f.write(response.read())

# Curated list of working exercise GIF URLs
EXERCISE_GIFS = {
    # From fitness blogs and reliable sources
    "Push-ups": "https://media.giphy.com/media/ZeByq9oaSgRQJR2kfm/giphy.gif",
    "Squats": "https://media.giphy.com/media/1qfDiAHdKLgCKlFP6o/giphy.gif",
    "Lunges": "https://media.giphy.com/media/xUNd9DLukkavmhybAs/giphy.gif",
    "Plank": "https://media.giphy.com/media/3oKIPnbKgN3bXeVpvy/giphy.gif",
    "Mountain Climbers": "https://media.giphy.com/media/TJKm32CqAHkB5xJdxQ/giphy.gif",
    "Burpees": "https://media.giphy.com/media/sFoZRSAmxQW58JId1G/giphy.gif",
    "Jumping Jacks": "https://media.giphy.com/media/8F3bK4aq1tCo0TLkf7/giphy.gif",
    "High Knees": "https://media.giphy.com/media/26gR0hw5iIHQFfOKc/giphy.gif",
    "Sit-ups": "https://media.giphy.com/media/scZPhLqaVOM1qG4lT9/giphy.gif",
    "Crunches": "https://media.giphy.com/media/1qfDv9TtbKa9Sc3qIi/giphy.gif",
    
    # Dumbbell exercises
    "Bicep Curls": "https://media.giphy.com/media/l0Iy8MF7Tx1fq5J2E/giphy.gif",
    "Shoulder Press": "https://media.giphy.com/media/l378Bu6ZYmzS6nBrW/giphy.gif",
    "Tricep Extensions": "https://media.giphy.com/media/xT0GqCREqKbLGgsPQc/giphy.gif",
    
    # Alternative sources for common exercises
    "Deadlift": "https://thumbs.gfycat.com/AfraidFlickeringAfghanhound-size_restricted.gif",
    "Bench Press": "https://thumbs.gfycat.com/QuestionableWelllitCuttlefish-size_restricted.gif",
    "Barbell Squat": "https://thumbs.gfycat.com/FamiliarSpiffyGermanshorthairedpointer-size_restricted.gif",
    "Pull-up": "https://thumbs.gfycat.com/AdorableAmusedIzuthrush-size_restricted.gif",
    "Dip": "https://thumbs.gfycat.com/IdenticalImperturbableBrant-size_restricted.gif",
    
    # From fitnessvolt.com
    "Dumbbell Row": "https://fitnessvolt.com/wp-content/uploads/2019/02/dumbbell-row.gif",
    "Dumbbell Shoulder Press": "https://fitnessvolt.com/wp-content/uploads/2018/04/dumbbell-shoulder-press.gif",
    "Lateral Raise": "https://fitnessvolt.com/wp-content/uploads/2018/04/lateral-raise.gif",
    "Front Raise": "https://fitnessvolt.com/wp-content/uploads/2018/04/dumbbell-front-raise.gif",
    "Hammer Curl": "https://fitnessvolt.com/wp-content/uploads/2018/03/hammer-curls.gif",
    "Goblet Squat": "https://fitnessvolt.com/wp-content/uploads/2018/03/goblet-squat.gif",
    "Dumbbell Lunge": "https://fitnessvolt.com/wp-content/uploads/2018/03/dumbbell-lunge.gif",
    "Romanian Deadlift": "https://fitnessvolt.com/wp-content/uploads/2018/03/Romanian-Deadlift.gif",
    "Leg Press": "https://fitnessvolt.com/wp-content/uploads/2018/03/leg-press.gif",
    "Calf Raise": "https://fitnessvolt.com/wp-content/uploads/2018/03/calf-raises.gif",
    "Leg Curl": "https://fitnessvolt.com/wp-content/uploads/2018/03/leg-curl.gif",
    "Leg Extension": "https://fitnessvolt.com/wp-content/uploads/2018/03/leg-extension.gif",
    
    # Chest exercises
    "Dumbbell Bench Press": "https://fitnessvolt.com/wp-content/uploads/2018/04/dumbbell-bench-press.gif",
    "Incline Dumbbell Press": "https://fitnessvolt.com/wp-content/uploads/2018/04/incline-dumbbell-press.gif",
    "Dumbbell Fly": "https://fitnessvolt.com/wp-content/uploads/2018/04/dumbbell-fly.gif",
    
    # Back exercises
    "Lat Pulldown": "https://fitnessvolt.com/wp-content/uploads/2018/04/lat-pulldown.gif",
    "Cable Row": "https://fitnessvolt.com/wp-content/uploads/2018/04/seated-cable-row.gif",
    "Face Pull": "https://fitnessvolt.com/wp-content/uploads/2018/04/face-pulls.gif",
    
    # Tricep exercises
    "Tricep Pushdown": "https://fitnessvolt.com/wp-content/uploads/2018/03/tricep-pushdown.gif",
    "Overhead Tricep Extension": "https://fitnessvolt.com/wp-content/uploads/2018/03/overhead-tricep-extension.gif",
    "Skull Crushers": "https://fitnessvolt.com/wp-content/uploads/2018/03/skull-crushers.gif",
    
    # Core exercises  
    "Russian Twist": "https://fitnessvolt.com/wp-content/uploads/2018/03/russian-twist.gif",
    "Bicycle Crunch": "https://fitnessvolt.com/wp-content/uploads/2018/03/bicycle-crunch.gif",
    "Leg Raise": "https://fitnessvolt.com/wp-content/uploads/2018/03/leg-raise.gif",
}

def try_download(name, url):
    """Try downloading from URL"""
    filename = f"{to_kebab_case(name)}.gif"
    filepath = OUTPUT_DIR / filename
    
    if filepath.exists():
        return 'skip', 0
    
    try:
        download_file(url, filepath)
        size = filepath.stat().st_size
        
        if size > 1000:  # Valid file
            return 'success', size
        else:
            filepath.unlink()
            return 'fail', 0
    except Exception as e:
        if filepath.exists():
            filepath.unlink()
        return 'fail', 0

def main():
    print("🎬 Giphy & Multi-Source Exercise GIF Downloader\n")
    print(f"Downloading {len(EXERCISE_GIFS)} exercise GIFs...\n")
    
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    
    success = 0
    skip = 0
    fail = 0
    
    for i, (name, url) in enumerate(EXERCISE_GIFS.items(), 1):
        progress = f"[{i}/{len(EXERCISE_GIFS)}]"
        print(f"{progress} {name}... ", end='', flush=True)
        
        result, size = try_download(name, url)
        
        if result == 'skip':
            print("⏭️  (exists)")
            skip += 1
        elif result == 'success':
            print(f"✅ ({format_size(size)})")
            success += 1
            time.sleep(0.3)
        else:
            print("❌")
            fail += 1
    
    print("\n" + "="*60)
    print(f"✅ Downloaded: {success}")
    print(f"⏭️  Skipped: {skip}")
    if fail > 0:
        print(f"❌ Failed: {fail}")
    print("="*60)
    print(f"\n🎉 Total GIFs: {success + skip}")
    print(f"📁 {OUTPUT_DIR}\n")

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n\n⚠️  Cancelled")
        sys.exit(1)
