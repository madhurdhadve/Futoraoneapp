-- Update notifications table to support different notification types
ALTER TABLE notifications 
ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'like',
ADD COLUMN IF NOT EXISTS actor_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS is_read BOOLEAN DEFAULT false;

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(user_id, is_read);
