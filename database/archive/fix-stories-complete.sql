-- Complete fix for story uploads
-- This fixes BOTH the storage bucket AND the RLS policies

-- Step 1: Create the stories bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('stories', 'stories', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Step 2: Drop all existing storage policies for stories bucket
DROP POLICY IF EXISTS "Stories are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload stories" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own stories" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own stories" ON storage.objects;
DROP POLICY IF EXISTS "Allow public read access" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to delete own stories" ON storage.objects;

-- Step 3: Create storage policies for the bucket
-- Allow anyone to read stories
CREATE POLICY "Stories are publicly accessible"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'stories');

-- Allow authenticated users to upload stories
CREATE POLICY "Authenticated users can upload stories"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'stories' 
    AND auth.role() = 'authenticated'
  );

-- Allow users to delete their own stories
CREATE POLICY "Users can delete their own stories"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'stories' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Step 4: Fix the stories TABLE RLS policies
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'stories') LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON public.stories';
    END LOOP;
END $$;

-- Enable RLS on the stories table
ALTER TABLE public.stories ENABLE ROW LEVEL SECURITY;

-- Create fresh, clean TABLE policies
CREATE POLICY "Allow anyone to view stories"
  ON public.stories
  FOR SELECT
  USING (true);

CREATE POLICY "Allow authenticated users to insert stories"
  ON public.stories
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow users to delete their own stories"
  ON public.stories
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);
