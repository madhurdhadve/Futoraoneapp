import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useStartChat = () => {
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { toast } = useToast();

    const startChat = async (userId: string, currentUserId: string) => {
        if (!currentUserId || currentUserId === userId) return;

        setLoading(true);

        try {
            // Check if conversation already exists using a more efficient query
            // We want to find a conversation where both users are participants
            // This is still tricky with Supabase simple queries, but we can optimize.

            // First, get all conversation IDs for the current user
            const { data: myConversations } = await supabase
                .from("conversation_participants")
                .select("conversation_id")
                .eq("user_id", currentUserId);

            if (myConversations && myConversations.length > 0) {
                const conversationIds = myConversations.map(c => c.conversation_id);

                // Then check if the target user is in any of these conversations
                const { data: existingConversation } = await supabase
                    .from("conversation_participants")
                    .select("conversation_id")
                    .in("conversation_id", conversationIds)
                    .eq("user_id", userId)
                    .maybeSingle(); // Use maybeSingle instead of loop

                if (existingConversation) {
                    navigate(`/chat/${existingConversation.conversation_id}`);
                    setLoading(false);
                    return;
                }
            }

            // Create new conversation with client-side ID to bypass RLS select restriction
            const newConversationId = crypto.randomUUID();

            const { error: createError } = await supabase
                .from("conversations")
                .insert({ id: newConversationId });

            if (createError) throw createError;

            // Add participants
            const { error: participantsError } = await supabase
                .from("conversation_participants")
                .insert([
                    { conversation_id: newConversationId, user_id: currentUserId },
                    { conversation_id: newConversationId, user_id: userId }
                ]);

            if (participantsError) throw participantsError;

            navigate(`/chat/${newConversationId}`);
        } catch (error) {
            console.error("Error starting chat:", error);
            toast({
                title: "Error",
                description: "Failed to start conversation. Please try again.",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    return { startChat, loading };
};
