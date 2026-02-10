import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { getMercadoPagoClient, createPreference } from '@/lib/mercadopago';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { orderId, merchantId } = body;

        if (!orderId || !merchantId) {
            return NextResponse.json({ error: 'Order ID and Merchant ID required' }, { status: 400 });
        }

        // Demo Mode Bypass
        if (merchantId === '00000000-0000-0000-0000-000000000000') {
            return NextResponse.json({
                init_point: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/success?orderId=${orderId}`,
                preference_id: 'demo-preference-id'
            });
        }

        // 1. Get Access Token for the Merchant
        const { data: merchant, error: merchantError } = await supabaseAdmin
            .from('merchants')
            .select('mercadopago_access_token')
            .eq('id', merchantId)
            .single();

        if (merchantError || !merchant) {
            return NextResponse.json({ error: 'Merchant not found' }, { status: 404 });
        }

        // If merchant hasn't configured MP, return error
        if (!merchant.mercadopago_access_token) {
            return NextResponse.json({ error: 'Mercado Pago not configured for this merchant' }, { status: 400 });
        }

        // 2. Get Order Details
        const { data: order, error: orderError } = await supabaseAdmin
            .from('orders')
            .select('*, order_items(*)')
            .eq('id', orderId)
            .single();

        if (orderError || !order) {
            return NextResponse.json({ error: 'Order not found' }, { status: 404 });
        }

        // 3. Create Preference in Mercado Pago
        const client = getMercadoPagoClient(merchant.mercadopago_access_token);

        const items = order.order_items.map((item: any) => ({
            id: item.product_id,
            title: item.product_name,
            quantity: item.quantity,
            unit_price: Number(item.unit_price_uyu),
            currency_id: 'UYU',
            picture_url: item.product_image_url
        }));

        // Add delivery cost as item if > 0
        if (order.delivery_cost_uyu > 0) {
            items.push({
                id: 'delivery',
                title: 'Costo de envío',
                quantity: 1,
                unit_price: Number(order.delivery_cost_uyu),
                currency_id: 'UYU'
            });
        }

        const backUrls = {
            success: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/success?orderId=${orderId}`,
            failure: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/failure?orderId=${orderId}`,
            pending: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/pending?orderId=${orderId}`
        };

        const notificationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/mercadopago?merchantId=${merchantId}`;

        const preference = await createPreference(client, items, order.id, backUrls, notificationUrl);

        // 4. Update Order with Preference ID
        await supabaseAdmin
            .from('orders')
            .update({ mp_preference_id: preference.id })
            .eq('id', orderId);

        return NextResponse.json({ init_point: preference.init_point, preference_id: preference.id });

    } catch (error: any) {
        console.error('Checkout error:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
