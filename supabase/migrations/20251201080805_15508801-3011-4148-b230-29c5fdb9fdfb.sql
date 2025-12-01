-- Add foreign key constraints to follows table
ALTER TABLE follows
DROP CONSTRAINT IF EXISTS follows_follower_id_fkey;

ALTER TABLE follows
DROP CONSTRAINT IF EXISTS follows_following_id_fkey;

ALTER TABLE follows
ADD CONSTRAINT follows_follower_id_fkey 
FOREIGN KEY (follower_id) 
REFERENCES profiles(id) 
ON DELETE CASCADE;

ALTER TABLE follows
ADD CONSTRAINT follows_following_id_fkey 
FOREIGN KEY (following_id) 
REFERENCES profiles(id) 
ON DELETE CASCADE;