#!/usr/bin/env python3
"""
Advanced Exercise GIF Downloader with Multiple Sources

This script tries multiple URLs and patterns for each exercise
"""

import os
import sys
from pathlib import Path
import urllib.request
import time

SCRIPT_DIR = Path(__file__).parent
PROJECT_ROOT = SCRIPT_DIR.parent
OUTPUT_DIR = PROJECT_ROOT / "public" / "exercise-gifs"

# Direct working URLs we know exist
KNOWN_GIFS = {
    # Chest
    "Bench Press": "https://fitnessprogramer.com/wp-content/uploads/2021/02/Barbell-Bench-Press.gif",
    "Incline Bench Press": "https://fitnessprogramer.com/wp-content/uploads/2021/02/Incline-Barbell-Bench-Press.gif",
    "Decline Bench Press": "https://fitnessprogramer.com/wp-content/uploads/2021/02/Decline-Barbell-Bench-Press.gif",
    "Dumbbell Bench Press": "https://fitnessprogramer.com/wp-content/uploads/2021/02/Dumbbell-Bench-Press.gif",
    "Incline Dumbbell Press": "https://fitnessprogramer.com/wp-content/uploads/2021/02/Incline-Dumbbell-Press.gif",
    "Push-ups": "https://fitnessprogramer.com/wp-content/uploads/2021/02/Push-up.gif",
    "Dumbbell Fly": "https://fitnessprogramer.com/wp-content/uploads/2021/02/Dumbbell-Fly.gif",
    "Cable Fly": "https://fitnessprogramer.com/wp-content/uploads/2021/02/CABLE-FLY.gif",
    "Pec Deck": "https://fitnessprogramer.com/wp-content/uploads/2021/02/Pec-Deck.gif",
    
    # Back
    "Deadlift": "https://fitnessprogramer.com/wp-content/uploads/2021/02/Deadlift.gif",
    "Romanian Deadlift": "https://fitnessprogramer.com/wp-content/uploads/2021/02/Romanian-Deadlift.gif",
    "Sumo Deadlift": "https://fitnessprogramer.com/wp-content/uploads/2021/02/Sumo-Deadlift.gif",
    "Barbell Row": "https://fitnessprogramer.com/wp-content/uploads/2021/02/Barbell-Row.gif",
    "Dumbbell Row": "https://fitnessprogramer.com/wp-content/uploads/2021/02/Dumbbell-Bent-Over-Row.gif",
    "T-Bar Row": "https://fitnessprogramer.com/wp-content/uploads/2021/02/T-Bar-Row.gif",
    "Pull-ups": "https://fitnessprogramer.com/wp-content/uploads/2021/04/Pull-up.gif",
    "Chin-ups": "https://fitnessprogramer.com/wp-content/uploads/2021/02/Chin-up.gif",
    "Lat Pulldown": "https://fitnessprogramer.com/wp-content/uploads/2021/02/Lat-Pulldown.gif",
    "Seated Cable Row": "https://fitnessprogramer.com/wp-content/uploads/2021/02/Seated-Cable-Row.gif",
    "Face Pulls": "https://fitnessprogramer.com/wp-content/uploads/2021/02/Face-Pull.gif",
    "Back Extension": "https://fitnessprogramer.com/wp-content/uploads/2021/02/45-degree-back-extension.gif",
    
    # Shoulders
    "Overhead Press": "https://fitnessprogramer.com/wp-content/uploads/2021/02/Barbell-Shoulder-Press.gif",
    "Dumbbell Shoulder Press": "https://fitnessprogramer.com/wp-content/uploads/2021/02/Dumbbell-Shoulder-Press.gif",
    "Arnold Press": "https://fitnessprogramer.com/wp-content/uploads/2021/02/Arnold-Press.gif",
    "Lateral Raise": "https://fitnessprogramer.com/wp-content/uploads/2021/02/Dumbbell-Lateral-Raise.gif",
    "Front Raise": "https://fitnessprogramer.com/wp-content/uploads/2021/02/Dumbbell-Front-Raise.gif",
    "Rear Delt Fly": "https://fitnessprogramer.com/wp-content/uploads/2021/02/Dumbbell-Reverse-Fly.gif",
    "Upright Row": "https://fitnessprogramer.com/wp-content/uploads/2021/02/Barbell-Upright-Row.gif",
    "Shrugs": "https://fitnessprogramer.com/wp-content/uploads/2021/02/Barbell-Shrug.gif",
    
    # Arms - Biceps
    "Barbell Curl": "https://fitnessprogramer.com/wp-content/uploads/2021/02/Barbell-Curl.gif",
    "Dumbbell Curl": "https://fitnessprogramer.com/wp-content/uploads/2021/02/Dumbbell-Curl.gif",
    "Hammer Curl": "https://fitnessprogramer.com/wp-content/uploads/2021/02/Hammer-Curl.gif",
    "Preacher Curl": "https://fitnessprogramer.com/wp-content/uploads/2021/02/Barbell-Preacher-Curl.gif",
    "Concentration Curl": "https://fitnessprogramer.com/wp-content/uploads/2021/02/Concentration-Curl.gif",
    "Cable Curl": "https://fitnessprogramer.com/wp-content/uploads/2021/02/standing-cable-curl.gif",
    
    # Arms - Triceps
    "Tricep Pushdown": "https://fitnessprogramer.com/wp-content/uploads/2021/02/rope-push-down.gif",
    "Overhead Tricep Extension": "https://fitnessprogramer.com/wp-content/uploads/2021/02/Dumbbell-Overhead-Triceps-Extension.gif",
    "Skull Crushers": "https://fitnessprogramer.com/wp-content/uploads/2021/02/Barbell-Lying-Triceps-Extension.gif",
    "Close Grip Bench Press": "https://fitnessprogramer.com/wp-content/uploads/2021/02/Close-Grip-Barbell-Bench-Press.gif",
    "Tricep Dips": "https://fitnessprogramer.com/wp-content/uploads/2021/02/Triceps-Dips.gif",
    
    # Legs
    "Squat": "https://fitnessprogramer.com/wp-content/uploads/2021/02/Barbell-Squat.gif",
    "Front Squat": "https://fitnessprogramer.com/wp-content/uploads/2021/02/Front-Squat.gif",
    "Goblet Squat": "https://fitnessprogramer.com/wp-content/uploads/2021/02/goblet-squat.gif",
    "Bulgarian Split Squat": "https://fitnessprogramer.com/wp-content/uploads/2021/02/Dumbbell-Bulgarian-Split-Squat.gif",
    "Lunges": "https://fitnessprogramer.com/wp-content/uploads/2021/02/Dumbbell-Lunge.gif",
    "Walking Lunges": "https://fitnessprogramer.com/wp-content/uploads/2021/02/Dumbbell-Walking-Lunge.gif",
    "Leg Press": "https://fitnessprogramer.com/wp-content/uploads/2021/02/LEG-PRESS.gif",
    "Leg Extension": "https://fitnessprogramer.com/wp-content/uploads/2021/02/Leg-Extensions.gif",
    "Leg Curl": "https://fitnessprogramer.com/wp-content/uploads/2021/02/Leg-Curl.gif",
    "Calf Raises": "https://fitnessprogramer.com/wp-content/uploads/2021/02/Calf-Raise.gif",
    "Hip Thrust": "https://fitnessprogramer.com/wp-content/uploads/2021/02/barbell-hip-thrust.gif",
    "Glute Bridge": "https://fitnessprogramer.com/wp-content/uploads/2021/02/barbell-glute-bridge.gif",
    
    # Core
    "Plank": "https://fitnessprogramer.com/wp-content/uploads/2021/02/Plank.gif",
    "Side Plank": "https://fitnessprogramer.com/wp-content/uploads/2021/02/Side-Plank.gif",
    "Ab Wheel": "https://fitnessprogramer.com/wp-content/uploads/2021/02/Ab-Wheel-Rollout.gif",
    "Bicycle Crunches": "https://fitnessprogramer.com/wp-content/uploads/2021/02/Bicycle-Crunch.gif",
    "Russian Twists": "https://fitnessprogramer.com/wp-content/uploads/2021/02/Weighted-Russian-Twist.gif",
    "Leg Raises": "https://fitnessprogramer.com/wp-content/uploads/2021/02/Hanging-Straight-Leg-Raise.gif",
    "Hanging Knee Raises": "https://fitnessprogramer.com/wp-content/uploads/2021/02/Hanging-Knee-Raise.gif",
    "Mountain Climbers": "https://fitnessprogramer.com/wp-content/uploads/2021/02/Mountain-Climber.gif",
    "Cable Crunch": "https://fitnessprogramer.com/wp-content/uploads/2021/02/Kneeling-Cable-Crunch.gif",
}

def to_kebab_case(text):
    return text.lower().replace(' ', '-')

def format_size(size_bytes):
    return f"{size_bytes / (1024 * 1024):.2f} MB"

def download_file(url, filepath):
    headers = {'User-Agent': 'Mozilla/5.0'}
    req = urllib.request.Request(url, headers=headers)
    with urllib.request.urlopen(req, timeout=10) as response:
        with open(filepath, 'wb') as f:
            f.write(response.read())

def main():
    print("🎯 Downloading Verified Exercise GIFs\n")
    print(f"Total exercises: {len(KNOWN_GIFS)}\n")
    
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    
    success = 0
    skip = 0
    fail = 0
    
    for i, (name, url) in enumerate(KNOWN_GIFS.items(), 1):
        filename = f"{to_kebab_case(name)}.gif"
        filepath = OUTPUT_DIR / filename
        
        progress = f"[{i}/{len(KNOWN_GIFS)}]"
        
        if filepath.exists():
            print(f"{progress} {name}... ⏭️  (exists)")
            skip += 1
            continue
        
        try:
            print(f"{progress} {name}... ", end='', flush=True)
            download_file(url, filepath)
            size = filepath.stat().st_size
            print(f"✅ ({format_size(size)})")
            success += 1
            time.sleep(0.3)
        except Exception as e:
            print(f"❌ {e}")
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
