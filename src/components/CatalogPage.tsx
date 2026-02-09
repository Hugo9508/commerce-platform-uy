"use client";

import { useState, useMemo } from "react";
import { CatalogHeader } from "@/components/layout/CatalogHeader";
import { CategoryChips } from "@/components/catalog/CategoryChips";
import { ProductGrid } from "@/components/catalog/ProductGrid";
// import { mockProducts, categories } from "@/data/mockProducts"; // Remove mock import

interface CatalogPageProps {
    merchant: any;
    products: any[];
    categories: any[];
    onCheckout?: () => void;
}

export function CatalogPage({ merchant, products, categories, onCheckout }: CatalogPageProps) {
    const [selectedCategory, setSelectedCategory] = useState("all");
    const [searchQuery, setSearchQuery] = useState("");

    const filteredProducts = useMemo(() => {
        return products.filter((product) => {
            // Filter by category (using ID or name?) 
            // The DB products have category_id. The selector normally uses ID or Slug.
            // Let's assume categories have 'id' and 'name'.
            // If selectedCategory is 'all', show all.
            // If selectedCategory is NOT 'all', check if product.category_id matches (or joined category name).

            // In getMerchantProducts we join categories(name).
            // Let's assume selectedCategory holds the ID for now, or we need to align with CategoryChips.

            // For simplicity, let's assume selectedCategory is the ID.
            const matchesCategory =
                selectedCategory === "all" || product.category_id === selectedCategory;

            const matchesSearch =
                searchQuery === "" ||
                product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (product.description && product.description.toLowerCase().includes(searchQuery.toLowerCase()));

            return matchesCategory && matchesSearch;
        });
    }, [products, selectedCategory, searchQuery]);

    return (
        <div className="min-h-screen bg-background">
            <CatalogHeader
                merchantName={merchant?.name || "Tienda"}
                merchantLogo={merchant?.logo_url}
                onSearch={setSearchQuery}
                onCheckout={onCheckout}
            />

            <main className="max-w-7xl mx-auto px-4 py-6">
                {/* Categories */}
                <div className="sticky top-[120px] z-40 bg-background/95 backdrop-blur-sm py-3 -mx-4 px-4 mb-4">
                    <CategoryChips
                        categories={categories}
                        selected={selectedCategory}
                        onSelect={setSelectedCategory}
                    />
                </div>

                {/* Products */}
                <ProductGrid products={filteredProducts} />
            </main>

            {/* WhatsApp Floating Button */}
            <a
                href="https://wa.me/59899000000"
                target="_blank"
                rel="noopener noreferrer"
                className="fixed bottom-6 left-6 w-14 h-14 bg-green-500 hover:bg-green-600 text-white rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all z-50"
            >
                <svg
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="w-7 h-7"
                >
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                </svg>
            </a>
        </div>
    );
}

