-- ============================================
-- STORAGE BUCKET CONFIGURATION
-- ============================================

-- 1. Create a new public bucket for product images
INSERT INTO storage.buckets (id, name, public, avif_autodetection, file_size_limit, allowed_mime_types)
VALUES ('products', 'products', true, false, 5242880, ARRAY['image/png', 'image/jpeg', 'image/webp', 'image/jpg'])
ON CONFLICT (id) DO NOTHING;

-- 2. Enable RLS on objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- 3. Policy: Public access to view images
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'products' );

-- 4. Policy: Authenticated users can upload images
CREATE POLICY "Authenticated users can upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK ( bucket_id = 'products' );

-- 5. Policy: Authenticated users can update their own images
CREATE POLICY "Users can update own images"
ON storage.objects FOR UPDATE
TO authenticated
USING ( bucket_id = 'products' AND owner = auth.uid() );

-- 6. Policy: Authenticated users can delete their own images
CREATE POLICY "Users can delete own images"
ON storage.objects FOR DELETE
TO authenticated
USING ( bucket_id = 'products' AND owner = auth.uid() );
