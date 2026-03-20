/**
 * Chargily Pay V2 Client
 * This utility handles communication with the Chargily API for payment processing.
 * Ref: https://dev.chargily.com/pay-v2/api-reference/introduction
 */

interface ChargilyCheckoutOptions {
    amount: number;
    currency: 'dzd';
    success_url: string;
    failure_url: string;
    webhook_endpoint: string;
    customer_id?: string;
    metadata?: Record<string, any>;
    description?: string;
}

interface ChargilyCustomerOptions {
    name: string;
    email: string;
    phone?: string;
    address?: {
        country: string;
        state: string;
        city: string;
        address: string;
    };
}

export class ChargilyClient {
    private apiKey: string;
    private baseUrl: string;

    constructor() {
        const key = process.env.CHARGILY_API_KEY;
        if (!key) {
            throw new Error('CHARGILY_API_KEY is not defined in environment variables');
        }
        this.apiKey = key;
        
        const mode = process.env.CHARGILY_MODE || 'test';
        this.baseUrl = mode === 'live' 
            ? 'https://pay.chargily.net/api/v2' 
            : 'https://pay.chargily.net/test/api/v2';
    }

    private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
        const response = await fetch(`${this.baseUrl}${endpoint}`, {
            ...options,
            headers: {
                'Authorization': `Bearer ${this.apiKey}`,
                'Content-Type': 'application/json',
                ...options.headers,
            },
        });

        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.message || `Chargily API error: ${response.statusText}`);
        }
        return data as T;
    }

    /**
     * Create a new checkout session.
     * Users will be redirected to the checkout_url returned by this call.
     */
    async createCheckout(options: ChargilyCheckoutOptions) {
        return this.request<any>('/checkouts', {
            method: 'POST',
            body: JSON.stringify(options),
        });
    }

    /**
     * Retrieve details of a specific checkout.
     */
    async retrieveCheckout(checkoutId: string) {
        return this.request<any>(`/checkouts/${checkoutId}`, {
            method: 'GET',
        });
    }

    /**
     * Expire an active checkout session.
     */
    async expireCheckout(checkoutId: string) {
        return this.request<any>(`/checkouts/${checkoutId}/expire`, {
            method: 'POST',
        });
    }

    /**
     * Create a customer for recurring users or better tracking.
     */
    async createCustomer(options: ChargilyCustomerOptions) {
        return this.request<any>('/customers', {
            method: 'POST',
            body: JSON.stringify(options),
        });
    }

    /**
     * Retrieve the current balance of the merchant account.
     */
    async retrieveBalance() {
        return this.request<any>('/balance', {
            method: 'GET',
        });
    }
}

// Singleton instance to be used across the application
let chargilyInstance: ChargilyClient | null = null;

export const getChargilyClient = () => {
    if (!chargilyInstance) {
        chargilyInstance = new ChargilyClient();
    }
    return chargilyInstance;
};
