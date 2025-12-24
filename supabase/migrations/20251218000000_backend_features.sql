-- Migration Purpose: Core backend features implementation.
-- Includes: Topic follows, tag extraction, gamification (XP/Leveling), and achievements system.
-- This is a major update defining several core tables and triggers.
-- Create Topic Follows Table
CREATE TABLE IF NOT EXISTS public.topic_follows (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    topic TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, topic)
);

-- RLS for Topic Follows
ALTER TABLE public.topic_follows ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own topic follows" ON public.topic_follows
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own topic follows" ON public.topic_follows
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own topic follows" ON public.topic_follows
    FOR DELETE USING (auth.uid() = user_id);

-- Modify Posts Table for Categories and Tags
ALTER TABLE public.posts 
ADD COLUMN IF NOT EXISTS category TEXT,
ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';

-- Index for Tags
CREATE INDEX IF NOT EXISTS idx_posts_tags ON public.posts USING GIN (tags);
CREATE INDEX IF NOT EXISTS idx_topic_follows_user_topic ON public.topic_follows(user_id, topic);
CREATE INDEX IF NOT EXISTS idx_follows_mutual ON public.follows(follower_id, following_id);

-- Hashtag Extraction Function and Trigger
CREATE OR REPLACE FUNCTION public.extract_hashtags()
RETURNS TRIGGER AS $$
DECLARE
    found_tags TEXT[];
BEGIN
    -- Extract hashtags using regex
    SELECT ARRAY(SELECT unnest(regexp_matches(NEW.content, '#([A-Za-z0-9_]+)', 'g'))) INTO found_tags;
    
    -- Update tags column (ensure array is compatible)
    -- The regexp_matches returns distinct matches as text array, we need to flatten if needed or just assign
    -- But since regexp_matches with 'g' returns setof text[], we need to be careful.
    -- Simplified approach:
    
    NEW.tags := ARRAY(
        SELECT DISTINCT substring(match[1] from 1)
        FROM regexp_matches(NEW.content, '#([a-zA-Z0-9_]+)', 'g') AS match
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_extract_hashtags ON public.posts;
CREATE TRIGGER trigger_extract_hashtags
    BEFORE INSERT OR UPDATE OF content ON public.posts
    FOR EACH ROW
    EXECUTE FUNCTION public.extract_hashtags();

-- Gamification Functions (XP & Leveling)
-- Ensure columns exist
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS xp INTEGER DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS level INTEGER DEFAULT 1;

CREATE OR REPLACE FUNCTION public.calculate_level(xp INTEGER)
RETURNS INTEGER AS $$
BEGIN
    -- Simple formula: Level = floor(sqrt(xp / 100)) + 1
    -- e.g., 0xp = L1, 100xp = L2, 400xp = L3
    IF xp < 100 THEN RETURN 1; END IF;
    RETURN floor(sqrt(xp::float / 100)) + 1;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public.give_xp(user_id UUID, amount INTEGER)
RETURNS VOID AS $$
DECLARE
    current_xp INTEGER;
    new_xp INTEGER;
    current_level INTEGER;
    new_level INTEGER;
BEGIN
    SELECT xp, level INTO current_xp, current_level FROM public.profiles WHERE id = user_id;
    
    IF NOT FOUND THEN RETURN; END IF;
    
    new_xp := current_xp + amount;
    new_level := public.calculate_level(new_xp);
    
    UPDATE public.profiles 
    SET xp = new_xp, level = new_level
    WHERE id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Triggers for XP
-- 1. New Post (+50 XP)
CREATE OR REPLACE FUNCTION public.trigger_xp_new_post()
RETURNS TRIGGER AS $$
BEGIN
    PERFORM public.give_xp(NEW.user_id, 50);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_post_created_xp ON public.posts;
CREATE TRIGGER on_post_created_xp
    AFTER INSERT ON public.posts
    FOR EACH ROW
    EXECUTE FUNCTION public.trigger_xp_new_post();

-- 2. New Comment (+20 XP)
CREATE OR REPLACE FUNCTION public.trigger_xp_new_comment()
RETURNS TRIGGER AS $$
BEGIN
    PERFORM public.give_xp(NEW.user_id, 20);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_comment_created_xp ON public.comments;
CREATE TRIGGER on_comment_created_xp
    AFTER INSERT ON public.comments
    FOR EACH ROW
    EXECUTE FUNCTION public.trigger_xp_new_comment();

-- 3. Received Like (+10 XP to author)
CREATE OR REPLACE FUNCTION public.trigger_xp_received_like()
RETURNS TRIGGER AS $$
DECLARE
    post_author_id UUID;
BEGIN
    -- Assuming post_reactions table has post_id
    SELECT user_id INTO post_author_id FROM public.posts WHERE id = NEW.post_id;
    
    IF post_author_id IS NOT NULL AND post_author_id != NEW.user_id THEN
        PERFORM public.give_xp(post_author_id, 10);
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Check if post_reactions exists, if not, skip this trigger creation or handle gracefully
-- We assume post_reactions exists from previous migrations.
-- DROP TRIGGER IF EXISTS on_like_received_xp ON public.post_reactions;
-- CREATE TRIGGER on_like_received_xp
--    AFTER INSERT ON public.post_reactions
--    FOR EACH ROW
--    WHEN (NEW.type = 'like')
--    EXECUTE FUNCTION public.trigger_xp_received_like();
-- Note: Commented out to avoid error if table doesn't exist yet, but user prompt implies it does.
-- I will blindly add it but wrap in a DO block if possible? No, standard SQL.
-- I'll assume the table exists as per user context.

DO $$
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'post_reactions') THEN
        DROP TRIGGER IF EXISTS on_like_received_xp ON public.post_reactions;
        CREATE TRIGGER on_like_received_xp
            AFTER INSERT ON public.post_reactions
            FOR EACH ROW
            WHEN (NEW.type = 'like')
            EXECUTE FUNCTION public.trigger_xp_received_like();
    END IF;
END $$;

-- Achievements Table (Ensure exists)
CREATE TABLE IF NOT EXISTS public.achievements (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    icon TEXT,
    criteria JSONB
);

CREATE TABLE IF NOT EXISTS public.user_achievements (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    achievement_id TEXT REFERENCES public.achievements(id),
    unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    UNIQUE(user_id, achievement_id)
);

ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "everyone can view user achievements" ON public.user_achievements
    FOR SELECT USING (true);
    
-- Seed Data
INSERT INTO public.achievements (id, name, description, icon) VALUES
    ('first-post', 'First Post', 'Created your first post', 'pencil'),
    ('50-likes', 'Social Butterfly', 'Received 50 likes in total', 'heart'),
    ('10-comments', 'Commentator', 'Left 10 comments', 'message-circle')
ON CONFLICT (id) DO NOTHING;

-- Achievement Unlock Trigger (Example: First Post)
CREATE OR REPLACE FUNCTION public.check_achievements_post()
RETURNS TRIGGER AS $$
DECLARE
    post_count INTEGER;
BEGIN
    SELECT count(*) INTO post_count FROM public.posts WHERE user_id = NEW.user_id;
    
    IF post_count = 1 THEN
        INSERT INTO public.user_achievements (user_id, achievement_id)
        VALUES (NEW.user_id, 'first-post')
        ON CONFLICT DO NOTHING;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS check_achievements_post_trigger ON public.posts;
CREATE TRIGGER check_achievements_post_trigger
    AFTER INSERT ON public.posts
    FOR EACH ROW
    EXECUTE FUNCTION public.check_achievements_post();
