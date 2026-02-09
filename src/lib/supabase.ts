import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
    return createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
}

// Types for database tables
export interface Plan {
    id: string;
    name: string;
    slug: string;
    price_uyu: number;
    max_products: number;
    max_categories: number;
    featured_enabled: boolean;
    analytics_enabled: boolean;
    custom_domain_enabled: boolean;
    priority_support: boolean;
    description: string | null;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

export interface Merchant {
    id: string;
    user_id: string | null;
    plan_id: string | null;
    name: string;
    slug: string;
    description: string | null;
    logo_url: string | null;
    banner_url: string | null;
    email: string | null;
    phone: string | null;
    whatsapp: string | null;
    address: string | null;
    barrio: string | null;
    city: string;
    primary_color: string;
    secondary_color: string;
    currency: string;
    mercadopago_access_token: string | null;
    accepts_cash: boolean;
    accepts_transfer: boolean;
    accepts_abitab: boolean;
    is_active: boolean;
    is_verified: boolean;
    created_at: string;
    updated_at: string;
}

export interface Category {
    id: string;
    merchant_id: string;
    name: string;
    slug: string;
    description: string | null;
    icon: string | null;
    sort_order: number;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

export interface Product {
    id: string;
    merchant_id: string;
    category_id: string | null;
    name: string;
    slug: string;
    description: string | null;
    price_uyu: number;
    compare_price_uyu: number | null;
    image_url: string | null;
    gallery_urls: string[] | null;
    sku: string | null;
    stock: number;
    track_stock: boolean;
    is_active: boolean;
    is_featured: boolean;
    sort_order: number;
    created_at: string;
    updated_at: string;
}

export interface DeliveryZone {
    id: string;
    merchant_id: string;
    name: string;
    barrio: string;
    delivery_cost_uyu: number;
    min_order_uyu: number;
    estimated_time: string | null;
    is_active: boolean;
    created_at: string;
}

export interface Customer {
    id: string;
    merchant_id: string;
    name: string;
    email: string | null;
    phone: string | null;
    whatsapp: string | null;
    address: string | null;
    barrio: string | null;
    city: string;
    notes: string | null;
    total_orders: number;
    total_spent_uyu: number;
    created_at: string;
    updated_at: string;
}

export type OrderStatus = 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivering' | 'delivered' | 'cancelled';
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';
export type PaymentMethod = 'mercadopago' | 'abitab' | 'redpagos' | 'transfer' | 'cash';

export interface Order {
    id: string;
    merchant_id: string;
    customer_id: string | null;
    order_number: string;
    subtotal_uyu: number;
    delivery_cost_uyu: number;
    discount_uyu: number;
    total_uyu: number;
    status: OrderStatus;
    payment_status: PaymentStatus;
    payment_method: PaymentMethod | null;
    mp_payment_id: string | null;
    mp_preference_id: string | null;
    delivery_address: string | null;
    delivery_barrio: string | null;
    delivery_notes: string | null;
    customer_name: string | null;
    customer_phone: string | null;
    customer_email: string | null;
    created_at: string;
    updated_at: string;
    confirmed_at: string | null;
    delivered_at: string | null;
}

export interface OrderItem {
    id: string;
    order_id: string;
    product_id: string | null;
    product_name: string;
    product_image_url: string | null;
    unit_price_uyu: number;
    quantity: number;
    total_uyu: number;
    notes: string | null;
    created_at: string;
}

// Database type for Supabase
export interface Database {
    public: {
        Tables: {
            plans: {
                Row: Plan;
                Insert: Omit<Plan, 'id' | 'created_at' | 'updated_at'>;
                Update: Partial<Omit<Plan, 'id'>>;
            };
            merchants: {
                Row: Merchant;
                Insert: Omit<Merchant, 'id' | 'created_at' | 'updated_at'>;
                Update: Partial<Omit<Merchant, 'id'>>;
            };
            categories: {
                Row: Category;
                Insert: Omit<Category, 'id' | 'created_at' | 'updated_at'>;
                Update: Partial<Omit<Category, 'id'>>;
            };
            products: {
                Row: Product;
                Insert: Omit<Product, 'id' | 'created_at' | 'updated_at'>;
                Update: Partial<Omit<Product, 'id'>>;
            };
            delivery_zones: {
                Row: DeliveryZone;
                Insert: Omit<DeliveryZone, 'id' | 'created_at'>;
                Update: Partial<Omit<DeliveryZone, 'id'>>;
            };
            customers: {
                Row: Customer;
                Insert: Omit<Customer, 'id' | 'created_at' | 'updated_at'>;
                Update: Partial<Omit<Customer, 'id'>>;
            };
            orders: {
                Row: Order;
                Insert: Omit<Order, 'id' | 'created_at' | 'updated_at'>;
                Update: Partial<Omit<Order, 'id'>>;
            };
            order_items: {
                Row: OrderItem;
                Insert: Omit<OrderItem, 'id' | 'created_at'>;
                Update: Partial<Omit<OrderItem, 'id'>>;
            };
        };
    };
}
