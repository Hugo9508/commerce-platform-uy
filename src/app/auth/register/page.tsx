"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Eye, EyeOff, Mail, Lock, Store, Phone, MapPin, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import { useRouter } from "next/navigation";

const barrios = [
    { value: "pocitos", label: "Pocitos" },
    { value: "centro", label: "Centro" },
    { value: "punta-carretas", label: "Punta Carretas" },
    { value: "carrasco", label: "Carrasco" },
    { value: "ciudad-vieja", label: "Ciudad Vieja" },
    { value: "buceo", label: "Buceo" },
    { value: "cordon", label: "Cordón" },
    { value: "malvin", label: "Malvín" },
    { value: "parque-rodo", label: "Parque Rodó" },
    { value: "tres-cruces", label: "Tres Cruces" },
];

export default function RegisterPage() {
    const router = useRouter();
    const { signIn } = useAuth();
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const [formData, setFormData] = useState({
        merchantName: "",
        email: "",
        password: "",
        whatsapp: "",
        barrio: "pocitos",
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            // Call API endpoint
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Error al registrar.');
            }

            // Success - Now sign in to get session
            // Success - Now sign in to get session
            const { error: signInError } = await signIn({
                email: formData.email,
                password: formData.password
            });

            if (signInError) {
                // If auto-signin fails (shouldn't happen if user is confirmed), redirect to login
                router.push("/auth/login?registered=true");
            } else {
                router.push("/dashboard");
            }

        } catch (err: any) {
            setError(err.message || "Ocurrió un error al crear la cuenta.");
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData((prev) => ({
            ...prev,
            [e.target.name]: e.target.value,
        }));
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md"
            >
                {/* Header */}
                <div className="text-center mb-8">
                    <Link href="/" className="inline-flex items-center gap-2 mb-4">
                        <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
                            <Store className="w-5 h-5 text-primary-foreground" />
                        </div>
                        <span className="font-bold text-xl">CatálogoUY</span>
                    </Link>
                    <h1 className="text-2xl font-bold">Crear tu tienda</h1>
                    <p className="text-muted-foreground mt-1">
                        Empezá a vender en minutos
                    </p>
                </div>

                {/* Form */}
                <motion.form
                    onSubmit={handleSubmit}
                    className="bg-card border border-border rounded-2xl p-6 shadow-xl"
                >
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            className="bg-destructive/10 text-destructive text-sm p-3 rounded-lg mb-4"
                        >
                            {error}
                        </motion.div>
                    )}

                    <div className="space-y-4">
                        {/* Store Name */}
                        <div className="space-y-2">
                            <Label htmlFor="merchantName">Nombre de tu tienda</Label>
                            <div className="relative">
                                <Store className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <Input
                                    id="merchantName"
                                    name="merchantName"
                                    placeholder="Mi Tienda"
                                    value={formData.merchantName}
                                    onChange={handleChange}
                                    className="pl-10"
                                    required
                                />
                            </div>
                        </div>

                        {/* Email */}
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <Input
                                    id="email"
                                    name="email"
                                    type="email"
                                    placeholder="tu@email.com"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="pl-10"
                                    required
                                />
                            </div>
                        </div>

                        {/* WhatsApp */}
                        <div className="space-y-2">
                            <Label htmlFor="whatsapp">WhatsApp</Label>
                            <div className="relative">
                                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <Input
                                    id="whatsapp"
                                    name="whatsapp"
                                    type="tel"
                                    placeholder="+598 99 123 456"
                                    value={formData.whatsapp}
                                    onChange={handleChange}
                                    className="pl-10"
                                    required
                                />
                            </div>
                        </div>

                        {/* Barrio */}
                        <div className="space-y-2">
                            <Label htmlFor="barrio">Barrio principal</Label>
                            <div className="relative">
                                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground z-10" />
                                <select
                                    id="barrio"
                                    name="barrio"
                                    value={formData.barrio}
                                    onChange={handleChange}
                                    className="w-full h-10 pl-10 pr-4 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                                >
                                    {barrios.map((b) => (
                                        <option key={b.value} value={b.value}>
                                            {b.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Password */}
                        <div className="space-y-2">
                            <Label htmlFor="password">Contraseña</Label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <Input
                                    id="password"
                                    name="password"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Mínimo 6 caracteres"
                                    value={formData.password}
                                    onChange={handleChange}
                                    className="pl-10 pr-10"
                                    minLength={6}
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                >
                                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Submit */}
                    <Button
                        type="submit"
                        className="w-full mt-6 h-12 gap-2"
                        disabled={loading}
                    >
                        {loading ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <>
                                Crear mi tienda
                                <ArrowRight size={16} />
                            </>
                        )}
                    </Button>

                    {/* Footer */}
                    <p className="text-center text-sm text-muted-foreground mt-4">
                        ¿Ya tenés cuenta?{" "}
                        <Link href="/auth/login" className="text-primary hover:underline font-medium">
                            Iniciar sesión
                        </Link>
                    </p>
                </motion.form>

                {/* Terms */}
                <p className="text-center text-xs text-muted-foreground mt-4">
                    Al registrarte aceptás nuestros{" "}
                    <Link href="/terms" className="underline">términos</Link> y{" "}
                    <Link href="/privacy" className="underline">política de privacidad</Link>
                </p>
            </motion.div>
        </div>
    );
}
