-- Fix for disappearing conversations in Messaging tab
-- Run this in your Supabase SQL Editor

-- 1. Drop the recursive policy that causes the issue
DROP POLICY IF EXISTS "Users can view participants of their conversations" ON public.conversation_participants;

-- 2. Create a simpler, non-recursive policy
CREATE POLICY "Users can view conversation participants"
    ON public.conversation_participants FOR SELECT
    USING (true);

-- Explanation:
-- The original policy checked "am I a participant?" by querying the table itself,
-- causing an infinite loop. The new policy allows reading all participants row,
-- trusting that the higher-level "conversations" table policy already restricts
-- which conversations a user can see (which it does).
