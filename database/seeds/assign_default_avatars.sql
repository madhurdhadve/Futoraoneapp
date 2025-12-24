-- Purpose: Migration script to assign default cartoon avatars to existing users.
-- Category: Seeds
-- Description: This script updates all profiles that have NULL or placeholder avatar URLs to use a unique DiceBear avatar based on their user ID.

-- Update all profiles with NULL or empty avatar_url
UPDATE profiles
SET avatar_url = 'https://api.dicebear.com/7.x/avataaars/svg?seed=' || id
WHERE avatar_url IS NULL OR avatar_url = '' OR avatar_url = '/placeholder.svg';

-- Verify the update
SELECT id, username, avatar_url 
FROM profiles 
WHERE avatar_url LIKE '%dicebear%' 
LIMIT 10;
