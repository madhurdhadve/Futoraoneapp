-- Add theme_color column to profiles if it doesn't exist
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS theme_color TEXT;

-- Update 'sanu' to be a creator and have a baby pink theme
UPDATE profiles
SET 
    verification_category = 'creator',
    theme_color = '#ffb7b2', -- Baby pink hex
    is_verified = true
WHERE username = 'sanu';
