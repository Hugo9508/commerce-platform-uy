import { createClient } from './supabase';
import type { Product, Category } from './supabase';
import { v4 as uuidv4 } from 'uuid';

const supabase = createClient();

export interface CreateProductData {
    merchant_id: string;
    category_id: string;
    name: string;
    description?: string;
    price_uyu: number;
    stock?: number;
    image_url?: string;
    is_active?: boolean;
    is_featured?: boolean;
}

export interface UpdateProductData extends Partial<CreateProductData> {
    id: string;
}

// Upload image to Supabase Storage
export async function uploadProductImage(file: File, merchantSlug: string): Promise<string | null> {
    try {
        const fileExt = file.name.split('.').pop();
        const fileName = `${merchantSlug}/${uuidv4()}.${fileExt}`;

        const { data, error } = await supabase.storage
            .from('products')
            .upload(fileName, file, {
                cacheControl: '3600',
                upsert: false
            });

        if (error) {
            console.error('Error uploading image:', error);
            return null;
        }

        const { data: { publicUrl } } = supabase.storage
            .from('products')
            .getPublicUrl(fileName);

        return publicUrl;
    } catch (error) {
        console.error('Upload error:', error);
        return null;
    }
}

// Create Product
export async function createProduct(data: CreateProductData) {
    const slug = data.name
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '') + '-' + uuidv4().slice(0, 4);

    const { data: product, error } = await supabase
        .from('products')
        .insert({
            ...data,
            slug,
            is_active: data.is_active ?? true,
            is_featured: data.is_featured ?? false,
        })
        .select()
        .single();

    if (error) {
        console.error('Error creating product:', error);
        return { success: false, error: error.message };
    }

    return { success: true, product };
}

// Update Product
export async function updateProduct(data: UpdateProductData) {
    const { id, ...updates } = data;

    const { data: product, error } = await supabase
        .from('products')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

    if (error) {
        console.error('Error updating product:', error);
        return { success: false, error: error.message };
    }

    return { success: true, product };
}

// Delete Product
export async function deleteProduct(id: string) {
    const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

    if (error) {
        console.error('Error deleting product:', error);
        return { success: false, error: error.message };
    }

    return { success: true };
}

// Get Merchant Categories (for selector)
export async function getMerchantCategories(merchantId: string) {
    const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('merchant_id', merchantId)
        .order('name');

    if (error) {
        console.error('Error fetching categories:', error);
        return [];
    }

    return data;
}

// Get Merchant Products (for dashboard list)
export async function getMerchantProducts(merchantId: string) {
    const { data, error } = await supabase
        .from('products')
        .select('*, categories(name)')
        .eq('merchant_id', merchantId)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching products:', error);
        return [];
    }

    return data;
}

// Get Single Product
export async function getProduct(id: string) {
    const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single();

    if (error) {
        console.error('Error fetching product:', error);
        return null;
    }

    return data;
}

// Get Merchant by Slug
export async function getMerchantBySlug(slug: string) {
    const { data, error } = await supabase
        .from('merchants')
        .select('*')
        .eq('slug', slug)
        .single();

    if (error) {
        console.error('Error fetching merchant by slug:', error.message, error.details || '', error.hint || '');
        return null;
    }

    return data;
}
