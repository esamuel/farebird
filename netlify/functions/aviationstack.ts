import { Handler } from '@netlify/functions';

const AVIATIONSTACK_API_URL = 'http://api.aviationstack.com/v1/flights';
// Fallback key provided by user for this session
const DEFAULT_KEY = 'ded963ff5fc670a326655b115a244892';

const handler: Handler = async (event) => {
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Content-Type': 'application/json',
    };

    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers, body: '' };
    }

    const apiKey = process.env.AVIATIONSTACK_API_KEY || DEFAULT_KEY;
    const flightIata = event.queryStringParameters?.flight_iata;

    if (!flightIata) {
        return {
            statusCode: 400,
            headers,
            body: JSON.stringify({ error: 'Missing flight_iata parameter' }),
        };
    }

    try {
        const response = await fetch(`${AVIATIONSTACK_API_URL}?access_key=${apiKey}&flight_iata=${flightIata}`);
        const data = await response.json();

        if (data.error) {
            return {
                statusCode: 400, // AviationStack returns 200 even on error sometimes, but we want to signal error
                headers,
                body: JSON.stringify({ error: data.error.message || 'AviationStack API error' }),
            };
        }

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify(data),
        };
    } catch (error) {
        console.error('AviationStack function error:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: 'Internal server error' }),
        };
    }
};

export { handler };
