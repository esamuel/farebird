/**
 * PayPal Payment Service
 * 
 * Secondary payment option for users who prefer PayPal.
 * Used alongside Duffel's built-in payment for flight bookings.
 * 
 * Documentation: https://developer.paypal.com/docs/checkout/
 * 
 * Required env vars:
 * - VITE_PAYPAL_CLIENT_ID
 * - VITE_PAYPAL_MODE ('sandbox' | 'live')
 */

// ==========================================
// 🔧 TYPES
// ==========================================

export interface PayPalOrderDetails {
  id: string;
  status: 'CREATED' | 'SAVED' | 'APPROVED' | 'VOIDED' | 'COMPLETED' | 'PAYER_ACTION_REQUIRED';
  intent: 'CAPTURE' | 'AUTHORIZE';
  purchase_units: {
    reference_id: string;
    amount: {
      currency_code: string;
      value: string;
    };
    description?: string;
  }[];
  payer?: {
    name?: {
      given_name: string;
      surname: string;
    };
    email_address?: string;
    payer_id?: string;
  };
  create_time: string;
  update_time: string;
}

export interface PayPalCreateOrderParams {
  amount: number;
  currency: string;
  description: string;
  referenceId: string; // e.g., Duffel offer ID
  returnUrl?: string;
  cancelUrl?: string;
}

export interface PayPalConfig {
  clientId: string;
  mode: 'sandbox' | 'live';
}

// ==========================================
// 🔧 CONFIGURATION
// ==========================================

const getConfig = (): PayPalConfig => {
  const clientId = import.meta.env.VITE_PAYPAL_CLIENT_ID || '';
  const mode = (import.meta.env.VITE_PAYPAL_MODE as 'sandbox' | 'live') || 'sandbox';
  
  return { clientId, mode };
};

export const isPayPalEnabled = (): boolean => {
  const { clientId } = getConfig();
  return !!clientId;
};

export const getPayPalClientId = (): string => {
  return getConfig().clientId;
};

export const getPayPalMode = (): 'sandbox' | 'live' => {
  return getConfig().mode;
};

// ==========================================
// 📜 SCRIPT LOADER
// ==========================================

let paypalScriptPromise: Promise<void> | null = null;

/**
 * Load PayPal SDK script dynamically
 */
export const loadPayPalScript = (): Promise<void> => {
  if (paypalScriptPromise) {
    return paypalScriptPromise;
  }

  const { clientId, mode } = getConfig();
  
  if (!clientId) {
    return Promise.reject(new Error('PayPal client ID not configured'));
  }

  paypalScriptPromise = new Promise((resolve, reject) => {
    // Check if already loaded
    if (window.paypal) {
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = `https://www.paypal.com/sdk/js?client-id=${clientId}&currency=USD&intent=capture`;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load PayPal SDK'));
    
    document.body.appendChild(script);
  });

  return paypalScriptPromise;
};

// ==========================================
// 💳 PAYPAL BUTTONS INTEGRATION
// ==========================================

export interface PayPalButtonsConfig {
  amount: number;
  currency: string;
  description: string;
  referenceId: string;
  onApprove: (orderId: string, payerInfo: PayPalOrderDetails['payer']) => Promise<void>;
  onError: (error: Error) => void;
  onCancel?: () => void;
}

/**
 * Render PayPal buttons in a container
 * Returns a cleanup function
 */
export const renderPayPalButtons = async (
  containerId: string,
  config: PayPalButtonsConfig
): Promise<() => void> => {
  await loadPayPalScript();

  if (!window.paypal) {
    throw new Error('PayPal SDK not loaded');
  }

  const buttons = window.paypal.Buttons({
    style: {
      layout: 'vertical',
      color: 'blue',
      shape: 'rect',
      label: 'paypal',
      height: 45,
    },

    // Create order on PayPal
    createOrder: (_data: unknown, actions: { order: { create: (options: unknown) => Promise<string> } }) => {
      return actions.order.create({
        intent: 'CAPTURE',
        purchase_units: [
          {
            reference_id: config.referenceId,
            description: config.description,
            amount: {
              currency_code: config.currency,
              value: config.amount.toFixed(2),
            },
          },
        ],
        application_context: {
          brand_name: 'Farebird',
          landing_page: 'NO_PREFERENCE',
          user_action: 'PAY_NOW',
          shipping_preference: 'NO_SHIPPING',
        },
      });
    },

    // Handle approval
    onApprove: async (data: { orderID: string }, actions: { order: { capture: () => Promise<PayPalOrderDetails> } }) => {
      try {
        const details = await actions.order.capture();
        await config.onApprove(data.orderID, details.payer);
      } catch (error) {
        config.onError(error instanceof Error ? error : new Error('Payment capture failed'));
      }
    },

    // Handle errors
    onError: (err: Error) => {
      console.error('PayPal error:', err);
      config.onError(err);
    },

    // Handle cancellation
    onCancel: () => {
      if (config.onCancel) {
        config.onCancel();
      }
    },
  });

  // Render buttons
  const container = document.getElementById(containerId);
  if (!container) {
    throw new Error(`Container #${containerId} not found`);
  }

  await buttons.render(`#${containerId}`);

  // Return cleanup function
  return () => {
    if (container) {
      container.innerHTML = '';
    }
  };
};

// ==========================================
// 🔧 UTILITY TYPES FOR WINDOW
// ==========================================

declare global {
  interface Window {
    paypal?: {
      Buttons: (config: {
        style?: {
          layout?: 'vertical' | 'horizontal';
          color?: 'gold' | 'blue' | 'silver' | 'white' | 'black';
          shape?: 'rect' | 'pill';
          label?: 'paypal' | 'checkout' | 'buynow' | 'pay';
          height?: number;
        };
        createOrder: (data: unknown, actions: { order: { create: (options: unknown) => Promise<string> } }) => Promise<string>;
        onApprove: (data: { orderID: string }, actions: { order: { capture: () => Promise<PayPalOrderDetails> } }) => Promise<void>;
        onError?: (err: Error) => void;
        onCancel?: () => void;
      }) => {
        render: (selector: string) => Promise<void>;
      };
    };
  }
}

export {};
