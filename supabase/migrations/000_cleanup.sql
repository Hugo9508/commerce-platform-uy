-- ============================================
-- SCRIPT DE LIMPIEZA (Ejecutar si hay errores)
-- Solo ejecuta esto si tienes errores de "already exists"
-- ============================================

-- Eliminar triggers primero
DROP TRIGGER IF EXISTS trigger_merchant_created ON public.merchants;
DROP TRIGGER IF EXISTS update_merchants_updated_at ON public.merchants;
DROP TRIGGER IF EXISTS update_categories_updated_at ON public.categories;
DROP TRIGGER IF EXISTS update_products_updated_at ON public.products;
DROP TRIGGER IF EXISTS update_customers_updated_at ON public.customers;
DROP TRIGGER IF EXISTS update_orders_updated_at ON public.orders;
DROP TRIGGER IF EXISTS update_plans_updated_at ON public.plans;

-- Eliminar funciones
DROP FUNCTION IF EXISTS public.on_merchant_created();
DROP FUNCTION IF EXISTS public.seed_default_delivery_zones(UUID);
DROP FUNCTION IF EXISTS public.seed_default_categories(UUID);
DROP FUNCTION IF EXISTS public.increment_customer_stats(UUID, DECIMAL);
DROP FUNCTION IF EXISTS public.generate_order_number(VARCHAR);
DROP FUNCTION IF EXISTS public.update_updated_at_column();

-- Eliminar vistas
DROP VIEW IF EXISTS public.merchant_stats;

-- Eliminar tablas (en orden por dependencias)
DROP TABLE IF EXISTS public.order_items CASCADE;
DROP TABLE IF EXISTS public.orders CASCADE;
DROP TABLE IF EXISTS public.customers CASCADE;
DROP TABLE IF EXISTS public.delivery_zones CASCADE;
DROP TABLE IF EXISTS public.products CASCADE;
DROP TABLE IF EXISTS public.categories CASCADE;
DROP TABLE IF EXISTS public.merchants CASCADE;
DROP TABLE IF EXISTS public.plans CASCADE;

-- Eliminar ENUMs
DROP TYPE IF EXISTS order_status;
DROP TYPE IF EXISTS payment_status;
DROP TYPE IF EXISTS payment_method;

-- ============================================
-- LISTO! Ahora ejecuta 001_initial_schema.sql
-- ============================================
