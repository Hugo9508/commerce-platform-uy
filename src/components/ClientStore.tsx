"use client";

import { useState } from "react";
import { CatalogPage } from "@/components/CatalogPage";
import { CheckoutPage } from "@/components/checkout/CheckoutPage";

interface ClientStoreProps {
    merchant: any;
    initialProducts: any[];
    categories: any[];
}

export function ClientStore({ merchant, initialProducts, categories }: ClientStoreProps) {
    const [view, setView] = useState<"catalog" | "checkout">("catalog");

    if (view === "checkout") {
        return (
            <CheckoutPage
                onBack={() => setView("catalog")}
                merchant={merchant}
            />
        );
    }

    return (
        <CatalogPage
            merchant={merchant}
            products={initialProducts}
            categories={categories}
            onCheckout={() => setView("checkout")}
        />
    );
}
