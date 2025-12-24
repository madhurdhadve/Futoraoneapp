-- Fix Stories RLS Policy Error
-- Run this in Supabase SQL Editor to allow story uploads

-- Drop all existing stories policies
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'stories') LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON public.stories';
    END LOOP;
END $$;

-- Recreate clean policies
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

-- Verify RLS is enabled
ALTER TABLE public.stories ENABLE ROW LEVEL SECURITY;
