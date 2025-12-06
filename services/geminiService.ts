import { GoogleGenAI, Type } from "@google/genai";
import { Flight, SearchParams, LastMinuteDeal } from "../types";

// ==========================================
// 🔑 API CONFIGURATION
// Amadeus API is now handled via Netlify serverless functions
// Set AMADEUS_CLIENT_ID and AMADEUS_CLIENT_SECRET in Netlify dashboard
// For local dev, credentials can still be stored in localStorage
// ==========================================

// Check if we're in production (Netlify) or local development
const isProduction = import.meta.env.PROD || window.location.hostname !== 'localhost';

// Initialize Gemini
const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_API_KEY || '' });

// --- Helper: Get Credentials (for local development only) ---
export const getAmadeusCredentials = () => {
  const id = localStorage.getItem('farebird_amadeus_id') || '';
  const secret = localStorage.getItem('farebird_amadeus_secret') || '';
  return { id, secret };
};

// --- Check if Amadeus is configured ---
export const isAmadeusConfigured = () => {
  if (isProduction) {
    // In production, we assume it's configured via Netlify env vars
    // The serverless function will return source: 'AI' if not configured
    return true;
  }
  const { id, secret } = getAmadeusCredentials();
  return !!(id && secret);
};

// --- Helper: Get Amadeus Auth Token (for local development) ---
let amadeusToken: string | null = null;
let tokenExpiry: number = 0;

const getAmadeusToken = async (): Promise<string | null> => {
  const { id, secret } = getAmadeusCredentials();

  if (!id || !secret) return null;
  if (amadeusToken && Date.now() < tokenExpiry) return amadeusToken;

  try {
    const params = new URLSearchParams();
    params.append('grant_type', 'client_credentials');
    params.append('client_id', id);
    params.append('client_secret', secret);

    const res = await fetch('https://test.api.amadeus.com/v1/security/oauth2/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error("Amadeus Token Error:", errorText);
      throw new Error('Failed to get Amadeus token');
    }

    const data = await res.json();
    amadeusToken = data.access_token;
    tokenExpiry = Date.now() + (data.expires_in * 1000) - 60000; // Buffer of 1 min
    return amadeusToken;
  } catch (error) {
    console.warn("Amadeus Auth Error (Falling back to AI):", error);
    return null;
  }
};

// --- Search via Netlify Serverless Function (Production) ---
const searchFlightsViaNetlify = async (params: SearchParams): Promise<{ source: 'API' | 'AI', data: Flight[] }> => {
  const queryParams = new URLSearchParams({
    origin: params.origin,
    destination: params.destination,
    date: params.date,
    adults: String(params.adults || params.passengers || 1),
  });

  if (params.returnDate) {
    queryParams.append('returnDate', params.returnDate);
  }
  if (params.cabinClass) {
    queryParams.append('cabinClass', params.cabinClass);
  }

  const response = await fetch(`/api/amadeus-search?${queryParams}`);

  if (!response.ok) {
    throw new Error(`Netlify function error: ${response.status}`);
  }

  const result = await response.json();
  return {
    source: result.source || 'AI',
    data: result.data || []
  };
};

// --- Real Search: Amadeus ---
const searchFlightsWithAmadeus = async (params: SearchParams): Promise<Flight[]> => {
  const token = await getAmadeusToken();
  if (!token) throw new Error("No API Token available");

  const url = `https://test.api.amadeus.com/v2/shopping/flight-offers?originLocationCode=${params.origin}&destinationLocationCode=${params.destination}&departureDate=${params.date}&adults=${params.passengers}&max=10`;

  const res = await fetch(url, {
    headers: { 'Authorization': `Bearer ${token}` }
  });

  if (!res.ok) throw new Error(`Amadeus API Error: ${res.statusText}`);

  const data = await res.json();

  if (!data.data) return [];

  // Map Amadeus response to our simple Flight interface
  return data.data.map((offer: any) => {
    const outboundItinerary = offer.itineraries[0];
    const outboundSegment = outboundItinerary.segments[0];
    const outboundLastSegment = outboundItinerary.segments[outboundItinerary.segments.length - 1];
    const outboundDuration = outboundItinerary.duration.replace('PT', '').toLowerCase();

    let returnFlight = undefined;
    if (offer.itineraries.length > 1) {
      const returnItinerary = offer.itineraries[1];
      const returnSegment = returnItinerary.segments[0];
      const returnLastSegment = returnItinerary.segments[returnItinerary.segments.length - 1];
      const returnDuration = returnItinerary.duration.replace('PT', '').toLowerCase();

      returnFlight = {
        airline: returnSegment.carrierCode,
        flightNumber: `${returnSegment.carrierCode}${returnSegment.number}`,
        departureTime: returnSegment.departure.at,
        arrivalTime: returnLastSegment.arrival.at,
        duration: returnDuration,
        stops: returnItinerary.segments.length - 1
      };
    }

    return {
      id: offer.id,
      airline: outboundSegment.carrierCode, // In a real app, you'd map "LH" to "Lufthansa"
      flightNumber: `${outboundSegment.carrierCode}${outboundSegment.number}`,
      origin: outboundSegment.departure.iataCode,
      destination: outboundLastSegment.arrival.iataCode,
      departureTime: outboundSegment.departure.at,
      arrivalTime: outboundLastSegment.arrival.at,
      price: parseFloat(offer.price.total),
      currency: offer.price.currency,
      duration: outboundDuration,
      stops: outboundItinerary.segments.length - 1,
      tags: ['Real Data'],
      returnFlight: returnFlight
    };
  });
};

// --- Fallback Search: Gemini AI ---
const searchFlightsWithGemini = async (params: SearchParams): Promise<Flight[]> => {
  // Check if API key is configured
  if (!import.meta.env.VITE_API_KEY) {
    console.warn("Gemini API Key missing, returning empty result.");
    return [];
  }

  try {
    const prompt = `
      Generate 5 realistic flight options from ${params.origin} to ${params.destination} on ${params.date}.
      ${params.returnDate ? `Include return flight details from ${params.destination} to ${params.origin} on ${params.returnDate}.` : ''}
      Include a mix of direct and connecting flights. vary the airlines and prices.
      Price should be realistic for a ${params.returnDate ? 'round-trip' : 'one-way'} ticket in USD.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              airline: { type: Type.STRING },
              flightNumber: { type: Type.STRING },
              origin: { type: Type.STRING },
              destination: { type: Type.STRING },
              departureTime: { type: Type.STRING, description: "ISO 8601 format date string" },
              arrivalTime: { type: Type.STRING, description: "ISO 8601 format date string" },
              price: { type: Type.NUMBER },
              currency: { type: Type.STRING },
              duration: { type: Type.STRING, description: "e.g. 2h 45m" },
              stops: { type: Type.NUMBER },
              tags: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "Tags like 'Cheapest', 'Fastest', 'Eco'"
              },
              baggageFees: {
                type: Type.OBJECT,
                properties: {
                  carryOn: { type: Type.NUMBER, description: "Fee for carry-on bag in USD" },
                  checkedBag: { type: Type.NUMBER, description: "Fee for checked bag in USD" }
                }
              },
              returnFlight: {
                type: Type.OBJECT,
                nullable: true,
                properties: {
                  airline: { type: Type.STRING },
                  flightNumber: { type: Type.STRING },
                  departureTime: { type: Type.STRING, description: "ISO 8601 format date string" },
                  arrivalTime: { type: Type.STRING, description: "ISO 8601 format date string" },
                  duration: { type: Type.STRING },
                  stops: { type: Type.NUMBER }
                }
              }
            }
          }
        }
      }
    });

    const data = JSON.parse(response.text || '[]');
    return data as Flight[];
  } catch (error) {
    console.error("Gemini Flight Search Error:", error);
    return [];
  }
};

import { searchFlights as searchDuffelFlights, duffelOfferToFlight, isDuffelEnabled, mapCabinClass } from './duffelService';
import { searchFlightsWithKiwi, isKiwiEnabled } from './kiwiService';

// --- Main Exported Function ---
export const searchFlightsWithAI = async (params: SearchParams): Promise<{ source: 'API' | 'AI' | 'MIXED', data: Flight[] }> => {
  const flightResults: Flight[] = [];
  const sources: string[] = [];

  // 1. Amadeus Search (via Netlify or Direct)
  const amadeusPromise = (async () => {
    if (isProduction) {
      try {
        const result = await searchFlightsViaNetlify(params);
        if (result.source === 'API') {
          return result.data;
        }
      } catch (e) { console.warn('Amadeus Netlify search failed', e); }
    } else {
      const { id, secret } = getAmadeusCredentials();
      if (id && secret) {
        try {
          return await searchFlightsWithAmadeus(params);
        } catch (e) { console.warn('Amadeus direct search failed', e); }
      }
    }
    return [];
  })();

  // 2. Duffel Search
  const duffelPromise = (async () => {
    if (isDuffelEnabled()) {
      try {
        const offers = await searchDuffelFlights({
          slices: [{
            origin: params.origin,
            destination: params.destination,
            departure_date: params.date,
          }],
          passengers: Array.from({ length: params.adults || 1 }).map(() => ({ type: 'adult' })),
          cabin_class: mapCabinClass(params.cabinClass || 'economy'),
          return_offers: true,
        });
        return offers.map(offer => ({
          ...duffelOfferToFlight(offer),
          tags: ['Duffel', ...duffelOfferToFlight(offer).tags || []]
        }));
      } catch (e) { console.warn('Duffel search failed', e); }
    }
    return [];
  })();

  // 3. Kiwi Search
  const kiwiPromise = (async () => {
    if (isKiwiEnabled()) {
      try {
        return await searchFlightsWithKiwi(params);
      } catch (e) { console.warn('Kiwi search failed', e); }
    }
    return [];
  })();

  // Execute all searches in parallel
  const [amadeusFlights, duffelFlights, kiwiFlights] = await Promise.all([
    amadeusPromise,
    duffelPromise,
    kiwiPromise
  ]);

  if (amadeusFlights.length > 0) {
    flightResults.push(...amadeusFlights);
    sources.push('Amadeus');
  }
  if (duffelFlights.length > 0) {
    flightResults.push(...duffelFlights);
    sources.push('Duffel');
  }
  if (kiwiFlights.length > 0) {
    flightResults.push(...kiwiFlights);
    sources.push('Kiwi');
  }

  // If we have real results, return them
  if (flightResults.length > 0) {
    // Deduplicate by flight number (simple check)
    const uniqueFlights = Array.from(new Map(flightResults.map(f => [f.flightNumber + f.departureTime, f])).values());
    return { source: sources.length > 1 ? 'MIXED' : 'API', data: uniqueFlights };
  }

  // Fallback to AI if no real APIs returned data
  console.log("No API results found, falling back to Gemini AI...");
  const aiData = await searchFlightsWithGemini(params);
  return { source: 'AI', data: aiData };
};

export const getPriceInsights = async (origin: string, destination: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Provide a brief (2 sentences) insight about flight price trends between ${origin} and ${destination}. Is now a good time to buy?`,
    });
    return response.text || "Unable to generate insights at this time.";
  } catch (error) {
    return "Insights unavailable.";
  }
};

// --- Natural Language Search Parser ---
export const parseNaturalLanguageQuery = async (query: string): Promise<SearchParams | null> => {
  // Check if API key is configured
  if (!import.meta.env.VITE_API_KEY) {
    console.warn("Gemini API Key missing, using basic parsing fallback");
    // Basic fallback parsing using regex
    return parseQueryWithRegex(query);
  }

  try {
    const prompt = `
      Parse this natural language flight search query into structured parameters: "${query}"
      
      Extract:
      - origin (airport code if mentioned, otherwise use "JFK" as default)
      - destination (airport code or city name)
      - date (YYYY-MM-DD format, interpret relative dates like "next weekend", "in December")
      - passengers (default to 1 if not mentioned)
      
      If the query is too vague or doesn't contain enough information, return null values for missing fields.
      Today's date is ${new Date().toISOString().split('T')[0]}.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            origin: { type: Type.STRING },
            destination: { type: Type.STRING },
            date: { type: Type.STRING },
            passengers: { type: Type.NUMBER }
          }
        }
      }
    });

    const data = JSON.parse(response.text || '{}');
    return data as SearchParams;
  } catch (error) {
    console.error("Natural Language Parse Error:", error);
    // Fall back to regex parsing
    return parseQueryWithRegex(query);
  }
};

// Basic regex-based query parser (fallback when Gemini is unavailable)
const parseQueryWithRegex = (query: string): SearchParams | null => {
  const lowerQuery = query.toLowerCase();

  // Common cities/airports mapping
  const cityToAirport: Record<string, string> = {
    'paris': 'CDG', 'london': 'LHR', 'tokyo': 'NRT', 'new york': 'JFK',
    'los angeles': 'LAX', 'miami': 'MIA', 'chicago': 'ORD', 'boston': 'BOS',
    'san francisco': 'SFO', 'seattle': 'SEA', 'las vegas': 'LAS', 'orlando': 'MCO',
    'rome': 'FCO', 'barcelona': 'BCN', 'amsterdam': 'AMS', 'dubai': 'DXB',
    'atlanta': 'ATL', 'denver': 'DEN', 'phoenix': 'PHX', 'houston': 'IAH',
    'dallas': 'DFW', 'philadelphia': 'PHL', 'detroit': 'DTW', 'minneapolis': 'MSP',
    'madrid': 'MAD', 'berlin': 'BER', 'munich': 'MUC', 'vienna': 'VIE',
    'zurich': 'ZRH', 'istanbul': 'IST', 'athens': 'ATH', 'lisbon': 'LIS',
    'hong kong': 'HKG', 'singapore': 'SIN', 'bangkok': 'BKK', 'sydney': 'SYD',
    'melbourne': 'MEL', 'toronto': 'YYZ', 'vancouver': 'YVR', 'montreal': 'YUL',
    'mexico city': 'MEX', 'cancun': 'CUN', 'sao paulo': 'GRU', 'buenos aires': 'EZE'
  };

  let origin = 'JFK'; // Default
  let destination = '';

  // Try to extract origin (look for "from [city]" pattern)
  const fromMatch = lowerQuery.match(/from\s+([a-z\s]+?)(?:\s+to|\s+in|\s+for|$)/);
  if (fromMatch) {
    const fromCity = fromMatch[1].trim();
    for (const [city, code] of Object.entries(cityToAirport)) {
      if (fromCity.includes(city)) {
        origin = code;
        break;
      }
    }
    // Also check for direct airport codes (e.g., "from LAX")
    const airportCodeMatch = fromCity.match(/\b([A-Z]{3})\b/i);
    if (airportCodeMatch) {
      origin = airportCodeMatch[1].toUpperCase();
    }
  }

  // Try to extract destination (look for "to [city]" pattern or just city names)
  const toMatch = lowerQuery.match(/to\s+([a-z\s]+?)(?:\s+from|\s+in|\s+for|\s+on|\s+next|\s+under|$)/);
  if (toMatch) {
    const toCity = toMatch[1].trim();
    for (const [city, code] of Object.entries(cityToAirport)) {
      if (toCity.includes(city)) {
        destination = code;
        break;
      }
    }
    // Also check for direct airport codes
    const airportCodeMatch = toCity.match(/\b([A-Z]{3})\b/i);
    if (airportCodeMatch) {
      destination = airportCodeMatch[1].toUpperCase();
    }
  } else {
    // If no "to" keyword, look for any city name in the query
    for (const [city, code] of Object.entries(cityToAirport)) {
      if (lowerQuery.includes(city) && cityToAirport[city] !== origin) {
        destination = code;
        break;
      }
    }
  }

  // Extract number of passengers
  const passengersMatch = lowerQuery.match(/(\d+)\s*(people|person|passenger|traveler)/);
  const passengers = passengersMatch ? parseInt(passengersMatch[1]) : 1;

  // Extract date (basic - look for month names)
  const today = new Date();
  const months = ['january', 'february', 'march', 'april', 'may', 'june',
    'july', 'august', 'september', 'october', 'november', 'december'];
  let date = today.toISOString().split('T')[0];

  for (let i = 0; i < months.length; i++) {
    if (lowerQuery.includes(months[i])) {
      const targetDate = new Date(today.getFullYear(), i, 15);
      if (targetDate < today) {
        targetDate.setFullYear(targetDate.getFullYear() + 1);
      }
      date = targetDate.toISOString().split('T')[0];
      break;
    }
  }

  // Handle "next week/weekend/month"
  if (lowerQuery.includes('next week') || lowerQuery.includes('next weekend')) {
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);
    date = nextWeek.toISOString().split('T')[0];
  } else if (lowerQuery.includes('next month')) {
    const nextMonth = new Date(today);
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    date = nextMonth.toISOString().split('T')[0];
  }

  if (!destination) {
    return null; // Can't parse without at least a destination
  }

  return {
    origin,
    destination,
    date,
    passengers,
    tripType: 'oneWay',
    adults: passengers,
    children: 0,
    infants: 0,
    cabinClass: 'economy'
  } as SearchParams;
};

// --- Vibe-Based Destination Discovery ---
export const getVibeDestinations = async (vibe: string, origin: string = 'JFK', maxBudget?: number): Promise<any[]> => {
  // Check if API key is configured
  if (!import.meta.env.VITE_API_KEY) {
    return generateMockVibeDestinations(vibe, maxBudget);
  }

  try {
    const budgetClause = maxBudget ? `with flights under $${maxBudget}` : '';
    const prompt = `
      Suggest 5 destinations from ${origin} that match the vibe: "${vibe}" ${budgetClause}.
      Include diverse international and domestic options.
      Provide realistic flight prices in USD.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              city: { type: Type.STRING },
              country: { type: Type.STRING },
              airport: { type: Type.STRING, description: "IATA code" },
              vibe: { type: Type.STRING },
              description: { type: Type.STRING, description: "Why this destination matches the vibe" },
              estimatedPrice: { type: Type.NUMBER }
            }
          }
        }
      }
    });

    const data = JSON.parse(response.text || '[]');
    return data;
  } catch (error) {
    console.warn("Vibe Destinations Error (using fallback):", error);
    return generateMockVibeDestinations(vibe, maxBudget);
  }
};

// --- Price Matrix Generator (Flexible Dates) ---
export const generatePriceMatrix = async (params: SearchParams): Promise<any[]> => {
  // Check if API key is configured
  if (!import.meta.env.VITE_API_KEY) {
    // Fallback immediately to mock data logic
    return generateMockPriceMatrix(params);
  }

  try {
    const baseDate = new Date(params.date);
    const dates: string[] = [];

    // Generate dates: -3 to +3 days
    for (let i = -3; i <= 3; i++) {
      const d = new Date(baseDate);
      d.setDate(d.getDate() + i);
      dates.push(d.toISOString().split('T')[0]);
    }

    const prompt = `
      Generate realistic flight prices from ${params.origin} to ${params.destination} for these dates: ${dates.join(', ')}.
      Vary prices realistically - weekends might be more expensive, mid-week cheaper.
      Return prices in USD. If a date is unrealistic (past), set price to null.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              date: { type: Type.STRING },
              price: { type: Type.NUMBER, nullable: true }
            }
          }
        }
      }
    });

    const data = JSON.parse(response.text || '[]');
    return data;
  } catch (error) {
    console.warn("Price Matrix Error (using fallback):", error);
    return generateMockPriceMatrix(params);
  }
};

// --- Last Minute Deals ---
export const getLastMinuteDeals = async (origin: string = 'JFK', maxBudget?: number): Promise<LastMinuteDeal[]> => {
  // Check if API key is configured
  if (!import.meta.env.VITE_API_KEY) {
    return generateMockLastMinuteDeals(origin);
  }

  try {
    const today = new Date();
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);

    const budgetClause = maxBudget ? `All deals must be under $${maxBudget}.` : '';

    const prompt = `
      Generate 6 last-minute flight deals departing from ${origin} within the next 7 days (${today.toISOString().split('T')[0]} to ${nextWeek.toISOString().split('T')[0]}).
      ${budgetClause}
      
      These should be deeply discounted flights to various destinations (mix of domestic and international).
      Include realistic airlines, flight numbers, and times.
      The discount should be between 20-60% off the original price.
      Seats left should be between 1-8 to create urgency.
      Vary the destinations - include beach, city, and adventure destinations.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              origin: { type: Type.STRING, description: "IATA airport code" },
              destination: { type: Type.STRING, description: "IATA airport code" },
              destinationCity: { type: Type.STRING, description: "City name" },
              airline: { type: Type.STRING },
              flightNumber: { type: Type.STRING },
              departureTime: { type: Type.STRING, description: "ISO 8601 format" },
              arrivalTime: { type: Type.STRING, description: "ISO 8601 format" },
              price: { type: Type.NUMBER, description: "Discounted price in USD" },
              originalPrice: { type: Type.NUMBER, description: "Original price before discount" },
              discount: { type: Type.NUMBER, description: "Discount percentage (e.g., 35 for 35%)" },
              duration: { type: Type.STRING, description: "e.g., 3h 45m" },
              stops: { type: Type.NUMBER },
              seatsLeft: { type: Type.NUMBER, description: "Number of seats remaining at this price" }
            }
          }
        }
      }
    });

    const data = JSON.parse(response.text || '[]');
    return data as LastMinuteDeal[];
  } catch (error) {
    console.warn("Last Minute Deals Error (using fallback):", error);
    return generateMockLastMinuteDeals(origin);
  }
};

// Mistake Fare interface
export interface MistakeFare {
  id: string;
  origin: string;
  originCity: string;
  destination: string;
  destinationCity: string;
  normalPrice: number;
  mistakePrice: number;
  discount: number;
  airline: string;
  departureDate: string;
  expiresIn: string;
  isVerified: boolean;
  bookingClass: string;
}

/**
 * Get Mistake Fares - Simulated error fares with huge discounts
 * In production, this would connect to fare monitoring services
 */
export const getMistakeFares = async (): Promise<MistakeFare[]> => {
  // Check if API key is configured
  if (!import.meta.env.VITE_API_KEY) {
    return generateMockMistakeFares();
  }

  try {
    const prompt = `Generate 3-5 realistic "mistake fare" flight deals. These are pricing errors by airlines that offer 50-90% discounts.

Return a JSON array with this structure:
[
  {
    "id": "unique-id",
    "origin": "JFK",
    "originCity": "New York",
    "destination": "CDG",
    "destinationCity": "Paris",
    "normalPrice": 850,
    "mistakePrice": 189,
    "discount": 78,
    "airline": "Air France",
    "departureDate": "2025-01-15",
    "expiresIn": "2 hours",
    "isVerified": true,
    "bookingClass": "Economy"
  }
]

Requirements:
- Use real airport codes and city names
- normalPrice should be realistic for the route
- mistakePrice should be 50-90% lower (these are errors!)
- discount should be the actual percentage off
- departureDate should be 2-8 weeks from now
- expiresIn should vary: "30 minutes", "1 hour", "2 hours", "4 hours"
- Mix of economy and business class deals
- Include both domestic US and international routes
- isVerified should be true for most, false for 1-2

Return ONLY the JSON array, no markdown.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      }
    });
    const text = response.text || '';

    // Clean up response
    let cleanText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

    const data = JSON.parse(cleanText);
    return data as MistakeFare[];
  } catch (error) {
    console.error("Mistake Fares Error:", error);
    return generateMockMistakeFares();
  }
};

// --- Mock Data Generators ---

const generateMockVibeDestinations = (vibe: string, maxBudget?: number): any[] => {
  const mockDestinations: Record<string, any[]> = {
    'nightlife': [
      { city: 'Las Vegas', country: 'USA', airport: 'LAS', vibe: 'nightlife', description: 'The ultimate nightlife destination with world-class clubs and casinos.', estimatedPrice: 250 },
      { city: 'Berlin', country: 'Germany', airport: 'BER', vibe: 'nightlife', description: 'Famous for its techno scene and legendary clubs like Berghain.', estimatedPrice: 650 },
      { city: 'Miami', country: 'USA', airport: 'MIA', vibe: 'nightlife', description: 'Vibrant South Beach nightlife with ocean views.', estimatedPrice: 300 },
      { city: 'Ibiza', country: 'Spain', airport: 'IBZ', vibe: 'nightlife', description: 'The party capital of the world during summer.', estimatedPrice: 800 },
      { city: 'New Orleans', country: 'USA', airport: 'MSY', vibe: 'nightlife', description: 'Jazz, blues, and the famous Bourbon Street.', estimatedPrice: 350 }
    ],
    'hiking': [
      { city: 'Denver', country: 'USA', airport: 'DEN', vibe: 'hiking', description: 'Gateway to the Rocky Mountains with endless trails.', estimatedPrice: 280 },
      { city: 'Vancouver', country: 'Canada', airport: 'YVR', vibe: 'hiking', description: 'Stunning mountains meet the ocean.', estimatedPrice: 450 },
      { city: 'Reykjavik', country: 'Iceland', airport: 'KEF', vibe: 'hiking', description: 'Volcanic landscapes, waterfalls, and glaciers.', estimatedPrice: 600 },
      { city: 'Cusco', country: 'Peru', airport: 'CUZ', vibe: 'hiking', description: 'Base for the Inca Trail and Machu Picchu.', estimatedPrice: 900 },
      { city: 'Zurich', country: 'Switzerland', airport: 'ZRH', vibe: 'hiking', description: 'Access to the Swiss Alps and pristine lakes.', estimatedPrice: 750 }
    ],
    'romantic': [
      { city: 'Paris', country: 'France', airport: 'CDG', vibe: 'romantic', description: 'The City of Light is timelessly romantic.', estimatedPrice: 700 },
      { city: 'Venice', country: 'Italy', airport: 'VCE', vibe: 'romantic', description: 'Gondola rides through historic canals.', estimatedPrice: 800 },
      { city: 'Santorini', country: 'Greece', airport: 'JTR', vibe: 'romantic', description: 'Stunning sunsets and white-washed architecture.', estimatedPrice: 950 },
      { city: 'Kyoto', country: 'Japan', airport: 'KIX', vibe: 'romantic', description: 'Peaceful temples and cherry blossoms.', estimatedPrice: 1100 },
      { city: 'Maui', country: 'USA', airport: 'OGG', vibe: 'romantic', description: 'Tropical paradise with secluded beaches.', estimatedPrice: 600 }
    ],
    'beach': [
      { city: 'Cancun', country: 'Mexico', airport: 'CUN', vibe: 'beach', description: 'White sand beaches and turquoise waters.', estimatedPrice: 350 },
      { city: 'Honolulu', country: 'USA', airport: 'HNL', vibe: 'beach', description: 'Iconic Waikiki beach and surfing.', estimatedPrice: 550 },
      { city: 'Bali', country: 'Indonesia', airport: 'DPS', vibe: 'beach', description: 'Tropical beaches, surfing, and culture.', estimatedPrice: 900 },
      { city: 'Phuket', country: 'Thailand', airport: 'HKT', vibe: 'beach', description: 'Stunning islands and clear waters.', estimatedPrice: 850 },
      { city: 'Nassau', country: 'Bahamas', airport: 'NAS', vibe: 'beach', description: 'Crystal clear Caribbean waters.', estimatedPrice: 400 }
    ],
    'culture': [
      { city: 'Rome', country: 'Italy', airport: 'FCO', vibe: 'culture', description: 'Ancient history on every corner.', estimatedPrice: 750 },
      { city: 'Cairo', country: 'Egypt', airport: 'CAI', vibe: 'culture', description: 'Pyramids, museums, and rich history.', estimatedPrice: 800 },
      { city: 'Istanbul', country: 'Turkey', airport: 'IST', vibe: 'culture', description: 'Where East meets West with stunning architecture.', estimatedPrice: 700 },
      { city: 'Mexico City', country: 'Mexico', airport: 'MEX', vibe: 'culture', description: 'Museums, art, and incredible food scene.', estimatedPrice: 400 },
      { city: 'London', country: 'UK', airport: 'LHR', vibe: 'culture', description: 'World-class museums and historic landmarks.', estimatedPrice: 650 }
    ],
    'adventure': [
      { city: 'Queenstown', country: 'New Zealand', airport: 'ZQN', vibe: 'adventure', description: 'Adventure capital of the world.', estimatedPrice: 1200 },
      { city: 'Cape Town', country: 'South Africa', airport: 'CPT', vibe: 'adventure', description: 'Hiking, shark diving, and surfing.', estimatedPrice: 1000 },
      { city: 'Costa Rica', country: 'Costa Rica', airport: 'SJO', vibe: 'adventure', description: 'Zip-lining, surfing, and rainforests.', estimatedPrice: 450 },
      { city: 'Kathmandu', country: 'Nepal', airport: 'KTM', vibe: 'adventure', description: 'Gateway to the Himalayas.', estimatedPrice: 1100 },
      { city: 'Moab', country: 'USA', airport: 'CNY', vibe: 'adventure', description: 'Red rock landscapes and outdoor sports.', estimatedPrice: 400 }
    ]
  };

  // Return mock data for the requested vibe, or a default set
  let results = mockDestinations[vibe] || mockDestinations['adventure'];

  // Filter by budget if provided
  if (maxBudget) {
    results = results.filter(d => d.estimatedPrice <= maxBudget);
  }

  return results;
};

const generateMockPriceMatrix = (params: SearchParams): any[] => {
  const baseDate = new Date(params.date);
  const mockData = [];
  const basePrice = 350; // Default base price

  for (let i = -3; i <= 3; i++) {
    const d = new Date(baseDate);
    d.setDate(d.getDate() + i);
    const dateStr = d.toISOString().split('T')[0];

    // Randomize price slightly
    const variance = Math.floor(Math.random() * 100) - 50;
    const price = basePrice + variance;

    mockData.push({
      date: dateStr,
      price: price > 0 ? price : basePrice
    });
  }

  return mockData;
};

const generateMockLastMinuteDeals = (origin: string): LastMinuteDeal[] => {
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  return [
    {
      id: 'lm-1',
      origin: origin,
      destination: 'MIA',
      destinationCity: 'Miami',
      airline: 'American Airlines',
      flightNumber: 'AA1234',
      departureTime: tomorrow.toISOString(),
      arrivalTime: new Date(tomorrow.getTime() + 3 * 60 * 60 * 1000).toISOString(),
      price: 189,
      originalPrice: 450,
      discount: 58,
      duration: '3h 15m',
      stops: 0,
      seatsLeft: 3
    },
    {
      id: 'lm-2',
      origin: origin,
      destination: 'LHR',
      destinationCity: 'London',
      airline: 'British Airways',
      flightNumber: 'BA178',
      departureTime: new Date(tomorrow.getTime() + 24 * 60 * 60 * 1000).toISOString(),
      arrivalTime: new Date(tomorrow.getTime() + 31 * 60 * 60 * 1000).toISOString(),
      price: 450,
      originalPrice: 980,
      discount: 54,
      duration: '7h 00m',
      stops: 0,
      seatsLeft: 5
    },
    {
      id: 'lm-3',
      origin: origin,
      destination: 'CUN',
      destinationCity: 'Cancun',
      airline: 'JetBlue',
      flightNumber: 'B6789',
      departureTime: new Date(tomorrow.getTime() + 48 * 60 * 60 * 1000).toISOString(),
      arrivalTime: new Date(tomorrow.getTime() + 52 * 60 * 60 * 1000).toISOString(),
      price: 220,
      originalPrice: 550,
      discount: 60,
      duration: '4h 10m',
      stops: 0,
      seatsLeft: 2
    }
  ];
};

const generateMockMistakeFares = (): MistakeFare[] => {
  return [
    {
      id: 'mf-1',
      origin: 'JFK',
      originCity: 'New York',
      destination: 'LHR',
      destinationCity: 'London',
      normalPrice: 890,
      mistakePrice: 198,
      discount: 78,
      airline: 'British Airways',
      departureDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      expiresIn: '2 hours',
      isVerified: true,
      bookingClass: 'Economy'
    },
    {
      id: 'mf-2',
      origin: 'LAX',
      originCity: 'Los Angeles',
      destination: 'NRT',
      destinationCity: 'Tokyo',
      normalPrice: 1450,
      mistakePrice: 347,
      discount: 76,
      airline: 'ANA',
      departureDate: new Date(Date.now() + 35 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      expiresIn: '45 minutes',
      isVerified: true,
      bookingClass: 'Economy'
    },
    {
      id: 'mf-3',
      origin: 'ORD',
      originCity: 'Chicago',
      destination: 'BCN',
      destinationCity: 'Barcelona',
      normalPrice: 2800,
      mistakePrice: 890,
      discount: 68,
      airline: 'Iberia',
      departureDate: new Date(Date.now() + 28 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      expiresIn: '1 hour',
      isVerified: false,
      bookingClass: 'Business'
    }
  ];
};