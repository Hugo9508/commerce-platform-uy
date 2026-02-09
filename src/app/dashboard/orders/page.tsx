"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { createClient } from "@/lib/supabase";
import { formatCurrency } from "@/lib/utils";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import { Eye, Loader2, Package } from "lucide-react";
import Link from "next/link";
import { Order } from "@/lib/orders";

export default function OrdersPage() {
    const { user } = useAuth();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchOrders() {
            if (!user) return;

            const supabase = createClient();

            // Get merchant ID first
            const { data: merchant } = await supabase
                .from('merchants')
                .select('id')
                .eq('user_id', user.id)
                .single();

            if (merchant) {
                const { data, error } = await supabase
                    .from('orders')
                    .select('*')
                    .eq('merchant_id', merchant.id)
                    .order('created_at', { ascending: false });

                if (!error && data) {
                    setOrders(data as Order[]);
                }
            }
            setLoading(false);
        }

        fetchOrders();
    }, [user]);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Pedidos</h1>
                    <p className="text-muted-foreground">
                        Gestioná tus ventas y envíos
                    </p>
                </div>
            </div>

            {orders.length === 0 ? (
                <div className="flex flex-col items-center justify-center border rounded-lg p-12 bg-card text-center">
                    <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                        <Package className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">No hay pedidos aún</h3>
                    <p className="text-muted-foreground max-w-sm mb-6">
                        Cuando recibas tu primer pedido, aparecerá aquí.
                        ¡Compartí tu tienda para empezar a vender!
                    </p>
                </div>
            ) : (
                <div className="border rounded-lg bg-card">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Pedido</TableHead>
                                <TableHead>Cliente</TableHead>
                                <TableHead>Fecha</TableHead>
                                <TableHead>Estado</TableHead>
                                <TableHead>Pago</TableHead>
                                <TableHead className="text-right">Total</TableHead>
                                <TableHead className="text-right">Acciones</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {orders.map((order) => (
                                <TableRow key={order.id}>
                                    <TableCell className="font-medium">
                                        #{order.order_number}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span className="font-medium">{order.customer_name}</span>
                                            <span className="text-xs text-muted-foreground">{order.customer_phone}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        {format(new Date(order.created_at), "d MMM, yyyy HH:mm", { locale: es })}
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={
                                            order.status === 'delivered' ? 'default' :
                                                order.status === 'cancelled' ? 'destructive' :
                                                    'outline'
                                        }>
                                            {order.status === 'pending' && 'Pendiente'}
                                            {order.status === 'confirmed' && 'Confirmado'}
                                            {order.status === 'preparing' && 'Preparando'}
                                            {order.status === 'ready' && 'Listo'}
                                            {order.status === 'delivering' && 'En camino'}
                                            {order.status === 'delivered' && 'Entregado'}
                                            {order.status === 'cancelled' && 'Cancelado'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={
                                            order.payment_status === 'paid' ? 'secondary' :
                                                order.payment_status === 'failed' ? 'destructive' :
                                                    'outline'
                                        }>
                                            {order.payment_status === 'pending' && 'Pendiente'}
                                            {order.payment_status === 'paid' && 'Pagado'}
                                            {order.payment_status === 'failed' && 'Fallido'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right font-medium">
                                        {formatCurrency(order.total_uyu)}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Link href={`/dashboard/orders/${order.id}`}>
                                            <Button variant="ghost" size="icon">
                                                <Eye className="w-4 h-4" />
                                            </Button>
                                        </Link>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            )}
        </div>
    );
}
