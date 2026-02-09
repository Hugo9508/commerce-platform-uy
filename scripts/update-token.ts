
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function updateToken() {
    const token = 'TEST-198806667779009-020823-4c234e370961ff105399f8702393eae9-1272257938';

    // Get all merchants to find the one to update (assuming single user for now or amirafixfine)
    const { data: merchants, error: listError } = await supabase.from('merchants').select('*');

    if (listError) {
        console.error('Error listing merchants:', listError);
        return;
    }

    if (!merchants || merchants.length === 0) {
        console.log('No merchants found.');
        return;
    }

    // Pick the first one or specific email if we linked it clearly. 
    // In previous turns, we worked with amirafixfine@gmail.com.
    // Let's just update the most recent one or all of them since this is a dev/test env for the user.
    // Actually, let's listing them to see.

    console.log('Found merchants:', merchants.map(m => `${m.id} - ${m.name} (${m.slug})`));

    const targetMerchant = merchants[0]; // Update the first one found

    if (targetMerchant) {
        const { error: updateError } = await supabase
            .from('merchants')
            .update({ mercadopago_access_token: token })
            .eq('id', targetMerchant.id);

        if (updateError) {
            console.error('Error updating token:', updateError);
        } else {
            console.log(`Successfully updated token for merchant: ${targetMerchant.name}`);
            console.log(`Store URL: ${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/${targetMerchant.slug}`);
        }
    }
}

updateToken();
