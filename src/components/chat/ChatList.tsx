import { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import { formatDistanceToNow } from "date-fns";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { UserSearchDialog } from "./UserSearchDialog";
import { VerifiedBadge } from "@/components/VerifiedBadge";
import { ConversationItem } from "./ConversationItem";

interface Profile {
    id: string;
    username: string;
    full_name: string;
    avatar_url: string | null;
    is_verified?: boolean | null;
}

interface Conversation {
    id: string;
    updated_at: string;
    participants: Profile[];
    last_message?: {
        content: string;
        created_at: string;
        sender_id: string;
        read_at: string | null;
    };
}

export function ChatList({ currentUserId }: { currentUserId: string }) {
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [searchOpen, setSearchOpen] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        fetchConversations();

        const channel = supabase
            .channel('public:conversations')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'conversations' },
                () => {
                    fetchConversations();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [currentUserId]);

    const fetchConversations = async () => {
        if (!currentUserId) return;

        const { data: participations, error } = await supabase
            .from('conversation_participants')
            .select('conversation_id')
            .eq('user_id', currentUserId);

        if (error || !participations) return;

        const conversationIds = participations.map(p => p.conversation_id);

        if (conversationIds.length === 0) {
            setConversations([]);
            return;
        }

        const { data: conversationsData, error: convError } = await supabase
            .from('conversations')
            .select(`
        id,
        updated_at,
        conversation_participants (
          user:profiles (
            id,
            username,
            full_name,
            avatar_url,
            is_verified
          )
        )
      `)
            .in('id', conversationIds)
            .order('updated_at', { ascending: false });

        if (convError) return;

        // Fetch last message for each conversation
        const conversationsWithMessages = await Promise.all(conversationsData.map(async (conv: any) => {
            const { data: messages } = await supabase
                .from('messages')
                .select('content, created_at, sender_id, read_at')
                .eq('conversation_id', conv.id)
                .order('created_at', { ascending: false })
                .limit(1)
                .single();

            // Filter out current user from participants to show the "other" person
            const otherParticipants = conv.conversation_participants
                .map((p: any) => p.user)
                .filter((u: any) => u.id !== currentUserId);

            return {
                id: conv.id,
                updated_at: conv.updated_at,
                participants: otherParticipants,
                last_message: messages ? {
                    content: messages.content,
                    created_at: messages.created_at,
                    sender_id: messages.sender_id,
                    read_at: messages.read_at
                } : undefined,
            };
        }));

        setConversations(conversationsWithMessages);
    };

    return (
        <div className="flex flex-col space-y-2 p-4">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">Messages</h2>
                <Button size="icon" variant="ghost" onClick={() => setSearchOpen(true)}>
                    <Plus className="h-5 w-5" />
                </Button>
            </div>

            <UserSearchDialog
                open={searchOpen}
                onOpenChange={setSearchOpen}
                currentUserId={currentUserId}
            />

            {conversations.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No conversations yet.</p>
            ) : (
                conversations.map((conv) => (
                    <ConversationItem
                        key={conv.id}
                        id={conv.id}
                        participant={conv.participants[0]}
                        lastMessage={conv.last_message}
                        currentUserId={currentUserId}
                        onClick={() => navigate(`/messages/${conv.id}`)}
                    />
                ))
            )}
        </div>
    );
}
