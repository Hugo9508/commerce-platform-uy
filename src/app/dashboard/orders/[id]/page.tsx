"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
    getOrderWithItems,
    updateOrderStatus,
    updatePaymentStatus
} from "@/lib/orders";
import type { Order, OrderItem } from "@/lib/orders";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription
} from "@/components/ui/card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
    ArrowLeft,
    Loader2,
    MapPin,
    Phone,
    Mail,
    User,
    Calendar,
    CreditCard,
    Package
} from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { formatCurrency } from "@/lib/utils";
import Image from "next/image";

type OrderDetail = Order & { items: OrderItem[] };

export default function OrderDetailPage() {
    const params = useParams();
    const router = useRouter();
    const { user, loading: authLoading } = useAuth();
    const [order, setOrder] = useState<OrderDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);

    const orderId = params.id as string;

    useEffect(() => {
        if (!authLoading && user) {
            loadOrder();
        }
    }, [orderId, user, authLoading]);

    const loadOrder = async () => {
        setLoading(true);
        const data = await getOrderWithItems(orderId);
        if (data) {
            setOrder(data as OrderDetail);
        } else {
            router.push("/dashboard/orders");
        }
        setLoading(false);
    };

    const handleStatusChange = async (newStatus: Order['status']) => {
        if (!order) return;
        setUpdating(true);
        const success = await updateOrderStatus(order.id, newStatus);
        if (success) {
            setOrder(prev => prev ? { ...prev, status: newStatus } : null);
        }
        setUpdating(false);
    };

    const handlePaymentStatusChange = async (newStatus: Order['payment_status']) => {
        if (!order) return;
        setUpdating(true);
        const success = await updatePaymentStatus(order.id, newStatus);
        if (success) {
            setOrder(prev => prev ? { ...prev, payment_status: newStatus } : null);
        }
        setUpdating(false);
    };

    if (authLoading || loading) {
        return (
            <div className="flex justify-center items-center h-96">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!order) return null;

    return (
        <div className="space-y-6 max-w-5xl mx-auto pb-10">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Link href="/dashboard/orders">
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="w-5 h-5" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold flex items-center gap-2">
                            Pedido #{order.order_number}
                        </h1>
                        <p className="text-muted-foreground text-sm flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            {format(new Date(order.created_at), "PPP p", { locale: es })}
                        </p>
                    </div>
                </div>
                <div className="flex gap-2">
                    {/* Actions like Print Invoice could go here */}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Main Content (Left Column) */}
                <div className="md:col-span-2 space-y-6">
                    {/* Order Items */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Productos</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {order.items.map((item) => (
                                    <div key={item.id} className="flex items-start gap-4 py-4 border-b last:border-0">
                                        <div className="relative w-16 h-16 bg-muted rounded-lg overflow-hidden shrink-0">
                                            {item.product_image_url ? (
                                                <Image
                                                    src={item.product_image_url}
                                                    alt={item.product_name}
                                                    fill
                                                    className="object-cover"
                                                />
                                            ) : (
                                                <Package className="w-8 h-8 text-muted-foreground absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="font-medium">{item.product_name}</h4>
                                            <p className="text-sm text-muted-foreground">
                                                {item.quantity} x {formatCurrency(item.unit_price_uyu)}
                                            </p>
                                            {item.notes && (
                                                <p className="text-xs bg-yellow-50 text-yellow-800 p-1 rounded mt-1 inline-block">
                                                    Nota: {item.notes}
                                                </p>
                                            )}
                                        </div>
                                        <div className="font-semibold">
                                            {formatCurrency(item.total_uyu)}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Totals */}
                            <div className="mt-8 space-y-2 border-t pt-4">
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Subtotal</span>
                                    <span>{formatCurrency(order.subtotal_uyu)}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Envío</span>
                                    <span>{formatCurrency(order.delivery_cost_uyu)}</span>
                                </div>
                                {order.discount_uyu > 0 && (
                                    <div className="flex justify-between text-sm text-green-600">
                                        <span>Descuento</span>
                                        <span>-{formatCurrency(order.discount_uyu)}</span>
                                    </div>
                                )}
                                <div className="flex justify-between text-lg font-bold pt-2 border-t mt-2">
                                    <span>Total</span>
                                    <span>{formatCurrency(order.total_uyu)}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Shipping Info */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <MapPin className="w-5 h-5" />
                                Detalles de Envío
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-1">
                                <span className="text-sm font-medium">Dirección</span>
                                <p className="text-muted-foreground">{order.delivery_address || 'Retiro en local'}</p>
                            </div>
                            <div className="grid gap-1">
                                <span className="text-sm font-medium">Barrio / Zona</span>
                                <p className="text-muted-foreground">{order.delivery_barrio || '-'}</p>
                            </div>
                            {order.delivery_notes && (
                                <div className="grid gap-1">
                                    <span className="text-sm font-medium">Notas de Envío</span>
                                    <p className="text-sm bg-muted p-2 rounded-md">{order.delivery_notes}</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar (Right Column) */}
                <div className="space-y-6">
                    {/* Status Management */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Estado del Pedido</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Estado de Entrega</label>
                                <Select
                                    disabled={updating}
                                    value={order.status}
                                    onValueChange={(v) => handleStatusChange(v as Order['status'])}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="pending">Pendiente</SelectItem>
                                        <SelectItem value="confirmed">Confirmado</SelectItem>
                                        <SelectItem value="preparing">Preparando</SelectItem>
                                        <SelectItem value="ready">Listo para enviar</SelectItem>
                                        <SelectItem value="delivering">En camino</SelectItem>
                                        <SelectItem value="delivered">Entregado</SelectItem>
                                        <SelectItem value="cancelled">Cancelado</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Estado de Pago</label>
                                <Select
                                    disabled={updating}
                                    value={order.payment_status}
                                    onValueChange={(v) => handlePaymentStatusChange(v as Order['payment_status'])}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="pending">Pendiente</SelectItem>
                                        <SelectItem value="paid">Pagado</SelectItem>
                                        <SelectItem value="failed">Fallido</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Customer Info */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <User className="w-5 h-5" />
                                Cliente
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg">
                                    {order.customer_name?.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <p className="font-medium">{order.customer_name}</p>
                                    <p className="text-sm text-muted-foreground">Cliente frecuente</p>
                                </div>
                            </div>
                            <div className="pt-2 space-y-3">
                                <div className="flex items-center gap-2 text-sm">
                                    <Phone className="w-4 h-4 text-muted-foreground" />
                                    <a href={`tel:${order.customer_phone}`} className="hover:underline">
                                        {order.customer_phone}
                                    </a>
                                </div>
                                {order.customer_email && (
                                    <div className="flex items-center gap-2 text-sm">
                                        <Mail className="w-4 h-4 text-muted-foreground" />
                                        <a href={`mailto:${order.customer_email}`} className="hover:underline">
                                            {order.customer_email}
                                        </a>
                                    </div>
                                )}
                            </div>
                            <Button variant="outline" className="w-full gap-2" asChild>
                                <a
                                    href={`https://wa.me/${order.customer_phone?.replace(/\D/g, '')}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    <Phone className="w-4 h-4" />
                                    Contactar por WhatsApp
                                </a>
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Payment Info */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <CreditCard className="w-5 h-5" />
                                Método de Pago
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center justify-between p-3 border rounded-lg bg-muted/20">
                                <span className="font-medium capitalize">
                                    {order.payment_method === 'mercadopago' ? 'Mercado Pago' :
                                        order.payment_method === 'cash' ? 'Efectivo' :
                                            order.payment_method}
                                </span>
                                <Badge variant={order.payment_status === 'paid' ? 'default' : 'outline'}>
                                    {order.payment_status === 'paid' ? 'Pagado' : 'Pendiente'}
                                </Badge>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
