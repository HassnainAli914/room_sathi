-- =============================================
-- FIX Storage Policies for Root Level Uploads (Type Cast Fixed)
-- Run this in Supabase SQL Editor
-- =============================================

-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Authenticated users can upload images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own images" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload own images" ON storage.objects;

-- Allow public read access (keep this)
-- DROP POLICY IF EXISTS "Public read access for images" ON storage.objects;
-- CREATE POLICY "Public read access for images" ON storage.objects FOR SELECT USING (bucket_id = 'images');

-- 1. Allow authenticated uploads to root (filename starts with user_id)
-- Fixed casting auth.uid() to text
CREATE POLICY "Users can upload own images"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'images' 
    AND auth.role() = 'authenticated'
    AND name LIKE (auth.uid()::text || '%')
);

-- 2. Allow updates to own images
CREATE POLICY "Users can update own images"
ON storage.objects FOR UPDATE
USING (
    bucket_id = 'images' 
    AND (
        -- If using folders (legacy support)
        (storage.foldername(name))[1] = auth.uid()::text
        OR 
        -- If using root files
        name LIKE (auth.uid()::text || '%')
    )
);

-- 3. Allow deletes of own images
CREATE POLICY "Users can delete own images"
ON storage.objects FOR DELETE
USING (
    bucket_id = 'images' 
    AND name LIKE (auth.uid()::text || '%')
);
