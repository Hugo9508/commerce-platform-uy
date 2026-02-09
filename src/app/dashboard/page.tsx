"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import {
    Store,
    Package,
    ShoppingCart,
    BarChart3,
    Settings,
    LogOut,
    Plus,
    Eye,
    TrendingUp,
    Clock,
    DollarSign,
    Users
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function DashboardPage() {
    const { user, loading, signOut } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && !user) {
            router.push("/auth/login");
        }
    }, [user, loading, router]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
            </div>
        );
    }

    if (!user) {
        return null;
    }

    const handleSignOut = async () => {
        await signOut();
        router.push("/");
    };

    // Mock stats - in production, fetch from Supabase
    const stats = [
        { label: "Productos", value: "0", icon: Package, color: "text-blue-500" },
        { label: "Pedidos hoy", value: "0", icon: ShoppingCart, color: "text-green-500" },
        { label: "Ventas del mes", value: "$U 0", icon: DollarSign, color: "text-yellow-500" },
        { label: "Clientes", value: "0", icon: Users, color: "text-purple-500" },
    ];

    return (
        <div className="min-h-screen bg-background">
            {/* Sidebar */}
            <aside className="fixed left-0 top-0 h-full w-64 bg-card border-r border-border p-4 hidden md:block">
                {/* Logo */}
                <div className="flex items-center gap-2 mb-8">
                    <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
                        <Store className="w-5 h-5 text-primary-foreground" />
                    </div>
                    <div>
                        <span className="font-bold">CatálogoUY</span>
                        <p className="text-xs text-muted-foreground">Dashboard</p>
                    </div>
                </div>

                {/* Store Name */}
                <div className="bg-muted/50 rounded-xl p-3 mb-6">
                    <p className="text-xs text-muted-foreground">Mi tienda</p>
                    <p className="font-semibold truncate">{user.merchant?.name || "Sin nombre"}</p>
                    <Link
                        href={`/${user.merchant?.slug || ""}`}
                        target="_blank"
                        className="text-xs text-primary hover:underline flex items-center gap-1 mt-1"
                    >
                        <Eye size={12} />
                        Ver catálogo
                    </Link>
                </div>

                {/* Navigation */}
                <nav className="space-y-1">
                    <Link
                        href="/dashboard"
                        className="flex items-center gap-3 px-3 py-2 rounded-lg bg-primary/10 text-primary font-medium"
                    >
                        <BarChart3 size={18} />
                        Dashboard
                    </Link>
                    <Link
                        href="/dashboard/products"
                        className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                    >
                        <Package size={18} />
                        Productos
                    </Link>
                    <Link
                        href="/dashboard/orders"
                        className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                    >
                        <ShoppingCart size={18} />
                        Pedidos
                    </Link>
                    <Link
                        href="/dashboard/settings"
                        className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                    >
                        <Settings size={18} />
                        Configuración
                    </Link>
                </nav>

                {/* Sign Out */}
                <button
                    onClick={handleSignOut}
                    className="absolute bottom-4 left-4 right-4 flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                >
                    <LogOut size={18} />
                    Cerrar sesión
                </button>
            </aside>

            {/* Main Content */}
            <main className="md:ml-64 p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-2xl font-bold">¡Hola, {user.merchant?.name || "Comerciante"}! 👋</h1>
                        <p className="text-muted-foreground">Aquí está el resumen de tu tienda</p>
                    </div>
                    <Button className="gap-2">
                        <Plus size={16} />
                        Agregar producto
                    </Button>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    {stats.map((stat, index) => (
                        <motion.div
                            key={stat.label}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                        >
                            <Card>
                                <CardContent className="p-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-muted-foreground">{stat.label}</p>
                                            <p className="text-2xl font-bold">{stat.value}</p>
                                        </div>
                                        <div className={`p-3 rounded-full bg-muted ${stat.color}`}>
                                            <stat.icon size={20} />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Recent Orders */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <Clock size={18} />
                                Pedidos recientes
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-center py-8 text-muted-foreground">
                                <ShoppingCart className="w-12 h-12 mx-auto mb-2 opacity-50" />
                                <p>No hay pedidos aún</p>
                                <p className="text-sm">Los pedidos aparecerán aquí</p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Quick Tips */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <TrendingUp size={18} />
                                Próximos pasos
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                                <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">
                                    1
                                </div>
                                <div>
                                    <p className="font-medium">Agregá tus productos</p>
                                    <p className="text-sm text-muted-foreground">
                                        Cargá fotos, precios y descripciones
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                                <div className="w-6 h-6 bg-muted text-muted-foreground rounded-full flex items-center justify-center text-sm font-bold">
                                    2
                                </div>
                                <div>
                                    <p className="font-medium">Configurá los envíos</p>
                                    <p className="text-sm text-muted-foreground">
                                        Definí costos por barrio
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                                <div className="w-6 h-6 bg-muted text-muted-foreground rounded-full flex items-center justify-center text-sm font-bold">
                                    3
                                </div>
                                <div>
                                    <p className="font-medium">Compartí tu catálogo</p>
                                    <p className="text-sm text-muted-foreground">
                                        En WhatsApp, Instagram y más
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </main>
        </div>
    );
}
