"use client";

import { Clock, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { motion } from "framer-motion";

export default function CheckoutPendingPage() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-background">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-sm flex flex-col items-center"
            >
                <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mb-6">
                    <Clock className="w-10 h-10 text-yellow-600" />
                </div>

                <h1 className="text-2xl font-bold text-center mb-2">Pago Pendiente</h1>
                <p className="text-muted-foreground text-center mb-6">
                    Tu pago está siendo procesado. Te avisaremos cuando se confirme.
                </p>

                <div className="w-full space-y-3">
                    <Link href="/" className="block w-full">
                        <Button variant="outline" className="w-full h-12 gap-2">
                            <ArrowLeft size={18} />
                            Volver al Inicio
                        </Button>
                    </Link>
                </div>
            </motion.div>
        </div>
    );
}
