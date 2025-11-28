import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search, ArrowLeft, Users } from "lucide-react";
import { motion } from "framer-motion";
import { BottomNav } from "@/components/BottomNav";
import { FollowButton } from "@/components/FollowButton";
import { StartChatButton } from "@/components/StartChatButton";
import { OnlineIndicator } from "@/components/OnlineIndicator";
import { supabase } from "@/integrations/supabase/client";
import type { User } from "@supabase/supabase-js";

interface UserProfile {
    id: string;
    username: string;
    full_name: string;
    avatar_url: string | null;
    bio: string | null;
    follower_count?: number;
    following_count?: number;
}

const AllPeople = () => {
    const [searchQuery, setSearchQuery] = useState("");
    const [users, setUsers] = useState<UserProfile[]>([]);
    const [filteredUsers, setFilteredUsers] = useState<UserProfile[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        fetchCurrentUser();
        fetchAllUsers();
    }, []);

    useEffect(() => {
        if (searchQuery.trim()) {
            const filtered = users.filter(
                (user) =>
                    user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    user.full_name.toLowerCase().includes(searchQuery.toLowerCase())
            );
            setFilteredUsers(filtered);
        } else {
            setFilteredUsers(users);
        }
    }, [searchQuery, users]);

    const fetchCurrentUser = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        setCurrentUser(user);
    };

    const fetchAllUsers = async () => {
        setLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();

            const { data, error } = await supabase
                .from("profiles")
                .select("id, username, full_name, avatar_url, bio")
                .neq("id", user?.id || "")
                .order("created_at", { ascending: false });

            if (error) throw error;

            const usersWithCounts = await Promise.all(
                (data || []).map(async (profile) => {
                    const [{ count: followerCount }, { count: followingCount }] = await Promise.all([
                        supabase.from("follows").select("*", { count: "exact", head: true }).eq("following_id", profile.id),
                        supabase.from("follows").select("*", { count: "exact", head: true }).eq("follower_id", profile.id),
                    ]);

                    return {
                        ...profile,
                        follower_count: followerCount || 0,
                        following_count: followingCount || 0,
                    };
                })
            );

            setUsers(usersWithCounts);
            setFilteredUsers(usersWithCounts);
        } catch (error) {
            console.error("Error fetching users:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
    };

    return (
        <div className="min-h-screen bg-background pb-20">
            <div className="sticky top-0 z-10 bg-card border-b border-border p-4 space-y-4">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
                        <ArrowLeft className="w-6 h-6" />
                    </Button>
                    <div className="flex-1">
                        <h1 className="text-2xl font-bold text-foreground">People</h1>
                        <p className="text-sm text-muted-foreground">{filteredUsers.length} users</p>
                    </div>
                </div>
                <form onSubmit={handleSearch}>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={18} />
                        <Input
                            type="text"
                            placeholder="Search people..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 bg-background border-border text-foreground"
                        />
                    </div>
                </form>
            </div>

            <div className="p-3 sm:p-4">
                {loading ? (
                    <div className="space-y-3">
                        {[1, 2, 3, 4, 5].map((i) => (
                            <Card key={i} className="bg-card border-border animate-pulse">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-full bg-muted" />
                                        <div className="flex-1 space-y-2">
                                            <div className="h-4 bg-muted rounded w-1/3" />
                                            <div className="h-3 bg-muted rounded w-1/4" />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                ) : filteredUsers.length === 0 ? (
                    <Card className="bg-card border-border">
                        <CardContent className="p-12 text-center">
                            <Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                            <p className="text-muted-foreground">
                                {searchQuery ? "No users found" : "No users available"}
                            </p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-3">
                        {filteredUsers.map((user, index) => (
                            <motion.div
                                key={user.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                            >
                                <Card className="bg-card border-border hover:border-primary transition-colors">
                                    <CardContent className="p-3 sm:p-4">
                                        <div className="flex items-start gap-3">
                                            <div
                                                className="relative cursor-pointer shrink-0"
                                                onClick={() => navigate(`/user/${user.id}`)}
                                            >
                                                <Avatar className="h-12 w-12 sm:h-14 sm:w-14">
                                                    <AvatarImage src={user.avatar_url || undefined} />
                                                    <AvatarFallback className="bg-primary text-primary-foreground">
                                                        {user.username[0]?.toUpperCase()}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <OnlineIndicator userId={user.id} />
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <div
                                                    className="cursor-pointer"
                                                    onClick={() => navigate(`/user/${user.id}`)}
                                                >
                                                    <p className="font-semibold text-foreground truncate">
                                                        {user.full_name}
                                                    </p>
                                                    <p className="text-sm text-muted-foreground truncate">
                                                        @{user.username}
                                                    </p>
                                                    {user.bio && (
                                                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                                            {user.bio}
                                                        </p>
                                                    )}
                                                    <div className="flex gap-3 mt-2 text-xs text-muted-foreground">
                                                        <span>
                                                            <span className="font-semibold text-foreground">
                                                                {user.follower_count}
                                                            </span>{" "}
                                                            followers
                                                        </span>
                                                        <span>
                                                            <span className="font-semibold text-foreground">
                                                                {user.following_count}
                                                            </span>{" "}
                                                            following
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex flex-col sm:flex-row gap-2 shrink-0">
                                                <FollowButton
                                                    userId={user.id}
                                                    currentUserId={currentUser?.id}
                                                />
                                                <StartChatButton
                                                    userId={user.id}
                                                    currentUserId={currentUser?.id}
                                                />
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>

            <BottomNav />
        </div>
    );
};

export default AllPeople;
