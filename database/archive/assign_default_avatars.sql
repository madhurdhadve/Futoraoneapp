-- Migration Script: Assign Default Cartoon Avatars to Existing Users
-- This script assigns a default cartoon avatar to all users who don't have one
-- Run this in the Supabase SQL Editor

-- Update all profiles with NULL or empty avatar_url
UPDATE profiles
SET avatar_url = 'https://api.dicebear.com/7.x/avataaars/svg?seed=' || id
WHERE avatar_url IS NULL OR avatar_url = '' OR avatar_url = '/placeholder.svg';

-- Verify the update
SELECT id, username, avatar_url 
FROM profiles 
WHERE avatar_url LIKE '%dicebear%' 
LIMIT 10;
