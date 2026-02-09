"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { createClient } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Save, Store, CreditCard } from "lucide-react";
import { Switch } from "@/components/ui/switch";

export default function SettingsPage() {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        slug: "",
        whatsapp: "",
        description: "",
        mercadopago_access_token: "",
        accepts_cash: true,
        accepts_transfer: true,
        accepts_abitab: true,
    });

    useEffect(() => {
        if (user?.merchant) {
            setFormData({
                name: user.merchant.name || "",
                slug: user.merchant.slug || "",
                whatsapp: user.merchant.whatsapp || "",
                description: user.merchant.description || "",
                mercadopago_access_token: user.merchant.mercadopago_access_token || "",
                accepts_cash: user.merchant.accepts_cash ?? true,
                accepts_transfer: user.merchant.accepts_transfer ?? true,
                accepts_abitab: user.merchant.accepts_abitab ?? true,
            });
        }
    }, [user]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSwitchChange = (name: string, checked: boolean) => {
        setFormData(prev => ({ ...prev, [name]: checked }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        const supabase = createClient();

        try {
            const { error } = await supabase
                .from('merchants')
                .update({
                    name: formData.name,
                    whatsapp: formData.whatsapp,
                    description: formData.description,
                    mercadopago_access_token: formData.mercadopago_access_token || null,
                    accepts_cash: formData.accepts_cash,
                    accepts_transfer: formData.accepts_transfer,
                    accepts_abitab: formData.accepts_abitab,
                })
                .eq('id', user?.merchant?.id);

            if (error) throw error;
            alert("Configuración guardada correctamente");
        } catch (error) {
            console.error(error);
            alert("Error al guardar la configuración");
        } finally {
            setSaving(false);
        }
    };

    if (!user) return null;

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Configuración</h1>
                <p className="text-muted-foreground">
                    Administrá los datos de tu tienda y métodos de pago
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* General Info */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Store className="w-5 h-5" />
                            Información General
                        </CardTitle>
                        <CardDescription>
                            Datos visibles para tus clientes
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid gap-2">
                            <Label htmlFor="name">Nombre de la tienda</Label>
                            <Input
                                id="name"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="whatsapp">WhatsApp (para pedidos)</Label>
                            <Input
                                id="whatsapp"
                                name="whatsapp"
                                value={formData.whatsapp}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="description">Descripción (opcional)</Label>
                            <Input
                                id="description"
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Payments */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <CreditCard className="w-5 h-5" />
                            Pagos y Cobros
                        </CardTitle>
                        <CardDescription>
                            Configurá cómo recibís el dinero
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">

                        <div className="p-4 border rounded-lg bg-muted/20 space-y-4">
                            <h3 className="font-semibold flex items-center gap-2">
                                <span className="text-blue-500">Mercado Pago</span>
                            </h3>
                            <div className="grid gap-2">
                                <Label htmlFor="mercadopago_access_token">Access Token (Producción)</Label>
                                <Input
                                    id="mercadopago_access_token"
                                    name="mercadopago_access_token"
                                    value={formData.mercadopago_access_token}
                                    onChange={handleChange}
                                    placeholder="APP_USR-..."
                                    type="password"
                                />
                                <p className="text-xs text-muted-foreground">
                                    Obtené tu token en el portal de desarrolladores de Mercado Pago.
                                </p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h3 className="font-semibold">Otros métodos</h3>
                            <div className="flex items-center justify-between">
                                <Label htmlFor="accepts_cash">Efectivo al recibir</Label>
                                <Switch
                                    id="accepts_cash"
                                    checked={formData.accepts_cash}
                                    onCheckedChange={(c) => handleSwitchChange('accepts_cash', c)}
                                />
                            </div>
                            <div className="flex items-center justify-between">
                                <Label htmlFor="accepts_transfer">Transferencia Bancaria</Label>
                                <Switch
                                    id="accepts_transfer"
                                    checked={formData.accepts_transfer}
                                    onCheckedChange={(c) => handleSwitchChange('accepts_transfer', c)}
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <div className="flex justify-end">
                    <Button type="submit" disabled={saving} size="lg">
                        {saving ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Guardando...
                            </>
                        ) : (
                            <>
                                <Save className="mr-2 h-4 w-4" />
                                Guardar cambios
                            </>
                        )}
                    </Button>
                </div>
            </form>
        </div>
    );
}
