import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Search, ArrowLeft, Users } from "lucide-react";
import { BottomNav } from "@/components/BottomNav";
import { supabase } from "@/integrations/supabase/client";
import type { User } from "@supabase/supabase-js";
import { UserCard } from "@/components/UserCard";

interface UserProfile {
    id: string;
    username: string;
    full_name: string;
    avatar_url: string | null;
    bio: string | null;
    follower_count?: number;
    following_count?: number;
    is_verified?: boolean | null;
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

    // Debounce search query to prevent filtering on every keystroke
    useEffect(() => {
        const timeoutId = setTimeout(() => {
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
        }, 300); // 300ms debounce

        return () => clearTimeout(timeoutId);
    }, [searchQuery, users]);

    const fetchCurrentUser = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        setCurrentUser(user);
    };

    const fetchAllUsers = async () => {
        setLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();

            // Optimization: Fetch profiles and counts in ONE query using Supabase foreign key aggregation
            // Assuming 'follows' table has foreign keys set up correctly to profiles
            // Note: If direct count aggregation isn't supported by your specific Supabase version/policy,
            // we typically use a .select('*, followers:follows!follower_id(count), following:follows!following_id(count)')

            // However, typical JS client might struggle with granular count maps if relations aren't perfect.
            // Let's rely on the previous logic but parallelize correctly or check if we can simply use the count approach.

            // Fallback Plan for Safety without changing Schema: 
            // 1. Fetch all profiles.
            // 2. Fetch all FOLLOWS relationships where involved (or just all follows if table is small, but that's risky).
            // BETTER: Use the aggregation syntax if possible.

            const { data, error } = await supabase
                .from("profiles")
                .select(`
                    id, 
                    username, 
                    full_name, 
                    avatar_url, 
                    bio, 
                    is_verified,
                    followers:follows!following_id(count),
                    following:follows!follower_id(count)
                `)
                .neq("id", user?.id || "")
                .order("created_at", { ascending: false });

            if (error) throw error;

            // Transform data to flat structure
            const usersWithCounts = (data || []).map((profile: any) => ({
                id: profile.id,
                username: profile.username,
                full_name: profile.full_name,
                avatar_url: profile.avatar_url,
                bio: profile.bio,
                is_verified: profile.is_verified,
                follower_count: profile.followers?.[0]?.count || 0,
                following_count: profile.following?.[0]?.count || 0,
            }));

            setUsers(usersWithCounts);
            setFilteredUsers(usersWithCounts);
        } catch (error) {
            console.error("Error fetching users:", error);
            // Error handling/Retries could go here
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = useCallback((e: React.FormEvent) => {
        e.preventDefault();
    }, []);

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
                            <UserCard
                                key={user.id}
                                user={user}
                                currentUser={currentUser}
                                index={index}
                            />
                        ))}
                    </div>
                )}
            </div>

            <BottomNav />
        </div>
    );
};

export default AllPeople;
