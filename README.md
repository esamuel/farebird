# Farebird 🐦

**Catch the best flight deals before they fly away.**

Farebird is a smart flight management platform that uses AI to find, track, and predict the cheapest flights for your next adventure. Unlike standard aggregators, we aim to be your intelligent travel assistant.

**Website:** https://farebird.app (coming soon)  
**Current Demo:** https://go-skyscout-app.netlify.app

---

## 🚀 Current Features

*   **AI Flight Search:** Generates realistic flight options and pricing using Gemini 2.5 AI.
*   **Smart Sorting:** Automatically calculates "Best Deals" based on a balance of price and duration.
*   **Price Insights:** Provides AI-driven advice on whether to buy now or wait based on historical trends.
*   **Saved Trips:** Bookmark flights to track them for later.
*   **🗣️ Natural Language Search:** Type conversational queries like "Weekend trip to somewhere warm in December under $400" - AI parses and searches automatically.
*   **📅 Flexible Price Matrix:** Visual grid showing prices for ±3 days from your selected date to find the cheapest option instantly.
*   **🧳 Real Cost Calculator:** Toggle carry-on and checked bag options to see the true final price including all fees upfront.
*   **🌍 Vibe Search:** Discover destinations by mood (Nightlife, Hiking, Romantic, Beach, Culture, Adventure) with AI-powered recommendations.
*   **⏰ Last Minute Deals:** Find deeply discounted flights departing within 7 days.
*   **⚡ Mistake Fare Alerts:** Get notified of airline pricing errors with 50-90% discounts (PRO feature).
*   **🎫 In-App Booking:** Complete flight booking & payment without leaving Farebird (via Duffel API).
*   **💳 Multiple Payment Options:** Credit card (Duffel) or PayPal for user preference.
*   **👥 Travelers & Cabin Class:** Select adults, children, infants and cabin class (Economy to First).
*   **📆 Visual Date Picker:** Beautiful dual-month calendar for selecting departure and return dates.

---

## 📊 Competitive Analysis

### How Competitors Monetize (All FREE to Users)

| App | Primary Revenue | Secondary Revenue |
|-----|----------------|-------------------|
| **Google Flights** | None (drives traffic to Google ecosystem) | N/A |
| **Skyscanner** | Affiliate commissions (78% of £271M) | Display ads, B2B API |
| **Kayak** | Affiliate commissions + ads | Hotel/car bookings |
| **Hopper** | Commissions (5-10%) | **Fintech products (50% of revenue!)** |

### Hopper's Fintech Model (Key Insight)
Hopper makes **50% of revenue from premium add-ons**, not just commissions:
- **Price Freeze**: $30 - Lock price for 21 days
- **Cancel for Any Reason**: $30 - 100% refund anytime
- **Leave for Any Reason**: $30 - Rebook hotel free
- **Flight Disruption Guarantee**: $25 - Rebooking if delayed

### What Competitors Offer FREE (We Can't Charge For)

| Feature | Google | Skyscanner | Kayak | Hopper |
|---------|--------|------------|-------|--------|
| Flight search | ✅ | ✅ | ✅ | ✅ |
| Price alerts | ✅ | ✅ | ✅ | ✅ |
| Price calendar | ✅ | ✅ | ✅ | ✅ |
| Explore map | ✅ | ✅ | ✅ | ❌ |
| Multi-city search | ✅ | ✅ | ✅ | ✅ |
| Price predictions | Basic | ❌ | ❌ | ✅ (AI) |

---

## 🎯 Market Gaps (What NO ONE Offers Free)

| Feature | Competitors | Farebird Pro Opportunity |
|---------|-------------|--------------------------|
| **AI Trip Planner** | None | Build full itinerary with AI |
| **Real-time Seat Maps** | Paid only | Show best seats for price |
| **Hidden City Ticketing Finder** | None | Find skiplagged routes |
| **Group Booking Optimizer** | None | Best strategy for 3+ travelers |
| **Mistake Fare Alerts** | Going.com ($49/yr) | Instant error fare notifications |
| **Price Drop Guarantee** | Hopper ($30/flight) | We refund the difference |
| **Multi-Airline Combo Builder** | Kiwi only | Build cheapest A→B→C routes |
| **Carbon Offset Calculator** | Basic/none | Detailed eco-impact + offset |
| **Loyalty Points Optimizer** | None | Which card/airline maximizes points |
| **Flexible Date AI** | Basic calendars | "Find me cheapest in next 3 months" |

---

## 💰 Monetization Strategy

### Tier 1: Free (Drive Traffic)
- Basic flight search
- Single price alert
- 7-day price history
- Standard AI predictions
- Affiliate booking links (we earn commission)

### Tier 2: Pro - $4.99/month or $39/year
- Unlimited price alerts
- 90-day price history
- Advanced AI predictions with confidence %
- Mistake fare alerts
- Multi-city trip optimizer
- Priority customer support
- Ad-free experience

### Tier 3: Fintech Add-ons (Per Transaction)
Like Hopper, but **cheaper**:
- **Price Lock**: $19 (vs Hopper's $30)
- **Cancel Protection**: $24 (vs Hopper's $30)
- **Price Drop Refund**: $15 (unique to us)

---

## 🏆 Our Unique Selling Points (USP)

What makes Farebird **better** than all others:

1. **AI-First Approach** - Gemini-powered natural language search ("Find me a beach trip under $500 in January")
2. **Vibe Search** - No other app lets you search by mood/experience
3. **Last Minute Deals** - Curated flash sales with real discounts
4. **Transparent Pricing** - Show baggage fees upfront (others hide this)
5. **Price Protection Cheaper** - Undercut Hopper's fintech fees by 30%

---

## 🗺️ Development Roadmap

### Phase 1: Core Features ✅
- [x] AI-powered flight search
- [x] Natural language search
- [x] Vibe-based destination discovery
- [x] Last minute deals
- [x] Booking integration (Skyscanner)
- [x] Travelers & cabin class selection
- [x] Visual date picker

### Phase 2: Engagement (Current)
- [x] **Mistake Fare Alerts** - High value, low cost to implement ✅
- [x] **In-App Booking** - Duffel API integration for seamless booking ✅
- [x] **PayPal Integration** - Secondary payment option ✅
- [ ] User authentication (login/signup)
- [ ] Saved searches & price alerts
- [ ] Email notifications

### Phase 3: Monetization
- [ ] Pro subscription tier (Paddle/Lemon Squeezy)
- [ ] Price Lock feature (insurance partner)
- [ ] Cancel Protection add-on
- [ ] Payment integration for subscriptions

### Phase 4: Growth
- [ ] Collaborative "Trip Boards" for group planning
- [ ] Layover Intelligence (connection risk analysis)
- [ ] Mobile app (React Native)
- [ ] Multi-language support

---

## 🛠️ Tech Stack

- **Frontend:** React 18, TypeScript, Tailwind CSS, Lucide Icons
- **AI:** Google Gemini 2.5 Flash
- **Build:** Vite
- **Deployment:** Netlify
- **Booking:** Duffel API (in-app booking & payment)
- **Payments:** Duffel (primary), PayPal (secondary)
- **Fallback:** Skyscanner/Kayak affiliate links

---

## 📦 Getting Started

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/go-skyscout.git
   cd go-skyscout
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   # Copy the example file
   cp .env.example .env.local
   
   # Edit with your keys
   VITE_API_KEY=your_gemini_api_key
   VITE_DUFFEL_API_KEY=your_duffel_api_key  # Optional: for in-app booking
   VITE_PAYPAL_CLIENT_ID=your_paypal_client_id  # Optional: for PayPal payments
   ```

4. Run the dev server:
   ```bash
   npm run dev
   ```

5. Build for production:
   ```bash
   npm run build
   ```

---

## 🎫 Booking Integration

### Primary: Duffel API (In-App Booking)

Duffel handles flight booking, ticketing, and payment processing. Users never leave Farebird!

1. Sign up at https://app.duffel.com/join
2. Get your API key from the dashboard
3. Add to `.env.local`:
   ```bash
   VITE_DUFFEL_API_KEY=duffel_test_xxx
   ```

**Pricing:** $3/order + 1% of order value + $2/ancillary

**Benefits:**
- No IATA accreditation needed (Duffel is merchant of record)
- 300+ airlines supported
- Handles ticketing, refunds, and customer support
- Modern REST API with great documentation

### Secondary: PayPal

Optional payment method for users who prefer PayPal.

1. Create app at https://developer.paypal.com/
2. Add to `.env.local`:
   ```bash
   VITE_PAYPAL_CLIENT_ID=your_client_id
   VITE_PAYPAL_MODE=sandbox  # or 'live' for production
   ```

### Fallback: Affiliate Links

When Duffel is not configured, users are redirected to external booking sites:

- **Skyscanner:** https://www.partners.skyscanner.net/
- **Kayak:** https://www.kayak.com/affiliates
- **Kiwi:** https://partners.kiwi.com/

Configure affiliate IDs in `services/affiliateConfig.ts`.

---

## 📄 License

MIT License - feel free to use this project as a starting point for your own flight search application.
