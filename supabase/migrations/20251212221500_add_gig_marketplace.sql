-- Create table for Gig Listings
CREATE TABLE public.gig_listings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    price INTEGER NOT NULL,
    currency TEXT DEFAULT 'INR' NOT NULL,
    status TEXT DEFAULT 'open' NOT NULL CHECK (status IN ('open', 'assigned', 'completed')),
    location TEXT DEFAULT 'Remote' NOT NULL,
    skills_required TEXT[] DEFAULT '{}'::TEXT[] NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.gig_listings ENABLE ROW LEVEL SECURITY;

-- Policies

-- 1. Everyone can view gigs
CREATE POLICY "Everyone can view gig listings" 
ON public.gig_listings FOR SELECT 
USING (true);

-- 2. Authenticated users can create gigs
CREATE POLICY "Users can create gig listings" 
ON public.gig_listings FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- 3. Users can update their own gigs
CREATE POLICY "Users can update own gigs" 
ON public.gig_listings FOR UPDATE 
USING (auth.uid() = user_id);

-- 4. Users can delete their own gigs
CREATE POLICY "Users can delete own gigs" 
ON public.gig_listings FOR DELETE 
USING (auth.uid() = user_id);

-- Add indexes for performance
CREATE INDEX idx_gig_listings_created_at ON public.gig_listings(created_at DESC);
CREATE INDEX idx_gig_listings_status ON public.gig_listings(status);
-- Index for array column (GIN index is best for arrays)
CREATE INDEX idx_gig_listings_skills ON public.gig_listings USING GIN (skills_required);

-- Comments
COMMENT ON TABLE public.gig_listings IS 'Marketplace for micro-gigs and freelance tasks';
