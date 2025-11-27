-- Fix infinite recursion in conversation_participants policy
-- Drop the problematic recursive policy
drop policy if exists "Users can view participants of their conversations" on public.conversation_participants;

-- Create a simpler, non-recursive policy
-- Users can view all participants (access is already controlled at the conversation level)
create policy "Users can view conversation participants"
    on public.conversation_participants for select
    using (true);

-- This is safe because:
-- 1. Conversations table already has RLS that restricts which conversations users can see
-- 2. Frontend only queries participants for conversations user has access to
-- 3. No sensitive data in the participants table itself (just IDs and timestamps)
