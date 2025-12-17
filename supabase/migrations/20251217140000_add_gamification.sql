-- Add gamification columns to profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS badges TEXT[] DEFAULT '{}';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS trust_score INTEGER DEFAULT 50;

-- Create an index for faster querying of badges
CREATE INDEX IF NOT EXISTS idx_profiles_badges ON public.profiles USING GIN(badges);

-- Update the types (this is a comment for the developer, types.ts needs manual update or generation)
-- badges: string[];
-- trust_score: number;
