"use client";

import { motion } from "framer-motion";

interface Category {
    id: string;
    name: string;
}

interface CategoryChipsProps {
    categories: Category[]; // Updated from string[]
    selected: string;
    onSelect: (category: string) => void;
}

export function CategoryChips({ categories, selected, onSelect }: CategoryChipsProps) {
    return (
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => onSelect("all")}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200 ${selected === "all"
                    ? "bg-primary text-primary-foreground shadow-md"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                    }`}
            >
                Todos
            </motion.button>
            {categories.map((category) => (
                <motion.button
                    key={category.id}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => onSelect(category.id)}
                    className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200 ${selected === category.id
                        ? "bg-primary text-primary-foreground shadow-md"
                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                        }`}
                >
                    {category.name}
                </motion.button>
            ))}
        </div>
    );
}
