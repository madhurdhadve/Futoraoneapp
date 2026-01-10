import { useEffect, useState, useRef, useCallback, useMemo, memo } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { Send, ArrowLeft, Check, CheckCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { MessageBubble } from "@/components/chat/MessageBubble";

interface Message {
    id: string;
    content: string;
    sender_id: string;
    created_at: string;
    read_at: string | null;
}

interface Profile {
    id: string;
    username: string;
    full_name: string;
    avatar_url: string | null;
}

export const ChatWindow = memo(({ conversationId, currentUserId }: { conversationId: string; currentUserId: string }) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState("");
    const [otherUser, setOtherUser] = useState<Profile | null>(null);
    const [isTyping, setIsTyping] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();
    const { toast } = useToast();

    const [isBlocked, setIsBlocked] = useState(false);

    const markAsRead = useCallback(async (messageId: string) => {
        // Update message read status
        await supabase
            .from('messages')
            .update({ read_at: new Date().toISOString() })
            .eq('id', messageId);

        // Update conversation participant last_read_at
        await supabase
            .from('conversation_participants')
            .update({ last_read_at: new Date().toISOString() })
            .eq('conversation_id', conversationId)
            .eq('user_id', currentUserId);
    }, [conversationId, currentUserId]);

    const scrollToBottom = useCallback(() => {
        setTimeout(() => {
            if (scrollRef.current) {
                scrollRef.current.scrollIntoView({ behavior: 'smooth' });
            }
        }, 100);
    }, []);

    const fetchOtherUser = useCallback(async () => {
        const { data } = await supabase
            .from('conversation_participants')
            .select('user:profiles(*)')
            .eq('conversation_id', conversationId)
            .neq('user_id', currentUserId)
            .single();

        if (data) {
            setOtherUser(data.user as unknown as Profile);
        }
    }, [conversationId, currentUserId]);

    const fetchMessages = useCallback(async () => {
        const { data } = await supabase
            .from('messages')
            .select('*')
            .eq('conversation_id', conversationId)
            .order('created_at', { ascending: true });

        if (data) {
            setMessages(data as Message[]);
            // Mark unread messages as read
            const unreadMessages = data.filter(m => m.sender_id !== currentUserId && !m.read_at);
            unreadMessages.forEach(m => markAsRead(m.id));
            scrollToBottom();
        }
    }, [conversationId, currentUserId, markAsRead, scrollToBottom]);

    const checkBlocks = useCallback(async () => {
        if (!otherUser) return;

        const { data: block1 } = await supabase
            .from('blocks')
            .select('*')
            .eq('blocker_id', currentUserId)
            .eq('blocked_id', otherUser.id)
            .single();

        const { data: block2 } = await supabase
            .from('blocks')
            .select('*')
            .eq('blocker_id', otherUser.id)
            .eq('blocked_id', currentUserId)
            .single();

        if (block1 || block2) {
            setIsBlocked(true);
        }
    }, [currentUserId, otherUser]);

    useEffect(() => {
        fetchMessages();
        fetchOtherUser();

        const channel = supabase
            .channel(`conversation:${conversationId}`)
            .on(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'messages', filter: `conversation_id=eq.${conversationId}` },
                (payload) => {
                    const newMsg = payload.new as Message;
                    setMessages((prev) => [...prev, newMsg]);
                    if (newMsg.sender_id !== currentUserId) {
                        markAsRead(newMsg.id);
                    }
                    scrollToBottom();
                }
            )
            .on(
                'postgres_changes',
                { event: 'UPDATE', schema: 'public', table: 'messages', filter: `conversation_id=eq.${conversationId}` },
                (payload) => {
                    setMessages((prev) => prev.map(msg => msg.id === payload.new.id ? payload.new as Message : msg));
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [conversationId, currentUserId, fetchMessages, fetchOtherUser, markAsRead, scrollToBottom]);

    useEffect(() => {
        if (otherUser) {
            checkBlocks();
        }
    }, [otherUser, checkBlocks]);

    const handleSend = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || isBlocked) return;

        const messageContent = newMessage.trim();
        setNewMessage("");

        const { error } = await supabase.from('messages').insert({
            conversation_id: conversationId,
            sender_id: currentUserId,
            content: messageContent,
        });

        if (error) {
            console.error('Error sending message:', error);
            setNewMessage(messageContent); // Restore on error
            toast({
                title: "Failed to send message",
                description: error.message || "Please check if the conversation exists and you have permission to send messages.",
                variant: "destructive"
            });
        } else {
            // Update conversation updated_at
            await supabase.from('conversations').update({ updated_at: new Date().toISOString() }).eq('id', conversationId);
        }
    }, [conversationId, currentUserId, isBlocked, newMessage, toast]);

    const renderedMessages = useMemo(() => (
        messages.map((msg) => (
            <MessageBubble
                key={msg.id}
                content={msg.content}
                createdAt={msg.created_at}
                isMe={msg.sender_id === currentUserId}
                readAt={msg.read_at}
            />
        ))
    ), [messages, currentUserId]);

    return (
        <div className="flex flex-col h-[calc(100vh-4rem)] md:h-[600px] bg-background">
            {/* Header */}
            <div className="flex items-center p-4 border-b">
                <Button variant="ghost" size="icon" className="md:hidden mr-2" onClick={() => navigate('/messages')}>
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                {otherUser && (
                    <div className="flex items-center gap-3">
                        <Avatar>
                            <AvatarImage src={otherUser.avatar_url || undefined} />
                            <AvatarFallback>{otherUser.username[0]}</AvatarFallback>
                        </Avatar>
                        <div>
                            <h3 className="font-semibold">{otherUser.full_name}</h3>
                            <p className="text-xs text-muted-foreground">@{otherUser.username}</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                    {renderedMessages}
                    <div ref={scrollRef} />
                </div>
            </ScrollArea>

            {/* Input */}
            {isBlocked ? (
                <div className="p-4 border-t text-center text-muted-foreground bg-muted/50">
                    You cannot message this user.
                </div>
            ) : (
                <form onSubmit={handleSend} className="p-4 border-t flex gap-2">
                    <Input
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type a message..."
                        className="flex-1"
                    />
                    <Button type="submit" size="icon" disabled={!newMessage.trim()}>
                        <Send className="h-4 w-4" />
                    </Button>
                </form>
            )}
        </div>
    );
});

ChatWindow.displayName = "ChatWindow";
