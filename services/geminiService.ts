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

// --- Main Exported Function ---
export const searchFlightsWithAI = async (params: SearchParams): Promise<{ source: 'API' | 'AI', data: Flight[] }> => {
  // In production, use Netlify serverless function
  if (isProduction) {
    try {
      console.log("Using Netlify serverless function for Amadeus API...");
      const result = await searchFlightsViaNetlify(params);

      // If serverless function returned AI source (credentials not configured), fall back to Gemini
      if (result.source === 'AI' && result.data.length === 0) {
        console.log("Serverless function indicated no API config, using Gemini fallback...");
        const aiData = await searchFlightsWithGemini(params);
        return { source: 'AI', data: aiData };
      }

      return result;
    } catch (error) {
      console.warn("Netlify function failed, switching to AI fallback...", error);
      const aiData = await searchFlightsWithGemini(params);
      return { source: 'AI', data: aiData };
    }
  }

  // In local development, use direct API calls if credentials exist
  const { id, secret } = getAmadeusCredentials();
  if (id && secret) {
    try {
      console.log("Attempting direct Amadeus API (local dev)...");
      const realData = await searchFlightsWithAmadeus(params);
      return { source: 'API', data: realData };
    } catch (error) {
      console.warn("Direct API failed, switching to AI fallback...", error);
    }
  }

  // Fallback to AI
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
    return null;
  }
};

// --- Vibe-Based Destination Discovery ---
export const getVibeDestinations = async (vibe: string, origin: string = 'JFK', maxBudget?: number): Promise<any[]> => {
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
    console.error("Vibe Destinations Error:", error);
    return [];
  }
};

// --- Price Matrix Generator (Flexible Dates) ---
export const generatePriceMatrix = async (params: SearchParams): Promise<any[]> => {
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
    console.error("Price Matrix Error:", error);
    return [];
  }
};

// --- Last Minute Deals ---
export const getLastMinuteDeals = async (origin: string = 'JFK', maxBudget?: number): Promise<LastMinuteDeal[]> => {
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
    console.error("Last Minute Deals Error:", error);
    return [];
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
    // Return sample data as fallback
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
  }
};