-- Create reviews table
CREATE TABLE IF NOT EXISTS public.reviews (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    reviewer_id UUID REFERENCES auth.users(id) NOT NULL,
    reviewee_id UUID REFERENCES auth.users(id) NOT NULL,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5) NOT NULL,
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT reviews_reviewer_reviewee_unique UNIQUE (reviewer_id, reviewee_id)
);

-- Enable RLS
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Reviews are viewable by everyone" ON public.reviews
    FOR SELECT USING (true);

CREATE POLICY "Users can create reviews for others" ON public.reviews
    FOR INSERT WITH CHECK (auth.uid() = reviewer_id AND auth.uid() <> reviewee_id);

CREATE POLICY "Users can update their own reviews" ON public.reviews
    FOR UPDATE USING (auth.uid() = reviewer_id);

-- Function to calculate and update User Trust Score
CREATE OR REPLACE FUNCTION update_trust_score()
RETURNS TRIGGER AS $$
DECLARE
    avg_rating NUMERIC;
    new_score INTEGER;
BEGIN
    -- Calculate average rating for the reviewee
    SELECT AVG(rating) INTO avg_rating
    FROM public.reviews
    WHERE reviewee_id = NEW.reviewee_id;

    -- If no reviews, default to 50, otherwise Average * 20 (max 100)
    IF avg_rating IS NULL THEN
        new_score := 50;
    ELSE
        new_score := ROUND(avg_rating * 20);
    END IF;

    -- Update the profile
    UPDATE public.profiles
    SET trust_score = new_score
    WHERE id = NEW.reviewee_id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger
DROP TRIGGER IF EXISTS on_review_created ON public.reviews;
CREATE TRIGGER on_review_created
    AFTER INSERT OR UPDATE ON public.reviews
    FOR EACH ROW
    EXECUTE FUNCTION update_trust_score();
