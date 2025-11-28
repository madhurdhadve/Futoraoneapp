import { useEffect, useState, useRef } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { Send, ArrowLeft, Check, CheckCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";

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

export function ChatWindow({ conversationId, currentUserId }: { conversationId: string; currentUserId: string }) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState("");
    const [otherUser, setOtherUser] = useState<Profile | null>(null);
    const [isTyping, setIsTyping] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();
    const { toast } = useToast();

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
    }, [conversationId, currentUserId]);

    const fetchOtherUser = async () => {
        const { data } = await supabase
            .from('conversation_participants')
            .select('user:profiles(*)')
            .eq('conversation_id', conversationId)
            .neq('user_id', currentUserId)
            .single();

        if (data) {
            setOtherUser(data.user as unknown as Profile);
        }
    };

    const fetchMessages = async () => {
        const { data } = await supabase
            .from('messages')
            .select('*')
            .eq('conversation_id', conversationId)
            .order('created_at', { ascending: true });

        if (data) {
            setMessages(data);
            // Mark unread messages as read
            const unreadMessages = data.filter(m => m.sender_id !== currentUserId && !m.read_at);
            unreadMessages.forEach(m => markAsRead(m.id));
            scrollToBottom();
        }
    };

    const markAsRead = async (messageId: string) => {
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
    };

    const scrollToBottom = () => {
        setTimeout(() => {
            if (scrollRef.current) {
                scrollRef.current.scrollIntoView({ behavior: 'smooth' });
            }
        }, 100);
    };

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        console.log('Attempting to send message:', {
            conversation_id: conversationId,
            sender_id: currentUserId,
            content: newMessage.trim()
        });

        const { error } = await supabase.from('messages').insert({
            conversation_id: conversationId,
            sender_id: currentUserId,
            content: newMessage.trim(),
        });

        if (error) {
            console.error('Error sending message:', error);
            toast({
                title: "Failed to send message",
                description: error.message || "Please check if the conversation exists and you have permission to send messages.",
                variant: "destructive"
            });
        } else {
            setNewMessage("");
            // Update conversation updated_at
            await supabase.from('conversations').update({ updated_at: new Date().toISOString() }).eq('id', conversationId);
        }
    };

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
                    {messages.map((msg) => {
                        const isMe = msg.sender_id === currentUserId;
                        return (
                            <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[70%] rounded-lg p-3 ${isMe ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                                    <p>{msg.content}</p>
                                    <div className={`flex items-center justify-end gap-1 mt-1 text-[10px] ${isMe ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                                        <span>{format(new Date(msg.created_at), 'HH:mm')}</span>
                                        {isMe && (
                                            <span>
                                                {msg.read_at ? <CheckCheck className="h-3 w-3" /> : <Check className="h-3 w-3" />}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                    <div ref={scrollRef} />
                </div>
            </ScrollArea>

            {/* Input */}
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
        </div>
    );
}
