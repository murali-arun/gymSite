# Emergency Template Fix

## Quick Fix - Run in Browser Console (F12):

```javascript
// Step 1: Check what's stored
console.log('Current templates:', localStorage.getItem('workoutTemplates'));

// Step 2: Clear corrupted templates
localStorage.removeItem('workoutTemplates');

// Step 3: Refresh page
location.reload();
```

## If that doesn't work:

```javascript
// Nuclear option - clear ALL localStorage
localStorage.clear();
location.reload();
```

## After clearing, you'll need to:
1. Re-create your user profile
2. Templates will be gone (but you can regenerate with AI)

---

## Alternative: Use Dev Server

The dev server shows actual error messages:

```bash
npm run dev
# Then open http://localhost:3000
```

Dev mode will show the REAL error, not minified React error #306.
