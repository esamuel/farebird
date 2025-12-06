# API Keys Setup Guide for Farebird

This guide will walk you through setting up all the API keys needed for full functionality.

---

## 1️⃣ Gemini AI API Key (Required for AI Features)

### What it enables:
- AI-powered flight search
- Price predictions and insights
- Vibe-based destination discovery
- Natural language search
- Price matrix generation
- Last-minute deals suggestions

### Steps to get your key:

1. **Go to Google AI Studio:**
   - Visit: https://makersuite.google.com/app/apikey
   - Or: https://aistudio.google.com/app/apikey

2. **Sign in with your Google account**

3. **Create API Key:**
   - Click "Create API Key"
   - Select "Create API key in new project" (or use existing project)
   - Copy the key (starts with `AIza...`)

4. **Add to your `.env.local` file:**
   ```bash
   VITE_API_KEY=AIzaSy...your_actual_key_here
   ```

5. **Important Notes:**
   - Free tier: 60 requests per minute
   - Paid tier available for higher limits
   - Keep this key secret (never commit to git)

---

## 2️⃣ Amadeus API (Required for Real Flight Pricing)

### What it enables:
- Real-time flight search from 500+ airlines
- Actual pricing data
- Live availability
- Flight schedules

### Steps to get your key:

1. **Create Account:**
   - Visit: https://developers.amadeus.com/register
   - Sign up with your email
   - Verify your email address

2. **Create an App:**
   - Go to: https://developers.amadeus.com/my-apps
   - Click "Create New App"
   - Name it "Farebird" (or anything you like)
   - Select "Flight Search" APIs

3. **Get Your Credentials:**
   - You'll see two keys:
     - **API Key** (Client ID)
     - **API Secret** (Client Secret)
   - Copy both!

4. **Add to Netlify Environment Variables:**
   
   Since Amadeus keys are server-side, add them to Netlify:
   
   - Go to: https://app.netlify.com/
   - Select your site
   - Go to: **Site settings** → **Environment variables**
   - Add these two variables:
     ```
     AMADEUS_CLIENT_ID = your_client_id_here
     AMADEUS_CLIENT_SECRET = your_client_secret_here
     ```
   - Click "Save"
   - **Redeploy your site** (Deploys → Trigger deploy → Deploy site)

5. **Important Notes:**
   - Test environment: 2,000 free API calls/month
   - Production: Requires approval and has costs
   - Start with test environment

---

## 3️⃣ Duffel API (Required for Real Bookings)

### What it enables:
- Real flight booking
- Secure payment processing
- E-ticket generation
- Booking management
- Duffel acts as merchant of record (no IATA license needed!)

### Steps to get your key:

1. **Create Account:**
   - Visit: https://app.duffel.com/join
   - Sign up with your email
   - Verify your email

2. **Complete Onboarding:**
   - Fill in your business details
   - You'll start in "test mode" automatically

3. **Get Your API Key:**
   - Go to: https://app.duffel.com/settings/access-tokens
   - You'll see your **Test API Token**
   - Copy it (starts with `duffel_test_...`)

4. **Add to your `.env.local` file:**
   ```bash
   VITE_DUFFEL_API_KEY=duffel_test_...your_actual_key_here
   ```

5. **Pricing (when you go live):**
   - $3 per order
   - 1% of order value
   - $2 per ancillary (bags, seats, etc.)
   - No monthly fees!

6. **Going to Production:**
   - Request production access from Duffel
   - They'll review your integration
   - You'll get a live API key (starts with `duffel_live_...`)

---

## 📝 Your Complete `.env.local` File Should Look Like:

```bash
# AI Search
VITE_API_KEY=AIzaSy...your_gemini_key

# Duffel Booking
VITE_DUFFEL_API_KEY=duffel_test_...your_duffel_key

# AviationStack (already configured)
# This is server-side, so it's in Netlify environment variables
```

---

## 🚀 After Adding Keys:

### Local Development:
1. Save your `.env.local` file
2. Restart your dev server:
   ```bash
   npm run dev
   ```

### Production (Netlify):
1. Make sure Amadeus keys are in Netlify environment variables
2. Push your code to GitHub:
   ```bash
   git add .
   git commit -m "docs: add API setup guide"
   git push origin main
   ```
3. Netlify will auto-deploy

---

## ✅ Testing Your Setup:

### Test Gemini AI:
- Go to "Search Flights"
- Try "Vibe Search" or "Natural Language Search"
- Should see AI-generated suggestions

### Test Amadeus:
- Do a regular flight search
- Check browser console - should see "Amadeus" in the source
- Should see real flight prices

### Test Duffel:
- Search for flights
- Click "Book Now" on a flight
- Should see booking modal (test mode)

---

## 🆘 Troubleshooting:

### Keys not working?
1. Check for typos in `.env.local`
2. Make sure there are no spaces around `=`
3. Restart your dev server
4. Clear browser cache

### Still seeing mock data?
- Check browser console for API errors
- Verify keys are correct
- Make sure you're not hitting rate limits

### Netlify deployment issues?
- Check environment variables are saved
- Trigger a manual redeploy
- Check deploy logs for errors

---

## 📞 Support:

- **Gemini AI**: https://ai.google.dev/docs
- **Amadeus**: https://developers.amadeus.com/support
- **Duffel**: https://duffel.com/docs or support@duffel.com

---

## 💰 Cost Summary:

| Service | Free Tier | Paid Tier |
|---------|-----------|-----------|
| **Gemini AI** | 60 req/min | $0.00025/1K chars |
| **Amadeus** | 2,000 calls/month | Pay per call |
| **Duffel** | Test mode free | $3 + 1% per booking |
| **AviationStack** | 100 calls/month | $9.99/month (10K calls) |

**Recommendation**: Start with free tiers, upgrade as needed!
