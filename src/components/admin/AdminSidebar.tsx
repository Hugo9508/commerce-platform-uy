"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Store, Users, CreditCard, Settings, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase";

const menuItems = [
    { name: "Resumen", href: "/admin", icon: LayoutDashboard },
    { name: "Comercios", href: "/admin/merchants", icon: Store },
    { name: "Usuarios", href: "/admin/users", icon: Users },
    { name: "Planes", href: "/admin/plans", icon: CreditCard },
    { name: "Configuración", href: "/admin/settings", icon: Settings },
];

export default function AdminSidebar({ user }: { user: any }) {
    const pathname = usePathname();
    const supabase = createClient();

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        window.location.href = "/";
    };

    return (
        <aside className="w-64 bg-white border-r border-gray-200 flex flex-col h-full">
            <div className="p-6 border-b border-gray-100">
                <h2 className="text-xl font-bold text-primary">Super Admin</h2>
                <p className="text-xs text-muted-foreground mt-1 truncate" title={user.email}>
                    {user.email}
                </p>
            </div>

            <nav className="flex-1 p-4 space-y-1">
                {menuItems.map((item) => {
                    const isActive = pathname === item.href;
                    const Icon = item.icon;
                    return (
                        <Link key={item.href} href={item.href}>
                            <Button
                                variant={isActive ? "secondary" : "ghost"}
                                className={`w-full justify-start gap-3 mb-1 ${isActive ? "bg-primary/10 text-primary hover:bg-primary/20" : ""
                                    }`}
                            >
                                <Icon size={20} />
                                {item.name}
                            </Button>
                        </Link>
                    );
                })}
            </nav>

            <div className="p-4 border-t border-gray-100">
                <Button variant="ghost" className="w-full justify-start gap-3 text-red-500 hover:text-red-700 hover:bg-red-50" onClick={handleSignOut}>
                    <LogOut size={20} />
                    Cerrar Sesión
                </Button>
            </div>
        </aside>
    );
}
