-- ============================================
-- CATÁLOGO UY - Seed de Barrios de Montevideo
-- Ejecutar después de 001_initial_schema.sql
-- ============================================

-- Esta función crea las zonas de envío predeterminadas
-- para un comerciante nuevo

CREATE OR REPLACE FUNCTION public.seed_default_delivery_zones(p_merchant_id UUID)
RETURNS void AS $$
BEGIN
    INSERT INTO public.delivery_zones (merchant_id, name, barrio, delivery_cost_uyu, estimated_time, is_active)
    VALUES
        (p_merchant_id, 'Pocitos', 'pocitos', 80, '30-45 min', true),
        (p_merchant_id, 'Centro', 'centro', 100, '30-45 min', true),
        (p_merchant_id, 'Punta Carretas', 'punta-carretas', 80, '30-45 min', true),
        (p_merchant_id, 'Carrasco', 'carrasco', 120, '45-60 min', true),
        (p_merchant_id, 'Ciudad Vieja', 'ciudad-vieja', 100, '30-45 min', true),
        (p_merchant_id, 'Buceo', 'buceo', 80, '30-45 min', true),
        (p_merchant_id, 'Cordón', 'cordon', 100, '30-45 min', true),
        (p_merchant_id, 'Malvín', 'malvin', 100, '35-50 min', true),
        (p_merchant_id, 'Parque Rodó', 'parque-rodo', 80, '30-45 min', true),
        (p_merchant_id, 'Tres Cruces', 'tres-cruces', 100, '30-45 min', true),
        (p_merchant_id, 'La Blanqueada', 'la-blanqueada', 100, '30-45 min', true),
        (p_merchant_id, 'Unión', 'union', 120, '40-55 min', true),
        (p_merchant_id, 'Parque Batlle', 'parque-batlle', 100, '30-45 min', true),
        (p_merchant_id, 'Palermo', 'palermo', 100, '30-45 min', true),
        (p_merchant_id, 'Aguada', 'aguada', 100, '30-45 min', true)
    ON CONFLICT (merchant_id, barrio) DO NOTHING;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- Función para crear categorías predeterminadas
-- ============================================

CREATE OR REPLACE FUNCTION public.seed_default_categories(p_merchant_id UUID)
RETURNS void AS $$
BEGIN
    INSERT INTO public.categories (merchant_id, name, slug, icon, sort_order, is_active)
    VALUES
        (p_merchant_id, 'Destacados', 'destacados', 'star', 0, true),
        (p_merchant_id, 'Ofertas', 'ofertas', 'tag', 1, true),
        (p_merchant_id, 'Nuevos', 'nuevos', 'sparkles', 2, true)
    ON CONFLICT (merchant_id, slug) DO NOTHING;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- Función helper para incrementar stats de cliente
-- ============================================

CREATE OR REPLACE FUNCTION public.increment_customer_stats(
    p_customer_id UUID,
    p_order_total DECIMAL(12,2)
)
RETURNS void AS $$
BEGIN
    UPDATE public.customers
    SET 
        total_orders = total_orders + 1,
        total_spent_uyu = total_spent_uyu + p_order_total
    WHERE id = p_customer_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- Trigger para auto-seed al crear merchant
-- ============================================

CREATE OR REPLACE FUNCTION public.on_merchant_created()
RETURNS TRIGGER AS $$
BEGIN
    -- Seed default delivery zones
    PERFORM public.seed_default_delivery_zones(NEW.id);
    -- Seed default categories
    PERFORM public.seed_default_categories(NEW.id);
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Crear trigger
DROP TRIGGER IF EXISTS trigger_merchant_created ON public.merchants;
CREATE TRIGGER trigger_merchant_created
    AFTER INSERT ON public.merchants
    FOR EACH ROW
    EXECUTE FUNCTION public.on_merchant_created();

-- ============================================
-- Vista para estadísticas del comerciante
-- ============================================

CREATE OR REPLACE VIEW public.merchant_stats AS
SELECT 
    m.id as merchant_id,
    m.name as merchant_name,
    COUNT(DISTINCT p.id) as total_products,
    COUNT(DISTINCT c.id) as total_categories,
    COUNT(DISTINCT cu.id) as total_customers,
    COUNT(DISTINCT o.id) as total_orders,
    COALESCE(SUM(o.total_uyu), 0) as total_revenue_uyu,
    COUNT(DISTINCT CASE WHEN o.status = 'pending' THEN o.id END) as pending_orders,
    COUNT(DISTINCT CASE WHEN o.created_at > NOW() - INTERVAL '24 hours' THEN o.id END) as orders_last_24h
FROM public.merchants m
LEFT JOIN public.products p ON p.merchant_id = m.id AND p.is_active = true
LEFT JOIN public.categories c ON c.merchant_id = m.id AND c.is_active = true
LEFT JOIN public.customers cu ON cu.merchant_id = m.id
LEFT JOIN public.orders o ON o.merchant_id = m.id
GROUP BY m.id, m.name;

-- ============================================
-- FIN DEL SEED
-- ============================================
