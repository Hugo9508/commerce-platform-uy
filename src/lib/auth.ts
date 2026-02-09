import { createClient } from './supabase';
import type { Merchant } from './supabase';

const supabase = createClient();

// ============================================
// AUTH TYPES
// ============================================

export interface AuthUser {
    id: string;
    email: string;
    merchant?: Merchant;
}

export interface SignUpData {
    email: string;
    password: string;
    merchantName: string;
    whatsapp: string;
    barrio?: string;
}

export interface SignInData {
    email: string;
    password: string;
}

export interface AuthResult {
    success: boolean;
    user?: AuthUser;
    error?: string;
}

// ============================================
// SIGN UP - Register new merchant
// ============================================

export async function signUp(data: SignUpData): Promise<AuthResult> {
    try {
        // 1. Create auth user
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email: data.email,
            password: data.password,
            options: {
                data: {
                    merchant_name: data.merchantName,
                },
            },
        });

        if (authError || !authData.user) {
            return {
                success: false,
                error: authError?.message || 'Error al crear cuenta',
            };
        }

        // 2. Create merchant profile
        const slug = data.merchantName
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-|-$/g, '');

        const { data: merchant, error: merchantError } = await supabase
            .from('merchants')
            .insert({
                user_id: authData.user.id,
                name: data.merchantName,
                slug: slug,
                whatsapp: data.whatsapp,
                email: data.email,
                barrio: data.barrio || 'Pocitos',
                is_active: true,
            })
            .select()
            .single();

        if (merchantError) {
            console.error('Error creating merchant:', merchantError);
            // Note: User was created but merchant wasn't
            // In production, you might want to clean up the auth user
            return {
                success: false,
                error: 'Error al crear perfil de tienda',
            };
        }

        return {
            success: true,
            user: {
                id: authData.user.id,
                email: authData.user.email!,
                merchant,
            },
        };
    } catch (error) {
        console.error('SignUp error:', error);
        return {
            success: false,
            error: 'Error inesperado al registrar',
        };
    }
}

// ============================================
// SIGN IN - Login existing merchant
// ============================================

export async function signIn(data: SignInData): Promise<AuthResult> {
    try {
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
            email: data.email,
            password: data.password,
        });

        if (authError || !authData.user) {
            return {
                success: false,
                error: authError?.message || 'Credenciales inválidas',
            };
        }

        // Get merchant profile
        const { data: merchant } = await supabase
            .from('merchants')
            .select('*')
            .eq('user_id', authData.user.id)
            .single();

        return {
            success: true,
            user: {
                id: authData.user.id,
                email: authData.user.email!,
                merchant: merchant || undefined,
            },
        };
    } catch (error) {
        console.error('SignIn error:', error);
        return {
            success: false,
            error: 'Error inesperado al iniciar sesión',
        };
    }
}

// ============================================
// SIGN OUT
// ============================================

export async function signOut(): Promise<{ success: boolean; error?: string }> {
    try {
        const { error } = await supabase.auth.signOut();

        if (error) {
            return { success: false, error: error.message };
        }

        return { success: true };
    } catch (error) {
        console.error('SignOut error:', error);
        return { success: false, error: 'Error al cerrar sesión' };
    }
}

// ============================================
// GET CURRENT USER
// ============================================

export async function getCurrentUser(): Promise<AuthUser | null> {
    try {
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return null;
        }

        // Get merchant profile
        const { data: merchant } = await supabase
            .from('merchants')
            .select('*')
            .eq('user_id', user.id)
            .single();

        return {
            id: user.id,
            email: user.email!,
            merchant: merchant || undefined,
        };
    } catch (error) {
        console.error('GetCurrentUser error:', error);
        return null;
    }
}

// ============================================
// AUTH STATE LISTENER
// ============================================

export function onAuthStateChange(callback: (user: AuthUser | null) => void) {
    return supabase.auth.onAuthStateChange(async (event, session) => {
        if (session?.user) {
            const { data: merchant } = await supabase
                .from('merchants')
                .select('*')
                .eq('user_id', session.user.id)
                .single();

            callback({
                id: session.user.id,
                email: session.user.email!,
                merchant: merchant || undefined,
            });
        } else {
            callback(null);
        }
    });
}

// ============================================
// PASSWORD RESET
// ============================================

export async function resetPassword(email: string): Promise<{ success: boolean; error?: string }> {
    try {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/auth/reset-password`,
        });

        if (error) {
            return { success: false, error: error.message };
        }

        return { success: true };
    } catch (error) {
        console.error('ResetPassword error:', error);
        return { success: false, error: 'Error al enviar email de recuperación' };
    }
}

// ============================================
// UPDATE MERCHANT PROFILE
// ============================================

export async function updateMerchantProfile(
    merchantId: string,
    updates: Partial<Merchant>
): Promise<{ success: boolean; merchant?: Merchant; error?: string }> {
    try {
        const { data, error } = await supabase
            .from('merchants')
            .update(updates)
            .eq('id', merchantId)
            .select()
            .single();

        if (error) {
            return { success: false, error: error.message };
        }

        return { success: true, merchant: data };
    } catch (error) {
        console.error('UpdateMerchantProfile error:', error);
        return { success: false, error: 'Error al actualizar perfil' };
    }
}
