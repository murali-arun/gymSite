# 🎬 Where to Find Exercise GIFs

## 🌟 Best Free Resources

### 1. **JEFIT Exercise Database**
- URL: https://www.jefit.com/exercises/
- **Best for:** Comprehensive library, high quality
- Free to use, has GIFs for almost every exercise
- Download: Right-click on exercise animation → Save image

### 2. **ExRx.net**
- URL: https://exrx.net/Lists/Directory
- **Best for:** Detailed form guides with animations
- Free, extensive library
- Professional quality demonstrations

### 3. **Muscle & Motion**
- URL: https://www.muscleandmotion.com/
- **Best for:** Anatomical animations showing muscles
- Has free demo exercises
- Beautiful 3D visualizations

### 4. **Giphy - Fitness Category**
- URL: https://giphy.com/search/exercise
- **Best for:** Variety and easy download
- Search specific exercises
- Direct download available

### 5. **Strength Level**
- URL: https://strengthlevel.com/exercises
- **Best for:** Multiple angle views
- Free to download
- Good demonstrations

## 🛠️ How to Use the Download Scripts

### Method 1: Simple Script (Few GIFs)

1. Edit `scripts/downloadGifs.js`
2. Add URLs to the `exerciseUrls` array:
```javascript
const exerciseUrls = [
  { name: 'Bench Press', url: 'https://example.com/bench.gif' },
  { name: 'Squat', url: 'https://example.com/squat.gif' },
];
```
3. Run: `node scripts/downloadGifs.js`

### Method 2: Bulk Download (Many GIFs)

1. Create `scripts/gif-urls.txt`:
```
Bench Press | https://example.com/bench.gif
Squat | https://example.com/squat.gif
Deadlift | https://example.com/deadlift.gif
```

2. Run: `node scripts/downloadGifsFromFile.js`

### Method 3: Manual Download

1. Find GIF on website
2. Right-click → Save As...
3. Rename to kebab-case: `bench-press.gif`
4. Move to `public/exercise-gifs/`

## 📝 Quick Start Workflow

### Step-by-Step Process:

1. **Go to JEFIT**: https://www.jefit.com/exercises/
2. **Search** for your exercise (e.g., "Bench Press")
3. **Right-click** on the animation
4. **Save As** → Save to Downloads
5. **Rename** the file:
   - `Bench Press` → `bench-press.gif`
   - `Bulgarian Split Squat` → `bulgarian-split-squat.gif`
6. **Move** to `public/exercise-gifs/`
7. **Done!** The app will automatically show it

## 🎯 Recommended Starter Pack

Here are the most common exercises to download first:

**Upper Body (10 exercises)**
- Bench Press
- Incline Bench Press
- Dumbbell Row
- Pull-ups
- Lat Pulldown
- Overhead Press
- Lateral Raise
- Barbell Curl
- Tricep Pushdown
- Face Pulls

**Lower Body (8 exercises)**
- Squat
- Romanian Deadlift
- Bulgarian Split Squat
- Leg Press
- Leg Curl
- Leg Extension
- Calf Raises
- Lunges

**Core (5 exercises)**
- Plank
- Dead Bug
- Russian Twists
- Leg Raises
- Bicycle Crunches

## 🔍 Advanced: Creating Your Own GIFs

If you can't find a specific exercise:

1. **Screen record** a YouTube tutorial
2. Use **ezgif.com** to convert to GIF
3. Trim to one complete rep
4. Optimize file size (keep under 5MB)

### Tools:
- **ScreenToGif** (Windows) - Free screen recorder
- **Kap** (Mac) - Free screen recorder  
- **ezgif.com** - Online GIF optimizer

## 📋 URL Collection Template

Create a file `my-exercise-urls.txt`:

```
# Chest
Bench Press | [paste URL here]
Incline Bench Press | [paste URL here]
Dumbbell Fly | [paste URL here]

# Back
Deadlift | [paste URL here]
Pull-ups | [paste URL here]
Barbell Row | [paste URL here]

# Legs
Squat | [paste URL here]
Bulgarian Split Squat | [paste URL here]
Leg Press | [paste URL here]
```

Then run the bulk download script!

## ⚡ Pro Tips

1. **Batch download** - Get 20-30 exercises at once
2. **Check file size** - Keep GIFs under 5MB each
3. **Test locally** - Make sure GIFs loop smoothly
4. **Consistent quality** - Try to get all GIFs from same source
5. **Side view preferred** - Better for seeing form

## 🎁 Bonus: YouTube Channels with Great Demos

- **AthleanX** - Professional form demonstrations
- **Jeff Nippard** - Science-based tutorials
- **Squat University** - Excellent movement quality
- **Mind Pump** - Clear exercise tutorials

## 🤝 Legal Note

- Most exercise animations are freely available
- JEFIT and ExRx.net allow educational use
- Always respect copyright
- For commercial use, verify licensing

---

**Questions?** The mapping system is smart and will auto-match variations, so you don't need every single exercise variant!
