"use client";

import { useState } from "react";
import { CatalogPage } from "@/components/CatalogPage";
import { CheckoutPage } from "@/components/checkout/CheckoutPage";

export default function Home() {
  const [view, setView] = useState<"catalog" | "checkout">("catalog");

  const mockMerchant = {
    id: "demo",
    name: "Demo Tienda",
    logo_url: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=100&h=100&fit=crop",
    slug: "demo",
    whatsapp: "099123456",
    accepts_cash: true,
    accepts_mercadopago: true
  };

  const mockProducts = [
    { id: "1", name: "Producto Demo", price: 100, image_url: "https://via.placeholder.com/150", merchant_id: "demo", category_id: "1", stock: 10, is_active: true, description: "Demo" }
  ];
  const mockCategories = [
    { id: "1", name: "General", merchant_id: "demo" }
  ];

  if (view === "checkout") {
    return (
      <CheckoutPage
        onBack={() => setView("catalog")}
        merchant={mockMerchant}
      />
    );
  }

  return (
    <CatalogPage
      merchant={mockMerchant}
      products={mockProducts}
      categories={mockCategories}
      onCheckout={() => setView("checkout")}
    />
  );
}
