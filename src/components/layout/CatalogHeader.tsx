"use client";

import { Search, MapPin } from "lucide-react";
import { Input } from "@/components/ui/input";
import { CartDrawer } from "@/components/cart/CartDrawer";

interface CatalogHeaderProps {
    merchantName: string;
    merchantLogo?: string;
    onSearch?: (query: string) => void;
    onCheckout?: () => void;
}

export function CatalogHeader({ merchantName, merchantLogo, onSearch, onCheckout }: CatalogHeaderProps) {
    return (
        <header className="sticky top-0 z-50 backdrop-blur-xl bg-background/80 border-b border-border/50">
            <div className="max-w-7xl mx-auto px-4 py-3">
                {/* Top Row: Logo + Location + Cart */}
                <div className="flex items-center justify-between gap-4 mb-3">
                    <div className="flex items-center gap-3">
                        {merchantLogo ? (
                            <img
                                src={merchantLogo}
                                alt={merchantName}
                                className="w-10 h-10 rounded-full object-cover border-2 border-border"
                            />
                        ) : (
                            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold">
                                {merchantName.charAt(0)}
                            </div>
                        )}
                        <div>
                            <h1 className="font-bold text-lg leading-tight">{merchantName}</h1>
                            <button className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
                                <MapPin size={12} />
                                <span>Montevideo</span>
                            </button>
                        </div>
                    </div>

                    <CartDrawer onCheckout={onCheckout} />
                </div>

                {/* Search Bar */}
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="Buscar productos..."
                        onChange={(e) => onSearch?.(e.target.value)}
                        className="w-full pl-10 h-11 bg-muted/50 border-0 rounded-xl focus-visible:ring-1"
                    />
                </div>
            </div>
        </header>
    );
}

