/**
 * Duffel API Service
 * 
 * Handles flight search, booking, and payment through Duffel.
 * Duffel acts as merchant of record - they handle ticketing and payment processing.
 * 
 * Documentation: https://duffel.com/docs
 * 
 * Required env var: VITE_DUFFEL_API_KEY
 */

// ==========================================
// 🔧 TYPES
// ==========================================

export interface DuffelPassenger {
  id?: string;
  type: 'adult' | 'child' | 'infant_without_seat';
  given_name?: string;
  family_name?: string;
  email?: string;
  phone_number?: string;
  born_on?: string; // YYYY-MM-DD
  gender?: 'male' | 'female';
  title?: 'mr' | 'ms' | 'mrs' | 'miss' | 'dr';
  identity_documents?: {
    type: 'passport';
    unique_identifier: string;
    expires_on: string;
    issuing_country_code: string;
  }[];
}

export interface DuffelSlice {
  origin: string; // IATA code
  destination: string; // IATA code
  departure_date: string; // YYYY-MM-DD
}

export interface DuffelOfferRequest {
  slices: DuffelSlice[];
  passengers: { type: DuffelPassenger['type'] }[];
  cabin_class?: 'economy' | 'premium_economy' | 'business' | 'first';
  return_offers?: boolean;
}

export interface DuffelSegment {
  id: string;
  origin: {
    iata_code: string;
    name: string;
    city_name: string;
  };
  destination: {
    iata_code: string;
    name: string;
    city_name: string;
  };
  departing_at: string;
  arriving_at: string;
  operating_carrier: {
    iata_code: string;
    name: string;
    logo_symbol_url: string;
  };
  marketing_carrier: {
    iata_code: string;
    name: string;
  };
  marketing_carrier_flight_number: string;
  duration: string; // ISO 8601 duration
  aircraft?: {
    name: string;
  };
}

export interface DuffelSliceResponse {
  id: string;
  origin: {
    iata_code: string;
    name: string;
    city_name: string;
  };
  destination: {
    iata_code: string;
    name: string;
    city_name: string;
  };
  duration: string;
  segments: DuffelSegment[];
}

export interface DuffelOffer {
  id: string;
  live_mode: boolean;
  total_amount: string;
  total_currency: string;
  base_amount: string;
  base_currency: string;
  tax_amount: string;
  tax_currency: string;
  owner: {
    iata_code: string;
    name: string;
    logo_symbol_url: string;
  };
  slices: DuffelSliceResponse[];
  passengers: {
    id: string;
    type: string;
    cabin_class: string;
    cabin_class_marketing_name: string;
    baggages: {
      type: 'checked' | 'carry_on';
      quantity: number;
    }[];
  }[];
  available_services: DuffelService[];
  conditions: {
    refund_before_departure?: {
      allowed: boolean;
      penalty_amount?: string;
      penalty_currency?: string;
    };
    change_before_departure?: {
      allowed: boolean;
      penalty_amount?: string;
      penalty_currency?: string;
    };
  };
  expires_at: string;
}

export interface DuffelService {
  id: string;
  type: 'baggage' | 'seat';
  total_amount: string;
  total_currency: string;
  maximum_quantity?: number;
  metadata?: {
    type?: string;
    maximum_weight_kg?: number;
    designator?: string;
    disclosures?: string[];
  };
  passenger_ids: string[];
  segment_ids: string[];
}

export interface DuffelOrder {
  id: string;
  live_mode: boolean;
  booking_reference: string;
  total_amount: string;
  total_currency: string;
  created_at: string;
  slices: DuffelSliceResponse[];
  passengers: DuffelPassenger[];
  owner: {
    iata_code: string;
    name: string;
  };
  documents: {
    type: 'electronic_ticket' | 'electronic_miscellaneous_document_associated';
    unique_identifier: string;
  }[];
}

export interface DuffelPaymentIntent {
  id: string;
  amount: string;
  currency: string;
  client_token: string;
  status: 'requires_payment_method' | 'requires_confirmation' | 'requires_action' | 'processing' | 'succeeded' | 'cancelled';
  live_mode: boolean;
}

// ==========================================
// 🔧 CONFIGURATION
// ==========================================

// Get API key from environment (used to check if Duffel is enabled)
const getApiKey = (): string => {
  const key = import.meta.env.VITE_DUFFEL_API_KEY;
  if (!key) {
    // Key is optional, so we don't need to warn every time
    return '';
  }
  return key;
};

// Check if Duffel is configured
export const isDuffelEnabled = (): boolean => {
  return !!getApiKey();
};

// ==========================================
// 🔗 API HELPERS (via Netlify Function)
// ==========================================

// Use Netlify function as proxy to avoid CORS issues
const NETLIFY_FUNCTION_URL = '/.netlify/functions/duffel-api';

const duffelApiCall = async <T>(
  action: string,
  data: Record<string, unknown> = {}
): Promise<T> => {
  const response = await fetch(NETLIFY_FUNCTION_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ action, data }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: response.statusText }));
    throw new Error(error.error || 'Duffel API error');
  }

  const result = await response.json();
  return result.data;
};

// ==========================================
// 📤 SEARCH FLIGHTS
// ==========================================

/**
 * Create an offer request to search for flights
 */
export const searchFlights = async (request: DuffelOfferRequest): Promise<DuffelOffer[]> => {
  const result = await duffelApiCall<{ offers: DuffelOffer[] }>('search', {
    slices: request.slices,
    passengers: request.passengers,
    cabin_class: request.cabin_class,
  });

  return result.offers || [];
};

/**
 * Get a specific offer by ID (to refresh before booking)
 */
export const getOffer = async (offerId: string): Promise<DuffelOffer> => {
  return duffelApiCall<DuffelOffer>('get_offer', { offer_id: offerId });
};

// ==========================================
// 🛒 BOOKING
// ==========================================

export interface CreateOrderParams {
  offer_id: string;
  passengers: DuffelPassenger[];
  payments?: {
    type: 'balance' | 'arc_bsp_cash';
    amount: string;
    currency: string;
  }[];
  selected_offers?: string[];
  services?: {
    id: string;
    quantity: number;
  }[];
  metadata?: Record<string, string>;
}

/**
 * Create an order (book the flight)
 * Note: For Duffel's managed payment, use createPaymentIntent instead
 */
export const createOrder = async (params: CreateOrderParams): Promise<DuffelOrder> => {
  return duffelApiCall<DuffelOrder>('create_order', {
    offer_id: params.offer_id,
    passengers: params.passengers,
    amount: params.payments?.[0]?.amount,
    currency: params.payments?.[0]?.currency,
    metadata: params.metadata,
  });
};

/**
 * Get order details
 */
export const getOrder = async (orderId: string): Promise<DuffelOrder> => {
  return duffelApiCall<DuffelOrder>('get_order', { order_id: orderId });
};

// ==========================================
// 💳 PAYMENT (Duffel Payments)
// ==========================================

/**
 * Create a payment intent for Duffel's hosted payment
 * This returns a client_token to use with Duffel's payment component
 */
export const createPaymentIntent = async (offerId: string): Promise<DuffelPaymentIntent> => {
  // First get the offer to know the amount
  const offer = await getOffer(offerId);

  return duffelApiCall<DuffelPaymentIntent>('create_payment_intent', {
    amount: offer.total_amount,
    currency: offer.total_currency,
  });
};

/**
 * Confirm a payment intent after user completes payment
 */
export const confirmPaymentIntent = async (
  _paymentIntentId: string,
  offerId: string,
  passengers: DuffelPassenger[],
  services?: { id: string; quantity: number }[]
): Promise<DuffelOrder> => {
  // Create the order with the confirmed payment
  return duffelApiCall<DuffelOrder>('create_order', {
    offer_id: offerId,
    passengers,
    services,
  });
};

// ==========================================
// 🎫 ANCILLARIES (Seats, Bags)
// ==========================================

/**
 * Get available seat maps for an offer
 */
export const getSeatMaps = async (offerId: string): Promise<unknown> => {
  return duffelApiCall('get_seat_maps', { offer_id: offerId });
};

/**
 * Get available services (bags, etc.) for an offer
 * Services are included in the offer response, but this refreshes them
 */
export const getOfferServices = async (offerId: string): Promise<DuffelService[]> => {
  const offer = await getOffer(offerId);
  return offer.available_services || [];
};

// ==========================================
// 🔄 ORDER MANAGEMENT
// ==========================================

/**
 * Cancel an order (if allowed by fare conditions)
 */
export const cancelOrder = async (orderId: string): Promise<{ refund_amount: string; refund_currency: string }> => {
  return duffelApiCall('cancel_order', { order_id: orderId });
};

/**
 * Get order cancellation quote
 */
export const getOrderCancellationQuote = async (orderId: string): Promise<{
  refund_amount: string;
  refund_currency: string;
  expires_at: string;
}> => {
  return duffelApiCall('get_cancellation_quote', { order_id: orderId });
};

// ==========================================
// 🔧 UTILITY FUNCTIONS
// ==========================================

/**
 * Parse ISO 8601 duration to human readable format
 * e.g., "PT2H30M" -> "2h 30m"
 */
export const parseDuration = (isoDuration: string): string => {
  const match = isoDuration.match(/PT(?:(\d+)H)?(?:(\d+)M)?/);
  if (!match) return isoDuration;

  const hours = match[1] ? `${match[1]}h` : '';
  const minutes = match[2] ? `${match[2]}m` : '';

  return [hours, minutes].filter(Boolean).join(' ');
};

/**
 * Convert Duffel offer to our Flight type for display
 */
import { Flight } from '../types';

export const duffelOfferToFlight = (offer: DuffelOffer): Flight => {
  const firstSlice = offer.slices[0];
  const firstSegment = firstSlice.segments[0];
  const lastSegment = firstSlice.segments[firstSlice.segments.length - 1];

  // Calculate baggage fees from available services
  let carryOnFee = 0;
  let checkedBagFee = 0;

  for (const service of offer.available_services || []) {
    if (service.type === 'baggage') {
      const amount = parseFloat(service.total_amount);
      if (service.metadata?.type === 'carry_on') {
        carryOnFee = amount;
      } else if (service.metadata?.type === 'checked') {
        checkedBagFee = amount;
      }
    }
  }

  return {
    id: offer.id,
    airline: offer.owner.name,
    flightNumber: `${firstSegment.marketing_carrier.iata_code}${firstSegment.marketing_carrier_flight_number}`,
    origin: firstSlice.origin.iata_code,
    destination: firstSlice.destination.iata_code,
    departureTime: firstSegment.departing_at,
    arrivalTime: lastSegment.arriving_at,
    price: parseFloat(offer.total_amount),
    currency: offer.total_currency,
    duration: parseDuration(firstSlice.duration),
    stops: firstSlice.segments.length - 1,
    duffelOfferId: offer.id,
    tags: ['Duffel'],
    baggageFees: {
      carryOn: carryOnFee,
      checkedBag: checkedBagFee,
    },
  };
};

/**
 * Map our cabin class to Duffel's format
 */
export const mapCabinClass = (cabinClass: string): DuffelOfferRequest['cabin_class'] => {
  const mapping: Record<string, DuffelOfferRequest['cabin_class']> = {
    economy: 'economy',
    premiumEconomy: 'premium_economy',
    business: 'business',
    first: 'first',
  };
  return mapping[cabinClass] || 'economy';
};
