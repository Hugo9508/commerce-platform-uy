"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, ArrowLeft, Phone, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { getOrderByNumber, getOrderWithItems } from "@/lib/orders";

export default function CheckoutSuccessPage() {
    const searchParams = useSearchParams();
    const orderId = searchParams.get("orderId");
    const [loading, setLoading] = useState(true);
    const [order, setOrder] = useState<any>(null);

    useEffect(() => {
        if (orderId) {
            // Demo mode check
            if (orderId === 'demo-order-uuid') {
                setOrder({
                    order_number: 'DEMO-123',
                    customer_phone: '099123456',
                    merchant_id: '00000000-0000-0000-0000-000000000000'
                });
                setLoading(false);
                return;
            }

            // Real mode fetch
            getOrderWithItems(orderId)
                .then((data) => {
                    setOrder(data);
                })
                .catch((err) => console.error(err))
                .finally(() => setLoading(false));
        } else {
            setLoading(false);
        }
    }, [orderId]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-background">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-sm flex flex-col items-center"
            >
                <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mb-6">
                    <CheckCircle2 className="w-10 h-10 text-white" />
                </div>

                <h1 className="text-2xl font-bold text-center mb-2">¡Pedido Confirmado!</h1>
                <p className="text-muted-foreground text-center mb-6">
                    Tu pedido ha sido procesado exitosamente.
                </p>

                {order && (
                    <div className="bg-muted/50 rounded-xl p-4 mb-6 w-full text-center">
                        <p className="text-sm text-muted-foreground">Número de pedido</p>
                        <p className="text-xl font-mono font-bold">#{order.order_number}</p>
                    </div>
                )}

                <div className="w-full space-y-3">
                    <Link href="/" className="block w-full">
                        <Button variant="outline" className="w-full h-12 gap-2">
                            <ArrowLeft size={18} />
                            Volver al Inicio
                        </Button>
                    </Link>

                    {order && (
                        <a
                            href={`https://wa.me/?text=Hola, acabo de hacer el pedido #${order.order_number}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block w-full"
                        >
                            <Button className="w-full h-12 bg-green-500 hover:bg-green-600 gap-2">
                                <Phone className="w-5 h-5" />
                                Contactar por WhatsApp
                            </Button>
                        </a>
                    )}
                </div>
            </motion.div>
        </div>
    );
}
