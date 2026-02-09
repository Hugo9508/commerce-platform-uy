import { createClient, type Merchant, type Product, type Category, type DeliveryZone } from './supabase';

const supabase = createClient();

// ============================================
// MERCHANT FUNCTIONS
// ============================================

export async function getMerchantBySlug(slug: string): Promise<Merchant | null> {
    const { data, error } = await supabase
        .from('merchants')
        .select('*')
        .eq('slug', slug)
        .eq('is_active', true)
        .single();

    if (error) {
        console.error('Error fetching merchant:', error);
        return null;
    }

    return data;
}

export async function getMerchantById(id: string): Promise<Merchant | null> {
    const { data, error } = await supabase
        .from('merchants')
        .select('*')
        .eq('id', id)
        .single();

    if (error) {
        console.error('Error fetching merchant:', error);
        return null;
    }

    return data;
}

// ============================================
// CATEGORY FUNCTIONS
// ============================================

export async function getCategoriesByMerchant(merchantId: string): Promise<Category[]> {
    const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('merchant_id', merchantId)
        .eq('is_active', true)
        .order('sort_order', { ascending: true });

    if (error) {
        console.error('Error fetching categories:', error);
        return [];
    }

    return data || [];
}

// ============================================
// PRODUCT FUNCTIONS
// ============================================

export async function getProductsByMerchant(
    merchantId: string,
    options?: {
        categoryId?: string;
        featured?: boolean;
        limit?: number;
        search?: string;
    }
): Promise<Product[]> {
    let query = supabase
        .from('products')
        .select('*')
        .eq('merchant_id', merchantId)
        .eq('is_active', true)
        .order('sort_order', { ascending: true });

    if (options?.categoryId) {
        query = query.eq('category_id', options.categoryId);
    }

    if (options?.featured) {
        query = query.eq('is_featured', true);
    }

    if (options?.search) {
        query = query.ilike('name', `%${options.search}%`);
    }

    if (options?.limit) {
        query = query.limit(options.limit);
    }

    const { data, error } = await query;

    if (error) {
        console.error('Error fetching products:', error);
        return [];
    }

    return data || [];
}

export async function getProductBySlug(
    merchantId: string,
    slug: string
): Promise<Product | null> {
    const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('merchant_id', merchantId)
        .eq('slug', slug)
        .eq('is_active', true)
        .single();

    if (error) {
        console.error('Error fetching product:', error);
        return null;
    }

    return data;
}

// ============================================
// DELIVERY ZONE FUNCTIONS
// ============================================

export async function getDeliveryZones(merchantId: string): Promise<DeliveryZone[]> {
    const { data, error } = await supabase
        .from('delivery_zones')
        .select('*')
        .eq('merchant_id', merchantId)
        .eq('is_active', true)
        .order('name', { ascending: true });

    if (error) {
        console.error('Error fetching delivery zones:', error);
        return [];
    }

    return data || [];
}

export async function getDeliveryZoneByBarrio(
    merchantId: string,
    barrio: string
): Promise<DeliveryZone | null> {
    const { data, error } = await supabase
        .from('delivery_zones')
        .select('*')
        .eq('merchant_id', merchantId)
        .eq('barrio', barrio)
        .eq('is_active', true)
        .single();

    if (error) {
        console.error('Error fetching delivery zone:', error);
        return null;
    }

    return data;
}

// ============================================
// CATALOG DATA (Combined fetch for a store)
// ============================================

export interface CatalogData {
    merchant: Merchant;
    categories: Category[];
    products: Product[];
    deliveryZones: DeliveryZone[];
}

export async function getCatalogData(merchantSlug: string): Promise<CatalogData | null> {
    const merchant = await getMerchantBySlug(merchantSlug);

    if (!merchant) {
        return null;
    }

    const [categories, products, deliveryZones] = await Promise.all([
        getCategoriesByMerchant(merchant.id),
        getProductsByMerchant(merchant.id),
        getDeliveryZones(merchant.id),
    ]);

    return {
        merchant,
        categories,
        products,
        deliveryZones,
    };
}
