import MercadoPagoConfig, { Preference } from 'mercadopago';

// Initialize Mercado Pago
// Note: In a real multi-tenant app, you might want to use the merchant's ACCESS_TOKEN 
// dynamically. For now, we'll assume we use the platform's credential or the merchant's credential provided in env/db.

// Getting the client initialized with a dummy token first, 
// ensuring we can re-initialize it with specific merchant tokens later if needed.

// Helper to get MP client for a specific merchant
export const getMercadoPagoClient = (accessToken: string) => {
    return new MercadoPagoConfig({ accessToken: accessToken });
};

export const createPreference = async (client: MercadoPagoConfig, items: any[], externalReference: string, backUrls: any, notificationUrl?: string) => {
    const preference = new Preference(client);
    return await preference.create({
        body: {
            items: items,
            external_reference: externalReference,
            back_urls: backUrls,
            auto_return: 'approved',
            notification_url: notificationUrl
        }
    });
};
