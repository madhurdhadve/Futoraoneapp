import { useEffect, useState, useRef } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { Send, ArrowLeft, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";

interface Message {
    id: string;
    content: string;
    sender_id: string;
    created_at: string;
    sender_name?: string;
    sender_avatar?: string;
}

interface Group {
    id: string;
    name: string;
    description: string;
    avatar_url: string | null;
}

export function GroupChatWindow({ groupId, currentUserId }: { groupId: string; currentUserId: string }) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState("");
    const [group, setGroup] = useState<Group | null>(null);
    const scrollRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();
    const { toast } = useToast();

    useEffect(() => {
        fetchGroupDetails();
        fetchMessages();

        const channel = supabase
            .channel(`group:${groupId}`)
            .on(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'messages', filter: `group_id=eq.${groupId}` },
                async (payload) => {
                    const newMsg = payload.new as Message;
                    // Fetch sender details for the new message
                    const { data: sender } = await supabase.from('profiles').select('full_name, avatar_url').eq('id', newMsg.sender_id).single();
                    if (sender) {
                        newMsg.sender_name = sender.full_name;
                        newMsg.sender_avatar = sender.avatar_url;
                    }
                    setMessages((prev) => [...prev, newMsg]);
                    scrollToBottom();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [groupId]);

    const fetchGroupDetails = async () => {
        const { data, error } = await supabase.from('groups').select('*').eq('id', groupId).single();
        if (data) setGroup(data);
        if (error) console.error("Error fetching group:", error);
    };

    const fetchMessages = async () => {
        const { data, error } = await supabase
            .from('messages')
            .select('*, profiles:sender_id(full_name, avatar_url)')
            .eq('group_id', groupId)
            .order('created_at', { ascending: true });

        if (data) {
            const formattedMessages = data.map((msg: any) => ({
                ...msg,
                sender_name: msg.profiles?.full_name,
                sender_avatar: msg.profiles?.avatar_url
            }));
            setMessages(formattedMessages);
            scrollToBottom();
        }
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

        const { error } = await supabase.from('messages').insert({
            group_id: groupId,
            sender_id: currentUserId,
            content: newMessage.trim(),
        });

        if (error) {
            toast({
                title: "Failed to send",
                description: error.message,
                variant: "destructive"
            });
        } else {
            setNewMessage("");
        }
    };

    return (
        <div className="flex flex-col h-[calc(100vh-0rem)] bg-background">
            {/* Header */}
            <div className="flex items-center p-4 border-b bg-card z-10 sticky top-0">
                <Button variant="ghost" size="icon" className="mr-2" onClick={() => navigate('/messages')}>
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <div className="flex items-center gap-3">
                    <Avatar>
                        <AvatarImage src={group?.avatar_url || undefined} />
                        <AvatarFallback><Users className="h-5 w-5" /></AvatarFallback>
                    </Avatar>
                    <div>
                        <h3 className="font-semibold">{group?.name || "Group Chat"}</h3>
                        <p className="text-xs text-muted-foreground">{group?.description || "Community Group"}</p>
                    </div>
                </div>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4 bg-muted/10">
                <div className="space-y-4 pb-4">
                    {messages.map((msg, index) => {
                        const isMe = msg.sender_id === currentUserId;
                        const showAvatar = !isMe && (index === 0 || messages[index - 1].sender_id !== msg.sender_id);

                        return (
                            <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'} mb-1`}>
                                {!isMe && (
                                    <div className="w-8 mr-2 flex-shrink-0">
                                        {showAvatar && (
                                            <Avatar className="h-8 w-8">
                                                <AvatarImage src={msg.sender_avatar} />
                                                <AvatarFallback>?</AvatarFallback>
                                            </Avatar>
                                        )}
                                    </div>
                                )}
                                <div className={`max-w-[70%] rounded-2xl px-4 py-2 ${isMe ? 'bg-primary text-primary-foreground rounded-tr-sm' : 'bg-card border rounded-tl-sm'}`}>
                                    {!isMe && showAvatar && <p className="text-[10px] text-muted-foreground mb-1">{msg.sender_name}</p>}
                                    <p className="text-sm">{msg.content}</p>
                                    <div className={`text-[10px] text-right mt-1 opacity-70`}>
                                        {format(new Date(msg.created_at), 'HH:mm')}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                    <div ref={scrollRef} />
                </div>
            </ScrollArea>

            {/* Input */}
            <form onSubmit={handleSend} className="p-4 border-t bg-card flex gap-2 w-full">
                <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Message..."
                    className="flex-1 rounded-full"
                />
                <Button type="submit" size="icon" className="rounded-full h-10 w-10 shrink-0" disabled={!newMessage.trim()}>
                    <Send className="h-4 w-4" />
                </Button>
            </form>
        </div>
    );
}
