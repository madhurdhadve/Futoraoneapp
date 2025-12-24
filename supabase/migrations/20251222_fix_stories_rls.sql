-- Migration Purpose: Primary fix for story RLS policies to enable user uploads.
-- This script established the base policies for the stories feature.
-- Fix RLS policies for stories table to allow inserts

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can create their own stories" ON public.stories;
DROP POLICY IF EXISTS "Users can delete their own stories" ON public.stories;
DROP POLICY IF EXISTS "Stories are viewable by everyone" ON public.stories;

-- Recreate policies with correct logic
CREATE POLICY "Stories are viewable by everyone"
  ON public.stories FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create stories"
  ON public.stories FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own stories"
  ON public.stories FOR DELETE
  USING (auth.uid() = user_id);
