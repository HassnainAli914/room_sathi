-- =============================================
-- FIX Storage Policies for Listing Images
-- Run this in Supabase SQL Editor
-- =============================================

-- Drop existing policies first
DROP POLICY IF EXISTS "Public read access for images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own images" ON storage.objects;
DROP POLICY IF EXISTS "Allow all uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow all reads" ON storage.objects;

-- Ensure bucket exists and is public
INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('images', 'images', true, 10485760)  -- 10MB limit
ON CONFLICT (id) DO UPDATE SET public = true;

-- =============================================
-- PERMISSIVE POLICIES for Development
-- =============================================

-- Allow ANYONE to read images (public bucket)
CREATE POLICY "Allow all reads"
ON storage.objects FOR SELECT
USING (bucket_id = 'images');

-- Allow authenticated users to upload ANY image
CREATE POLICY "Allow authenticated uploads"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'images' 
    AND (auth.role() = 'authenticated' OR auth.role() = 'anon')
);

-- Allow authenticated users to update images
CREATE POLICY "Allow authenticated updates"
ON storage.objects FOR UPDATE
USING (bucket_id = 'images')
WITH CHECK (bucket_id = 'images');

-- Allow authenticated users to delete images
CREATE POLICY "Allow authenticated deletes"
ON storage.objects FOR DELETE
USING (bucket_id = 'images');

-- Verify bucket settings
SELECT id, name, public, file_size_limit 
FROM storage.buckets 
WHERE id = 'images';

-- Verify policies
SELECT policyname, permissive, cmd 
FROM pg_policies 
WHERE tablename = 'objects' AND schemaname = 'storage';
