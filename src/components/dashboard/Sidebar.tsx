"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    Package,
    ShoppingCart,
    Settings,
    LogOut,
    Store,
    Eye
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

export default function MerchantSidebar() {
    const pathname = usePathname();
    const { user, signOut } = useAuth();
    const router = useRouter();

    const handleSignOut = async () => {
        await signOut();
        router.push("/");
    };

    if (!user) return null;

    const menuItems = [
        { name: "Resumen", href: "/dashboard", icon: LayoutDashboard },
        { name: "Productos", href: "/dashboard/products", icon: Package },
        { name: "Pedidos", href: "/dashboard/orders", icon: ShoppingCart },
        { name: "Configuración", href: "/dashboard/settings", icon: Settings },
    ];

    return (
        <aside className="fixed left-0 top-0 h-full w-64 bg-card border-r border-border p-4 hidden md:flex flex-col z-50">
            {/* Logo */}
            <div className="flex items-center gap-2 mb-8 px-2">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                    <Store className="w-5 h-5 text-primary-foreground" />
                </div>
                <div>
                    <span className="font-bold text-lg">CatálogoUY</span>
                </div>
            </div>

            {/* Store Information */}
            <div className="bg-muted/50 rounded-xl p-3 mb-6">
                <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-1">Mi Tienda</p>
                <p className="font-medium truncate" title={user.merchant?.name}>
                    {user.merchant?.name || "Cargando..."}
                </p>
                {user.merchant?.slug && (
                    <Link
                        href={`/${user.merchant.slug}`}
                        target="_blank"
                        className="text-xs text-primary hover:underline flex items-center gap-1 mt-2"
                    >
                        <Eye size={12} />
                        Ver catálogo público
                    </Link>
                )}
            </div>

            {/* Navigation */}
            <nav className="flex-1 space-y-1">
                {menuItems.map((item) => {
                    const isActive = pathname === item.href;
                    const Icon = item.icon;
                    return (
                        <Link key={item.href} href={item.href}>
                            <Button
                                variant={isActive ? "secondary" : "ghost"}
                                className={`w-full justify-start gap-3 ${isActive ? "bg-primary/10 text-primary hover:bg-primary/20" : "text-muted-foreground"
                                    }`}
                            >
                                <Icon size={20} />
                                {item.name}
                            </Button>
                        </Link>
                    );
                })}
            </nav>

            {/* Sign Out */}
            <div className="pt-4 mt-auto border-t border-border">
                <Button
                    variant="ghost"
                    className="w-full justify-start gap-3 text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={handleSignOut}
                >
                    <LogOut size={20} />
                    Cerrar Sesión
                </Button>
            </div>
        </aside>
    );
}
