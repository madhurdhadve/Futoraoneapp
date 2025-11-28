-- Fix infinite recursion in conversation_participants policy
DROP POLICY IF EXISTS "Users can view participants of their conversations" ON public.conversation_participants;

CREATE POLICY "Users can view conversation participants"
  ON public.conversation_participants FOR SELECT
  USING (true);

-- Add one_signal_player_id to profiles for push notifications
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS one_signal_player_id TEXT;

-- Add read_at column to messages table for read receipts
ALTER TABLE public.messages 
ADD COLUMN IF NOT EXISTS read_at TIMESTAMP WITH TIME ZONE;