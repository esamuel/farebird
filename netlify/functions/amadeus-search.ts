import type { Handler, HandlerEvent, HandlerContext } from "@netlify/functions";

// Amadeus API credentials from environment variables
// Support both VITE_ prefixed (for consistency) and non-prefixed names
const AMADEUS_CLIENT_ID = process.env.VITE_AMADEUS_CLIENT_ID || process.env.AMADEUS_CLIENT_ID || "";
const AMADEUS_CLIENT_SECRET = process.env.VITE_AMADEUS_CLIENT_SECRET || process.env.AMADEUS_CLIENT_SECRET || "";
const AMADEUS_BASE_URL = "https://test.api.amadeus.com";

// Token cache
let cachedToken: string | null = null;
let tokenExpiry: number = 0;

// Get OAuth2 token from Amadeus
async function getAmadeusToken(): Promise<string> {
  // Return cached token if still valid
  if (cachedToken && Date.now() < tokenExpiry) {
    return cachedToken;
  }

  const params = new URLSearchParams();
  params.append("grant_type", "client_credentials");
  params.append("client_id", AMADEUS_CLIENT_ID);
  params.append("client_secret", AMADEUS_CLIENT_SECRET);

  const response = await fetch(`${AMADEUS_BASE_URL}/v1/security/oauth2/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: params,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Amadeus auth failed: ${errorText}`);
  }

  const data = await response.json();
  cachedToken = data.access_token;
  tokenExpiry = Date.now() + data.expires_in * 1000 - 60000; // 1 min buffer

  return cachedToken!;
}

// Main handler
const handler: Handler = async (event: HandlerEvent, context: HandlerContext) => {
  // CORS headers
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Content-Type": "application/json",
  };

  // Handle preflight
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers, body: "" };
  }

  // Check for credentials
  if (!AMADEUS_CLIENT_ID || !AMADEUS_CLIENT_SECRET) {
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        source: "AI",
        error: "Amadeus credentials not configured",
        data: [],
      }),
    };
  }

  try {
    // Parse query parameters
    const params = event.queryStringParameters || {};
    const { origin, destination, date, adults = "1", returnDate, cabinClass } = params;

    if (!origin || !destination || !date) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: "Missing required parameters: origin, destination, date" }),
      };
    }

    // Get token
    const token = await getAmadeusToken();

    // Build Amadeus API URL
    let url = `${AMADEUS_BASE_URL}/v2/shopping/flight-offers?originLocationCode=${origin}&destinationLocationCode=${destination}&departureDate=${date}&adults=${adults}&max=10`;

    if (returnDate) {
      url += `&returnDate=${returnDate}`;
    }

    if (cabinClass) {
      const cabinMap: Record<string, string> = {
        economy: "ECONOMY",
        premiumEconomy: "PREMIUM_ECONOMY",
        business: "BUSINESS",
        first: "FIRST",
      };
      url += `&travelClass=${cabinMap[cabinClass] || "ECONOMY"}`;
    }

    // Call Amadeus API
    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Amadeus API Error:", response.status, errorText);
      console.error("Request URL:", url);
      throw new Error(`Amadeus API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();

    // Transform Amadeus response to our Flight format
    const flights = (data.data || []).map((offer: any) => {
      const itinerary = offer.itineraries[0];
      const firstSegment = itinerary.segments[0];
      const lastSegment = itinerary.segments[itinerary.segments.length - 1];

      // Parse duration PT2H30M -> 2h 30m
      const duration = itinerary.duration
        .replace("PT", "")
        .replace("H", "h ")
        .replace("M", "m")
        .toLowerCase();

      // Get airline name from dictionaries if available
      const carrierCode = firstSegment.carrierCode;
      const airlineName = data.dictionaries?.carriers?.[carrierCode] || carrierCode;

      let returnFlight = undefined;
      if (offer.itineraries.length > 1) {
        const returnItinerary = offer.itineraries[1];
        const returnFirstSegment = returnItinerary.segments[0];
        const returnLastSegment = returnItinerary.segments[returnItinerary.segments.length - 1];

        const returnDuration = returnItinerary.duration
          .replace("PT", "")
          .replace("H", "h ")
          .replace("M", "m")
          .toLowerCase();

        const returnCarrierCode = returnFirstSegment.carrierCode;
        const returnAirlineName = data.dictionaries?.carriers?.[returnCarrierCode] || returnCarrierCode;

        returnFlight = {
          airline: returnAirlineName,
          flightNumber: `${returnCarrierCode}${returnFirstSegment.number}`,
          departureTime: returnFirstSegment.departure.at,
          arrivalTime: returnLastSegment.arrival.at,
          duration: returnDuration.trim(),
          stops: returnItinerary.segments.length - 1,
        };
      }

      return {
        id: offer.id,
        airline: airlineName,
        flightNumber: `${carrierCode}${firstSegment.number}`,
        origin: firstSegment.departure.iataCode,
        destination: lastSegment.arrival.iataCode,
        departureTime: firstSegment.departure.at,
        arrivalTime: lastSegment.arrival.at,
        price: parseFloat(offer.price.total),
        currency: offer.price.currency,
        duration: duration.trim(),
        stops: itinerary.segments.length - 1,
        tags: ["Live Data"],
        baggageFees: {
          carryOn: 0, // Amadeus doesn't always provide this
          checkedBag: 35, // Default estimate
        },
        returnFlight: returnFlight,
      };
    });

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        source: "API",
        data: flights,
      }),
    };
  } catch (error) {
    console.error("Amadeus function error:", error);
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        source: "AI",
        error: error instanceof Error ? error.message : "Unknown error",
        data: [],
      }),
    };
  }
};

export { handler };
