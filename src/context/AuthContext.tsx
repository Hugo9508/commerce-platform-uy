"use client";

import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from "react";
import type { AuthUser, SignInData, SignUpData, AuthResult } from "@/lib/auth";

interface AuthContextType {
    user: AuthUser | null;
    loading: boolean;
    signIn: (data: SignInData) => Promise<{ success: boolean; error?: string }>;
    signUp: (data: SignUpData) => Promise<{ success: boolean; error?: string }>;
    signOut: () => Promise<{ success: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [loading, setLoading] = useState(true);
    const [authModule, setAuthModule] = useState<typeof import("@/lib/auth") | null>(null);

    // Load auth module dynamically on client side only
    useEffect(() => {
        import("@/lib/auth").then((module) => {
            setAuthModule(module);
        });
    }, []);

    // Initialize user and listen for auth changes
    useEffect(() => {
        if (!authModule) return;

        // Get initial user
        authModule.getCurrentUser().then((currentUser) => {
            setUser(currentUser);
            setLoading(false);
        });

        // Listen for auth changes
        const { data: { subscription } } = authModule.onAuthStateChange((currentUser) => {
            setUser(currentUser);
            setLoading(false);
        });

        return () => {
            subscription.unsubscribe();
        };
    }, [authModule]);

    const handleSignIn = useCallback(async (data: SignInData) => {
        if (!authModule) {
            return { success: false, error: "Auth not initialized" };
        }
        const result = await authModule.signIn(data);
        if (result.success && result.user) {
            setUser(result.user);
        }
        return { success: result.success, error: result.error };
    }, [authModule]);

    const handleSignUp = useCallback(async (data: SignUpData) => {
        if (!authModule) {
            return { success: false, error: "Auth not initialized" };
        }
        const result = await authModule.signUp(data);
        if (result.success && result.user) {
            setUser(result.user);
        }
        return { success: result.success, error: result.error };
    }, [authModule]);

    const handleSignOut = useCallback(async () => {
        if (!authModule) {
            return { success: false, error: "Auth not initialized" };
        }
        const result = await authModule.signOut();
        if (result.success) {
            setUser(null);
        }
        return result;
    }, [authModule]);

    return (
        <AuthContext.Provider
            value={{
                user,
                loading,
                signIn: handleSignIn,
                signUp: handleSignUp,
                signOut: handleSignOut,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}
