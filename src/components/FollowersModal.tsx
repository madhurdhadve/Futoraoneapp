import { useState, useEffect, useCallback, memo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { FollowButton } from "./FollowButton";

interface FollowUser {
    id: string;
    username: string;
    full_name: string;
    avatar_url: string | null;
}

interface FollowersModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    userId: string;
    currentUserId: string | undefined;
    defaultTab?: "followers" | "following";
}

export const FollowersModal = memo(({
    open,
    onOpenChange,
    userId,
    currentUserId,
    defaultTab = "followers",
}: FollowersModalProps) => {
    const [followers, setFollowers] = useState<FollowUser[]>([]);
    const [following, setFollowing] = useState<FollowUser[]>([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const fetchFollowData = useCallback(async () => {
        setLoading(true);

        // Fetch both followers and following in parallel
        const [followersResult, followingResult] = await Promise.all([
            supabase
                .from("follows")
                .select(`
                    follower_id,
                    profiles!follows_follower_id_fkey(id, username, full_name, avatar_url)
                `)
                .eq("following_id", userId),
            supabase
                .from("follows")
                .select(`
                    following_id,
                    profiles!follows_following_id_fkey(id, username, full_name, avatar_url)
                `)
                .eq("follower_id", userId)
        ]);

        if (followersResult.data) {
            setFollowers(
                followersResult.data
                    .map((f: any) => f.profiles)
                    .filter(Boolean)
            );
        }

        if (followingResult.data) {
            setFollowing(
                followingResult.data
                    .map((f: any) => f.profiles)
                    .filter(Boolean)
            );
        }

        setLoading(false);
    }, [userId]);

    useEffect(() => {
        if (open) {
            fetchFollowData();
        }
    }, [open, fetchFollowData]);

    useEffect(() => {
        if (!open || !userId) return;

        // Subscribe to realtime changes for follows
        const channel = supabase
            .channel('follows-changes')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'follows'
                },
                (payload) => {
                    // Only refresh if the change involves the user we're viewing
                    const isRelevant = 
                        (payload.new as any)?.following_id === userId ||
                        (payload.new as any)?.follower_id === userId ||
                        (payload.old as any)?.following_id === userId ||
                        (payload.old as any)?.follower_id === userId;
                    
                    if (isRelevant) {
                        fetchFollowData();
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [open, userId, fetchFollowData]);

    const handleUserClick = useCallback((userId: string) => {
        onOpenChange(false);
        navigate(`/user/${userId}`);
    }, [navigate, onOpenChange]);

    const renderUserList = (users: FollowUser[]) => {
        if (loading) {
            return <p className="text-center text-muted-foreground py-8">Loading...</p>;
        }

        if (users.length === 0) {
            return <p className="text-center text-muted-foreground py-8">No users found</p>;
        }

        return (
            <div className="space-y-3 max-h-96 overflow-y-auto">
                {users.map((user) => (
                    <div
                        key={user.id}
                        className="flex items-center justify-between p-3 hover:bg-muted rounded-lg transition-colors"
                    >
                        <div
                            className="flex items-center gap-3 flex-1 cursor-pointer"
                            onClick={() => handleUserClick(user.id)}
                        >
                            <Avatar className="h-12 w-12">
                                <AvatarImage src={user.avatar_url || undefined} />
                                <AvatarFallback>{user.username[0]?.toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <div>
                                <p className="font-semibold text-foreground">{user.full_name}</p>
                                <p className="text-sm text-muted-foreground">@{user.username}</p>
                            </div>
                        </div>
                        <FollowButton
                            userId={user.id}
                            currentUserId={currentUserId}
                            onFollowChange={fetchFollowData}
                        />
                    </div>
                ))}
            </div>
        );
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Connections</DialogTitle>
                </DialogHeader>
                <Tabs defaultValue={defaultTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="followers">
                            Followers ({followers.length})
                        </TabsTrigger>
                        <TabsTrigger value="following">
                            Following ({following.length})
                        </TabsTrigger>
                    </TabsList>
                    <TabsContent value="followers" className="mt-4">
                        {renderUserList(followers)}
                    </TabsContent>
                    <TabsContent value="following" className="mt-4">
                        {renderUserList(following)}
                    </TabsContent>
                </Tabs>
            </DialogContent>
        </Dialog>
    );
});
