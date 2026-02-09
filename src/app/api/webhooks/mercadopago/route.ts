import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { Payment } from 'mercadopago';
import { getMercadoPagoClient } from '@/lib/mercadopago';
import { sendWhatsAppMessage } from '@/lib/evolution-api';

export async function POST(request: Request) {
    try {
        const url = new URL(request.url);
        const topic = url.searchParams.get('topic') || url.searchParams.get('type');
        const id = url.searchParams.get('id') || url.searchParams.get('data.id');
        const merchantId = url.searchParams.get('merchantId');

        if (!merchantId) {
            console.error('Webhook error: Missing merchantId');
            return NextResponse.json({ error: 'Missing merchantId' }, { status: 400 });
        }

        if (topic === 'payment' && id) {
            console.log(`Received payment notification for merchant ${merchantId}: ${id}`);

            // 1. Get Merchant Token and Contact Info
            const { data: merchant, error: merchantError } = await supabaseAdmin
                .from('merchants')
                .select('mercadopago_access_token, phone, whatsapp')
                .eq('id', merchantId)
                .single();

            if (merchantError || !merchant || !merchant.mercadopago_access_token) {
                console.error('Webhook error: Merchant not found or token missing', merchantError);
                return NextResponse.json({ error: 'Merchant not found' }, { status: 404 });
            }

            // 2. Fetch Payment Details from Mercado Pago
            const client = getMercadoPagoClient(merchant.mercadopago_access_token);
            const payment = new Payment(client);

            const paymentData = await payment.get({ id: id });

            if (!paymentData) {
                console.error('Webhook error: Payment not found in Mercado Pago');
                return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
            }

            const orderId = paymentData.external_reference;
            const status = paymentData.status;
            const statusDetail = paymentData.status_detail;

            console.log(`Processing Order: ${orderId} | Status: ${status} | Detail: ${statusDetail}`);

            // 3. Map MP Status to our DB Status
            let paymentStatus = 'pending';
            let orderStatus = 'pending';
            let confirmedAt = null;

            if (status === 'approved') {
                paymentStatus = 'paid';
                orderStatus = 'confirmed'; // Auto-confirm order
                confirmedAt = new Date().toISOString();
            } else if (status === 'rejected' || status === 'cancelled' || status === 'refunded' || status === 'charged_back') {
                paymentStatus = 'failed';
                if (status === 'refunded') paymentStatus = 'refunded';
            }

            // 4. Update Order in Supabase
            const updateData: any = {
                payment_status: paymentStatus,
                mp_payment_id: id,
                updated_at: new Date().toISOString()
            };

            // Only update order status if it's approved to avoid overwriting manual changes
            // Or if it was pending and now failed
            if (status === 'approved') {
                updateData.status = orderStatus;
                updateData.confirmed_at = confirmedAt;
            }

            const { error: updateError } = await supabaseAdmin
                .from('orders')
                .update(updateData)
                .eq('id', orderId);

            if (updateError) {
                console.error('Webhook error: Failed to update order', updateError);
                return NextResponse.json({ error: 'Database update failed' }, { status: 500 });
            }

            console.log(`Order ${orderId} updated successfully.`);

            // TODO: Trigger WhatsApp Notification via Evolution API
            if (status === 'approved') {
                // 1. Notify Merchant
                if (merchant.phone || merchant.whatsapp) {
                    const merchantPhone = merchant.whatsapp || merchant.phone;
                    const merchantMsg = `🎉 ¡Nueva venta confirmada!\n\nPedido: #${orderId}\nTotal: $${Math.round(paymentData.transaction_amount || 0)}`;
                    await sendWhatsAppMessage(merchantPhone, merchantMsg);
                }

                // 2. Notify Customer (if we have their phone in the order)
                // We need to fetch the order details first to get customer info if not present in paymentData
                // For now, let's assume we can get it from the order we updated or fetch it.
                // Ideally, we fetch the order to get the customer_phone.

                const { data: orderData } = await supabaseAdmin
                    .from('orders')
                    .select('customer_phone, customer_name')
                    .eq('id', orderId)
                    .single();

                if (orderData?.customer_phone) {
                    const customerMsg = `Hola ${orderData.customer_name || 'Cliente'}, ¡tu pedido #${orderId} ha sido confirmado! 🚀\nPronto lo prepararemos para ti.`;
                    await sendWhatsAppMessage(orderData.customer_phone, customerMsg);
                }
            }

            return NextResponse.json({ status: 'OK' });
        }

        return NextResponse.json({ status: 'OK' });

    } catch (error: any) {
        console.error('Webhook error:', error);
        return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
    }
}
