-- Create Groups Table
CREATE TABLE IF NOT EXISTS public.groups (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    avatar_url TEXT,
    created_by UUID REFERENCES auth.users(id) NOT NULL,
    is_public BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create Group Members Table
CREATE TABLE IF NOT EXISTS public.group_members (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    group_id UUID REFERENCES public.groups(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role TEXT DEFAULT 'member' CHECK (role IN ('admin', 'member')),
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(group_id, user_id)
);

-- Modify Messages Table to support groups
ALTER TABLE public.messages 
ADD COLUMN IF NOT EXISTS group_id UUID REFERENCES public.groups(id) ON DELETE CASCADE;

-- Enable RLS
ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_members ENABLE ROW LEVEL SECURITY;

-- Policies for Groups
CREATE POLICY "Public groups are viewable by everyone" ON public.groups
    FOR SELECT USING (is_public = true);

CREATE POLICY "Members can view their private groups" ON public.groups
    FOR SELECT USING (
        auth.uid() IN (SELECT user_id FROM public.group_members WHERE group_id = id)
    );

CREATE POLICY "Authenticated users can create groups" ON public.groups
    FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Admins can update groups" ON public.groups
    FOR UPDATE USING (
        auth.uid() IN (SELECT user_id FROM public.group_members WHERE group_id = id AND role = 'admin')
    );

-- Policies for Group Members
CREATE POLICY "Members can view other members in their groups" ON public.group_members
    FOR SELECT USING (
        group_id IN (
            SELECT group_id FROM public.group_members WHERE user_id = auth.uid()
        )
        OR 
        group_id IN (SELECT id FROM public.groups WHERE is_public = true)
    );

CREATE POLICY "Admins can add members" ON public.group_members
    FOR INSERT WITH CHECK (
        auth.uid() IN (SELECT user_id FROM public.group_members WHERE group_id = group_id AND role = 'admin')
        OR
        -- Allow users to join public groups themselves
        (auth.uid() = user_id AND group_id IN (SELECT id FROM public.groups WHERE is_public = true))
    );

CREATE POLICY "Admins can remove members" ON public.group_members
    FOR DELETE USING (
        auth.uid() IN (SELECT user_id FROM public.group_members WHERE group_id = group_id AND role = 'admin')
        OR
        auth.uid() = user_id -- Users can leave groups
    );

-- Update Messages Policy to include group messages
-- Note: You might need to drop existing policy if it conflicts or amend it. 
-- Assuming a generic "Users can view messages they are part of" policy exists.
-- We'll add a specific one for groups.

CREATE POLICY "Group members can view group messages" ON public.messages
    FOR SELECT USING (
        group_id IS NOT NULL AND
        group_id IN (SELECT group_id FROM public.group_members WHERE user_id = auth.uid())
    );

CREATE POLICY "Group members can send group messages" ON public.messages
    FOR INSERT WITH CHECK (
        group_id IS NOT NULL AND
        group_id IN (SELECT group_id FROM public.group_members WHERE user_id = auth.uid())
    );
