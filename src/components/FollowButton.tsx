import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { UserPlus, UserMinus } from "lucide-react";

interface FollowButtonProps {
    userId: string;
    currentUserId: string | undefined;
    onFollowChange?: () => void;
}

export const FollowButton = ({ userId, currentUserId, onFollowChange }: FollowButtonProps) => {
    const [isFollowing, setIsFollowing] = useState(false);
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        checkFollowStatus();
    }, [userId, currentUserId]);

    const checkFollowStatus = async () => {
        if (!currentUserId) return;

        const { data } = await supabase
            .from("follows")
            .select("id")
            .eq("follower_id", currentUserId)
            .eq("following_id", userId)
            .single();

        setIsFollowing(!!data);
    };

    const handleFollow = async () => {
        if (!currentUserId) {
            toast({
                title: "Error",
                description: "You must be logged in to follow users",
                variant: "destructive",
            });
            return;
        }

        setLoading(true);

        try {
            if (isFollowing) {
                // Unfollow
                await supabase
                    .from("follows")
                    .delete()
                    .eq("follower_id", currentUserId)
                    .eq("following_id", userId);

                setIsFollowing(false);
                toast({
                    title: "Unfollowed",
                    description: "You have unfollowed this user",
                });
            } else {
                // Follow
                await supabase.from("follows").insert({
                    follower_id: currentUserId,
                    following_id: userId,
                });

                // Create notification
                await supabase.from("notifications").insert({
                    user_id: userId,
                    type: "follow",
                    actor_id: currentUserId,
                    is_read: false,
                });

                setIsFollowing(true);
                toast({
                    title: "Following",
                    description: "You are now following this user",
                });
            }

            onFollowChange?.();
        } catch (error) {
            toast({
                title: "Error",
                description: (error as Error).message,
                variant: "destructive",
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
            onClick={handleFollow}
            disabled={loading}
            variant={isFollowing ? "outline" : "default"}
            className={isFollowing ? "" : "gradient-primary text-white"}
            size="sm"
        >
            {isFollowing ? (
                <>
                    <UserMinus className="w-4 h-4 mr-2" />
                    Unfollow
                </>
            ) : (
                <>
                    <UserPlus className="w-4 h-4 mr-2" />
                    Follow
                </>
            )}
        </Button>
    );
};
