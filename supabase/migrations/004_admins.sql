-- ============================================
-- TABLA: admins (Super Administradores)
-- ============================================

CREATE TABLE IF NOT EXISTS public.admins (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;

-- Políticas de seguridad (Solo admins pueden ver la tabla de admins)
CREATE POLICY "Admins are viewable by admins" ON public.admins
    FOR SELECT USING (auth.uid() IN (SELECT user_id FROM public.admins));

-- Insertar un admin inicial si se conoce el ID (Opcional, se hace manual)
-- INSERT INTO public.admins (user_id, email) VALUES ('uuid-del-user', 'admin@example.com');
