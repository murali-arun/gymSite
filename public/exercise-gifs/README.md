# Exercise GIFs/Videos

This folder contains demonstration GIFs and videos for exercises.

## How to Add a New Exercise GIF

1. **Find or create a GIF** for the exercise
   - Use a clear, looping GIF that shows proper form
   - Recommended size: 480x270 to 640x360 (16:9 aspect ratio)
   - Format: GIF, MP4, or WebM

2. **Name the file** using kebab-case:
   - Use lowercase
   - Replace spaces with hyphens
   - Examples:
     - `bench-press.gif`
     - `dumbbell-shoulder-press.gif`
     - `bulgarian-split-squat.gif`

3. **Place the file** in this folder:
   ```
   /public/exercise-gifs/your-exercise-name.gif
   ```

4. **Update the mapping** in `/src/utils/exerciseMedia.js`:
   ```javascript
   const exerciseMediaMap = {
     // ... existing exercises
     'Your Exercise Name': 'your-exercise-name.gif',
   };
   ```

5. **Test it** by starting a workout with that exercise

## File Naming Examples

| Exercise Name | File Name |
|--------------|-----------|
| Bench Press | `bench-press.gif` |
| Bulgarian Split Squat | `bulgarian-split-squat.gif` |
| Dumbbell Shoulder Press | `dumbbell-shoulder-press.gif` |
| Pull-ups | `pull-ups.gif` |
| Barbell Row | `barbell-row.gif` |

## Tips

- Keep file sizes reasonable (< 5MB per GIF)
- Use tools like [ezgif.com](https://ezgif.com) to optimize GIFs
- Consider using MP4/WebM for smaller file sizes
- Show the full range of motion
- Use a neutral/transparent background if possible

## Current Status

✅ Mapping system ready
📁 Folder structure created
⏳ Add your GIFs here!
