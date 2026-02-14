#!/usr/bin/env python3
"""
Comprehensive Exercise GIF Scraper
Scrapes exercise GIFs from multiple fitness websites

Usage:
    python3 scripts/scrape_all_gifs.py
"""

import os
import sys
import urllib.request
import urllib.error
from pathlib import Path
import time
import re
from html.parser import HTMLParser

SCRIPT_DIR = Path(__file__).parent
PROJECT_ROOT = SCRIPT_DIR.parent
OUTPUT_DIR = PROJECT_ROOT / "public" / "exercise-gifs"

# ===== EXERCISE DATABASES =====

# Common exercises to search for
EXERCISES = [
    # Chest
    "Bench Press", "Incline Bench Press", "Decline Bench Press",
    "Dumbbell Bench Press", "Incline Dumbbell Press", "Decline Dumbbell Press",
    "Push-ups", "Dips", "Chest Dips", "Dumbbell Fly", "Cable Fly",
    "Pec Deck", "Chest Press Machine",
    
    # Back
    "Deadlift", "Romanian Deadlift", "Sumo Deadlift",
    "Barbell Row", "Dumbbell Row", "T-Bar Row", "Pendlay Row",
    "Pull-ups", "Chin-ups", "Neutral Grip Pull-ups",
    "Lat Pulldown", "Close Grip Lat Pulldown", "Wide Grip Lat Pulldown",
    "Seated Cable Row", "Cable Row", "Face Pulls",
    "Hyperextension", "Back Extension",
    
    # Shoulders
    "Overhead Press", "Military Press", "Push Press",
    "Dumbbell Shoulder Press", "Arnold Press", "Bradford Press",
    "Lateral Raise", "Front Raise", "Rear Delt Fly",
    "Upright Row", "Shrugs", "Cable Lateral Raise",
    
    # Arms
    "Barbell Curl", "EZ Bar Curl", "Dumbbell Curl",
    "Hammer Curl", "Preacher Curl", "Concentration Curl",
    "Cable Curl", "Incline Dumbbell Curl",
    "Tricep Pushdown", "Rope Pushdown", "Overhead Tricep Extension",
    "Skull Crushers", "Close Grip Bench Press", "Tricep Dips",
    "Dumbbell Kickback",
    
    # Legs
    "Squat", "Back Squat", "Front Squat", "Goblet Squat",
    "Bulgarian Split Squat", "Split Squat", "Lunges", "Walking Lunges",
    "Leg Press", "Hack Squat", "Leg Extension", "Leg Curl",
    "Leg Curl", "Hamstring Curl", "Seated Leg Curl",
    "Calf Raises", "Seated Calf Raise", "Standing Calf Raise",
    "Hip Thrust", "Glute Bridge", "Good Morning",
    
    # Core
    "Plank", "Side Plank", "Ab Wheel", "Ab Rollout",
    "Crunches", "Bicycle Crunches", "Russian Twists",
    "Leg Raises", "Hanging Leg Raises", "Hanging Knee Raises",
    "Mountain Climbers", "Dead Bug", "Bird Dog",
    "Cable Crunch", "Decline Sit-ups", "Toe Touches",
    "V-Ups", "Hollow Hold", "Dragon Flag",
]

# URL patterns for different websites
URL_PATTERNS = {
    'fitnessprogramer': [
        "https://fitnessprogramer.com/wp-content/uploads/2021/02/{}-{}.gif",
        "https://fitnessprogramer.com/wp-content/uploads/2021/04/{}-{}.gif",
        "https://fitnessprogramer.com/wp-content/uploads/2022/02/{}-{}.gif",
    ],
}

def to_kebab_case(text):
    """Convert exercise name to kebab-case"""
    return text.lower().replace(' ', '-').replace('_', '-')

def to_title_case(text):
    """Convert to Title Case for URLs"""
    return '-'.join(word.capitalize() for word in text.split())

def format_size(size_bytes):
    """Format bytes to MB"""
    return f"{size_bytes / (1024 * 1024):.2f} MB"

def download_file(url, filepath):
    """Download a file from URL"""
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    }
    req = urllib.request.Request(url, headers=headers)
    
    with urllib.request.urlopen(req, timeout=10) as response:
        if response.status != 200:
            raise Exception(f"HTTP {response.status}")
        
        with open(filepath, 'wb') as f:
            f.write(response.read())

def try_download_exercise(exercise_name, patterns):
    """Try to download an exercise GIF from multiple URL patterns"""
    filename = f"{to_kebab_case(exercise_name)}.gif"
    filepath = OUTPUT_DIR / filename
    
    # Skip if already exists
    if filepath.exists():
        return 'skip', 0
    
    # Try different URL patterns
    kebab = to_kebab_case(exercise_name)
    title = to_title_case(exercise_name)
    
    url_variants = []
    
    # Generate URL variants for FitnessProgramer
    for pattern in patterns.get('fitnessprogramer', []):
        # Handle different word counts safely
        parts = exercise_name.split()
        
        try:
            if len(parts) == 1:
                # Single word: "Plank" -> "Plank"
                single_pattern = pattern.replace("{}-{}", "{}")
                url_variants.append(single_pattern.format(title))
            elif len(parts) == 2:
                # Two words: "Bench Press" -> "Bench-Press"
                url_variants.append(pattern.format(parts[0].capitalize(), parts[1].capitalize()))
            elif len(parts) >= 3:
                # Three+ words: "Close Grip Bench Press" -> "Close-Grip-Bench-Press"
                url_variants.append(pattern.replace("{}-{}", "{}").format(title))
        except:
            # If format fails, try kebab case
            url_variants.append(pattern.replace("{}-{}", "{}").format(title))
    
    # Try each URL
    for url in url_variants:
        url = url.replace('--', '-').rstrip('-').replace('--', '-')
        try:
            download_file(url, filepath)
            size = filepath.stat().st_size
            if size > 1000:  # At least 1KB
                return 'success', size
            else:
                filepath.unlink()
        except:
            continue
    
    return 'fail', 0

def main():
    print("🌐 Comprehensive Exercise GIF Scraper\n")
    print(f"Searching for {len(EXERCISES)} exercises across multiple websites...\n")
    
    # Create output directory
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    
    success_count = 0
    skip_count = 0
    fail_count = 0
    
    for i, exercise in enumerate(EXERCISES, 1):
        progress = f"[{i}/{len(EXERCISES)}]"
        print(f"{progress} {exercise}... ", end='', flush=True)
        
        result, size = try_download_exercise(exercise, URL_PATTERNS)
        
        if result == 'skip':
            print("⏭️  (already exists)")
            skip_count += 1
        elif result == 'success':
            print(f"✅ ({format_size(size)})")
            success_count += 1
            time.sleep(0.3)  # Be nice to servers
        else:
            print("❌")
            fail_count += 1
        
        # Brief pause every 10 requests
        if i % 10 == 0:
            time.sleep(1)
    
    print("\n" + "="*60)
    print(f"✅ Successfully downloaded: {success_count}")
    if skip_count > 0:
        print(f"⏭️  Skipped (already exist): {skip_count}")
    if fail_count > 0:
        print(f"❌ Not found: {fail_count}")
    print("="*60 + "\n")
    
    total = success_count + skip_count
    if total > 0:
        print(f"🎉 You now have {total} exercise GIFs!")
        print(f"📁 Location: {OUTPUT_DIR}")
        print("\n💡 These will automatically appear in your workouts!\n")

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n\n⚠️  Scraping cancelled by user")
        sys.exit(1)
    except Exception as e:
        print(f"\n❌ Error: {e}")
        sys.exit(1)
