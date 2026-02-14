# 🚀 Quick Start - Download Exercise GIFs

## Python Scripts (Recommended)

### Method 1: Bulk Download (Easiest!)

1. **Run the script to create template:**
```bash
python3 scripts/download_gifs_from_file.py
```

2. **Edit the created file** `scripts/gif-urls.txt`:
```
Bench Press | https://fitnessprogramer.com/wp-content/uploads/2021/02/Barbell-Bench-Press.gif
Squat | https://fitnessprogramer.com/wp-content/uploads/2021/02/Barbell-Squat.gif
Deadlift | https://fitnessprogramer.com/wp-content/uploads/2021/02/Deadlift.gif
```

3. **Run again to download:**
```bash
python3 scripts/download_gifs_from_file.py
```

### Method 2: Edit Script Directly

1. **Edit** `scripts/download_gifs.py`
2. **Add URLs** to the `EXERCISE_URLS` list
3. **Run:**
```bash
python3 scripts/download_gifs.py
```

## 🌐 Best GIF Sources

### **FitnessProgramer.com** (Recommended!)
- Direct GIF links
- High quality
- Example: `https://fitnessprogramer.com/wp-content/uploads/2021/02/Barbell-Bench-Press.gif`

**Common Exercises:**
```
Bench Press | https://fitnessprogramer.com/wp-content/uploads/2021/02/Barbell-Bench-Press.gif
Squat | https://fitnessprogramer.com/wp-content/uploads/2021/02/Barbell-Squat.gif
Deadlift | https://fitnessprogramer.com/wp-content/uploads/2021/02/Deadlift.gif
Pull-ups | https://fitnessprogramer.com/wp-content/uploads/2021/04/Pull-up.gif
Overhead Press | https://fitnessprogramer.com/wp-content/uploads/2021/02/Barbell-Shoulder-Press.gif
Barbell Row | https://fitnessprogramer.com/wp-content/uploads/2021/02/Barbell-Row.gif
Romanian Deadlift | https://fitnessprogramer.com/wp-content/uploads/2021/02/Romanian-Deadlift.gif
Lat Pulldown | https://fitnessprogramer.com/wp-content/uploads/2021/02/Lat-Pulldown.gif
Dumbbell Curl | https://fitnessprogramer.com/wp-content/uploads/2021/02/Dumbbell-Curl.gif
Tricep Pushdown | https://fitnessprogramer.com/wp-content/uploads/2021/02/rope-push-down.gif
```

### **ExRx.net**
- Professional animations
- Browse: https://exrx.net/Lists/Directory
- Find exercise → Copy GIF link

### **JEFIT.com**
- Browse: https://www.jefit.com/exercises/
- Right-click on animation → Copy image address

## 📝 Starter Pack URLs

Create `scripts/gif-urls.txt` with these:

```
# Upper Body
Bench Press | https://fitnessprogramer.com/wp-content/uploads/2021/02/Barbell-Bench-Press.gif
Incline Bench Press | https://fitnessprogramer.com/wp-content/uploads/2021/02/Incline-Barbell-Bench-Press.gif
Push-ups | https://fitnessprogramer.com/wp-content/uploads/2021/02/Push-up.gif
Pull-ups | https://fitnessprogramer.com/wp-content/uploads/2021/04/Pull-up.gif
Barbell Row | https://fitnessprogramer.com/wp-content/uploads/2021/02/Barbell-Row.gif
Lat Pulldown | https://fitnessprogramer.com/wp-content/uploads/2021/02/Lat-Pulldown.gif
Overhead Press | https://fitnessprogramer.com/wp-content/uploads/2021/02/Barbell-Shoulder-Press.gif
Lateral Raise | https://fitnessprogramer.com/wp-content/uploads/2021/02/Dumbbell-Lateral-Raise.gif

# Lower Body
Squat | https://fitnessprogramer.com/wp-content/uploads/2021/02/Barbell-Squat.gif
Deadlift | https://fitnessprogramer.com/wp-content/uploads/2021/02/Deadlift.gif
Romanian Deadlift | https://fitnessprogramer.com/wp-content/uploads/2021/02/Romanian-Deadlift.gif
Bulgarian Split Squat | https://fitnessprogramer.com/wp-content/uploads/2021/02/Dumbbell-Bulgarian-Split-Squat.gif
Leg Press | https://fitnessprogramer.com/wp-content/uploads/2021/02/LEG-PRESS.gif
Lunges | https://fitnessprogramer.com/wp-content/uploads/2021/02/Dumbbell-Lunge.gif

# Arms
Barbell Curl | https://fitnessprogramer.com/wp-content/uploads/2021/02/Barbell-Curl.gif
Dumbbell Curl | https://fitnessprogramer.com/wp-content/uploads/2021/02/Dumbbell-Curl.gif
Hammer Curl | https://fitnessprogramer.com/wp-content/uploads/2021/02/Hammer-Curl.gif
Tricep Pushdown | https://fitnessprogramer.com/wp-content/uploads/2021/02/rope-push-down.gif

# Core
Plank | https://fitnessprogramer.com/wp-content/uploads/2021/02/Plank.gif
Russian Twists | https://fitnessprogramer.com/wp-content/uploads/2021/02/Weighted-Russian-Twist.gif
Leg Raises | https://fitnessprogramer.com/wp-content/uploads/2021/02/Hanging-Straight-Leg-Raise.gif
```

Then run:
```bash
python3 scripts/download_gifs_from_file.py
```

## ✅ All Done!

The GIFs will automatically appear in your workouts - no extra configuration needed!

## 🔍 Finding More GIFs

### Browse FitnessProgramer.com:
1. Go to: https://fitnessprogramer.com/exercise-library/
2. Find your exercise
3. Right-click on GIF → Copy image address
4. Add to your `gif-urls.txt`

### Pattern for FitnessProgramer URLs:
```
https://fitnessprogramer.com/wp-content/uploads/2021/02/[Exercise-Name].gif
```

Examples:
- `Dumbbell-Bench-Press.gif`
- `Cable-Fly.gif`
- `Front-Squat.gif`
