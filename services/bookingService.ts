/**
 * Booking Service with Affiliate Support
 * 
 * Supports multiple booking providers and direct airline links with affiliate tracking.
 * Configure your affiliate IDs in affiliateConfig.ts to earn commissions.
 * 
 * Supported providers:
 * - 'google' - Google Flights (no affiliate, good fallback)
 * - 'skyscanner' - Skyscanner (50% revenue share)
 * - 'kayak' - Kayak (CPA model)
 * - 'kiwi' - Kiwi.com (3-5% commission)
 * - 'travelpayouts' - Access to 60+ programs
 * - 'direct' - Direct airline booking with affiliate tracking
 */

import { AFFILIATE_IDS, getAirlineAffiliateKey, AIRLINE_CODE_MAP } from './affiliateConfig';

// ==========================================
// 🔧 CONFIGURATION
// ==========================================

// Default provider when no direct airline link is available
const DEFAULT_PROVIDER = 'skyscanner' as const;

// Whether to prefer direct airline booking (with affiliate) over meta-search
const PREFER_DIRECT_AIRLINE = true;

type BookingProvider = 'google' | 'skyscanner' | 'kayak' | 'kiwi' | 'travelpayouts' | 'direct';

// ==========================================
// 🔗 URL GENERATORS
// ==========================================

interface BookingParams {
  origin: string;
  destination: string;
  departureDate: string; // ISO string or YYYY-MM-DD
  returnDate?: string;
  passengers?: number;
}

const formatDate = (isoString: string): string => {
  const date = new Date(isoString);
  return date.toISOString().split('T')[0]; // YYYY-MM-DD
};

const formatDateForGoogle = (isoString: string): string => {
  // Google Flights uses YYYY-MM-DD
  return formatDate(isoString);
};

const formatDateForSkyscanner = (isoString: string): string => {
  // Skyscanner uses YYMMDD
  const date = new Date(isoString);
  const yy = date.getFullYear().toString().slice(-2);
  const mm = (date.getMonth() + 1).toString().padStart(2, '0');
  const dd = date.getDate().toString().padStart(2, '0');
  return `${yy}${mm}${dd}`;
};

/**
 * Generate Google Flights URL
 * Free, no affiliate needed
 */
const getGoogleFlightsUrl = (params: BookingParams): string => {
  const { origin, destination, departureDate, returnDate, passengers = 1 } = params;
  const depDate = formatDateForGoogle(departureDate);
  
  // Google Flights URL format
  // One-way: /flights/JFK/LHR/2024-12-15
  // Round-trip: /flights/JFK/LHR/2024-12-15/2024-12-22
  let url = `https://www.google.com/travel/flights?q=flights%20from%20${origin}%20to%20${destination}%20on%20${depDate}`;
  
  if (returnDate) {
    const retDate = formatDateForGoogle(returnDate);
    url += `%20return%20${retDate}`;
  }
  
  return url;
};

/**
 * Generate Skyscanner URL
 * Add affiliate ID for revenue
 */
const getSkyscannerUrl = (params: BookingParams): string => {
  const { origin, destination, departureDate, returnDate, passengers = 1 } = params;
  const depDate = formatDateForSkyscanner(departureDate);
  const retDate = returnDate ? formatDateForSkyscanner(returnDate) : '';
  
  // Skyscanner URL format: /transport/flights/ORIGIN/DEST/YYMMDD/YYMMDD/
  let url = `https://www.skyscanner.com/transport/flights/${origin}/${destination}/${depDate}/`;
  
  if (retDate) {
    url += `${retDate}/`;
  }
  
  url += `?adults=${passengers}&adultsv2=${passengers}`;
  
  // Add affiliate tracking if configured
  if (AFFILIATE_IDS.skyscanner.id) {
    url += `&associateid=${AFFILIATE_IDS.skyscanner.id}`;
  }
  
  return url;
};

/**
 * Generate Kayak URL
 * Add affiliate ID for revenue
 */
const getKayakUrl = (params: BookingParams): string => {
  const { origin, destination, departureDate, returnDate, passengers = 1 } = params;
  const depDate = formatDate(departureDate);
  
  // Kayak URL format: /flights/JFK-LHR/2024-12-15/2024-12-22
  let url = `https://www.kayak.com/flights/${origin}-${destination}/${depDate}`;
  
  if (returnDate) {
    url += `/${formatDate(returnDate)}`;
  }
  
  url += `?sort=bestflight_a&fs=stops=0`;
  
  return url;
};

/**
 * Generate Kiwi.com URL
 * Add affiliate ID for revenue
 */
const getKiwiUrl = (params: BookingParams): string => {
  const { origin, destination, departureDate, returnDate, passengers = 1 } = params;
  const depDate = formatDate(departureDate);
  
  let url = `https://www.kiwi.com/en/search/results/${origin}/${destination}/${depDate}`;
  
  if (returnDate) {
    url += `/${formatDate(returnDate)}`;
  }
  
  url += `?sortBy=price`;
  
  // Add affiliate tracking if configured
  if (AFFILIATE_IDS.kiwi.id) {
    url += `&affilid=${AFFILIATE_IDS.kiwi.id}`;
  }
  
  return url;
};

/**
 * Generate Travelpayouts URL (Aviasales/Jetradar)
 * Access to 60+ airline programs
 */
const getTravelpayoutsUrl = (params: BookingParams): string => {
  const { origin, destination, departureDate, returnDate, passengers = 1 } = params;
  const depDate = formatDate(departureDate).replace(/-/g, '');
  
  let url = `https://www.aviasales.com/search/${origin}${depDate}${destination}`;
  
  if (returnDate) {
    url += formatDate(returnDate).replace(/-/g, '');
  }
  
  url += `${passengers}`;
  
  // Add marker if configured
  const tp = AFFILIATE_IDS.travelpayouts as { id: string; marker?: string };
  if (tp.marker) {
    url += `?marker=${tp.marker}`;
  }
  
  return url;
};

/**
 * Generate CheapOAir URL
 */
const getCheapOAirUrl = (params: BookingParams): string => {
  const { origin, destination, departureDate, returnDate, passengers = 1 } = params;
  const depDate = formatDate(departureDate);
  
  let url = `https://www.cheapoair.com/flights/${origin}/${destination}/${depDate}`;
  
  if (returnDate) {
    url += `/${formatDate(returnDate)}`;
  }
  
  return url;
};

/**
 * Generate Trip.com URL
 */
const getTripUrl = (params: BookingParams): string => {
  const { origin, destination, departureDate, returnDate, passengers = 1 } = params;
  const depDate = formatDate(departureDate);
  
  let url = `https://www.trip.com/flights/${origin}-${destination}/`;
  url += `?dcity=${origin}&acity=${destination}&ddate=${depDate}`;
  
  if (returnDate) {
    url += `&rdate=${formatDate(returnDate)}`;
  }
  
  url += `&adult=${passengers}`;
  
  return url;
};

// ==========================================
// ✈️ DIRECT AIRLINE BOOKING URLS
// ==========================================

interface DirectAirlineBookingParams extends BookingParams {
  airline: string;
  flightNumber?: string;
}

// Airline booking URL generators
const AIRLINE_BOOKING_URLS: Record<string, (params: DirectAirlineBookingParams) => string> = {
  emirates: (p) => `https://www.emirates.com/flights/search?origin=${p.origin}&destination=${p.destination}&departureDate=${formatDate(p.departureDate)}&adults=${p.passengers || 1}`,
  qatar: (p) => `https://www.qatarairways.com/en/booking.html?from=${p.origin}&to=${p.destination}&departing=${formatDate(p.departureDate)}&adults=${p.passengers || 1}`,
  etihad: (p) => `https://www.etihad.com/en/book/flights?origin=${p.origin}&destination=${p.destination}&departureDate=${formatDate(p.departureDate)}&adults=${p.passengers || 1}`,
  lufthansa: (p) => `https://www.lufthansa.com/us/en/flight-search?origin=${p.origin}&destination=${p.destination}&departureDate=${formatDate(p.departureDate)}&adults=${p.passengers || 1}`,
  britishAirways: (p) => `https://www.britishairways.com/travel/book/public/en_us?from=${p.origin}&to=${p.destination}&depDate=${formatDate(p.departureDate)}&cabin=M&ad=${p.passengers || 1}`,
  delta: (p) => `https://www.delta.com/flight-search/book-a-flight?cacheKeySuffix=be8d4e5b-3a2e&tripType=ONE_WAY&originCity=${p.origin}&destinationCity=${p.destination}&departureDate=${formatDate(p.departureDate)}&paxCount=${p.passengers || 1}`,
  united: (p) => `https://www.united.com/en/us/fsr/choose-flights?f=${p.origin}&t=${p.destination}&d=${formatDate(p.departureDate)}&tt=1&at=1&sc=7&px=${p.passengers || 1}&taxng=1&newHP=True&clm=7`,
  american: (p) => `https://www.aa.com/booking/find-flights?origin=${p.origin}&destination=${p.destination}&departureDate=${formatDate(p.departureDate)}&passengers=${p.passengers || 1}`,
  southwest: (p) => `https://www.southwest.com/air/booking/select.html?originationAirportCode=${p.origin}&destinationAirportCode=${p.destination}&departureDate=${formatDate(p.departureDate)}&adultPassengersCount=${p.passengers || 1}`,
  jetblue: (p) => `https://www.jetblue.com/booking/flights?from=${p.origin}&to=${p.destination}&depart=${formatDate(p.departureDate)}&isMultiCity=false&noOfRoute=1&adults=${p.passengers || 1}`,
  airCanada: (p) => `https://www.aircanada.com/aeroplan/redeem/availability/outbound?org0=${p.origin}&dest0=${p.destination}&departureDate0=${formatDate(p.departureDate)}&ADT=${p.passengers || 1}`,
  ryanair: (p) => `https://www.ryanair.com/gb/en/trip/flights/select?adults=${p.passengers || 1}&dateOut=${formatDate(p.departureDate)}&originIata=${p.origin}&destinationIata=${p.destination}`,
  easyjet: (p) => `https://www.easyjet.com/en/search?origin=${p.origin}&destination=${p.destination}&outboundDate=${formatDate(p.departureDate)}&adults=${p.passengers || 1}`,
  singapore: (p) => `https://www.singaporeair.com/en_UK/plan-and-book/your-booking/?from=${p.origin}&to=${p.destination}&cabinClass=Y&adult=${p.passengers || 1}&departDate=${formatDate(p.departureDate)}`,
  cathay: (p) => `https://www.cathaypacific.com/cx/en_US/book-a-trip/flight-search.html?origin=${p.origin}&destination=${p.destination}&departureDate=${formatDate(p.departureDate)}&adults=${p.passengers || 1}`,
  ana: (p) => `https://www.ana.co.jp/en/us/book-plan/booking/search/?itineraryType=oneWay&departureAirport=${p.origin}&arrivalAirport=${p.destination}&departureDate=${formatDate(p.departureDate)}&adultNum=${p.passengers || 1}`,
  jal: (p) => `https://www.jal.co.jp/en/inter/booking/?from=${p.origin}&to=${p.destination}&date=${formatDate(p.departureDate)}&adult=${p.passengers || 1}`,
  korean: (p) => `https://www.koreanair.com/booking/booking?departureAirportCode=${p.origin}&arrivalAirportCode=${p.destination}&departureDate=${formatDate(p.departureDate)}&adultCount=${p.passengers || 1}`,
  turkish: (p) => `https://www.turkishairlines.com/en-int/flights/?origin=${p.origin}&destination=${p.destination}&departureDate=${formatDate(p.departureDate)}&adult=${p.passengers || 1}`,
  airFrance: (p) => `https://wwws.airfrance.us/search/offers?pax=${p.passengers || 1}ADT&cabinClass=ECONOMY&activeConnection=0&connections=${p.origin}:A>${p.destination}:A-${formatDate(p.departureDate)}`,
  klm: (p) => `https://www.klm.us/search/offers?pax=${p.passengers || 1}ADT&cabinClass=ECONOMY&connections=${p.origin}:A>${p.destination}:A-${formatDate(p.departureDate)}`,
  iberia: (p) => `https://www.iberia.com/us/flights/?market=US&language=en&origin=${p.origin}&destination=${p.destination}&outbound=${formatDate(p.departureDate)}&adults=${p.passengers || 1}`,
  tap: (p) => `https://www.flytap.com/en-us/booking?from=${p.origin}&to=${p.destination}&date=${formatDate(p.departureDate)}&adults=${p.passengers || 1}`,
  virgin: (p) => `https://www.virginatlantic.com/flight-search/select-flights?origin=${p.origin}&destination=${p.destination}&departureDate=${formatDate(p.departureDate)}&adult=${p.passengers || 1}`,
  alaska: (p) => `https://www.alaskaair.com/search?O=${p.origin}&D=${p.destination}&OD=${formatDate(p.departureDate)}&A=${p.passengers || 1}`,
  spirit: (p) => `https://www.spirit.com/book/flights?origin=${p.origin}&destination=${p.destination}&date=${formatDate(p.departureDate)}&adt=${p.passengers || 1}`,
  frontier: (p) => `https://www.flyfrontier.com/booking/search?origin=${p.origin}&destination=${p.destination}&date=${formatDate(p.departureDate)}&adults=${p.passengers || 1}`,
  vueling: (p) => `https://www.vueling.com/en/booking/select?origin=${p.origin}&destination=${p.destination}&outbound=${formatDate(p.departureDate)}&adults=${p.passengers || 1}`,
  norwegian: (p) => `https://www.norwegian.com/us/booking/flight-search?origin=${p.origin}&destination=${p.destination}&outbound=${formatDate(p.departureDate)}&adults=${p.passengers || 1}`,
};

/**
 * Get direct airline booking URL if available
 */
const getDirectAirlineUrl = (params: DirectAirlineBookingParams): string | null => {
  const affiliateKey = getAirlineAffiliateKey(params.airline);
  
  if (affiliateKey && AIRLINE_BOOKING_URLS[affiliateKey]) {
    return AIRLINE_BOOKING_URLS[affiliateKey](params);
  }
  
  return null;
};

// ==========================================
// 📤 MAIN EXPORT
// ==========================================

export interface ExtendedBookingParams extends BookingParams {
  airline?: string;
  flightNumber?: string;
}

/**
 * Get booking URL - prefers direct airline booking if available
 */
export const getBookingUrl = (params: ExtendedBookingParams, provider?: BookingProvider): string => {
  // If airline is provided and we prefer direct booking, try that first
  if (PREFER_DIRECT_AIRLINE && params.airline) {
    const directUrl = getDirectAirlineUrl(params as DirectAirlineBookingParams);
    if (directUrl) {
      return directUrl;
    }
  }
  
  // Fall back to meta-search provider
  const selectedProvider = provider || DEFAULT_PROVIDER;
  
  switch (selectedProvider) {
    case 'skyscanner':
      return getSkyscannerUrl(params);
    case 'kayak':
      return getKayakUrl(params);
    case 'kiwi':
      return getKiwiUrl(params);
    case 'travelpayouts':
      return getTravelpayoutsUrl(params);
    case 'google':
    default:
      return getGoogleFlightsUrl(params);
  }
};

/**
 * Open booking page in new tab
 */
export const openBookingPage = (params: ExtendedBookingParams, provider?: BookingProvider): void => {
  const url = getBookingUrl(params, provider);
  window.open(url, '_blank', 'noopener,noreferrer');
};

/**
 * Get the booking provider name for display
 */
export const getBookingProviderName = (params?: ExtendedBookingParams): string => {
  // If we have an airline and prefer direct, show airline name
  if (PREFER_DIRECT_AIRLINE && params?.airline) {
    const affiliateKey = getAirlineAffiliateKey(params.airline);
    if (affiliateKey && AIRLINE_BOOKING_URLS[affiliateKey]) {
      return params.airline;
    }
  }
  
  const names: Record<BookingProvider, string> = {
    google: 'Google Flights',
    skyscanner: 'Skyscanner',
    kayak: 'Kayak',
    kiwi: 'Kiwi.com',
    travelpayouts: 'Aviasales',
    direct: 'Airline Direct'
  };
  
  return names[DEFAULT_PROVIDER];
};

/**
 * Check if direct airline booking is available for this airline
 */
export const hasDirectBooking = (airline: string): boolean => {
  const affiliateKey = getAirlineAffiliateKey(airline);
  return !!(affiliateKey && AIRLINE_BOOKING_URLS[affiliateKey]);
};

/**
 * Get all available booking options for a flight
 */
export const getBookingOptions = (params: ExtendedBookingParams): Array<{ name: string; url: string; type: 'direct' | 'meta' }> => {
  const options: Array<{ name: string; url: string; type: 'direct' | 'meta' }> = [];
  
  // Add direct airline option if available
  if (params.airline) {
    const directUrl = getDirectAirlineUrl(params as DirectAirlineBookingParams);
    if (directUrl) {
      options.push({
        name: `Book on ${params.airline}`,
        url: directUrl,
        type: 'direct'
      });
    }
  }
  
  // Add meta-search options
  options.push(
    { name: 'Skyscanner', url: getSkyscannerUrl(params), type: 'meta' },
    { name: 'Kayak', url: getKayakUrl(params), type: 'meta' },
    { name: 'Google Flights', url: getGoogleFlightsUrl(params), type: 'meta' },
    { name: 'Kiwi.com', url: getKiwiUrl(params), type: 'meta' }
  );
  
  return options;
};
