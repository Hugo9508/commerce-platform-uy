
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://supabase.axion380.com.br';
const supabaseServiceKey = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJzdXBhYmFzZSIsImlhdCI6MTc2MTg0ODU4MCwiZXhwIjo0OTE3NTIyMTgwLCJyb2xlIjoic2VydmljZV9yb2xlIn0.rNjJWwmUpV-3FkuWuAWjTGDai1YnaeaDxMZNSZSxua0';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function updateToken() {
    const token = 'TEST-198806667779009-020823-4c234e370961ff105399f8702393eae9-1272257938';

    const { data: merchants, error: listError } = await supabase.from('merchants').select('*');

    if (listError) {
        console.error('Error listing merchants:', listError);
        return;
    }

    if (!merchants || merchants.length === 0) {
        console.log('No merchants found.');
        return;
    }

    const targetMerchant = merchants[0];

    console.log(`Updating merchant: ${targetMerchant.name} (${targetMerchant.id})`);

    const { error: updateError } = await supabase
        .from('merchants')
        .update({ mercadopago_access_token: token })
        .eq('id', targetMerchant.id);

    if (updateError) {
        console.error('Error updating token:', updateError);
    } else {
        console.log(`Successfully updated token.`);
        console.log(`Store URL: http://localhost:3000/${targetMerchant.slug}`);
    }
}

updateToken();
