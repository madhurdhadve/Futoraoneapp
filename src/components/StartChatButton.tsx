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
      // @ts-ignore
      const { data: conversationId, error } = await supabase.rpc('get_or_create_conversation', {
        other_user_id: userId
      });

      if (error) throw error;

      navigate(`/messages/${conversationId}`);
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
