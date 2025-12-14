import { useState, useEffect, useRef, useCallback, memo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowLeft, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { User } from "@supabase/supabase-js";
import { formatDistanceToNow } from "date-fns";
import { CartoonLoader } from "@/components/CartoonLoader";

interface Message {
  id: string;
  content: string;
  sender_id: string;
  created_at: string;
  is_read: boolean;
  // Make sure to include any other fields used
}

interface OtherUser {
  id: string;
  username: string;
  full_name: string;
  avatar_url: string | null;
}

// Memoized message component to prevent unnecessary re-renders
const MessageBubble = memo(({ message, isOwn }: { message: Message, isOwn: boolean }) => (
  <div className={`flex ${isOwn ? "justify-end" : "justify-start"}`}>
    <div
      className={`max-w-[70%] sm:max-w-[60%] rounded-2xl px-4 py-2 ${isOwn
        ? "bg-primary text-primary-foreground"
        : "bg-muted text-foreground"
        }`}
    >
      <p className="text-sm sm:text-base break-words">{message.content}</p>
      <div className="flex items-center justify-end gap-1 mt-1">
        <p className="text-xs opacity-70">
          {formatDistanceToNow(new Date(message.created_at), {
            addSuffix: true
          })}
        </p>
        {isOwn && message.is_read && (
          <span className="text-xs opacity-70">• Read</span>
        )}
      </div>
    </div>
  </div>
));

MessageBubble.displayName = "MessageBubble";

const Chat = () => {
  const { conversationId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [otherUser, setOtherUser] = useState<OtherUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();
  const lastTypingSentRef = useRef<number>(0);

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (user && conversationId) {
      fetchConversationDetails();
      subscribeToMessages();
      subscribeToTyping();
      markMessagesAsRead();
    }
  }, [user, conversationId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate("/auth");
      return;
    }
    setUser(user);
  };

  const fetchConversationDetails = async () => {
    if (!user || !conversationId) return;

    // Get other participant
    const { data: participants } = await supabase
      .from("conversation_participants")
      .select("user_id, profiles(id, username, full_name, avatar_url)")
      .eq("conversation_id", conversationId)
      .neq("user_id", user.id)
      .single();

    if (participants?.profiles) {
      setOtherUser(participants.profiles as any);
    }

    // Get messages
    const { data: messagesData } = await supabase
      .from("messages")
      .select("*")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true });

    if (messagesData) {
      setMessages(messagesData);
    }

    setLoading(false);
  };

  const subscribeToMessages = () => {
    const channel = supabase
      .channel(`messages-${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`
        },
        (payload) => {
          setMessages(prev => [...prev, payload.new as Message]);
          if (payload.new.sender_id !== user?.id) {
            markMessagesAsRead();
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`
        },
        (payload) => {
          setMessages(prev =>
            prev.map(msg => msg.id === payload.new.id ? payload.new as Message : msg)
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const subscribeToTyping = () => {
    const channel = supabase
      .channel(`typing-${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'typing_indicators',
          filter: `conversation_id=eq.${conversationId}`
        },
        (payload) => {
          const newData = payload.new as any;
          if (newData && newData.user_id !== user?.id) {
            setIsTyping(newData.is_typing);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const markMessagesAsRead = async () => {
    if (!user || !conversationId) return;

    // Update last_read_at for the current user
    await supabase
      .from("conversation_participants")
      .update({ last_read_at: new Date().toISOString() })
      .eq("conversation_id", conversationId)
      .eq("user_id", user.id);

    // Mark unread messages as read
    await supabase
      .from("messages")
      .update({ is_read: true })
      .eq("conversation_id", conversationId)
      .eq("is_read", false)
      .neq("sender_id", user.id);
  };

  const handleTyping = useCallback(async () => {
    if (!user || !conversationId) return;

    // Clear existing timeout to prevent premature "is typing: false"
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    const now = Date.now();
    // Only send "is typing" update if more than 2 seconds have passed since last update
    if (now - lastTypingSentRef.current > 2000) {
      lastTypingSentRef.current = now;
      await supabase
        .from("typing_indicators")
        .upsert({
          conversation_id: conversationId,
          user_id: user.id,
          is_typing: true,
          updated_at: new Date().toISOString()
        });
    }

    // Set timeout to clear typing status
    typingTimeoutRef.current = setTimeout(async () => {
      await supabase
        .from("typing_indicators")
        .upsert({
          conversation_id: conversationId,
          user_id: user.id,
          is_typing: false,
          updated_at: new Date().toISOString()
        });
      lastTypingSentRef.current = 0; // Reset so next type sends immediately
    }, 3000);
  }, [user, conversationId]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user || !conversationId || sending) return;

    setSending(true);

    const { error } = await supabase.from("messages").insert({
      conversation_id: conversationId,
      sender_id: user.id,
      content: newMessage.trim(),
      is_read: false
    });

    // Clear typing indicator
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    await supabase
      .from("typing_indicators")
      .upsert({
        conversation_id: conversationId,
        user_id: user.id,
        is_typing: false,
        updated_at: new Date().toISOString()
      });
    lastTypingSentRef.current = 0;

    if (error) {
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive"
      });
    } else {
      setNewMessage("");
    }

    setSending(false);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  if (loading) {
    return <CartoonLoader />;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-card border-b border-border p-3 sm:p-4">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/messages")}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          {otherUser && (
            <>
              <Avatar
                className="h-10 w-10 cursor-pointer"
                onClick={() => navigate(`/user/${otherUser.id}`)}
              >
                <AvatarImage src={otherUser.avatar_url || undefined} />
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {otherUser.username[0]?.toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div
                className="flex-1 cursor-pointer"
                onClick={() => navigate(`/user/${otherUser.id}`)}
              >
                <p className="font-semibold text-foreground">{otherUser.full_name}</p>
                <p className="text-xs text-muted-foreground">@{otherUser.username}</p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-4">
        {messages.map((message) => (
          <MessageBubble
            key={message.id}
            message={message}
            isOwn={message.sender_id === user?.id}
          />
        ))}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-muted rounded-2xl px-4 py-2">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-foreground rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-2 h-2 bg-foreground rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-2 h-2 bg-foreground rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="sticky bottom-0 bg-card border-t border-border p-3 sm:p-4">
        <form onSubmit={sendMessage} className="flex gap-2">
          <Input
            value={newMessage}
            onChange={(e) => {
              setNewMessage(e.target.value);
              handleTyping();
            }}
            placeholder="Type a message..."
            className="flex-1 bg-background border-border"
          />
          <Button
            type="submit"
            disabled={!newMessage.trim() || sending}
            size="icon"
            className="shrink-0"
          >
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </div>
    </div>
  );
};

export default Chat;
