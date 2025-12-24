-- Migration Purpose: Fix Storage RLS policies for profile images and post images.
-- This script ensures consistent access control for the 'post-images' bucket.
-- Row Level Security (RLS) is applied to prevent unauthorized uploads.
-- FINAL FIX: Profile Image Upload RLS
-- Run this in your Supabase SQL Editor (https://supabase.com/dashboard/project/_/sql)

-- 1. Ensure the bucket is public and has RLS enabled
DO $$
BEGIN
    INSERT INTO storage.buckets (id, name, public)
    VALUES ('post-images', 'post-images', true)
    ON CONFLICT (id) DO UPDATE SET public = true;
EXCEPTION WHEN OTHERS THEN
    NULL;
END $$;

-- 2. Drop all old/conflicting policies to start fresh
DROP POLICY IF EXISTS "Post images are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload post images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own post images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own post images" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload to their own folder" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own files" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own files" ON storage.objects;
DROP POLICY IF EXISTS "Admins can manage all post images" ON storage.objects;

-- 3. Create SIMPLE and ROBUST policies
-- Policy A: Everyone can view images
CREATE POLICY "Post images public access"
ON storage.objects FOR SELECT
USING (bucket_id = 'post-images');

-- Policy B: Any logged-in user can upload to THEIR OWN folder
-- We use a simple folder check: name MUST start with their user ID
CREATE POLICY "Users can upload to own folder"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'post-images' AND 
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy C: Users can update files in their folder
CREATE POLICY "Users can update own folder"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'post-images' AND 
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy D: Users can delete files in their folder
CREATE POLICY "Users can delete own folder"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'post-images' AND 
  (storage.foldername(name))[1] = auth.uid()::text
);

-- 4. Admin full control (for moderation)
CREATE POLICY "Admins full access"
ON storage.objects FOR ALL
TO authenticated
USING (
  bucket_id = 'post-images' AND
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND is_admin = true
  )
);
