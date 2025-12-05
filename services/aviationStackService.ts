export interface FlightStatus {
    flight_date: string;
    flight_status: string;
    departure: {
        airport: string;
        timezone: string;
        iata: string;
        icao: string;
        terminal: string;
        gate: string;
        delay: number;
        scheduled: string;
        estimated: string;
        actual: string;
        estimated_runway: string;
        actual_runway: string;
    };
    arrival: {
        airport: string;
        timezone: string;
        iata: string;
        icao: string;
        terminal: string;
        gate: string;
        baggage: string;
        delay: number;
        scheduled: string;
        estimated: string;
        actual: string;
        estimated_runway: string;
        actual_runway: string;
    };
    airline: {
        name: string;
        iata: string;
        icao: string;
    };
    flight: {
        number: string;
        iata: string;
        icao: string;
        codeshared: any;
    };
}

const NETLIFY_FUNCTION_URL = '/.netlify/functions/aviationstack';

export const getFlightStatus = async (flightIata: string): Promise<FlightStatus | null> => {
    try {
        const response = await fetch(`${NETLIFY_FUNCTION_URL}?flight_iata=${flightIata}`);

        if (!response.ok) {
            throw new Error(`AviationStack API error: ${response.statusText}`);
        }

        const result = await response.json();

        if (result.data && result.data.length > 0) {
            return result.data[0];
        }

        return null;
    } catch (error) {
        console.error('Flight status fetch failed:', error);
        return null;
    }
};
