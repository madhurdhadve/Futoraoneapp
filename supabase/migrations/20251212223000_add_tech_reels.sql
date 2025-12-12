-- Create Reels Table
CREATE TABLE IF NOT EXISTS public.reels (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    video_url TEXT NOT NULL,
    thumbnail_url TEXT,
    caption TEXT,
    category TEXT DEFAULT 'Tech',
    likes_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.reels ENABLE ROW LEVEL SECURITY;

-- Policies for Reels Table
CREATE POLICY "Everyone can view reels" ON public.reels
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create reels" ON public.reels
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reels" ON public.reels
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reels" ON public.reels
    FOR DELETE USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX idx_reels_created_at ON public.reels(created_at DESC);
CREATE INDEX idx_reels_category ON public.reels(category);

-- Storage Bucket for Reels (Note: Creation via SQL is limited in some Supabase setups, but we define policies)
-- Assuming 'reels' bucket is created via dashboard or client, but here are policies if it exists

INSERT INTO storage.buckets (id, name, public) 
VALUES ('reels', 'reels', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Reel Videos are publicly accessible" ON storage.objects
  FOR SELECT USING (bucket_id = 'reels');

CREATE POLICY "Authenticated users can upload reel videos" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'reels' AND auth.role() = 'authenticated');

CREATE POLICY "Users can update their own reel videos" ON storage.objects
  FOR UPDATE USING (bucket_id = 'reels' AND auth.uid() = owner);

CREATE POLICY "Users can delete their own reel videos" ON storage.objects
  FOR DELETE USING (bucket_id = 'reels' AND auth.uid() = owner);
