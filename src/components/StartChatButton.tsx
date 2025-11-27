import { useState } from "react";
import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

interface StartChatButtonProps {
  userId: string;
  currentUserId: string | undefined;
}

export const StartChatButton = ({ userId, currentUserId }: StartChatButtonProps) => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const startChat = async () => {
    if (!currentUserId || currentUserId === userId) return;

    setLoading(true);

    try {
      // Check if conversation already exists
      const { data: existingParticipations } = await supabase
        .from("conversation_participants")
        .select("conversation_id")
        .eq("user_id", currentUserId);

      if (existingParticipations) {
        for (const participation of existingParticipations) {
          const { data: otherParticipant } = await supabase
            .from("conversation_participants")
            .select("user_id")
            .eq("conversation_id", participation.conversation_id)
            .eq("user_id", userId)
            .single();

          if (otherParticipant) {
            // Conversation exists, navigate to it
            navigate(`/chat/${participation.conversation_id}`);
            setLoading(false);
            return;
          }
        }
      }

      // Create new conversation
      const { data: conversation, error: convError } = await supabase
        .from("conversations")
        .insert({})
        .select()
        .single();

      if (convError || !conversation) {
        throw new Error("Failed to create conversation");
      }

      // Add both participants
      const { error: participantsError } = await supabase
        .from("conversation_participants")
        .insert([
          { conversation_id: conversation.id, user_id: currentUserId },
          { conversation_id: conversation.id, user_id: userId }
        ]);

      if (participantsError) {
        throw new Error("Failed to add participants");
      }

      // Navigate to new conversation
      navigate(`/chat/${conversation.id}`);
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to start chat",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (!currentUserId || currentUserId === userId) {
    return null;
  }

  return (
    <Button
      onClick={startChat}
      disabled={loading}
      variant="outline"
      size="sm"
      className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
    >
      <MessageCircle className="w-4 h-4 mr-2" />
      Message
    </Button>
  );
};
