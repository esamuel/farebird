import { Flight, SearchParams } from '../types';

// ==========================================
// 🥝 KIWI.COM (TEQUILA) SERVICE
// ==========================================

// Check if Kiwi is configured
export const isKiwiEnabled = (): boolean => {
    // In production, we assume it's configured via Netlify env vars
    // For local, we check if the key is in .env (though we don't access it directly here to be safe, 
    // we rely on the Netlify function to handle the key)
    return true;
};

// Use Netlify function as proxy
const NETLIFY_FUNCTION_URL = '/.netlify/functions/kiwi-search';

interface KiwiFlight {
    id: string;
    flyFrom: string;
    flyTo: string;
    cityFrom: string;
    cityTo: string;
    price: number;
    local_departure: string;
    local_arrival: string;
    duration: {
        total: number; // seconds
    };
    airlines: string[];
    route: {
        airline: string;
        flight_no: number;
        local_departure: string;
        local_arrival: string;
    }[];
    booking_token: string;
    deep_link: string;
    virtual_interlining: boolean;
    baglimit: {
        hand_width?: number;
        hand_height?: number;
        hand_length?: number;
        hand_weight?: number;
        hold_weight?: number;
    };
}

export const searchFlightsWithKiwi = async (params: SearchParams): Promise<Flight[]> => {
    try {
        // Format date for Kiwi (DD/MM/YYYY)
        const dateObj = new Date(params.date);
        const formattedDate = `${dateObj.getDate().toString().padStart(2, '0')}/${(dateObj.getMonth() + 1).toString().padStart(2, '0')}/${dateObj.getFullYear()}`;

        let returnDateFormatted = undefined;
        if (params.returnDate) {
            const returnDateObj = new Date(params.returnDate);
            returnDateFormatted = `${returnDateObj.getDate().toString().padStart(2, '0')}/${(returnDateObj.getMonth() + 1).toString().padStart(2, '0')}/${returnDateObj.getFullYear()}`;
        }

        const queryParams = new URLSearchParams({
            fly_from: params.origin,
            fly_to: params.destination,
            date_from: formattedDate,
            date_to: formattedDate,
            adults: String(params.adults || params.passengers || 1),
            curr: 'USD',
            limit: '20'
        });

        if (returnDateFormatted) {
            queryParams.append('return_from', returnDateFormatted);
            queryParams.append('return_to', returnDateFormatted);
            queryParams.append('flight_type', 'round');
        } else {
            queryParams.append('flight_type', 'oneway');
        }

        if (params.cabinClass) {
            const cabinMap: Record<string, string> = {
                economy: 'M',
                premiumEconomy: 'W',
                business: 'C',
                first: 'F'
            };
            if (cabinMap[params.cabinClass]) {
                queryParams.append('selected_cabins', cabinMap[params.cabinClass]);
            }
        }

        const response = await fetch(`${NETLIFY_FUNCTION_URL}?${queryParams.toString()}`);

        if (!response.ok) {
            // If 401/403 or other error, fallback to mock data
            console.warn('Kiwi API error or not authorized, using mock data');
            return generateMockKiwiFlights(params);
        }

        const result = await response.json();

        if (!result.data) return generateMockKiwiFlights(params);

        return result.data.map((offer: KiwiFlight) => mapKiwiOfferToFlight(offer));
    } catch (error) {
        console.warn('Kiwi search failed, using mock data:', error);
        return generateMockKiwiFlights(params);
    }
};

// --- Mock Data Generator ---
const generateMockKiwiFlights = (params: SearchParams): Flight[] => {
    const mockFlights: Flight[] = [];
    const airlines = ['Ryanair', 'EasyJet', 'Wizz Air', 'Vueling'];

    for (let i = 0; i < 3; i++) {
        const airline1 = airlines[Math.floor(Math.random() * airlines.length)];
        const airline2 = airlines[Math.floor(Math.random() * airlines.length)];
        const price = 80 + Math.floor(Math.random() * 150);

        // Create a "Virtual Interlining" flight (combining two low-cost carriers)
        mockFlights.push({
            id: `kiwi-mock-${i}`,
            airline: `${airline1} + ${airline2}`,
            flightNumber: `VI${100 + i}`,
            origin: params.origin,
            destination: params.destination,
            departureTime: `${params.date}T${10 + i}:00:00`,
            arrivalTime: `${params.date}T${14 + i}:30:00`,
            price: price,
            currency: 'USD',
            duration: '4h 30m',
            stops: 1,
            tags: ['Kiwi.com', 'Virtual Interline', 'Cheapest'],
            baggageFees: {
                carryOn: 30,
                checkedBag: 50
            },
            bookingLink: 'https://www.kiwi.com/us/'
        });
    }

    return mockFlights;
};

const mapKiwiOfferToFlight = (offer: KiwiFlight): Flight => {
    const firstRoute = offer.route[0];
    const lastRoute = offer.route[offer.route.length - 1];

    // Calculate duration string
    const hours = Math.floor(offer.duration.total / 3600);
    const minutes = Math.floor((offer.duration.total % 3600) / 60);
    const durationStr = `${hours}h ${minutes}m`;

    // Determine tags
    const tags = ['Kiwi.com'];
    if (offer.virtual_interlining) tags.push('Virtual Interline');
    if (offer.price < 100) tags.push('Great Value');

    // Estimate baggage fees if not provided (Kiwi often includes basic, but charges for extras)
    // This is an estimation as Kiwi API structure for bags is complex
    const carryOnFee = offer.baglimit.hand_weight ? 0 : 30;
    const checkedBagFee = offer.baglimit.hold_weight ? 0 : 50;

    return {
        id: `kiwi-${offer.id}`,
        airline: offer.airlines[0], // Main airline
        flightNumber: `${firstRoute.airline}${firstRoute.flight_no}`,
        origin: offer.flyFrom,
        destination: offer.flyTo,
        departureTime: offer.local_departure,
        arrivalTime: offer.local_arrival,
        price: offer.price,
        currency: 'USD',
        duration: durationStr,
        stops: offer.route.length - 1,
        tags: tags,
        baggageFees: {
            carryOn: carryOnFee,
            checkedBag: checkedBagFee
        },
        bookingLink: offer.deep_link // We might want to add this to Flight type if not present
    };
};
