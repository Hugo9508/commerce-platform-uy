import { Product } from "@/context/CartContext";

export const mockProducts: Product[] = [
    {
        id: "1",
        name: "Pizza Margherita",
        description: "Tomate, mozzarella fresca, albahaca y aceite de oliva",
        price: 450,
        image: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400&h=400&fit=crop",
        category: "Pizzas",
    },
    {
        id: "2",
        name: "Pizza Pepperoni",
        description: "Salsa de tomate, mozzarella y pepperoni artesanal",
        price: 520,
        image: "https://images.unsplash.com/photo-1628840042765-356cda07504e?w=400&h=400&fit=crop",
        category: "Pizzas",
    },
    {
        id: "3",
        name: "Hamburguesa Clásica",
        description: "Carne 180g, lechuga, tomate, cebolla y salsa especial",
        price: 380,
        image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=400&fit=crop",
        category: "Hamburguesas",
    },
    {
        id: "4",
        name: "Hamburguesa Doble",
        description: "Doble carne, queso cheddar, bacon y cebolla caramelizada",
        price: 520,
        image: "https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?w=400&h=400&fit=crop",
        category: "Hamburguesas",
    },
    {
        id: "5",
        name: "Empanadas x6",
        description: "Mix de carne, pollo y jamón y queso",
        price: 290,
        image: "https://images.unsplash.com/photo-1617655840632-8a06d14e0702?w=400&h=400&fit=crop",
        category: "Empanadas",
    },
    {
        id: "6",
        name: "Coca-Cola 500ml",
        description: "Bebida gaseosa clásica",
        price: 85,
        image: "https://images.unsplash.com/photo-1554866585-cd94860890b7?w=400&h=400&fit=crop",
        category: "Bebidas",
    },
    {
        id: "7",
        name: "Limonada Natural",
        description: "Limonada casera con menta fresca",
        price: 120,
        image: "https://images.unsplash.com/photo-1621263764928-df1444c5e859?w=400&h=400&fit=crop",
        category: "Bebidas",
    },
    {
        id: "8",
        name: "Tiramisú",
        description: "Postre italiano con café y mascarpone",
        price: 220,
        image: "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=400&h=400&fit=crop",
        category: "Postres",
    },
];

export const categories = ["Pizzas", "Hamburguesas", "Empanadas", "Bebidas", "Postres"];
