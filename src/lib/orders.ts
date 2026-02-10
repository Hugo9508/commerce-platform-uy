import { createClient, type Order, type OrderItem, type Customer } from './supabase';
export type { Order, OrderItem, Customer };

const supabase = createClient();

// ============================================
// ORDER CREATION
// ============================================

export interface CreateOrderInput {
    merchantId: string;
    items: {
        productId: string;
        productName: string;
        productImageUrl?: string;
        unitPrice: number;
        quantity: number;
        notes?: string;
    }[];
    customer: {
        name: string;
        phone: string;
        email?: string;
        address?: string;
        barrio?: string;
        notes?: string;
    };
    deliveryCost: number;
    paymentMethod: 'mercadopago' | 'abitab' | 'redpagos' | 'transfer' | 'cash';
}

export interface CreateOrderResult {
    success: boolean;
    order?: Order;
    orderNumber?: string;
    error?: string;
}

export async function createOrder(input: CreateOrderInput): Promise<CreateOrderResult> {
    // Demo Mode Bypass
    if (input.merchantId === '00000000-0000-0000-0000-000000000000') {
        await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate delay
        return {
            success: true,
            order: {
                id: 'demo-order-uuid',
                merchant_id: input.merchantId,
                customer_id: 'demo-customer',
                order_number: `DEMO-${Math.floor(Math.random() * 1000)}`,
                status: 'pending',
                payment_status: 'pending',
                total_uyu: input.items.reduce((acc, item) => acc + (item.unitPrice * item.quantity), 0) + input.deliveryCost,
                created_at: new Date().toISOString(),
                // Add other required fields with dummy data if needed by strict typing
            } as any,
            orderNumber: `DEMO-${Math.floor(Math.random() * 1000)}`,
        };
    }

    try {
        // Calculate totals
        const subtotal = input.items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
        const total = subtotal + input.deliveryCost;

        // Generate order number (simple version - use DB function in production)
        const orderNumber = `ORD-${Date.now().toString(36).toUpperCase()}`;

        // Find or create customer
        let customerId: string | null = null;

        const { data: existingCustomer } = await supabase
            .from('customers')
            .select('id')
            .eq('merchant_id', input.merchantId)
            .eq('phone', input.customer.phone)
            .single();

        if (existingCustomer) {
            customerId = existingCustomer.id;

            // Update customer stats
            await supabase
                .from('customers')
                .update({
                    name: input.customer.name,
                    email: input.customer.email,
                    address: input.customer.address,
                    barrio: input.customer.barrio,
                    notes: input.customer.notes,
                })
                .eq('id', customerId);
        } else {
            // Create new customer
            const { data: newCustomer, error: customerError } = await supabase
                .from('customers')
                .insert({
                    merchant_id: input.merchantId,
                    name: input.customer.name,
                    phone: input.customer.phone,
                    email: input.customer.email,
                    whatsapp: input.customer.phone,
                    address: input.customer.address,
                    barrio: input.customer.barrio,
                    notes: input.customer.notes,
                })
                .select('id')
                .single();

            if (newCustomer) {
                customerId = newCustomer.id;
            }
        }

        // Create order
        const { data: order, error: orderError } = await supabase
            .from('orders')
            .insert({
                merchant_id: input.merchantId,
                customer_id: customerId,
                order_number: orderNumber,
                subtotal_uyu: subtotal,
                delivery_cost_uyu: input.deliveryCost,
                discount_uyu: 0,
                total_uyu: total,
                status: 'pending',
                payment_status: 'pending',
                payment_method: input.paymentMethod,
                delivery_address: input.customer.address,
                delivery_barrio: input.customer.barrio,
                delivery_notes: input.customer.notes,
                customer_name: input.customer.name,
                customer_phone: input.customer.phone,
                customer_email: input.customer.email,
            })
            .select()
            .single();

        if (orderError || !order) {
            throw new Error(orderError?.message || 'Error creating order');
        }

        // Create order items
        const orderItems = input.items.map((item) => ({
            order_id: order.id,
            product_id: item.productId,
            product_name: item.productName,
            product_image_url: item.productImageUrl,
            unit_price_uyu: item.unitPrice,
            quantity: item.quantity,
            total_uyu: item.unitPrice * item.quantity,
            notes: item.notes,
        }));

        const { error: itemsError } = await supabase
            .from('order_items')
            .insert(orderItems);

        if (itemsError) {
            console.error('Error creating order items:', itemsError);
        }

        // Update customer stats
        if (customerId) {
            await supabase.rpc('increment_customer_stats', {
                p_customer_id: customerId,
                p_order_total: total,
            });
        }

        return {
            success: true,
            order,
            orderNumber,
        };
    } catch (error) {
        console.error('Error creating order:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
        };
    }
}

// ============================================
// ORDER QUERIES
// ============================================

export async function getOrderByNumber(
    merchantId: string,
    orderNumber: string
): Promise<Order | null> {
    const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('merchant_id', merchantId)
        .eq('order_number', orderNumber)
        .single();

    if (error) {
        console.error('Error fetching order:', error);
        return null;
    }

    return data;
}

export async function getOrderItems(orderId: string): Promise<OrderItem[]> {
    const { data, error } = await supabase
        .from('order_items')
        .select('*')
        .eq('order_id', orderId);

    if (error) {
        console.error('Error fetching order items:', error);
        return [];
    }

    return data || [];
}

export async function getOrderWithItems(orderId: string) {
    const { data: order, error: orderError } = await supabase
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .single();

    if (orderError || !order) {
        return null;
    }

    const items = await getOrderItems(orderId);

    return {
        ...order,
        items,
    };
}

// ============================================
// ORDER STATUS UPDATES
// ============================================

export async function updateOrderStatus(
    orderId: string,
    status: Order['status']
): Promise<boolean> {
    const updateData: Partial<Order> = { status };

    if (status === 'confirmed') {
        updateData.confirmed_at = new Date().toISOString();
    } else if (status === 'delivered') {
        updateData.delivered_at = new Date().toISOString();
    }

    const { error } = await supabase
        .from('orders')
        .update(updateData)
        .eq('id', orderId);

    if (error) {
        console.error('Error updating order status:', error);
        return false;
    }

    return true;
}

export async function updatePaymentStatus(
    orderId: string,
    paymentStatus: Order['payment_status'],
    mpPaymentId?: string
): Promise<boolean> {
    const updateData: Partial<Order> = { payment_status: paymentStatus };

    if (mpPaymentId) {
        updateData.mp_payment_id = mpPaymentId;
    }

    const { error } = await supabase
        .from('orders')
        .update(updateData)
        .eq('id', orderId);

    if (error) {
        console.error('Error updating payment status:', error);
        return false;
    }

    return true;
}

// ============================================
// MERCHANT ORDERS LIST
// ============================================

export async function getMerchantOrders(
    merchantId: string,
    options?: {
        status?: Order['status'];
        limit?: number;
        offset?: number;
    }
) {
    let query = supabase
        .from('orders')
        .select('*')
        .eq('merchant_id', merchantId)
        .order('created_at', { ascending: false });

    if (options?.status) {
        query = query.eq('status', options.status);
    }

    if (options?.limit) {
        query = query.limit(options.limit);
    }

    if (options?.offset) {
        query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
    }

    const { data, error } = await query;

    if (error) {
        console.error('Error fetching orders:', error);
        return [];
    }

    return data || [];
}
