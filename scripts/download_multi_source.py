#!/usr/bin/env python3
"""
Multi-Source Exercise GIF Downloader
Tries multiple websites for each exercise

Usage:
    python3 scripts/download_multi_source.py
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
    with urllib.request.urlopen(req, timeout=10) as response:
        with open(filepath, 'wb') as f:
            f.write(response.read())

# Exercise URLs from multiple sources
MULTI_SOURCE_EXERCISES = {
    # BODYWEIGHT EXERCISES
    "Push-ups": [
        "https://www.inspireusafoundation.org/wp-content/uploads/2021/08/push-up.gif",
        "https://www.strengthlog.com/wp-content/uploads/2020/06/Push-up.gif",
    ],
    "Diamond Push-ups": [
        "https://www.inspireusafoundation.org/wp-content/uploads/2022/03/diamond-pushup.gif",
    ],
    "Pull-ups": [
        "https://www.inspireusafoundation.org/wp-content/uploads/2022/02/pull-up.gif",
        "https://www.strengthlog.com/wp-content/uploads/2020/06/Pull-up.gif",
    ],
    "Chin-ups": [
        "https://www.inspireusafoundation.org/wp-content/uploads/2022/02/chin-up.gif",
    ],
    "Dips": [
        "https://www.inspireusafoundation.org/wp-content/uploads/2022/02/tricep-dips.gif",
    ],
    "Bodyweight Squat": [
        "https://www.inspireusafoundation.org/wp-content/uploads/2022/02/bodyweight-squat.gif",
    ],
    "Lunges": [
        "https://www.inspireusafoundation.org/wp-content/uploads/2022/02/dumbbell-lunge.gif",
    ],
    "Burpees": [
        "https://www.inspireusafoundation.org/wp-content/uploads/2022/02/burpee.gif",
    ],
    "Mountain Climbers": [
        "https://www.inspireusafoundation.org/wp-content/uploads/2022/02/mountain-climber.gif",
    ],
    "Plank": [
        "https://www.inspireusafoundation.org/wp-content/uploads/2022/02/plank.gif",
    ],
    "Side Plank": [
        "https://www.inspireusafoundation.org/wp-content/uploads/2022/02/side-plank.gif",
    ],
    
    # BARBELL EXERCISES
    "Bench Press": [
        "https://www.inspireusafoundation.org/wp-content/uploads/2021/11/barbell-bench-press.gif",
        "https://www.strengthlog.com/wp-content/uploads/2020/06/Bench-press.gif",
    ],
    "Incline Bench Press": [
        "https://www.inspireusafoundation.org/wp-content/uploads/2022/02/incline-bench-press.gif",
    ],
    "Squat": [
        "https://www.inspireusafoundation.org/wp-content/uploads/2022/02/barbell-squat.gif",
        "https://www.strengthlog.com/wp-content/uploads/2020/06/Barbell-squat.gif",
    ],
    "Deadlift": [
        "https://www.inspireusafoundation.org/wp-content/uploads/2022/02/deadlift.gif",
        "https://www.strengthlog.com/wp-content/uploads/2020/06/Deadlift.gif",
    ],
    "Romanian Deadlift": [
        "https://www.inspireusafoundation.org/wp-content/uploads/2022/02/romanian-deadlift.gif",
    ],
    "Barbell Row": [
        "https://www.inspireusafoundation.org/wp-content/uploads/2022/02/barbell-bent-over-row.gif",
        "https://www.strengthlog.com/wp-content/uploads/2020/06/Barbell-row.gif",
    ],
    "Overhead Press": [
        "https://www.inspireusafoundation.org/wp-content/uploads/2022/02/overhead-press.gif",
        "https://www.strengthlog.com/wp-content/uploads/2020/06/Overhead-press.gif",
    ],
    "Barbell Curl": [
        "https://www.inspireusafoundation.org/wp-content/uploads/2022/02/barbell-curl.gif",
    ],
    
    # DUMBBELL EXERCISES
    "Dumbbell Bench Press": [
        "https://www.inspireusafoundation.org/wp-content/uploads/2022/02/dumbbell-bench-press.gif",
        "https://www.strengthlog.com/wp-content/uploads/2020/06/Dumbbell-bench-press.gif",
    ],
    "Incline Dumbbell Press": [
        "https://www.inspireusafoundation.org/wp-content/uploads/2022/02/incline-dumbbell-press.gif",
    ],
    "Dumbbell Fly": [
        "https://www.inspireusafoundation.org/wp-content/uploads/2022/02/dumbbell-fly.gif",
    ],
    "Dumbbell Row": [
        "https://www.inspireusafoundation.org/wp-content/uploads/2022/02/dumbbell-bent-over-row.gif",
        "https://www.strengthlog.com/wp-content/uploads/2020/06/Dumbbell-row.gif",
    ],
    "Dumbbell Shoulder Press": [
        "https://www.inspireusafoundation.org/wp-content/uploads/2022/02/dumbbell-shoulder-press.gif",
        "https://www.strengthlog.com/wp-content/uploads/2020/06/Dumbbell-shoulder-press.gif",
    ],
    "Lateral Raise": [
        "https://www.inspireusafoundation.org/wp-content/uploads/2022/02/dumbbell-lateral-raise.gif",
        "https://www.strengthlog.com/wp-content/uploads/2020/06/Lateral-raise.gif",
    ],
    "Front Raise": [
        "https://www.inspireusafoundation.org/wp-content/uploads/2022/02/dumbbell-front-raise.gif",
    ],
    "Rear Delt Fly": [
        "https://www.inspireusafoundation.org/wp-content/uploads/2022/02/rear-delt-fly.gif",
    ],
    "Dumbbell Curl": [
        "https://www.inspireusafoundation.org/wp-content/uploads/2022/02/dumbbell-curl.gif",
        "https://www.strengthlog.com/wp-content/uploads/2020/06/Dumbbell-curl.gif",
    ],
    "Hammer Curl": [
        "https://www.inspireusafoundation.org/wp-content/uploads/2022/02/hammer-curl.gif",
    ],
    "Overhead Tricep Extension": [
        "https://www.inspireusafoundation.org/wp-content/uploads/2022/02/overhead-tricep-extension.gif",
    ],
    "Goblet Squat": [
        "https://www.inspireusafoundation.org/wp-content/uploads/2022/02/goblet-squat.gif",
    ],
    "Dumbbell Lunges": [
        "https://www.inspireusafoundation.org/wp-content/uploads/2022/02/dumbbell-lunge.gif",
    ],
    "Bulgarian Split Squat": [
        "https://www.inspireusafoundation.org/wp-content/uploads/2022/02/bulgarian-split-squat.gif",
    ],
    
    # CABLE/MACHINE EXERCISES
    "Lat Pulldown": [
        "https://www.inspireusafoundation.org/wp-content/uploads/2022/02/lat-pulldown.gif",
        "https://www.strengthlog.com/wp-content/uploads/2020/06/Lat-pulldown.gif",
    ],
    "Seated Cable Row": [
        "https://www.inspireusafoundation.org/wp-content/uploads/2022/02/seated-cable-row.gif",
    ],
    "Cable Fly": [
        "https://www.inspireusafoundation.org/wp-content/uploads/2022/02/cable-fly.gif",
    ],
    "Tricep Pushdown": [
        "https://www.inspireusafoundation.org/wp-content/uploads/2022/02/tricep-pushdown.gif",
    ],
    "Face Pulls": [
        "https://www.inspireusafoundation.org/wp-content/uploads/2022/02/face-pull.gif",
    ],
    "Leg Press": [
        "https://www.inspireusafoundation.org/wp-content/uploads/2022/02/leg-press.gif",
    ],
    "Leg Extension": [
        "https://www.inspireusafoundation.org/wp-content/uploads/2022/02/leg-extension.gif",
    ],
    "Leg Curl": [
        "https://www.inspireusafoundation.org/wp-content/uploads/2022/02/leg-curl.gif",
    ],
    "Calf Raises": [
        "https://www.inspireusafoundation.org/wp-content/uploads/2022/02/calf-raise.gif",
    ],
    
    # CORE EXERCISES
    "Russian Twists": [
        "https://www.inspireusafoundation.org/wp-content/uploads/2022/02/russian-twist.gif",
    ],
    "Bicycle Crunches": [
        "https://www.inspireusafoundation.org/wp-content/uploads/2022/02/bicycle-crunch.gif",
    ],
    "Leg Raises": [
        "https://www.inspireusafoundation.org/wp-content/uploads/2022/02/leg-raise.gif",
    ],
    "Dead Bug": [
        "https://www.inspireusafoundation.org/wp-content/uploads/2022/02/dead-bug.gif",
    ],
}

def try_download(name, urls):
    """Try downloading from multiple URLs"""
    filename = f"{to_kebab_case(name)}.gif"
    filepath = OUTPUT_DIR / filename
    
    if filepath.exists():
        return 'skip', 0
    
    for url in urls:
        try:
            download_file(url, filepath)
            size = filepath.stat().st_size
            
            if size > 1000:  # Valid file
                return 'success', size
            else:
                filepath.unlink()
        except Exception as e:
            if filepath.exists():
                filepath.unlink()
            continue
    
    return 'fail', 0

def main():
    print("🌐 Multi-Source Exercise GIF Downloader\n")
    print(f"Trying {len(MULTI_SOURCE_EXERCISES)} exercises from multiple sources...\n")
    
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    
    success = 0
    skip = 0
    fail = 0
    
    for i, (name, urls) in enumerate(MULTI_SOURCE_EXERCISES.items(), 1):
        progress = f"[{i}/{len(MULTI_SOURCE_EXERCISES)}]"
        print(f"{progress} {name}... ", end='', flush=True)
        
        result, size = try_download(name, urls)
        
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
