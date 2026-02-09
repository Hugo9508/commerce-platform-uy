import { createClient } from '@supabase/supabase-js';

// Note: This client should ONLY be used in server-side contexts (API routes, Server Actions)
// NEVER expose this to the client-side as it uses the SERVICE_ROLE_KEY which bypasses RLS.

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});
