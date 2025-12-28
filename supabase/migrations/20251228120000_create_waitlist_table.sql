-- Create Waitlist Table
CREATE TABLE IF NOT EXISTS public.waitlist (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    email TEXT,
    username TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id)
);

-- RLS for Waitlist
ALTER TABLE public.waitlist ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert themselves into waitlist" ON public.waitlist
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own waitlist status" ON public.waitlist
    FOR SELECT USING (auth.uid() = user_id);

-- Optional: Allow admins to view all (if admin logic exists)
-- CREATE POLICY "Admins can view all waitlist" ON public.waitlist ...
