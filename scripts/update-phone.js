
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://supabase.axion380.com.br';
const supabaseServiceKey = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJzdXBhYmFzZSIsImlhdCI6MTc2MTg0ODU4MCwiZXhwIjo0OTE3NTIyMTgwLCJyb2xlIjoic2VydmljZV9yb2xlIn0.rNjJWwmUpV-3FkuWuAWjTGDai1YnaeaDxMZNSZSxua0';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function updatePhone() {
    const slug = 'test3-201';

    // Update with a valid format number (Example: 59899123456)
    // Using a placeholder valid mobile for test
    const newPhone = '099000000';

    const { error } = await supabase
        .from('merchants')
        .update({ whatsapp: newPhone, phone: newPhone })
        .eq('slug', slug);

    if (error) {
        console.error('Error updating phone:', error);
    } else {
        console.log(`Updated phone for ${slug} to ${newPhone}`);
    }
}

updatePhone();
