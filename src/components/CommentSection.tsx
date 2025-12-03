import React, { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Trash2, Send } from "lucide-react";
import type { User } from "@supabase/supabase-js";
import { CommentSkeleton } from "@/components/CommentSkeleton";

interface Comment {
    id: string;
    content: string;
    created_at: string;
    user_id: string;
    profiles: {
        username: string;
        full_name: string;
        avatar_url: string | null;
    };
}

interface CommentSectionProps {
    postId: string;
    postAuthorId: string;
    currentUser: User | null;
}

export const CommentSection = ({ postId, postAuthorId, currentUser }: CommentSectionProps) => {
    const [comments, setComments] = useState<Comment[]>([]);
    const [newComment, setNewComment] = useState("");
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        fetchComments();

        // Subscribe to real-time comments
        const channel = supabase
            .channel(`comments-${postId}`)
            .on(
                "postgres_changes",
                {
                    event: "*",
                    schema: "public",
                    table: "comments",
                    filter: `post_id=eq.${postId}`,
                },
                () => {
                    fetchComments();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [postId]);

    const [isFetching, setIsFetching] = useState(true);

    const fetchComments = useCallback(async () => {
        setIsFetching(true);
        const { data, error } = await supabase
            .from("comments")
            .select(`
        *,
        profiles(username, full_name, avatar_url)
      `)
            .eq("post_id", postId)
            .order("created_at", { ascending: true });

        if (!error && data) {
            setComments(data as unknown as Comment[]);
        }
        setIsFetching(false);
    }, [postId]);


    const handleSubmitComment = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentUser || !newComment.trim()) return;

        // Optimistic UI: add comment locally
        const tempId = `temp-${Date.now()}`;
        const tempComment: Comment = {
            id: tempId,
            content: newComment.trim(),
            created_at: new Date().toISOString(),
            user_id: currentUser.id,
            profiles: {
                username: currentUser.user_metadata?.username || "",
                full_name: currentUser.user_metadata?.full_name || "",
                avatar_url: currentUser.user_metadata?.avatar_url || null,
            },
        };
        setComments((prev) => [...prev, tempComment]);
        setNewComment("");
        setLoading(true);

        try {
            const { error } = await supabase.from("comments").insert({
                post_id: postId,
                user_id: currentUser.id,
                content: tempComment.content,
            });

            if (error) throw error;

            // Refresh comments from server to get real IDs and timestamps
            await fetchComments();
            toast({
                title: "Comment posted",
                description: "Your comment has been added",
            });
        } catch (error) {
            // Revert optimistic comment on error
            setComments((prev) => prev.filter((c) => c.id !== tempId));
            toast({
                title: "Error",
                description: (error as Error).message,
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    }, [currentUser, newComment, postId, fetchComments, toast]);

    const handleDeleteComment = useCallback(async (commentId: string) => {
        try {
            const { error } = await supabase.from("comments").delete().eq("id", commentId);

            if (error) throw error;

            toast({
                title: "Comment deleted",
                description: "Your comment has been removed",
            });
        } catch (error) {
            toast({
                title: "Error",
                description: (error as Error).message,
                variant: "destructive",
            });
        }
    }, [toast]);

    return (
        <div className="space-y-4">
            {/* Comments List */}
            {comments.length > 0 && (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                    {comments.map((comment) => (
                        <Card key={comment.id} className="p-3">
                            <div className="flex items-start gap-3">
                                <Avatar className="h-8 w-8">
                                    <AvatarImage src={comment.profiles.avatar_url || undefined} />
                                    <AvatarFallback>{comment.profiles.username[0]}</AvatarFallback>
                                </Avatar>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="font-semibold text-sm">{comment.profiles.full_name}</p>
                                            <p className="text-xs text-muted-foreground">
                                                @{comment.profiles.username} · {new Date(comment.created_at).toLocaleDateString()}
                                            </p>
                                        </div>
                                        {currentUser?.id === comment.user_id && (
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8"
                                                onClick={() => handleDeleteComment(comment.id)}
                                            >
                                                <Trash2 className="h-4 w-4 text-destructive" />
                                            </Button>
                                        )}
                                    </div>
                                    <p className="text-sm mt-1">{comment.content}</p>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            )}

            {/* Comment Input */}
            {currentUser && (
                <form onSubmit={handleSubmitComment} className="flex gap-2">
                    <Avatar className="h-8 w-8 shrink-0">
                        <AvatarImage src={currentUser.user_metadata?.avatar_url} />
                        <AvatarFallback>{currentUser.user_metadata?.username?.[0] || "U"}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 flex gap-2">
                        <Textarea
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder="Write a comment..."
                            className="min-h-[60px] resize-none"
                            disabled={loading}
                        />
                        <Button
                            type="submit"
                            size="icon"
                            disabled={loading || !newComment.trim()}
                            className="gradient-primary text-white shrink-0"
                        >
                            <Send className="h-4 w-4" />
                        </Button>
                    </div>
                </form>
            )}
        </div>
    );
};

export default React.memo(CommentSection);
