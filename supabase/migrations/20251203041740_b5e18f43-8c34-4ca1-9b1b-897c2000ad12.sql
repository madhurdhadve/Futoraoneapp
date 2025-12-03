-- Add digest_mode columns to profiles if they don't exist
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS digest_mode boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS last_digest_at timestamptz;

-- Add performance indexes
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON public.posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_user_id ON public.posts(user_id);
CREATE INDEX IF NOT EXISTS idx_likes_post_id ON public.likes(post_id);
CREATE INDEX IF NOT EXISTS idx_likes_user_id ON public.likes(user_id);
CREATE INDEX IF NOT EXISTS idx_comments_post_id ON public.comments(post_id);
CREATE INDEX IF NOT EXISTS idx_follows_follower_id ON public.follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_follows_following_id ON public.follows(following_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON public.notifications(user_id, is_read);

-- Add constraint to prevent self-following
ALTER TABLE public.follows DROP CONSTRAINT IF EXISTS no_self_follow;
ALTER TABLE public.follows ADD CONSTRAINT no_self_follow CHECK (follower_id != following_id);

-- Add constraint to prevent self-blocking
ALTER TABLE public.blocks DROP CONSTRAINT IF EXISTS no_self_block;
ALTER TABLE public.blocks ADD CONSTRAINT no_self_block CHECK (blocker_id != blocked_id);

-- Add unique constraints to prevent duplicate likes/saves
ALTER TABLE public.likes DROP CONSTRAINT IF EXISTS unique_user_post_like;
ALTER TABLE public.likes ADD CONSTRAINT unique_user_post_like UNIQUE (user_id, post_id);

ALTER TABLE public.saves DROP CONSTRAINT IF EXISTS unique_user_post_save;
ALTER TABLE public.saves ADD CONSTRAINT unique_user_post_save UNIQUE (user_id, post_id);