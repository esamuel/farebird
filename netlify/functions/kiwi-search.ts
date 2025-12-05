import { Handler } from '@netlify/functions';

const KIWI_API_URL = 'https://api.tequila.kiwi.com/v2/search';

const handler: Handler = async (event) => {
    // CORS headers
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Content-Type': 'application/json',
    };

    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers, body: '' };
    }

    const apiKey = process.env.KIWI_API_KEY;
    if (!apiKey) {
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: 'KIWI_API_KEY not configured' }),
        };
    }

    try {
        const queryParams = event.queryStringParameters;
        const queryString = new URLSearchParams(queryParams as any).toString();

        const response = await fetch(`${KIWI_API_URL}?${queryString}`, {
            headers: {
                'apikey': apiKey,
                'accept': 'application/json'
            }
        });

        const data = await response.json();

        if (!response.ok) {
            return {
                statusCode: response.status,
                headers,
                body: JSON.stringify({ error: data.message || 'Kiwi API error' }),
            };
        }

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify(data),
        };
    } catch (error) {
        console.error('Kiwi function error:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: 'Internal server error' }),
        };
    }
};

export { handler };
