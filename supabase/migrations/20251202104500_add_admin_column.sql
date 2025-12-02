-- Add is_admin column to profiles
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;

COMMENT ON COLUMN profiles.is_admin IS 'Indicates if the user has admin privileges';

-- Set @Madhur as admin and verified
UPDATE profiles
SET is_admin = TRUE, is_verified = TRUE
WHERE username ILIKE 'madhur';
