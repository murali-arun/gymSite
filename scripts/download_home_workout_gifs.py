#!/usr/bin/env python3
"""
Home Workout GIF Downloader
Focus on bodyweight and dumbbell exercises

Usage:
    python3 scripts/download_home_workout_gifs.py
"""

import os
import sys
from pathlib import Path
import urllib.request
import time

SCRIPT_DIR = Path(__file__).parent
PROJECT_ROOT = SCRIPT_DIR.parent
OUTPUT_DIR = PROJECT_ROOT / "public" / "exercise-gifs"

# Home workout exercises - Bodyweight & Dumbbells
HOME_WORKOUT_GIFS = {
    # ===== BODYWEIGHT EXERCISES =====
    
    # Upper Body Bodyweight
    "Push-ups": "https://fitnessprogramer.com/wp-content/uploads/2021/02/Push-up.gif",
    "Diamond Push-ups": "https://fitnessprogramer.com/wp-content/uploads/2021/02/Diamond-Push-up.gif",
    "Wide Push-ups": "https://fitnessprogramer.com/wp-content/uploads/2021/02/Wide-Grip-Push-up.gif",
    "Pike Push-ups": "https://fitnessprogramer.com/wp-content/uploads/2021/02/Pike-Push-up.gif",
    "Decline Push-ups": "https://fitnessprogramer.com/wp-content/uploads/2021/02/Decline-Push-Up.gif",
    "Pull-ups": "https://fitnessprogramer.com/wp-content/uploads/2021/04/Pull-up.gif",
    "Chin-ups": "https://fitnessprogramer.com/wp-content/uploads/2021/02/Chin-up.gif",
    "Dips": "https://fitnessprogramer.com/wp-content/uploads/2021/02/Triceps-Dips.gif",
    "Bench Dips": "https://fitnessprogramer.com/wp-content/uploads/2021/02/Bench-Dip.gif",
    
    # Lower Body Bodyweight
    "Bodyweight Squat": "https://fitnessprogramer.com/wp-content/uploads/2021/02/Bodyweight-Squat.gif",
    "Jump Squats": "https://fitnessprogramer.com/wp-content/uploads/2021/02/Jump-Squat.gif",
    "Pistol Squat": "https://fitnessprogramer.com/wp-content/uploads/2021/02/Pistol-Squat.gif",
    "Lunges": "https://fitnessprogramer.com/wp-content/uploads/2021/02/Bodyweight-Lunge.gif",
    "Bulgarian Split Squat": "https://fitnessprogramer.com/wp-content/uploads/2021/02/Bodyweight-Bulgarian-Split-Squat.gif",
    "Glute Bridge": "https://fitnessprogramer.com/wp-content/uploads/2021/02/Glute-bridge.gif",
    "Single Leg Glute Bridge": "https://fitnessprogramer.com/wp-content/uploads/2021/02/Single-Leg-Glute-Bridge.gif",
    "Calf Raises": "https://fitnessprogramer.com/wp-content/uploads/2021/02/Calf-Raise.gif",
    "Wall Sit": "https://fitnessprogramer.com/wp-content/uploads/2021/02/Wall-Sit.gif",
    
    # Core Bodyweight
    "Plank": "https://fitnessprogramer.com/wp-content/uploads/2021/02/Plank.gif",
    "Side Plank": "https://fitnessprogramer.com/wp-content/uploads/2021/02/Side-Plank.gif",
    "Mountain Climbers": "https://fitnessprogramer.com/wp-content/uploads/2021/02/Mountain-Climber.gif",
    "Bicycle Crunches": "https://fitnessprogramer.com/wp-content/uploads/2021/02/Bicycle-Crunch.gif",
    "Leg Raises": "https://fitnessprogramer.com/wp-content/uploads/2021/02/Lying-Leg-Raise.gif",
    "Crunches": "https://fitnessprogramer.com/wp-content/uploads/2021/02/Crunches.gif",
    "V-Ups": "https://fitnessprogramer.com/wp-content/uploads/2021/02/V-ups.gif",
    "Flutter Kicks": "https://fitnessprogramer.com/wp-content/uploads/2021/02/Flutter-Kicks.gif",
    "Superman": "https://fitnessprogramer.com/wp-content/uploads/2021/02/Superman-Exercise.gif",
    "Bird Dog": "https://fitnessprogramer.com/wp-content/uploads/2021/02/bird-dog.gif",
    "Dead Bug": "https://fitnessprogramer.com/wp-content/uploads/2021/02/Dead-Bug.gif",
    "Burpees": "https://fitnessprogramer.com/wp-content/uploads/2021/02/Burpee.gif",
    
    # ===== DUMBBELL EXERCISES =====
    
    # Dumbbell Chest
    "Dumbbell Bench Press": "https://fitnessprogramer.com/wp-content/uploads/2021/02/Dumbbell-Bench-Press.gif",
    "Incline Dumbbell Press": "https://fitnessprogramer.com/wp-content/uploads/2021/02/Incline-Dumbbell-Press.gif",
    "Decline Dumbbell Press": "https://fitnessprogramer.com/wp-content/uploads/2021/02/Decline-Dumbbell-Press.gif",
    "Dumbbell Fly": "https://fitnessprogramer.com/wp-content/uploads/2021/02/Dumbbell-Fly.gif",
    "Incline Dumbbell Fly": "https://fitnessprogramer.com/wp-content/uploads/2021/02/Incline-Dumbbell-Fly.gif",
    "Dumbbell Pullover": "https://fitnessprogramer.com/wp-content/uploads/2021/02/Dumbbell-Pullover.gif",
    
    # Dumbbell Back
    "Dumbbell Row": "https://fitnessprogramer.com/wp-content/uploads/2021/02/Dumbbell-Bent-Over-Row.gif",
    "Single Arm Dumbbell Row": "https://fitnessprogramer.com/wp-content/uploads/2021/02/One-Arm-Dumbbell-Row.gif",
    "Dumbbell Deadlift": "https://fitnessprogramer.com/wp-content/uploads/2021/02/Dumbbell-Deadlift.gif",
    "Dumbbell Romanian Deadlift": "https://fitnessprogramer.com/wp-content/uploads/2021/02/Dumbbell-Romanian-Deadlift.gif",
    
    # Dumbbell Shoulders
    "Dumbbell Shoulder Press": "https://fitnessprogramer.com/wp-content/uploads/2021/02/Dumbbell-Shoulder-Press.gif",
    "Arnold Press": "https://fitnessprogramer.com/wp-content/uploads/2021/02/Arnold-Press.gif",
    "Lateral Raise": "https://fitnessprogramer.com/wp-content/uploads/2021/02/Dumbbell-Lateral-Raise.gif",
    "Front Raise": "https://fitnessprogramer.com/wp-content/uploads/2021/02/Dumbbell-Front-Raise.gif",
    "Rear Delt Fly": "https://fitnessprogramer.com/wp-content/uploads/2021/02/Dumbbell-Reverse-Fly.gif",
    "Dumbbell Shrugs": "https://fitnessprogramer.com/wp-content/uploads/2021/02/Dumbbell-Shrug.gif",
    
    # Dumbbell Arms
    "Dumbbell Curl": "https://fitnessprogramer.com/wp-content/uploads/2021/02/Dumbbell-Curl.gif",
    "Hammer Curl": "https://fitnessprogramer.com/wp-content/uploads/2021/02/Hammer-Curl.gif",
    "Concentration Curl": "https://fitnessprogramer.com/wp-content/uploads/2021/02/Concentration-Curl.gif",
    "Incline Dumbbell Curl": "https://fitnessprogramer.com/wp-content/uploads/2021/02/Incline-Dumbbell-Curl.gif",
    "Overhead Tricep Extension": "https://fitnessprogramer.com/wp-content/uploads/2021/02/Dumbbell-Overhead-Triceps-Extension.gif",
    "Tricep Kickback": "https://fitnessprogramer.com/wp-content/uploads/2021/02/Dumbbell-Kickback.gif",
    
    # Dumbbell Legs
    "Goblet Squat": "https://fitnessprogramer.com/wp-content/uploads/2021/02/goblet-squat.gif",
    "Dumbbell Squat": "https://fitnessprogramer.com/wp-content/uploads/2021/02/Dumbbell-Squat.gif",
    "Dumbbell Lunges": "https://fitnessprogramer.com/wp-content/uploads/2021/02/Dumbbell-Lunge.gif",
    "Dumbbell Bulgarian Split Squat": "https://fitnessprogramer.com/wp-content/uploads/2021/02/Dumbbell-Bulgarian-Split-Squat.gif",
    "Dumbbell Step-ups": "https://fitnessprogramer.com/wp-content/uploads/2021/02/Dumbbell-Step-up.gif",
    "Dumbbell Calf Raise": "https://fitnessprogramer.com/wp-content/uploads/2021/02/Dumbbell-Calf-Raise.gif",
    
    # Dumbbell Core
    "Russian Twists": "https://fitnessprogramer.com/wp-content/uploads/2021/02/Weighted-Russian-Twist.gif",
    "Dumbbell Side Bend": "https://fitnessprogramer.com/wp-content/uploads/2021/02/Dumbbell-Side-Bend.gif",
    "Dumbbell Wood Chop": "https://fitnessprogramer.com/wp-content/uploads/2021/02/Dumbbell-Wood-Chop.gif",
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
    print("🏠 Home Workout GIF Downloader (Bodyweight & Dumbbells)\n")
    print(f"Total exercises: {len(HOME_WORKOUT_GIFS)}\n")
    
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    
    success = 0
    skip = 0
    fail = 0
    
    for i, (name, url) in enumerate(HOME_WORKOUT_GIFS.items(), 1):
        filename = f"{to_kebab_case(name)}.gif"
        filepath = OUTPUT_DIR / filename
        
        progress = f"[{i}/{len(HOME_WORKOUT_GIFS)}]"
        
        if filepath.exists():
            print(f"{progress} {name}... ⏭️  (exists)")
            skip += 1
            continue
        
        try:
            print(f"{progress} {name}... ", end='', flush=True)
            download_file(url, filepath)
            size = filepath.stat().st_size
            
            if size < 1000:  # Less than 1KB = probably 404
                filepath.unlink()
                print(f"❌ (invalid file)")
                fail += 1
            else:
                print(f"✅ ({format_size(size)})")
                success += 1
                time.sleep(0.3)
        except Exception as e:
            print(f"❌ {e}")
            fail += 1
            if filepath.exists():
                filepath.unlink()
    
    print("\n" + "="*60)
    print(f"✅ Downloaded: {success}")
    print(f"⏭️  Skipped: {skip}")
    if fail > 0:
        print(f"❌ Failed: {fail}")
    print("="*60)
    print(f"\n🏠 Total Home Workout GIFs: {success + skip}")
    print(f"📁 {OUTPUT_DIR}")
    print("\n💪 Perfect for home workouts with minimal equipment!\n")

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n\n⚠️  Cancelled")
        sys.exit(1)
