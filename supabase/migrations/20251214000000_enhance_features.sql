-- Create topic_follows table
CREATE TABLE IF NOT EXISTS topic_follows (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  topic_tag TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, topic_tag)
);

-- Enable RLS
ALTER TABLE topic_follows ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view their own topic follows" ON topic_follows
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own topic follows" ON topic_follows
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own topic follows" ON topic_follows
  FOR DELETE USING (auth.uid() = user_id);

-- Add tags to posts if not exists
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'posts' AND column_name = 'tags') THEN 
        ALTER TABLE posts ADD COLUMN tags TEXT[] DEFAULT '{}';
    END IF;
END $$;
