
const { createClient } = require('@supabase/supabase-js');
// Mocking the fetch for the script since Node < 18 might need it, but likely user has new Node.
// If fetch is missing, we might need 'node-fetch', but let's try native first.

const supabaseUrl = 'https://supabase.axion380.com.br';
const supabaseServiceKey = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJzdXBhYmFzZSIsImlhdCI6MTc2MTg0ODU4MCwiZXhwIjo0OTE3NTIyMTgwLCJyb2xlIjoic2VydmljZV9yb2xlIn0.rNjJWwmUpV-3FkuWuAWjTGDai1YnaeaDxMZNSZSxua0';

// Evolution API Config
const EVOLUTION_API_URL = 'https://evolution.axion380.com.br';
const EVOLUTION_API_KEY = 'atgW2rJezfFfTRtq1exSQC7ykLdWk35S';
const EVOLUTION_INSTANCE_NAME = 'Maya';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function sendWhatsAppMessage(phone, message) {
    try {
        let formattedPhone = phone.replace(/[^0-9]/g, '');
        if (formattedPhone.startsWith('09')) {
            formattedPhone = '598' + formattedPhone.substring(1);
        } else if (formattedPhone.startsWith('9')) {
            formattedPhone = '598' + formattedPhone;
        }

        console.log(`Sending WhatsApp to ${formattedPhone}...`);

        const response = await fetch(`${EVOLUTION_API_URL}/message/sendText/${EVOLUTION_INSTANCE_NAME}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'apikey': EVOLUTION_API_KEY
            },
            body: JSON.stringify({
                number: formattedPhone,
                text: message,
            })
        });

        const data = await response.json();
        console.log('API Response:', JSON.stringify(data, null, 2));
        return response.ok;

    } catch (error) {
        console.error('Error sending WhatsApp:', error);
        return false;
    }
}

async function test() {
    // 1. Get Merchant Phone
    const slug = 'test3-201';
    const { data: merchant } = await supabase
        .from('merchants')
        .select('whatsapp, phone, name')
        .eq('slug', slug)
        .single();

    if (!merchant) {
        console.log('Merchant not found');
        return;
    }

    const phone = merchant.whatsapp || merchant.phone;
    if (!phone) {
        console.log('Merchant has no phone configured');
        return;
    }
    console.log(`Raw phone from DB: "${phone}"`);

    console.log(`Testing WhatsApp for merchant: ${merchant.name} (${phone})`);

    // 2. Send Test Message
    const message = `🔔 Prueba de Integración CatalogoUY\n\nHola ${merchant.name}, si lees esto, la integración de WhatsApp funciona correctamente. 🚀`;
    await sendWhatsAppMessage(phone, message);
}

test();
