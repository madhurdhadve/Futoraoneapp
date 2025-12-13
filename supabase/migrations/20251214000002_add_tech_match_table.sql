-- Create table for Tech Matchess
CREATE TABLE IF NOT EXISTS tech_matches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  liker_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  liked_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'matched', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(liker_id, liked_id)
);

-- Enable RLS
ALTER TABLE tech_matches ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can create matches" ON tech_matches
  FOR INSERT WITH CHECK (auth.uid() = liker_id);

CREATE POLICY "Users can view their own matches" ON tech_matches
  FOR SELECT USING (auth.uid() = liker_id OR auth.uid() = liked_id);

-- Optional: Function to check for mutual match
CREATE OR REPLACE FUNCTION check_mutual_match() RETURNS TRIGGER AS $$
BEGIN
  -- If there is a reverse record (liked_id liked liker_id)
  IF EXISTS (
    SELECT 1 FROM tech_matches 
    WHERE liker_id = NEW.liked_id 
    AND liked_id = NEW.liker_id
  ) THEN
    -- Update both to 'matched'
    UPDATE tech_matches 
    SET status = 'matched' 
    WHERE liker_id = NEW.liked_id AND liked_id = NEW.liker_id;
    
    NEW.status := 'matched';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_match_created
  BEFORE INSERT ON tech_matches
  FOR EACH ROW
  EXECUTE FUNCTION check_mutual_match();
