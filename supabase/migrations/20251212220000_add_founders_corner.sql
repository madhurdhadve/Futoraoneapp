-- Create table for Co-Founder Listings
CREATE TABLE public.founder_listings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    role_needed TEXT NOT NULL,
    idea_description TEXT NOT NULL,
    equity_range TEXT NOT NULL,
    stage TEXT NOT NULL,
    industry TEXT NOT NULL,
    location TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.founder_listings ENABLE ROW LEVEL SECURITY;

-- Policies

-- 1. Everyone can view listings
CREATE POLICY "Everyone can view founder listings" 
ON public.founder_listings FOR SELECT 
USING (true);

-- 2. Authenticated users can create listings
CREATE POLICY "Users can create founder listings" 
ON public.founder_listings FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- 3. Users can update their own listings
CREATE POLICY "Users can update own listings" 
ON public.founder_listings FOR UPDATE 
USING (auth.uid() = user_id);

-- 4. Users can delete their own listings
CREATE POLICY "Users can delete own listings" 
ON public.founder_listings FOR DELETE 
USING (auth.uid() = user_id);

-- Add indexes for better performance on common filters
CREATE INDEX idx_founder_listings_created_at ON public.founder_listings(created_at DESC);
CREATE INDEX idx_founder_listings_industry ON public.founder_listings(industry);
CREATE INDEX idx_founder_listings_location ON public.founder_listings(location);

-- Add comments for documentation
COMMENT ON TABLE public.founder_listings IS 'Listings for users looking for co-founders';
