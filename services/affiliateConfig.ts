/**
 * Affiliate Configuration
 * 
 * Add your affiliate IDs here to earn commissions on bookings.
 * Sign up links provided for each program.
 */

export interface AffiliateConfig {
  id: string;
  enabled: boolean;
  signUpUrl: string;
  commissionInfo: string;
}

// ==========================================
// 🔑 AFFILIATE IDS - Add yours here!
// ==========================================

export const AFFILIATE_IDS = {
  // Meta-search / OTAs
  skyscanner: {
    id: '', // https://www.partners.skyscanner.net/
    enabled: true,
    signUpUrl: 'https://www.partners.skyscanner.net/',
    commissionInfo: '50% revenue share on clicks'
  },
  kayak: {
    id: '', // https://www.kayak.com/affiliates
    enabled: true,
    signUpUrl: 'https://www.kayak.com/affiliates',
    commissionInfo: 'CPA model, varies by market'
  },
  kiwi: {
    id: '', // https://partners.kiwi.com/
    enabled: true,
    signUpUrl: 'https://partners.kiwi.com/',
    commissionInfo: '3-5% commission on bookings'
  },
  travelpayouts: {
    id: '', // https://www.travelpayouts.com/ - Access to 60+ programs
    marker: '',
    enabled: true,
    signUpUrl: 'https://www.travelpayouts.com/',
    commissionInfo: 'Access to 60+ airline & hotel programs'
  },
  cheapoair: {
    id: '', // https://www.cheapoair.com/affiliates
    enabled: true,
    signUpUrl: 'https://www.cheapoair.com/affiliates',
    commissionInfo: '$5-15 per booking'
  },
  trip: {
    id: '', // https://www.trip.com/affiliates (Trip.com/Ctrip)
    enabled: true,
    signUpUrl: 'https://www.trip.com/affiliates',
    commissionInfo: '3-5% commission'
  },
  expedia: {
    id: '', // https://expediapartnersolutions.com/
    enabled: true,
    signUpUrl: 'https://expediapartnersolutions.com/',
    commissionInfo: '2-6% commission'
  },
  booking: {
    id: '', // https://www.booking.com/affiliate-program/
    enabled: true,
    signUpUrl: 'https://www.booking.com/affiliate-program/',
    commissionInfo: '25-40% commission on hotels'
  },
  
  // Direct Airlines (via affiliate networks)
  emirates: {
    id: '', // Via Commission Junction / Awin
    enabled: true,
    signUpUrl: 'https://www.awin.com/',
    commissionInfo: '1-2% on bookings via Awin'
  },
  qatar: {
    id: '', // Via Partnerize
    enabled: true,
    signUpUrl: 'https://partnerize.com/',
    commissionInfo: '1% commission via Partnerize'
  },
  etihad: {
    id: '', // Via Awin
    enabled: true,
    signUpUrl: 'https://www.awin.com/',
    commissionInfo: '1-2% via Awin'
  },
  lufthansa: {
    id: '', // Via Awin
    enabled: true,
    signUpUrl: 'https://www.awin.com/',
    commissionInfo: '0.5-1% via Awin'
  },
  britishAirways: {
    id: '', // Via Awin
    enabled: true,
    signUpUrl: 'https://www.awin.com/',
    commissionInfo: '0.5-1% via Awin'
  },
  delta: {
    id: '', // Via Commission Junction
    enabled: true,
    signUpUrl: 'https://www.cj.com/',
    commissionInfo: '$2-5 per booking via CJ'
  },
  united: {
    id: '', // Via Impact
    enabled: true,
    signUpUrl: 'https://impact.com/',
    commissionInfo: '1-2% via Impact'
  },
  american: {
    id: '', // Via Rakuten
    enabled: true,
    signUpUrl: 'https://rakutenadvertising.com/',
    commissionInfo: '1% via Rakuten'
  },
  southwest: {
    id: '', // Via Commission Junction
    enabled: true,
    signUpUrl: 'https://www.cj.com/',
    commissionInfo: '$2-4 per booking'
  },
  jetblue: {
    id: '', // Via Commission Junction
    enabled: true,
    signUpUrl: 'https://www.cj.com/',
    commissionInfo: '$2-5 per booking'
  },
  airCanada: {
    id: '', // Via Awin
    enabled: true,
    signUpUrl: 'https://www.awin.com/',
    commissionInfo: '1% via Awin'
  },
  ryanair: {
    id: '', // Direct program
    enabled: true,
    signUpUrl: 'https://www.ryanair.com/gb/en/info/affiliate-program',
    commissionInfo: '€0.50-2 per booking'
  },
  easyjet: {
    id: '', // Via Awin
    enabled: true,
    signUpUrl: 'https://www.awin.com/',
    commissionInfo: '1% via Awin'
  },
  vueling: {
    id: '', // Via Awin
    enabled: true,
    signUpUrl: 'https://www.awin.com/',
    commissionInfo: '1% via Awin'
  },
  norwegian: {
    id: '', // Via Awin
    enabled: true,
    signUpUrl: 'https://www.awin.com/',
    commissionInfo: '1% via Awin'
  },
  singapore: {
    id: '', // Via Partnerize
    enabled: true,
    signUpUrl: 'https://partnerize.com/',
    commissionInfo: '1% via Partnerize'
  },
  cathay: {
    id: '', // Via Commission Junction
    enabled: true,
    signUpUrl: 'https://www.cj.com/',
    commissionInfo: '1% via CJ'
  },
  ana: {
    id: '', // Via Rakuten
    enabled: true,
    signUpUrl: 'https://rakutenadvertising.com/',
    commissionInfo: '1% via Rakuten'
  },
  jal: {
    id: '', // Via Rakuten
    enabled: true,
    signUpUrl: 'https://rakutenadvertising.com/',
    commissionInfo: '1% via Rakuten'
  },
  korean: {
    id: '', // Via Commission Junction
    enabled: true,
    signUpUrl: 'https://www.cj.com/',
    commissionInfo: '1% via CJ'
  },
  turkish: {
    id: '', // Via Awin
    enabled: true,
    signUpUrl: 'https://www.awin.com/',
    commissionInfo: '1% via Awin'
  },
  airFrance: {
    id: '', // Via Awin
    enabled: true,
    signUpUrl: 'https://www.awin.com/',
    commissionInfo: '0.5-1% via Awin'
  },
  klm: {
    id: '', // Via Awin (same as Air France)
    enabled: true,
    signUpUrl: 'https://www.awin.com/',
    commissionInfo: '0.5-1% via Awin'
  },
  iberia: {
    id: '', // Via Awin
    enabled: true,
    signUpUrl: 'https://www.awin.com/',
    commissionInfo: '1% via Awin'
  },
  tap: {
    id: '', // Via Awin
    enabled: true,
    signUpUrl: 'https://www.awin.com/',
    commissionInfo: '1% via Awin'
  },
  virgin: {
    id: '', // Via Awin
    enabled: true,
    signUpUrl: 'https://www.awin.com/',
    commissionInfo: '1% via Awin'
  },
  alaska: {
    id: '', // Via Commission Junction
    enabled: true,
    signUpUrl: 'https://www.cj.com/',
    commissionInfo: '$2-4 per booking'
  },
  spirit: {
    id: '', // Via Commission Junction
    enabled: true,
    signUpUrl: 'https://www.cj.com/',
    commissionInfo: '$2-3 per booking'
  },
  frontier: {
    id: '', // Via Commission Junction
    enabled: true,
    signUpUrl: 'https://www.cj.com/',
    commissionInfo: '$2-3 per booking'
  }
} as const;

// Airline code to affiliate key mapping
export const AIRLINE_CODE_MAP: Record<string, keyof typeof AFFILIATE_IDS> = {
  // IATA codes
  'EK': 'emirates',
  'QR': 'qatar',
  'EY': 'etihad',
  'LH': 'lufthansa',
  'BA': 'britishAirways',
  'DL': 'delta',
  'UA': 'united',
  'AA': 'american',
  'WN': 'southwest',
  'B6': 'jetblue',
  'AC': 'airCanada',
  'FR': 'ryanair',
  'U2': 'easyjet',
  'VY': 'vueling',
  'DY': 'norwegian',
  'SQ': 'singapore',
  'CX': 'cathay',
  'NH': 'ana',
  'JL': 'jal',
  'KE': 'korean',
  'TK': 'turkish',
  'AF': 'airFrance',
  'KL': 'klm',
  'IB': 'iberia',
  'TP': 'tap',
  'VS': 'virgin',
  'AS': 'alaska',
  'NK': 'spirit',
  'F9': 'frontier',
  
  // Full names (for AI-generated results)
  'EMIRATES': 'emirates',
  'QATAR AIRWAYS': 'qatar',
  'ETIHAD': 'etihad',
  'ETIHAD AIRWAYS': 'etihad',
  'LUFTHANSA': 'lufthansa',
  'BRITISH AIRWAYS': 'britishAirways',
  'DELTA': 'delta',
  'DELTA AIR LINES': 'delta',
  'UNITED': 'united',
  'UNITED AIRLINES': 'united',
  'AMERICAN': 'american',
  'AMERICAN AIRLINES': 'american',
  'SOUTHWEST': 'southwest',
  'SOUTHWEST AIRLINES': 'southwest',
  'JETBLUE': 'jetblue',
  'JETBLUE AIRWAYS': 'jetblue',
  'AIR CANADA': 'airCanada',
  'RYANAIR': 'ryanair',
  'EASYJET': 'easyjet',
  'VUELING': 'vueling',
  'NORWEGIAN': 'norwegian',
  'SINGAPORE AIRLINES': 'singapore',
  'CATHAY PACIFIC': 'cathay',
  'ANA': 'ana',
  'ALL NIPPON AIRWAYS': 'ana',
  'JAL': 'jal',
  'JAPAN AIRLINES': 'jal',
  'KOREAN AIR': 'korean',
  'TURKISH AIRLINES': 'turkish',
  'AIR FRANCE': 'airFrance',
  'KLM': 'klm',
  'IBERIA': 'iberia',
  'TAP': 'tap',
  'TAP PORTUGAL': 'tap',
  'TAP AIR PORTUGAL': 'tap',
  'VIRGIN ATLANTIC': 'virgin',
  'ALASKA': 'alaska',
  'ALASKA AIRLINES': 'alaska',
  'SPIRIT': 'spirit',
  'SPIRIT AIRLINES': 'spirit',
  'FRONTIER': 'frontier',
  'FRONTIER AIRLINES': 'frontier'
};

// Get affiliate key from airline name or code
export const getAirlineAffiliateKey = (airline: string): keyof typeof AFFILIATE_IDS | null => {
  const normalized = airline.toUpperCase().trim();
  
  // Try direct match first
  if (AIRLINE_CODE_MAP[normalized]) {
    return AIRLINE_CODE_MAP[normalized];
  }
  
  // Try partial match
  for (const [key, value] of Object.entries(AIRLINE_CODE_MAP)) {
    if (normalized.includes(key) || key.includes(normalized)) {
      return value;
    }
  }
  
  return null;
};
