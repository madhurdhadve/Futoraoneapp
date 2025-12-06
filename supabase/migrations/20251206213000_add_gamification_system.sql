-- Add gamification columns to profiles
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS xp INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS level INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS current_streak INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS longest_streak INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_activity_date TIMESTAMPTZ DEFAULT NOW();

-- Create achievements table
CREATE TABLE IF NOT EXISTS achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  icon_name TEXT NOT NULL, -- Name of the Lucide icon or emoji
  xp_reward INTEGER DEFAULT 100,
  condition_type TEXT NOT NULL, -- e.g., 'posts_count', 'likes_received'
  condition_value INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create user_achievements table
CREATE TABLE IF NOT EXISTS user_achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  achievement_id UUID REFERENCES achievements(id) ON DELETE CASCADE,
  unlocked_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, achievement_id)
);

-- Enable RLS
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Achievements are viewable by everyone" ON achievements
  FOR SELECT USING (true);

CREATE POLICY "User achievements are viewable by everyone" ON user_achievements
  FOR SELECT USING (true);

-- Insert some default achievements
INSERT INTO achievements (title, description, icon_name, xp_reward, condition_type, condition_value) VALUES
('First Steps', 'Create your first post', 'Footprints', 50, 'posts_count', 1),
('Regular Contributor', 'Create 10 posts', 'PenTool', 200, 'posts_count', 10),
('Social Butterfly', 'Receive 50 likes', 'Heart', 300, 'likes_received', 50),
('Code Warrior', 'Share 5 code snippets', 'Code', 150, 'code_posts', 5),
('Bug Hunter', 'Report a bug (or fix one)', 'Bug', 500, 'manual', 1),
('Streak Master', 'Login for 7 days in a row', 'Flame', 500, 'streak_days', 7);
