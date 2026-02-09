"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, Upload, X, Package } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/context/AuthContext";
import { createProduct, getMerchantCategories, uploadProductImage } from "@/lib/merchant-api";

export default function NewProductPage() {
    const router = useRouter();
    const { user, loading: authLoading } = useAuth();
    const [loading, setLoading] = useState(false);
    const [categories, setCategories] = useState<any[]>([]);

    // Form state
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        price_uyu: "",
        category_id: "",
        is_active: true,
        is_featured: false,
    });

    // Image handling
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (!authLoading && user?.merchant?.id) {
            loadCategories();
        }
    }, [user, authLoading]);

    const loadCategories = async () => {
        if (!user?.merchant?.id) return;
        const data = await getMerchantCategories(user.merchant.id);
        setCategories(data || []);
        // Set first category as default if available
        if (data && data.length > 0) {
            setFormData(prev => ({ ...prev, category_id: data[0].id }));
        }
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImageFile(file);
            const previewUrl = URL.createObjectURL(file);
            setImagePreview(previewUrl);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user?.merchant) return;

        setLoading(true);

        try {
            let imageUrl = undefined;

            // Upload image if selected
            if (imageFile) {
                const url = await uploadProductImage(imageFile, user.merchant.slug);
                if (url) imageUrl = url;
            }

            const result = await createProduct({
                merchant_id: user.merchant.id,
                name: formData.name,
                description: formData.description,
                price_uyu: parseFloat(formData.price_uyu),
                category_id: formData.category_id,
                is_active: formData.is_active,
                is_featured: formData.is_featured,
                image_url: imageUrl,
            });

            if (result.success) {
                router.push("/dashboard/products");
            } else {
                console.error("Error creating product:", result.error);
                // Show error toast
            }
        } catch (error) {
            console.error("Error submitting form:", error);
        } finally {
            setLoading(false);
        }
    };

    if (authLoading) return null;

    return (
        <div className="p-6 max-w-2xl mx-auto">
            <div className="flex items-center gap-4 mb-8">
                <Link href="/dashboard/products">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="w-5 h-5" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-2xl font-bold">Nuevo Producto</h1>
                    <p className="text-muted-foreground">Agregá un producto a tu catálogo</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                {/* Image Upload */}
                <div className="space-y-4">
                    <Label>Imagen del producto</Label>
                    <div
                        className="border-2 border-dashed rounded-xl p-4 flex flex-col items-center justify-center min-h-[200px] cursor-pointer hover:bg-muted/50 transition-colors relative"
                        onClick={() => fileInputRef.current?.click()}
                    >
                        {imagePreview ? (
                            <div className="relative w-full h-48">
                                <Image
                                    src={imagePreview}
                                    alt="Preview"
                                    fill
                                    className="object-contain rounded-lg"
                                />
                                <Button
                                    type="button"
                                    variant="destructive"
                                    size="icon"
                                    className="absolute top-2 right-2 h-8 w-8 rounded-full"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setImageFile(null);
                                        setImagePreview(null);
                                    }}
                                >
                                    <X size={14} />
                                </Button>
                            </div>
                        ) : (
                            <>
                                <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mb-2">
                                    <Upload className="w-6 h-6 text-muted-foreground" />
                                </div>
                                <p className="text-sm font-medium">Click para subir imagen</p>
                                <p className="text-xs text-muted-foreground mt-1">PNG, JPG, WEBP hasta 5MB</p>
                            </>
                        )}
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleImageChange}
                        />
                    </div>
                </div>

                {/* Basic Info */}
                <div className="grid gap-6">
                    <div className="space-y-2">
                        <Label htmlFor="name">Nombre del producto *</Label>
                        <Input
                            id="name"
                            value={formData.name}
                            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                            placeholder="Ej: Hamburguesa Clásica"
                            required
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="price">Precio (UYU) *</Label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                                <Input
                                    id="price"
                                    type="number"
                                    value={formData.price_uyu}
                                    onChange={(e) => setFormData(prev => ({ ...prev, price_uyu: e.target.value }))}
                                    className="pl-7"
                                    placeholder="0"
                                    min="0"
                                    step="0.01"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="category">Categoría *</Label>
                            <Select
                                value={formData.category_id}
                                onValueChange={(value) => setFormData(prev => ({ ...prev, category_id: value }))}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Seleccionar..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {categories.map((cat) => (
                                        <SelectItem key={cat.id} value={cat.id}>
                                            {cat.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">Descripción</Label>
                        <Textarea
                            id="description"
                            value={formData.description}
                            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                            placeholder="Detalles sobre el producto..."
                            className="h-24"
                        />
                    </div>
                </div>

                {/* Settings */}
                <div className="space-y-4 pt-4 border-t">
                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label>Producto activo</Label>
                            <p className="text-sm text-muted-foreground">Visible para los clientes</p>
                        </div>
                        <Switch
                            checked={formData.is_active}
                            onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
                        />
                    </div>
                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label>Destacado</Label>
                            <p className="text-sm text-muted-foreground">Aparecerá en la sección principal</p>
                        </div>
                        <Switch
                            checked={formData.is_featured}
                            onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_featured: checked }))}
                        />
                    </div>
                </div>

                {/* Actions */}
                <div className="flex gap-4 pt-4">
                    <Link href="/dashboard/products" className="w-full">
                        <Button variant="outline" className="w-full" type="button">
                            Cancelar
                        </Button>
                    </Link>
                    <Button type="submit" className="w-full" disabled={loading}>
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Crear Producto
                    </Button>
                </div>
            </form>
        </div>
    );
}
