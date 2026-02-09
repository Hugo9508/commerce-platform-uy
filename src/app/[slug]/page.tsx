import { notFound } from "next/navigation";
import { getMerchantBySlug, getMerchantProducts, getMerchantCategories } from "@/lib/merchant-api";
import { ClientStore } from "@/components/ClientStore";

// Server Component
export default async function StorePage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const merchant = await getMerchantBySlug(slug);

    if (!merchant) {
        notFound();
    }

    const products = await getMerchantProducts(merchant.id);
    const categories = await getMerchantCategories(merchant.id);

    return (
        <ClientStore
            merchant={merchant}
            initialProducts={products}
            categories={categories}
        />
    );
}
