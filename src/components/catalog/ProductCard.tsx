"use client";

import { motion } from "framer-motion";
import { Plus, Check } from "lucide-react";
import { useState } from "react";
import { useCart, Product } from "@/context/CartContext";

interface ProductCardProps {
    product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
    const { addItem } = useCart();
    const [added, setAdded] = useState(false);

    const handleAdd = () => {
        addItem(product);
        setAdded(true);
        setTimeout(() => setAdded(false), 1500);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -4 }}
            className="group relative bg-card rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300"
        >
            {/* Image Container */}
            <div className="aspect-square relative overflow-hidden bg-muted">
                <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />

                {/* Add Button */}
                <motion.button
                    onClick={handleAdd}
                    whileTap={{ scale: 0.9 }}
                    className={`absolute bottom-3 right-3 w-10 h-10 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 ${added
                            ? "bg-green-500 text-white"
                            : "bg-white text-foreground hover:bg-primary hover:text-primary-foreground"
                        }`}
                >
                    {added ? <Check size={20} /> : <Plus size={20} />}
                </motion.button>
            </div>

            {/* Content */}
            <div className="p-4">
                <h3 className="font-semibold text-foreground truncate">{product.name}</h3>
                <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                    {product.description}
                </p>
                <p className="text-lg font-bold text-primary mt-2">
                    $U {product.price.toLocaleString("es-UY")}
                </p>
            </div>
        </motion.div>
    );
}
