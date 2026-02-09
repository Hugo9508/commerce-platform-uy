
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://supabase.axion380.com.br';
const supabaseServiceKey = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJzdXBhYmFzZSIsImlhdCI6MTc2MTg0ODU4MCwiZXhwIjo0OTE3NTIyMTgwLCJyb2xlIjoic2VydmljZV9yb2xlIn0.rNjJWwmUpV-3FkuWuAWjTGDai1YnaeaDxMZNSZSxua0';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function verifyMerchant() {
    const slug = 'test3-201'; // The slug we found earlier

    console.log(`Checking merchant with slug: ${slug}`);

    const { data, error } = await supabase
        .from('merchants')
        .select('*')
        .eq('slug', slug)
        .single();

    if (error) {
        console.error('Error:', error);
    } else {
        console.log('Merchant found:');
        console.log('ID:', data.id);
        console.log('Name:', data.name);
        console.log('Is Active:', data.is_active);
        console.log('Token:', data.mercadopago_access_token ? 'Present' : 'Missing');
    }
}

verifyMerchant();
