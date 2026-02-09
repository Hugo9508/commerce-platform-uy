import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        console.log('Registration request body:', body); // Debug log

        // Map client fields to server variables
        const { email, password, merchantName, whatsapp, barrio } = body;
        const name = merchantName;
        const phone = whatsapp;

        if (!email || !password || !name) {
            return NextResponse.json({ error: 'Faltan datos requeridos (email, password, nombre)' }, { status: 400 });
        }

        // 1. Create User (Admin execution to skip email confirmation if needed)
        const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
            email,
            password,
            email_confirm: true,
            user_metadata: {
                role: 'merchant',
                name: name,
            }
        });

        if (authError) {
            console.error('Error creating user:', authError);
            return NextResponse.json({ error: authError.message }, { status: 400 });
        }

        if (!authData.user) {
            return NextResponse.json({ error: 'User creation failed' }, { status: 500 });
        }

        if (!authData.user) {
            return NextResponse.json({ error: 'User creation failed' }, { status: 500 });
        }

        const userId = authData.user.id;

        // Generate slug from name
        const slug = name
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-|-$/g, '') + '-' + Math.floor(Math.random() * 1000);

        // 2. Create Merchant Profile (Bypassing RLS with Admin Client)
        const { error: merchantError } = await supabaseAdmin
            .from('merchants')
            .insert([
                {
                    user_id: userId,
                    name: name,
                    slug: slug,
                    email: email,
                    whatsapp: phone, // Mapping phone to whatsapp for now
                    barrio: barrio,
                    is_active: true
                }
            ]);

        if (merchantError) {
            console.error('Error creating merchant:', merchantError);
            // Optional: Delete user if merchant creation fails to keep consistency
            await supabaseAdmin.auth.admin.deleteUser(userId);
            return NextResponse.json({ error: merchantError.message }, { status: 400 });
        }

        return NextResponse.json({ success: true, userId });

    } catch (error) {
        console.error('Registration error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
