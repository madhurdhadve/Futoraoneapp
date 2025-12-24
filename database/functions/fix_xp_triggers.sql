-- Purpose: Fix XP triggers and achievement check functions.
-- Category: Functions/Triggers
-- Description: This script recreates the functions for awarding XP and checking achievements based on user activity (posts, likes, comments).

-- Function: Check and unlock achievements
CREATE OR REPLACE FUNCTION check_achievements(target_user_id UUID, condition_type_to_check TEXT)
RETURNS VOID AS $$
DECLARE
  current_val INTEGER;
  ach RECORD;
BEGIN
  -- Determine current value based on type
  IF condition_type_to_check = 'posts_count' THEN
    SELECT COUNT(*) INTO current_val FROM posts WHERE user_id = target_user_id;
  ELSIF condition_type_to_check = 'likes_received' THEN
    SELECT COUNT(*) INTO current_val 
    FROM likes l 
    JOIN posts p ON l.post_id = p.id 
    WHERE p.user_id = target_user_id;
  ELSIF condition_type_to_check = 'code_posts' THEN
    SELECT COUNT(*) INTO current_val 
    FROM posts 
    WHERE user_id = target_user_id 
    AND (content ILIKE '%```%' OR content ILIKE '%code%');
  ELSE
    RETURN;
  END IF;

  -- Check all achievements of this type
  FOR ach IN 
    SELECT * FROM achievements WHERE condition_type = condition_type_to_check 
  LOOP
    IF current_val >= ach.condition_value THEN
      -- Try to unlock (UNIQUE constraint on user_id, achievement_id prevents duplicates)
      INSERT INTO user_achievements (user_id, achievement_id)
      VALUES (target_user_id, ach.id)
      ON CONFLICT (user_id, achievement_id) DO NOTHING;
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to award XP safely
CREATE OR REPLACE FUNCTION award_xp(target_user_id UUID, xp_amount INTEGER)
RETURNS VOID AS $$
DECLARE
  current_xp INTEGER;
  new_xp INTEGER;
  new_level INTEGER;
BEGIN
  -- Get current XP
  SELECT xp INTO current_xp FROM profiles WHERE id = target_user_id;
  IF current_xp IS NULL THEN
    current_xp := 0;
  END IF;

  -- Calculate new values
  new_xp := current_xp + xp_amount;
  new_level := (new_xp / 500) + 1; -- Level up every 500 XP

  -- Update profile safely
  UPDATE profiles
  SET 
    xp = new_xp,
    level = new_level,
    updated_at = NOW()
  WHERE id = target_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger: Award XP for Posts (First post = 50 XP, others = 10 XP)
CREATE OR REPLACE FUNCTION handle_new_post_xp()
RETURNS TRIGGER AS $$
DECLARE
  posts_today INTEGER;
  xp_to_award INTEGER;
BEGIN
  -- Check how many posts this user made today
  SELECT COUNT(*) INTO posts_today
  FROM posts
  WHERE user_id = NEW.user_id
  AND created_at >= CURRENT_DATE;

  IF posts_today = 1 THEN
    xp_to_award := 50; -- First Post of the Day
  ELSE
    xp_to_award := 10; -- Regular Post
  END IF;

  -- Extra XP for Code Snippets (match 100 XP total for first snippet)
  IF NEW.content ILIKE '%```%' OR NEW.content ILIKE '%code%' THEN
    xp_to_award := xp_to_award + 50;
  END IF;

  PERFORM award_xp(NEW.user_id, xp_to_award);
  
  -- Achievement Checks
  PERFORM check_achievements(NEW.user_id, 'posts_count');
  IF NEW.content ILIKE '%```%' OR NEW.content ILIKE '%code%' THEN
    PERFORM check_achievements(NEW.user_id, 'code_posts');
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_post_created_xp ON posts;
CREATE TRIGGER on_post_created_xp
AFTER INSERT ON posts
FOR EACH ROW
EXECUTE FUNCTION handle_new_post_xp();

-- Trigger: Award XP for Comments (20 XP)
CREATE OR REPLACE FUNCTION handle_new_comment_xp()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM award_xp(NEW.user_id, 20);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_comment_created_xp ON comments;
CREATE TRIGGER on_comment_created_xp
AFTER INSERT ON comments
FOR EACH ROW
EXECUTE FUNCTION handle_new_comment_xp();

-- Trigger: Award XP for Likes (5 XP)
CREATE OR REPLACE FUNCTION handle_new_like_xp()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM award_xp(NEW.user_id, 5);
  
  -- Check for likes_received achievement for the POST AUTHOR
  -- Need to find post author first
  DECLARE
    post_author_id UUID;
  BEGIN
    SELECT user_id INTO post_author_id FROM posts WHERE id = NEW.post_id;
    IF post_author_id IS NOT NULL THEN
      PERFORM check_achievements(post_author_id, 'likes_received');
    END IF;
  END;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_like_created_xp ON likes;
CREATE TRIGGER on_like_created_xp
AFTER INSERT ON likes
FOR EACH ROW
EXECUTE FUNCTION handle_new_like_xp();

-- BACKFILL: Check all achievements for all users right now
DO $$
DECLARE
  u RECORD;
BEGIN
  FOR u IN SELECT id FROM profiles LOOP
    PERFORM check_achievements(u.id, 'posts_count');
    PERFORM check_achievements(u.id, 'likes_received');
    PERFORM check_achievements(u.id, 'code_posts');
  END LOOP;
END;
$$;
