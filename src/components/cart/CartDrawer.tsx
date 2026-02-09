"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ShoppingCart, Minus, Plus, X, ArrowRight } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetFooter, SheetClose } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useCart } from "@/context/CartContext";

interface CartDrawerProps {
    onCheckout?: () => void;
}

export function CartDrawer({ onCheckout }: CartDrawerProps) {
    const { items, total, itemCount, removeItem, updateQuantity } = useCart();

    return (
        <Sheet>
            <SheetTrigger asChild>
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="relative flex items-center justify-center w-12 h-12 rounded-full bg-primary text-primary-foreground shadow-lg hover:shadow-xl transition-shadow"
                >
                    <ShoppingCart size={20} />
                    {itemCount > 0 && (
                        <motion.span
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 text-white text-xs font-bold rounded-full flex items-center justify-center"
                        >
                            {itemCount}
                        </motion.span>
                    )}
                </motion.button>
            </SheetTrigger>
            <SheetContent className="w-full sm:max-w-md flex flex-col">
                <SheetHeader>
                    <SheetTitle className="flex items-center gap-2">
                        <ShoppingCart size={20} />
                        Mi Carrito ({itemCount})
                    </SheetTitle>
                </SheetHeader>

                {items.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-center">
                        <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mb-4">
                            <ShoppingCart size={32} className="text-muted-foreground" />
                        </div>
                        <h3 className="font-semibold text-foreground">Carrito vacío</h3>
                        <p className="text-muted-foreground text-sm mt-1">
                            Agregá productos para empezar
                        </p>
                    </div>
                ) : (
                    <>
                        <div className="flex-1 overflow-auto py-4 space-y-4">
                            <AnimatePresence>
                                {items.map((item) => (
                                    <motion.div
                                        key={item.id}
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        className="flex gap-3 p-3 bg-muted/50 rounded-xl"
                                    >
                                        <img
                                            src={item.image}
                                            alt={item.name}
                                            className="w-16 h-16 object-cover rounded-lg"
                                        />
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-medium text-sm truncate">{item.name}</h4>
                                            <p className="text-sm text-muted-foreground">
                                                $U {item.price.toLocaleString("es-UY")}
                                            </p>
                                            <div className="flex items-center gap-2 mt-2">
                                                <button
                                                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                    className="w-7 h-7 rounded-full bg-background flex items-center justify-center hover:bg-muted transition-colors"
                                                >
                                                    <Minus size={14} />
                                                </button>
                                                <span className="text-sm font-medium w-6 text-center">
                                                    {item.quantity}
                                                </span>
                                                <button
                                                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                    className="w-7 h-7 rounded-full bg-background flex items-center justify-center hover:bg-muted transition-colors"
                                                >
                                                    <Plus size={14} />
                                                </button>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => removeItem(item.id)}
                                            className="text-muted-foreground hover:text-destructive transition-colors"
                                        >
                                            <X size={18} />
                                        </button>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>

                        <Separator />

                        <SheetFooter className="flex-col gap-4 pt-4">
                            <div className="flex justify-between items-center w-full">
                                <span className="text-muted-foreground">Total</span>
                                <span className="text-2xl font-bold">
                                    $U {total.toLocaleString("es-UY")}
                                </span>
                            </div>
                            <SheetClose asChild>
                                <Button
                                    className="w-full h-12 text-base gap-2"
                                    size="lg"
                                    onClick={onCheckout}
                                >
                                    Continuar al Pago
                                    <ArrowRight size={18} />
                                </Button>
                            </SheetClose>
                        </SheetFooter>
                    </>
                )}
            </SheetContent>
        </Sheet>
    );
}

