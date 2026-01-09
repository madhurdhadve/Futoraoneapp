import { memo } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { VerifiedBadge } from "@/components/VerifiedBadge";
import { formatDistanceToNow } from "date-fns";
import { MessageCircle } from "lucide-react"; // Fallback icon

interface ConversationItemProps {
    id: string;
    participant: {
        username: string;
        full_name: string;
        avatar_url: string | null;
        is_verified?: boolean | null;
    };
    lastMessage?: {
        content: string;
        created_at: string;
        sender_id: string;
        read_at: string | null;
    };
    currentUserId: string;
    onClick: () => void;
}

export const ConversationItem = memo(({ id, participant, lastMessage, currentUserId, onClick }: ConversationItemProps) => {
    return (
        <div
            onClick={onClick}
            className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
        >
            <Avatar>
                <AvatarImage src={participant?.avatar_url || undefined} />
                <AvatarFallback>{participant?.username?.[0]}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
                <div className="flex justify-between items-baseline">
                    <h3 className="font-semibold truncate flex items-center gap-1">
                        {participant?.full_name || participant?.username}
                        <VerifiedBadge isVerified={participant?.is_verified} size={14} />
                    </h3>
                    {lastMessage && (
                        <span className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(lastMessage.created_at), { addSuffix: true })}
                        </span>
                    )}
                </div>
                {lastMessage && (
                    <p className={`text-sm truncate ${!lastMessage.read_at && lastMessage.sender_id !== currentUserId ? 'font-bold text-foreground' : 'text-muted-foreground'}`}>
                        {lastMessage.sender_id === currentUserId ? 'You: ' : ''}{lastMessage.content}
                    </p>
                )}
            </div>
        </div>
    );
});

ConversationItem.displayName = "ConversationItem";
