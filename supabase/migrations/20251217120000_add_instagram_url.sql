-- Add Instagram URL column to profiles table
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS instagram_url TEXT;

-- Add comment to the column
COMMENT ON COLUMN profiles.instagram_url IS 'User Instagram profile URL';
