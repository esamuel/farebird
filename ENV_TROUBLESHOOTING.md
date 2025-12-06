# Environment Variables Not Loading - Troubleshooting Guide

## Issue
You see this error in the console:
```
Gemini API Key missing, returning empty result.
```

Even though you have `VITE_API_KEY` in your `.env.local` file.

---

## Quick Fixes (Try these in order)

### 1. **Restart Your Dev Server** ⚡
Environment variables are only loaded when the dev server starts.

```bash
# Stop the server (Ctrl+C)
# Then restart:
npm run dev
```

### 2. **Check Your `.env.local` Format** 📝
Make sure your file looks exactly like this (no spaces around `=`):

```bash
VITE_API_KEY=AIzaSyYourActualKeyHere
VITE_DUFFEL_API_KEY=duffel_test_YourActualKeyHere
```

**Common mistakes:**
- ❌ `VITE_API_KEY = AIza...` (spaces around =)
- ❌ `VITE_API_KEY="AIza..."` (quotes - not needed)
- ❌ `VITA_API_KEY=AIza...` (typo: VITA instead of VITE)
- ✅ `VITE_API_KEY=AIza...` (correct!)

### 3. **Verify File Location** 📁
The `.env.local` file must be in the **root** of your project:

```
go-skyscout/
├── .env.local          ← HERE (same level as package.json)
├── package.json
├── src/
└── ...
```

NOT in:
- ❌ `src/.env.local`
- ❌ `public/.env.local`
- ❌ Any subdirectory

### 4. **Check for Typos** 🔍
The variable name must be **exactly** `VITE_API_KEY`:
- ✅ `VITE_API_KEY` (correct)
- ❌ `VITA_API_KEY` (missing E)
- ❌ `VUE_API_KEY` (wrong framework)
- ❌ `REACT_APP_API_KEY` (wrong prefix)

### 5. **Verify the Key is Valid** 🔑
Test your Gemini API key:

1. Go to: https://aistudio.google.com/app/apikey
2. Check if your key is still active
3. If expired, create a new one
4. Replace the old key in `.env.local`

### 6. **Clear Cache and Rebuild** 🧹
Sometimes Vite caches old environment variables:

```bash
# Stop the server
# Delete cache
rm -rf node_modules/.vite

# Restart
npm run dev
```

---

## Diagnostic Tool

I've added a diagnostic tool to your app. When you run `npm run dev`, check the browser console for:

```
🔍 Environment Variables Diagnostic:
=====================================
✅ VITE_API_KEY: AIzaSy...
✅ VITE_DUFFEL_API_KEY: duffel_test_...
✅ MODE: development
✅ DEV: true
=====================================
```

If you see ❌ next to `VITE_API_KEY`, the variable isn't loading.

---

## Production (Netlify) Issues

If it works locally but not on Netlify:

### For Client-Side Keys (VITE_*):
These need to be in your `.env.local` AND committed to git (or set in Netlify build settings).

**Option 1: Commit to Git** (if key is not sensitive)
```bash
# Create .env.production
echo "VITE_API_KEY=your_key_here" > .env.production
git add .env.production
git commit -m "Add production env vars"
git push
```

**Option 2: Netlify Build Environment Variables**
1. Go to Netlify Dashboard
2. Site settings → Build & deploy → Environment
3. Add: `VITE_API_KEY` = `your_key_here`
4. Redeploy

---

## Still Not Working?

### Check the actual value in your code:
Add this temporarily to `services/geminiService.ts` line 16:

```typescript
const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_API_KEY || '' });
console.log('🔑 API Key loaded:', import.meta.env.VITE_API_KEY ? 'YES ✅' : 'NO ❌');
console.log('🔑 First 10 chars:', import.meta.env.VITE_API_KEY?.substring(0, 10));
```

This will show you if the key is actually being loaded.

---

## Common Scenarios

### Scenario 1: Works locally, fails on Netlify
**Solution**: Add `VITE_API_KEY` to Netlify environment variables

### Scenario 2: Fails locally and on Netlify
**Solution**: Check `.env.local` format and restart dev server

### Scenario 3: Key loads but API fails
**Solution**: Key might be invalid - regenerate at https://aistudio.google.com/

---

## Need More Help?

1. Check the browser console for the diagnostic output
2. Look for any error messages about the API key
3. Verify your key works by testing it directly at: https://aistudio.google.com/

If you're still stuck, share:
- The diagnostic output from the console
- Any error messages
- Whether it's failing locally or on Netlify
