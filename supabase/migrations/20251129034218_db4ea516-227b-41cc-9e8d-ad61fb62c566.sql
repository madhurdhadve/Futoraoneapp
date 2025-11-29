-- Add banner_url column to profiles table if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'profiles' 
    AND column_name = 'banner_url'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN banner_url text;
  END IF;
END $$;

-- Create tables for new features

-- Story Highlights table
CREATE TABLE IF NOT EXISTS public.story_highlights (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  cover_image_url text,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Story Highlight Items (stories added to highlights)
CREATE TABLE IF NOT EXISTS public.story_highlight_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  highlight_id uuid REFERENCES public.story_highlights(id) ON DELETE CASCADE NOT NULL,
  story_id uuid REFERENCES public.stories(id) ON DELETE CASCADE NOT NULL,
  added_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE(highlight_id, story_id)
);

-- Saved Collections table
CREATE TABLE IF NOT EXISTS public.saved_collections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  description text,
  is_private boolean DEFAULT false NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Collection Items (posts in collections)
CREATE TABLE IF NOT EXISTS public.collection_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  collection_id uuid REFERENCES public.saved_collections(id) ON DELETE CASCADE NOT NULL,
  post_id uuid REFERENCES public.posts(id) ON DELETE CASCADE NOT NULL,
  added_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE(collection_id, post_id)
);

-- User Recommendations/Suggestions table
CREATE TABLE IF NOT EXISTS public.user_recommendations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  recommended_user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  score integer DEFAULT 0,
  reason text,
  created_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE(user_id, recommended_user_id)
);

-- Video Calls table
CREATE TABLE IF NOT EXISTS public.video_calls (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  caller_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  callee_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  status text DEFAULT 'pending' NOT NULL CHECK (status IN ('pending', 'accepted', 'rejected', 'ended', 'missed')),
  started_at timestamptz DEFAULT now() NOT NULL,
  ended_at timestamptz,
  duration_seconds integer
);

-- Enable RLS on all new tables
ALTER TABLE public.story_highlights ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.story_highlight_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collection_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.video_calls ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Story Highlights
CREATE POLICY "Users can view their own highlights"
  ON public.story_highlights FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view highlights of users they follow"
  ON public.story_highlights FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.follows
      WHERE follower_id = auth.uid() AND following_id = user_id
    )
  );

CREATE POLICY "Users can create their own highlights"
  ON public.story_highlights FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own highlights"
  ON public.story_highlights FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own highlights"
  ON public.story_highlights FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for Story Highlight Items
CREATE POLICY "Users can view highlight items"
  ON public.story_highlight_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.story_highlights
      WHERE id = highlight_id AND (user_id = auth.uid() OR EXISTS (
        SELECT 1 FROM public.follows WHERE follower_id = auth.uid() AND following_id = user_id
      ))
    )
  );

CREATE POLICY "Users can add items to their highlights"
  ON public.story_highlight_items FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.story_highlights
      WHERE id = highlight_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can remove items from their highlights"
  ON public.story_highlight_items FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.story_highlights
      WHERE id = highlight_id AND user_id = auth.uid()
    )
  );

-- RLS Policies for Saved Collections
CREATE POLICY "Users can view their own collections"
  ON public.saved_collections FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view public collections"
  ON public.saved_collections FOR SELECT
  USING (is_private = false);

CREATE POLICY "Users can create their own collections"
  ON public.saved_collections FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own collections"
  ON public.saved_collections FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own collections"
  ON public.saved_collections FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for Collection Items
CREATE POLICY "Users can view items in their collections"
  ON public.collection_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.saved_collections
      WHERE id = collection_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can view items in public collections"
  ON public.collection_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.saved_collections
      WHERE id = collection_id AND is_private = false
    )
  );

CREATE POLICY "Users can add items to their collections"
  ON public.collection_items FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.saved_collections
      WHERE id = collection_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can remove items from their collections"
  ON public.collection_items FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.saved_collections
      WHERE id = collection_id AND user_id = auth.uid()
    )
  );

-- RLS Policies for User Recommendations
CREATE POLICY "Users can view their own recommendations"
  ON public.user_recommendations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System can create recommendations"
  ON public.user_recommendations FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can delete their recommendations"
  ON public.user_recommendations FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for Video Calls
CREATE POLICY "Users can view their own calls"
  ON public.video_calls FOR SELECT
  USING (auth.uid() = caller_id OR auth.uid() = callee_id);

CREATE POLICY "Users can create calls"
  ON public.video_calls FOR INSERT
  WITH CHECK (auth.uid() = caller_id);

CREATE POLICY "Users can update their calls"
  ON public.video_calls FOR UPDATE
  USING (auth.uid() = caller_id OR auth.uid() = callee_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_story_highlights_user_id ON public.story_highlights(user_id);
CREATE INDEX IF NOT EXISTS idx_story_highlight_items_highlight_id ON public.story_highlight_items(highlight_id);
CREATE INDEX IF NOT EXISTS idx_saved_collections_user_id ON public.saved_collections(user_id);
CREATE INDEX IF NOT EXISTS idx_collection_items_collection_id ON public.collection_items(collection_id);
CREATE INDEX IF NOT EXISTS idx_user_recommendations_user_id ON public.user_recommendations(user_id);
CREATE INDEX IF NOT EXISTS idx_video_calls_caller_id ON public.video_calls(caller_id);
CREATE INDEX IF NOT EXISTS idx_video_calls_callee_id ON public.video_calls(callee_id);

-- Trigger for updated_at on saved_collections
CREATE TRIGGER update_saved_collections_updated_at
  BEFORE UPDATE ON public.saved_collections
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();