-- Fix RLS policies for follows table
DROP POLICY IF EXISTS "Users can view all follows" ON follows;
DROP POLICY IF EXISTS "Enable read access for all users" ON follows;
DROP POLICY IF EXISTS "Follows are viewable by everyone" ON follows;

-- Create a permissive select policy for follows
CREATE POLICY "Enable read access for all users"
ON follows FOR SELECT
USING (true);

-- Ensure profiles are publicly visible
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON profiles;

CREATE POLICY "Public profiles are viewable by everyone"
ON profiles FOR SELECT
USING (true);