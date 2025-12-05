import { Handler } from '@netlify/functions';

const DUFFEL_API_URL = 'https://api.duffel.com';
const DUFFEL_API_VERSION = 'v1';

const handler: Handler = async (event) => {
  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Content-Type': 'application/json',
  };

  // Handle preflight
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  const apiKey = process.env.DUFFEL_API_KEY;
  if (!apiKey) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'DUFFEL_API_KEY not configured' }),
    };
  }

  try {
    const body = JSON.parse(event.body || '{}');
    const { action, data } = body;

    let endpoint = '';
    let method = 'POST';
    let requestBody: string | undefined;

    switch (action) {
      case 'search':
        // Create offer request
        endpoint = '/offer_requests';
        requestBody = JSON.stringify({
          data: {
            slices: data.slices,
            passengers: data.passengers,
            cabin_class: data.cabin_class || 'economy',
            return_offers: true,
          },
        });
        break;

      case 'get_offer':
        // Get single offer details
        endpoint = `/offers/${data.offer_id}`;
        method = 'GET';
        break;

      case 'create_order':
        // Create booking order
        endpoint = '/orders';
        requestBody = JSON.stringify({
          data: {
            type: 'instant',
            selected_offers: [data.offer_id],
            passengers: data.passengers,
            payments: [
              {
                type: 'balance',
                amount: data.amount,
                currency: data.currency,
              },
            ],
            metadata: data.metadata,
          },
        });
        break;

      case 'get_order':
        // Get order details
        endpoint = `/orders/${data.order_id}`;
        method = 'GET';
        break;

      case 'list_airlines':
        // Get available airlines
        endpoint = '/airlines';
        method = 'GET';
        break;

      default:
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: `Unknown action: ${action}` }),
        };
    }

    const response = await fetch(`${DUFFEL_API_URL}/${DUFFEL_API_VERSION}${endpoint}`, {
      method,
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Duffel-Version': 'v1',
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: method !== 'GET' ? requestBody : undefined,
    });

    const responseData = await response.json();

    if (!response.ok) {
      console.error('Duffel API error:', responseData);
      return {
        statusCode: response.status,
        headers,
        body: JSON.stringify({
          error: responseData.errors?.[0]?.message || 'Duffel API error',
          details: responseData,
        }),
      };
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(responseData),
    };
  } catch (error) {
    console.error('Duffel function error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: error instanceof Error ? error.message : 'Internal server error',
      }),
    };
  }
};

export { handler };
