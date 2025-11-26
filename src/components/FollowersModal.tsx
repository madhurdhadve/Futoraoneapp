import { useState, useEffect } from "react";
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

export const FollowersModal = ({
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

    useEffect(() => {
        if (open) {
            fetchFollowData();
        }
    }, [open, userId]);

    const fetchFollowData = async () => {
        setLoading(true);

        // Fetch followers
        const { data: followersData } = await supabase
            .from("follows")
            .select(`
        follower_id,
        profiles!follows_follower_id_fkey(id, username, full_name, avatar_url)
      `)
            .eq("following_id", userId);

        // Fetch following
        const { data: followingData } = await supabase
            .from("follows")
            .select(`
        following_id,
        profiles!follows_following_id_fkey(id, username, full_name, avatar_url)
      `)
            .eq("follower_id", userId);

        if (followersData) {
            setFollowers(
                followersData
                    .map((f: any) => f.profiles)
                    .filter(Boolean)
            );
        }

        if (followingData) {
            setFollowing(
                followingData
                    .map((f: any) => f.profiles)
                    .filter(Boolean)
            );
        }

        setLoading(false);
    };

    const handleUserClick = (userId: string) => {
        onOpenChange(false);
        navigate(`/user/${userId}`);
    };

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
};
