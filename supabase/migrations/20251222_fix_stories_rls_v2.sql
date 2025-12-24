-- Migration Purpose: Comprehensive fix for story Row Level Security (RLS) policies.
-- This script resets all policies on the 'stories' table to ensure clean access.
-- V2 update includes better visibility and insert/delete permissions.
-- Comprehensive fix for stories RLS policies
-- This script drops ALL existing policies and recreates them cleanly

-- First, disable RLS temporarily to check
ALTER TABLE public.stories DISABLE ROW LEVEL SECURITY;

-- Drop ALL existing policies (using IF EXISTS to avoid errors)
DO $$ 
BEGIN
    -- Drop all possible policy name variations
    DROP POLICY IF EXISTS "Stories are viewable by everyone" ON public.stories;
    DROP POLICY IF EXISTS "Users can create their own stories" ON public.stories;
    DROP POLICY IF EXISTS "Users can delete their own stories" ON public.stories;
    DROP POLICY IF EXISTS "Authenticated users can create stories" ON public.stories;
    DROP POLICY IF EXISTS "Users can create stories" ON public.stories;
    DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.stories;
    DROP POLICY IF EXISTS "Enable read access for all users" ON public.stories;
    DROP POLICY IF EXISTS "Enable delete for users based on user_id" ON public.stories;
END $$;

-- Re-enable RLS
ALTER TABLE public.stories ENABLE ROW LEVEL SECURITY;

-- Create fresh, clean policies
CREATE POLICY "allow_select_stories"
  ON public.stories
  FOR SELECT
  USING (true);

CREATE POLICY "allow_insert_stories"
  ON public.stories
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "allow_delete_own_stories"
  ON public.stories
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Grant necessary permissions
GRANT SELECT, INSERT, DELETE ON public.stories TO authenticated;
GRANT SELECT ON public.stories TO anon;
