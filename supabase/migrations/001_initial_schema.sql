-- ============================================
-- CATÁLOGO UY - Schema Multi-Tenant
-- Para Supabase autohospedado
-- ============================================

-- Habilitar extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================
-- TABLA: plans (Planes de suscripción)
-- ============================================
CREATE TABLE IF NOT EXISTS public.plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(50) NOT NULL UNIQUE,
    price_uyu DECIMAL(10,2) NOT NULL DEFAULT 0,
    max_products INTEGER NOT NULL DEFAULT 50,
    max_categories INTEGER NOT NULL DEFAULT 10,
    featured_enabled BOOLEAN NOT NULL DEFAULT false,
    analytics_enabled BOOLEAN NOT NULL DEFAULT false,
    custom_domain_enabled BOOLEAN NOT NULL DEFAULT false,
    priority_support BOOLEAN NOT NULL DEFAULT false,
    description TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Insertar planes predeterminados
INSERT INTO public.plans (name, slug, price_uyu, max_products, max_categories, featured_enabled, analytics_enabled, description) VALUES
    ('Gratis', 'free', 0, 20, 5, false, false, 'Ideal para empezar. Hasta 20 productos.'),
    ('Emprendedor', 'starter', 990, 100, 15, true, false, 'Para negocios en crecimiento.'),
    ('Profesional', 'pro', 2490, 500, 50, true, true, 'Para comercios establecidos.'),
    ('Enterprise', 'enterprise', 4990, -1, -1, true, true, 'Sin límites. Dominio personalizado.')
ON CONFLICT (slug) DO NOTHING;

-- ============================================
-- TABLA: merchants (Comerciantes/Tiendas)
-- ============================================
CREATE TABLE IF NOT EXISTS public.merchants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    plan_id UUID REFERENCES public.plans(id) ON DELETE SET NULL,
    
    -- Información básica
    name VARCHAR(200) NOT NULL,
    slug VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    logo_url TEXT,
    banner_url TEXT,
    
    -- Contacto
    email VARCHAR(255),
    phone VARCHAR(50),
    whatsapp VARCHAR(50),
    
    -- Ubicación (Montevideo)
    address TEXT,
    barrio VARCHAR(100),
    city VARCHAR(100) DEFAULT 'Montevideo',
    
    -- Configuración
    primary_color VARCHAR(7) DEFAULT '#000000',
    secondary_color VARCHAR(7) DEFAULT '#ffffff',
    currency VARCHAR(3) DEFAULT 'UYU',
    
    -- Pagos
    mercadopago_access_token TEXT,
    accepts_cash BOOLEAN DEFAULT true,
    accepts_transfer BOOLEAN DEFAULT true,
    accepts_abitab BOOLEAN DEFAULT true,
    
    -- Estado
    is_active BOOLEAN NOT NULL DEFAULT true,
    is_verified BOOLEAN NOT NULL DEFAULT false,
    
    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices para merchants
CREATE INDEX IF NOT EXISTS idx_merchants_slug ON public.merchants(slug);
CREATE INDEX IF NOT EXISTS idx_merchants_user_id ON public.merchants(user_id);
CREATE INDEX IF NOT EXISTS idx_merchants_is_active ON public.merchants(is_active);

-- ============================================
-- TABLA: categories (Categorías de productos)
-- ============================================
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    merchant_id UUID NOT NULL REFERENCES public.merchants(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) NOT NULL,
    description TEXT,
    icon VARCHAR(50),
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Slug único por comerciante
    UNIQUE(merchant_id, slug)
);

-- Índices para categories
CREATE INDEX IF NOT EXISTS idx_categories_merchant_id ON public.categories(merchant_id);

-- ============================================
-- TABLA: products (Productos)
-- ============================================
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    merchant_id UUID NOT NULL REFERENCES public.merchants(id) ON DELETE CASCADE,
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    
    -- Información del producto
    name VARCHAR(200) NOT NULL,
    slug VARCHAR(200) NOT NULL,
    description TEXT,
    price_uyu DECIMAL(10,2) NOT NULL,
    compare_price_uyu DECIMAL(10,2),
    
    -- Imágenes
    image_url TEXT,
    gallery_urls TEXT[],
    
    -- Inventario
    sku VARCHAR(100),
    stock INTEGER DEFAULT -1, -- -1 = ilimitado
    track_stock BOOLEAN DEFAULT false,
    
    -- Estado
    is_active BOOLEAN NOT NULL DEFAULT true,
    is_featured BOOLEAN NOT NULL DEFAULT false,
    
    -- Ordenamiento
    sort_order INTEGER DEFAULT 0,
    
    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Slug único por comerciante
    UNIQUE(merchant_id, slug)
);

-- Índices para products
CREATE INDEX IF NOT EXISTS idx_products_merchant_id ON public.products(merchant_id);
CREATE INDEX IF NOT EXISTS idx_products_category_id ON public.products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_is_active ON public.products(is_active);
CREATE INDEX IF NOT EXISTS idx_products_is_featured ON public.products(is_featured);

-- ============================================
-- TABLA: delivery_zones (Zonas de envío)
-- ============================================
CREATE TABLE IF NOT EXISTS public.delivery_zones (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    merchant_id UUID NOT NULL REFERENCES public.merchants(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    barrio VARCHAR(100) NOT NULL,
    delivery_cost_uyu DECIMAL(10,2) NOT NULL DEFAULT 0,
    min_order_uyu DECIMAL(10,2) DEFAULT 0,
    estimated_time VARCHAR(50),
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    UNIQUE(merchant_id, barrio)
);

-- ============================================
-- TABLA: customers (Clientes)
-- ============================================
CREATE TABLE IF NOT EXISTS public.customers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    merchant_id UUID NOT NULL REFERENCES public.merchants(id) ON DELETE CASCADE,
    
    -- Información
    name VARCHAR(200) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(50),
    whatsapp VARCHAR(50),
    
    -- Dirección
    address TEXT,
    barrio VARCHAR(100),
    city VARCHAR(100) DEFAULT 'Montevideo',
    notes TEXT,
    
    -- Estadísticas
    total_orders INTEGER DEFAULT 0,
    total_spent_uyu DECIMAL(12,2) DEFAULT 0,
    
    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Email único por comerciante (si existe)
    UNIQUE(merchant_id, phone)
);

-- Índices para customers
CREATE INDEX IF NOT EXISTS idx_customers_merchant_id ON public.customers(merchant_id);
CREATE INDEX IF NOT EXISTS idx_customers_phone ON public.customers(phone);

-- ============================================
-- TABLA: orders (Pedidos)
-- ============================================
CREATE TYPE order_status AS ENUM (
    'pending',
    'confirmed',
    'preparing',
    'ready',
    'delivering',
    'delivered',
    'cancelled'
);

CREATE TYPE payment_status AS ENUM (
    'pending',
    'paid',
    'failed',
    'refunded'
);

CREATE TYPE payment_method AS ENUM (
    'mercadopago',
    'abitab',
    'redpagos',
    'transfer',
    'cash'
);

CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    merchant_id UUID NOT NULL REFERENCES public.merchants(id) ON DELETE CASCADE,
    customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
    
    -- Número de pedido legible
    order_number VARCHAR(20) NOT NULL,
    
    -- Totales
    subtotal_uyu DECIMAL(10,2) NOT NULL,
    delivery_cost_uyu DECIMAL(10,2) NOT NULL DEFAULT 0,
    discount_uyu DECIMAL(10,2) NOT NULL DEFAULT 0,
    total_uyu DECIMAL(10,2) NOT NULL,
    
    -- Estado
    status order_status NOT NULL DEFAULT 'pending',
    payment_status payment_status NOT NULL DEFAULT 'pending',
    payment_method payment_method,
    
    -- Mercado Pago
    mp_payment_id VARCHAR(100),
    mp_preference_id VARCHAR(100),
    
    -- Entrega
    delivery_address TEXT,
    delivery_barrio VARCHAR(100),
    delivery_notes TEXT,
    
    -- Datos del cliente (snapshot)
    customer_name VARCHAR(200),
    customer_phone VARCHAR(50),
    customer_email VARCHAR(255),
    
    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    confirmed_at TIMESTAMPTZ,
    delivered_at TIMESTAMPTZ,
    
    -- Número único por comerciante
    UNIQUE(merchant_id, order_number)
);

-- Índices para orders
CREATE INDEX IF NOT EXISTS idx_orders_merchant_id ON public.orders(merchant_id);
CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON public.orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at DESC);

-- ============================================
-- TABLA: order_items (Items del pedido)
-- ============================================
CREATE TABLE IF NOT EXISTS public.order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
    
    -- Snapshot del producto al momento de la compra
    product_name VARCHAR(200) NOT NULL,
    product_image_url TEXT,
    unit_price_uyu DECIMAL(10,2) NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    total_uyu DECIMAL(10,2) NOT NULL,
    
    -- Notas especiales
    notes TEXT,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices para order_items
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items(order_id);

-- ============================================
-- FUNCIONES HELPER
-- ============================================

-- Función para generar número de pedido
CREATE OR REPLACE FUNCTION generate_order_number(merchant_slug VARCHAR)
RETURNS VARCHAR AS $$
DECLARE
    prefix VARCHAR(6);
    seq INTEGER;
    result VARCHAR(20);
BEGIN
    prefix := UPPER(LEFT(merchant_slug, 3)) || '-';
    seq := COALESCE(
        (SELECT COUNT(*) + 1 FROM public.orders o 
         JOIN public.merchants m ON o.merchant_id = m.id 
         WHERE m.slug = merchant_slug),
        1
    );
    result := prefix || LPAD(seq::TEXT, 6, '0');
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para updated_at
CREATE TRIGGER update_merchants_updated_at BEFORE UPDATE ON public.merchants
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON public.categories
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON public.products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON public.customers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON public.orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_plans_updated_at BEFORE UPDATE ON public.plans
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Habilitar RLS en todas las tablas
ALTER TABLE public.merchants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.delivery_zones ENABLE ROW LEVEL SECURITY;

-- Políticas para merchants (solo el dueño puede modificar)
CREATE POLICY "Merchants are viewable by everyone" ON public.merchants
    FOR SELECT USING (is_active = true);

CREATE POLICY "Users can manage their own merchants" ON public.merchants
    FOR ALL USING (auth.uid() = user_id);

-- Políticas para products (público para ver, dueño para modificar)
CREATE POLICY "Products are viewable by everyone" ON public.products
    FOR SELECT USING (is_active = true);

CREATE POLICY "Merchants can manage their products" ON public.products
    FOR ALL USING (
        merchant_id IN (SELECT id FROM public.merchants WHERE user_id = auth.uid())
    );

-- Políticas para categories
CREATE POLICY "Categories are viewable by everyone" ON public.categories
    FOR SELECT USING (is_active = true);

CREATE POLICY "Merchants can manage their categories" ON public.categories
    FOR ALL USING (
        merchant_id IN (SELECT id FROM public.merchants WHERE user_id = auth.uid())
    );

-- Políticas para orders (solo el comerciante ve sus pedidos)
CREATE POLICY "Merchants can view their orders" ON public.orders
    FOR SELECT USING (
        merchant_id IN (SELECT id FROM public.merchants WHERE user_id = auth.uid())
    );

CREATE POLICY "Anyone can create orders" ON public.orders
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Merchants can update their orders" ON public.orders
    FOR UPDATE USING (
        merchant_id IN (SELECT id FROM public.merchants WHERE user_id = auth.uid())
    );

-- Políticas para order_items
CREATE POLICY "Order items follow order policies" ON public.order_items
    FOR ALL USING (
        order_id IN (
            SELECT o.id FROM public.orders o
            JOIN public.merchants m ON o.merchant_id = m.id
            WHERE m.user_id = auth.uid()
        )
    );

CREATE POLICY "Anyone can create order items" ON public.order_items
    FOR INSERT WITH CHECK (true);

-- Políticas para customers
CREATE POLICY "Merchants can view their customers" ON public.customers
    FOR ALL USING (
        merchant_id IN (SELECT id FROM public.merchants WHERE user_id = auth.uid())
    );

-- Políticas para delivery_zones (público para ver)
CREATE POLICY "Delivery zones are viewable by everyone" ON public.delivery_zones
    FOR SELECT USING (is_active = true);

CREATE POLICY "Merchants can manage their delivery zones" ON public.delivery_zones
    FOR ALL USING (
        merchant_id IN (SELECT id FROM public.merchants WHERE user_id = auth.uid())
    );

-- ============================================
-- DATOS DE EJEMPLO (Opcional)
-- ============================================

-- Insertar comerciante de demo
-- INSERT INTO public.merchants (name, slug, description, whatsapp, barrio)
-- VALUES ('Demo Tienda', 'demo-tienda', 'Tienda de demostración', '+59899000000', 'Pocitos');

-- ============================================
-- FIN DEL SCHEMA
-- ============================================
