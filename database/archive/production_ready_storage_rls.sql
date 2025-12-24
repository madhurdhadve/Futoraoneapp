-- DEFINITIVE PRODUCTION-READY STORAGE RLS
-- Run this in your Supabase SQL Editor: https://supabase.com/dashboard/project/_/sql

-- 1. HARMONIZE BUCKETS (Ensuring both variations exist and are public)
INSERT INTO storage.buckets (id, name, public)
VALUES ('post-images', 'post-images', true)
ON CONFLICT (id) DO UPDATE SET public = true;

INSERT INTO storage.buckets (id, name, public)
VALUES ('post_images', 'post_images', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- 2. RESET POLICIES (Drop all to avoid conflicts/overlap)
DO $$
DECLARE
    pol RECORD;
BEGIN
    FOR pol IN (SELECT policyname FROM pg_policies WHERE tablename = 'objects' AND schemaname = 'storage') LOOP
        IF pol.policyname LIKE '%post-images%' OR pol.policyname LIKE '%post_images%' THEN
            EXECUTE 'DROP POLICY IF EXISTS "' || pol.policyname || '" ON storage.objects';
        END IF;
    END LOOP;
END $$;

-- 3. THE AUTHORITATIVE POLICY SUITE (Applying to both ID variations)
-- We use a folder-based convention: bucket/[auth.uid()]/filename

-- SELECT: Public read access
CREATE POLICY "post_images_select_policy" ON storage.objects FOR SELECT 
USING (bucket_id IN ('post-images', 'post_images'));

-- INSERT: Authenticated users can upload to their own folder
CREATE POLICY "post_images_insert_policy" ON storage.objects FOR INSERT 
TO authenticated 
WITH CHECK (
    bucket_id IN ('post-images', 'post_images') AND 
    (storage.foldername(name))[1] = auth.uid()::text
);

-- UPDATE: Authenticated users can update their own files
CREATE POLICY "post_images_update_policy" ON storage.objects FOR UPDATE 
TO authenticated 
USING (
    bucket_id IN ('post-images', 'post_images') AND 
    (storage.foldername(name))[1] = auth.uid()::text
);

-- DELETE: Authenticated users can delete their own files
CREATE POLICY "post_images_delete_policy" ON storage.objects FOR DELETE 
TO authenticated 
USING (
    bucket_id IN ('post-images', 'post_images') AND 
    (storage.foldername(name))[1] = auth.uid()::text
);

-- 4. ADMIN ACCESS (Optional but recommended for moderation)
CREATE POLICY "post_images_admin_policy" ON storage.objects FOR ALL 
TO authenticated 
USING (
    bucket_id IN ('post-images', 'post_images') AND
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND (is_admin = true OR username = 'sanu')
    )
);

