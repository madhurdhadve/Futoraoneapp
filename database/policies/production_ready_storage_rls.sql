-- Purpose: Production-ready storage RLS policies for avatars and post images.
-- Category: Policies
-- Description: A consolidated script for setting up production storage policies for post images and profile avatars.

-- ROBUST STORAGE FIX FOR AVATARS AND POST IMAGES
-- Run this in your Supabase SQL Editor: https://supabase.com/dashboard/project/_/sql

-- 1. Ensure the buckets exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('post-images', 'post-images', true)
ON CONFLICT (id) DO UPDATE SET public = true;

INSERT INTO storage.buckets (id, name, public)
VALUES ('post_images', 'post_images', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- 2. Drop existing policies to start fresh for BOTH buckets
DO $$
BEGIN
    -- Drop for post-images
    DROP POLICY IF EXISTS "Post images public access" ON storage.objects;
    DROP POLICY IF EXISTS "Users can upload to own folder" ON storage.objects;
    DROP POLICY IF EXISTS "Users can update own folder" ON storage.objects;
    DROP POLICY IF EXISTS "Users can delete own folder" ON storage.objects;
    DROP POLICY IF EXISTS "Admins full access" ON storage.objects;
    
    -- Drop older variations
    DROP POLICY IF EXISTS "Allow public read access" ON storage.objects;
    DROP POLICY IF EXISTS "Allow authenticated uploads" ON storage.objects;
    DROP POLICY IF EXISTS "Authenticated users can upload post images" ON storage.objects;
    DROP POLICY IF EXISTS "Users can update their own post images" ON storage.objects;
    DROP POLICY IF EXISTS "Users can delete their own post images" ON storage.objects;
END $$;

-- 3. Create NEW robust policies for 'post-images' (hyphen)
CREATE POLICY "Public Access - post-images"
ON storage.objects FOR SELECT
USING (bucket_id = 'post-images');

CREATE POLICY "Authenticated Insert - post-images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'post-images' 
    AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Authenticated Update - post-images"
ON storage.objects FOR UPDATE
TO authenticated
USING (
    bucket_id = 'post-images' 
    AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Authenticated Delete - post-images"
ON storage.objects FOR DELETE
TO authenticated
USING (
    bucket_id = 'post-images' 
    AND (storage.foldername(name))[1] = auth.uid()::text
);

-- 4. Create NEW robust policies for 'post_images' (underscore)
CREATE POLICY "Public Access - post_images"
ON storage.objects FOR SELECT
USING (bucket_id = 'post_images');

CREATE POLICY "Authenticated Insert - post_images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'post_images' 
    AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Authenticated Update - post_images"
ON storage.objects FOR UPDATE
TO authenticated
USING (
    bucket_id = 'post_images' 
    AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Authenticated Delete - post_images"
ON storage.objects FOR DELETE
TO authenticated
USING (
    bucket_id = 'post_images' 
    AND (storage.foldername(name))[1] = auth.uid()::text
);

-- 5. Admin full control (for moderation)
CREATE POLICY "Admins full access"
ON storage.objects FOR ALL
TO authenticated
USING (
    (bucket_id = 'post-images' OR bucket_id = 'post_images') AND
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND is_admin = true
    )
);
