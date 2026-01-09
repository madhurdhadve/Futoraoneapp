import { memo } from "react";
import { format } from "date-fns";
import { Check, CheckCheck } from "lucide-react";

interface MessageBubbleProps {
    content: string;
    createdAt: string;
    isMe: boolean;
    readAt: string | null;
}

export const MessageBubble = memo(({ content, createdAt, isMe, readAt }: MessageBubbleProps) => {
    return (
        <div className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[70%] rounded-lg p-3 ${isMe ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                <p>{content}</p>
                <div className={`flex items-center justify-end gap-1 mt-1 text-[10px] ${isMe ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                    <span>{format(new Date(createdAt), 'HH:mm')}</span>
                    {isMe && (
                        <span>
                            {readAt ? <CheckCheck className="h-3 w-3" /> : <Check className="h-3 w-3" />}
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
}, (prev, next) => {
    return (
        prev.content === next.content &&
        prev.readAt === next.readAt &&
        prev.isMe === next.isMe
    );
});

MessageBubble.displayName = "MessageBubble";
