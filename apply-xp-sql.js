import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

const sql = `
-- Gamification Functions (XP & Leveling)
CREATE OR REPLACE FUNCTION public.calculate_level(xp INTEGER)
RETURNS INTEGER AS $$
BEGIN
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
    
    IF NOT FOUND THEN 
        UPDATE public.profiles SET xp = 0, level = 1 WHERE id = user_id;
        current_xp := 0;
        current_level := 1;
    END IF;
    
    new_xp := COALESCE(current_xp, 0) + amount;
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
    SELECT user_id INTO post_author_id FROM public.posts WHERE id = NEW.post_id;
    
    IF post_author_id IS NOT NULL AND post_author_id != NEW.user_id THEN
        PERFORM public.give_xp(post_author_id, 10);
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_like_received_xp ON public.likes;
CREATE TRIGGER on_like_received_xp
    AFTER INSERT ON public.likes
    FOR EACH ROW
    EXECUTE FUNCTION public.trigger_xp_received_like();
`;

async function applySql() {
    console.log('Applying XP Logic SQL...');
    const { error } = await supabase.rpc('exec_sql', { query: sql });
    if (error) {
        console.error('Error applying SQL:', error);
    } else {
        console.log('SQL applied successfully!');
    }
}

applySql();
