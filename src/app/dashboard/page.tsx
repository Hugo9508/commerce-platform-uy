"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
    Package,
    ShoppingCart,
    DollarSign,
    Users,
    Clock,
    TrendingUp,
    Plus
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import { createClient } from "@/lib/supabase";

export default function DashboardPage() {
    const { user } = useAuth();
    const [stats, setStats] = useState({
        products: 0,
        orders: 0,
        revenue: 0,
        customers: 0
    });
    const [loadingStats, setLoadingStats] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            if (!user?.merchant?.id) return;

            try {
                const supabase = createClient();
                const merchantId = user.merchant.id;

                // Products count
                const { count: productsCount } = await supabase
                    .from('products')
                    .select('*', { count: 'exact', head: true })
                    .eq('merchant_id', merchantId)
                    .eq('is_active', true);

                // Orders count
                const { count: ordersCount } = await supabase
                    .from('orders')
                    .select('*', { count: 'exact', head: true })
                    .eq('merchant_id', merchantId);

                // Customers count
                const { count: customersCount } = await supabase
                    .from('customers')
                    .select('*', { count: 'exact', head: true })
                    .eq('merchant_id', merchantId);

                // Revenue (Simple sum for MVP)
                const { data: orders } = await supabase
                    .from('orders')
                    .select('total_uyu')
                    .eq('merchant_id', merchantId)
                    .neq('status', 'cancelled'); // Exclude cancelled

                const revenue = orders?.reduce((acc, curr) => acc + (curr.total_uyu || 0), 0) || 0;

                setStats({
                    products: productsCount || 0,
                    orders: ordersCount || 0,
                    revenue: revenue,
                    customers: customersCount || 0
                });

            } catch (error) {
                console.error('Error fetching stats:', error);
            } finally {
                setLoadingStats(false);
            }
        };

        fetchStats();
    }, [user]);

    const statCards = [
        { label: "Productos Activos", value: stats.products.toString(), icon: Package, color: "text-blue-500", bg: "bg-blue-50" },
        { label: "Pedidos Totales", value: stats.orders.toString(), icon: ShoppingCart, color: "text-green-500", bg: "bg-green-50" },
        { label: "Ingresos", value: `$U ${stats.revenue.toLocaleString()}`, icon: DollarSign, color: "text-yellow-500", bg: "bg-yellow-50" },
        { label: "Clientes", value: stats.customers.toString(), icon: Users, color: "text-purple-500", bg: "bg-purple-50" },
    ];

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">¡Hola, {user?.merchant?.name}! 👋</h1>
                    <p className="text-muted-foreground">Aquí está el resumen de tu negocio hoy.</p>
                </div>
                <Link href="/dashboard/products/new">
                    <Button className="gap-2 shadow-lg hover:shadow-xl transition-all">
                        <Plus size={18} />
                        Nuevo Producto
                    </Button>
                </Link>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {statCards.map((stat, index) => (
                    <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                    >
                        <Card className="border-none shadow-sm hover:shadow-md transition-shadow">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground mb-1">{stat.label}</p>
                                        <h3 className="text-2xl font-bold tracking-tight">
                                            {loadingStats ? "..." : stat.value}
                                        </h3>
                                    </div>
                                    <div className={`p-3 rounded-xl ${stat.bg} ${stat.color}`}>
                                        <stat.icon size={22} />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>

            {/* Quick Actions & Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Recent Orders Placeholder */}
                <Card className="col-span-1 lg:col-span-2 shadow-sm">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <Clock size={20} className="text-primary" />
                            Actividad Reciente
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col items-center justify-center py-12 text-muted-foreground bg-muted/20 rounded-xl border border-dashed">
                            <ShoppingCart className="w-12 h-12 mb-3 opacity-20" />
                            <p className="font-medium">No hay pedidos recientes</p>
                            <p className="text-sm opacity-70">Los nuevos pedidos aparecerán aquí</p>
                        </div>
                    </CardContent>
                </Card>

                {/* Quick Tips */}
                <Card className="shadow-sm">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <TrendingUp size={20} className="text-green-600" />
                            Tips para vender más
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex gap-4 p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
                            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm shrink-0">
                                1
                            </div>
                            <div>
                                <p className="font-medium text-sm">Mejora tus fotos</p>
                                <p className="text-xs text-muted-foreground mt-1">
                                    Productos con buenas fotos venden un 40% más.
                                </p>
                            </div>
                        </div>
                        <div className="flex gap-4 p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
                            <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center font-bold text-sm shrink-0">
                                2
                            </div>
                            <div>
                                <p className="font-medium text-sm">Comparte en redes</p>
                                <p className="text-xs text-muted-foreground mt-1">
                                    Promociona tu link en Instagram Stories.
                                </p>
                            </div>
                        </div>
                        <div className="flex gap-4 p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
                            <div className="w-8 h-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center font-bold text-sm shrink-0">
                                3
                            </div>
                            <div>
                                <p className="font-medium text-sm">Configura WhatsApp</p>
                                <p className="text-xs text-muted-foreground mt-1">
                                    Asegúrate de tener tu número verificado.
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
