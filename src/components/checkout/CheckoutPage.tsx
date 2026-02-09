"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, CreditCard, Banknote, MapPin, User, Phone, Mail, CheckCircle2, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCart } from "@/context/CartContext";
import { createOrder } from "@/lib/orders";

const BARRIOS_MONTEVIDEO = [
    { name: "Centro", delivery: 80 },
    { name: "Ciudad Vieja", delivery: 100 },
    { name: "Pocitos", delivery: 60 },
    { name: "Carrasco", delivery: 120 },
    { name: "Buceo", delivery: 70 },
    { name: "Malvín", delivery: 90 },
    { name: "Punta Carretas", delivery: 80 },
    { name: "Cordón", delivery: 70 },
    { name: "Parque Rodó", delivery: 75 },
    { name: "Tres Cruces", delivery: 85 },
];

interface CheckoutPageProps {
    onBack: () => void;
    merchant: any;
}

export function CheckoutPage({ onBack, merchant }: CheckoutPageProps) {
    const { items, total, clearCart } = useCart();
    const [step, setStep] = useState<"form" | "processing" | "success" | "error">("form");
    const [selectedBarrio, setSelectedBarrio] = useState("");
    const [paymentMethod, setPaymentMethod] = useState("mercadopago");
    const [errorMessage, setErrorMessage] = useState("");
    const [orderNumber, setOrderNumber] = useState("");

    // Form Data
    const [formData, setFormData] = useState({
        name: "",
        phone: "",
        email: "",
        address: "",
        notes: "",
    });

    const deliveryCost = BARRIOS_MONTEVIDEO.find(b => b.name === selectedBarrio)?.delivery || 0;
    const finalTotal = total + deliveryCost;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStep("processing");
        setErrorMessage("");

        try {
            // 1. Create Order in Supabase
            const orderInput = {
                merchantId: merchant.id,
                items: items.map(item => ({
                    productId: item.id,
                    productName: item.name,
                    productImageUrl: item.image,
                    unitPrice: item.price,
                    quantity: item.quantity,
                    notes: "" // Add notes per item if needed in UI
                })),
                customer: {
                    name: formData.name,
                    phone: formData.phone,
                    email: formData.email,
                    address: formData.address,
                    barrio: selectedBarrio,
                    notes: formData.notes
                },
                deliveryCost: deliveryCost,
                paymentMethod: paymentMethod as any
            };

            const result = await createOrder(orderInput);

            if (!result.success || !result.order) {
                throw new Error(result.error || "Error al crear el pedido");
            }

            setOrderNumber(result.orderNumber || "PENDIENT");

            // 2. Handle Payment
            if (paymentMethod === "mercadopago") {
                // Call Checkout API
                const response = await fetch('/api/checkout', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        orderId: result.order.id,
                        merchantId: merchant.id
                    })
                });

                const paymentData = await response.json();

                if (!response.ok) {
                    throw new Error(paymentData.error || "Error al iniciar pago");
                }

                // Redirect to Mercado Pago
                if (paymentData.init_point) {
                    // Clear cart before redirecting? Or keep it in case they come back?
                    // Better clear it if keeping it creates logic issues, but ideally keep valid until success.
                    // For now, let's Redirect.
                    window.location.href = paymentData.init_point;
                    return;
                }
            } else {
                // Cash / Transfer / Abitab
                setStep("success");
                clearCart();
            }

        } catch (error: any) {
            console.error(error);
            setErrorMessage(error.message || "Ocurrió un error inesperado.");
            setStep("error");
        }
    };

    if (step === "processing") {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-background p-6">
                <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
                <h2 className="text-xl font-semibold">Procesando tu pedido...</h2>
                <p className="text-muted-foreground">Por favor esperá un momento.</p>
            </div>
        );
    }

    if (step === "error") {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-background p-6">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-6">
                    <AlertCircle className="w-8 h-8 text-red-600" />
                </div>
                <h2 className="text-xl font-bold mb-2">Hubo un problema</h2>
                <p className="text-muted-foreground text-center max-w-sm mb-6">
                    {errorMessage}
                </p>
                <Button onClick={() => setStep("form")}>
                    Intentar de nuevo
                </Button>
            </div>
        );
    }

    if (step === "success") {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="min-h-screen flex flex-col items-center justify-center p-6 bg-background"
            >
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: "spring" }}
                    className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mb-6"
                >
                    <CheckCircle2 className="w-10 h-10 text-white" />
                </motion.div>
                <h1 className="text-2xl font-bold text-center mb-2">¡Pedido Confirmado!</h1>
                <p className="text-muted-foreground text-center mb-6">
                    Te enviaremos los detalles pordetails por WhatsApp
                </p>
                <div className="bg-muted/50 rounded-xl p-4 mb-6 w-full max-w-sm">
                    <p className="text-sm text-muted-foreground">Número de pedido</p>
                    <p className="text-xl font-mono font-bold text-center">#{orderNumber}</p>
                </div>

                <div className="w-full max-w-sm space-y-3">
                    <Button
                        onClick={onBack}
                        className="w-full h-12 gap-2"
                        variant="outline"
                    >
                        <ArrowLeft size={18} />
                        Volver al Catálogo
                    </Button>

                    <a
                        href={`https://wa.me/${merchant.whatsapp?.replace(/\D/g, '')}?text=Hola, acabo de hacer el pedido #${orderNumber}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block w-full"
                    >
                        <Button className="w-full h-12 bg-green-500 hover:bg-green-600 gap-2">
                            <Phone className="w-5 h-5" />
                            Contactar por WhatsApp
                        </Button>
                    </a>
                </div>
            </motion.div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <header className="sticky top-0 z-50 backdrop-blur-xl bg-background/80 border-b border-border/50">
                <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
                    <button
                        onClick={onBack}
                        className="w-10 h-10 rounded-full bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h1 className="font-bold text-lg">Checkout</h1>
                        <p className="text-xs text-muted-foreground">{merchant.name}</p>
                    </div>
                </div>
            </header>

            <main className="max-w-2xl mx-auto px-4 py-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Order Summary */}
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base">Resumen del Pedido</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {items.map((item) => (
                                <div key={item.id} className="flex justify-between items-center">
                                    <div className="flex items-center gap-3">
                                        {item.image && (
                                            <img
                                                src={item.image}
                                                alt={item.name}
                                                className="w-12 h-12 rounded-lg object-cover"
                                            />
                                        )}
                                        <div>
                                            <p className="text-sm font-medium">{item.name}</p>
                                            <p className="text-xs text-muted-foreground">x{item.quantity}</p>
                                        </div>
                                    </div>
                                    <p className="font-medium">
                                        $U {(item.price * item.quantity).toLocaleString("es-UY")}
                                    </p>
                                </div>
                            ))}
                            <Separator />
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Subtotal</span>
                                <span>$U {total.toLocaleString("es-UY")}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Envío ({selectedBarrio || "seleccionar"})</span>
                                <span>{deliveryCost > 0 ? `$U ${deliveryCost}` : "—"}</span>
                            </div>
                            <Separator />
                            <div className="flex justify-between font-bold text-lg">
                                <span>Total</span>
                                <span className="text-primary">$U {finalTotal.toLocaleString("es-UY")}</span>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Customer Info */}
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base flex items-center gap-2">
                                <User size={18} />
                                Datos de Contacto
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Nombre completo</Label>
                                <Input
                                    id="name"
                                    placeholder="Ej: Juan Pérez"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="phone">WhatsApp</Label>
                                    <div className="relative">
                                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                        <Input
                                            id="phone"
                                            placeholder="099 123 456"
                                            className="pl-10"
                                            value={formData.phone}
                                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email (opcional)</Label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                        <Input
                                            id="email"
                                            type="email"
                                            placeholder="tu@email.com"
                                            className="pl-10"
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Delivery */}
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base flex items-center gap-2">
                                <MapPin size={18} />
                                Dirección de Entrega
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label>Barrio</Label>
                                <Select value={selectedBarrio} onValueChange={setSelectedBarrio} required>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Seleccionar barrio..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {BARRIOS_MONTEVIDEO.map((barrio) => (
                                            <SelectItem key={barrio.name} value={barrio.name}>
                                                <div className="flex justify-between items-center w-full">
                                                    <span>{barrio.name}</span>
                                                    <span className="text-muted-foreground ml-4">+$U {barrio.delivery}</span>
                                                </div>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="address">Dirección completa</Label>
                                <Input
                                    id="address"
                                    placeholder="Calle, número, apto..."
                                    value={formData.address}
                                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="notes">Notas para el delivery (opcional)</Label>
                                <Input
                                    id="notes"
                                    placeholder="Ej: Tocar timbre 2B"
                                    value={formData.notes}
                                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Payment Method */}
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base flex items-center gap-2">
                                <CreditCard size={18} />
                                Método de Pago
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="space-y-3">
                                {merchant.mercadopago_access_token && (
                                    <div className={`flex items-center space-x-3 p-3 rounded-lg border transition-colors cursor-pointer ${paymentMethod === 'mercadopago' ? 'border-primary bg-primary/5' : 'border-border hover:bg-muted/50'}`}>
                                        <RadioGroupItem value="mercadopago" id="mercadopago" />
                                        <Label htmlFor="mercadopago" className="flex-1 cursor-pointer">
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                                                    <CreditCard className="w-4 h-4 text-white" />
                                                </div>
                                                <div>
                                                    <p className="font-medium">Mercado Pago</p>
                                                    <p className="text-xs text-muted-foreground">Tarjeta, débito o saldo</p>
                                                </div>
                                            </div>
                                        </Label>
                                    </div>
                                )}

                                {merchant.accepts_abitab && (
                                    <div className={`flex items-center space-x-3 p-3 rounded-lg border transition-colors cursor-pointer ${paymentMethod === 'abitab' ? 'border-primary bg-primary/5' : 'border-border hover:bg-muted/50'}`}>
                                        <RadioGroupItem value="abitab" id="abitab" />
                                        <Label htmlFor="abitab" className="flex-1 cursor-pointer">
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 bg-yellow-500 rounded-lg flex items-center justify-center">
                                                    <Banknote className="w-4 h-4 text-white" />
                                                </div>
                                                <div>
                                                    <p className="font-medium">Abitab / Redpagos</p>
                                                    <p className="text-xs text-muted-foreground">Pago en local</p>
                                                </div>
                                            </div>
                                        </Label>
                                    </div>
                                )}

                                {merchant.accepts_transfer && (
                                    <div className={`flex items-center space-x-3 p-3 rounded-lg border transition-colors cursor-pointer ${paymentMethod === 'transfer' ? 'border-primary bg-primary/5' : 'border-border hover:bg-muted/50'}`}>
                                        <RadioGroupItem value="transfer" id="transfer" />
                                        <Label htmlFor="transfer" className="flex-1 cursor-pointer">
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                                                    <Banknote className="w-4 h-4 text-white" />
                                                </div>
                                                <div>
                                                    <p className="font-medium">Transferencia Bancaria</p>
                                                    <p className="text-xs text-muted-foreground">BROU, Santander, Itaú</p>
                                                </div>
                                            </div>
                                        </Label>
                                    </div>
                                )}

                                {merchant.accepts_cash && (
                                    <div className={`flex items-center space-x-3 p-3 rounded-lg border transition-colors cursor-pointer ${paymentMethod === 'cash' ? 'border-primary bg-primary/5' : 'border-border hover:bg-muted/50'}`}>
                                        <RadioGroupItem value="cash" id="cash" />
                                        <Label htmlFor="cash" className="flex-1 cursor-pointer">
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 bg-gray-600 rounded-lg flex items-center justify-center">
                                                    <Banknote className="w-4 h-4 text-white" />
                                                </div>
                                                <div>
                                                    <p className="font-medium">Efectivo</p>
                                                    <p className="text-xs text-muted-foreground">Pago contra entrega</p>
                                                </div>
                                            </div>
                                        </Label>
                                    </div>
                                )}
                            </RadioGroup>
                        </CardContent>
                    </Card>

                    {/* Submit Button */}
                    <Button
                        type="submit"
                        className="w-full h-14 text-lg font-semibold"
                        size="lg"
                        disabled={!selectedBarrio || items.length === 0}
                    >
                        {`Confirmar Pedido — $U ${finalTotal.toLocaleString("es-UY")}`}
                    </Button>
                </form>
            </main>
        </div>
    );
}
