import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Github, Linkedin, Globe, MapPin, Heart, MessageCircle, MoreVertical } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { motion } from "framer-motion";
import type { User } from "@supabase/supabase-js";
import { useToast } from "@/hooks/use-toast";
import { BottomNav } from "@/components/BottomNav";
import { FollowButton } from "@/components/FollowButton";
import { FollowersModal } from "@/components/FollowersModal";
import { StartChatButton } from "@/components/StartChatButton";
import { useTrackProfileView } from "@/hooks/useProfileViews";
import { OnlineIndicator } from "@/components/OnlineIndicator";
import { useMutualFollowers } from "@/hooks/useMutualFollowers";
import { MutualFollowersModal } from "@/components/MutualFollowersModal";
import { Users } from "lucide-react";
import { BlockUserDialog } from "@/components/BlockUserDialog";
import { VerifiedBadge } from "@/components/VerifiedBadge";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import { CartoonLoader } from "@/components/CartoonLoader";

interface Profile {
    id: string;
    username: string;
    full_name: string;
    avatar_url: string | null;
    bio: string | null;
    location: string | null;
    github_url: string | null;
    linkedin_url: string | null;
    portfolio_url: string | null;
    tech_skills: string[] | null;
    is_verified?: boolean | null;
    verification_category?: string | null;
    theme_color?: string | null;
}

interface Project {
    id: string;
    title: string;
    description: string;
    tech_stack: string[];
    project_likes: { id: string }[];
}

interface Post {
    id: string;
    content: string;
    image_url: string | null;
    created_at: string;
    likes: { id: string }[];
    comments: { id: string }[];
}

const UserProfile = () => {
    const { userId } = useParams();
    const navigate = useNavigate();
    const { toast } = useToast();
    const { isAdmin } = useIsAdmin();
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<Profile | null>(null);
    const [loading, setLoading] = useState(true);
    const [projects, setProjects] = useState<Project[]>([]);
    const [posts, setPosts] = useState<Post[]>([]);
    const [followerCount, setFollowerCount] = useState(0);
    const [followingCount, setFollowingCount] = useState(0);
    const [followersModalOpen, setFollowersModalOpen] = useState(false);
    const [followersModalTab, setFollowersModalTab] = useState<"followers" | "following">("followers");
    const [mutualModalOpen, setMutualModalOpen] = useState(false);

    const [isBlocked, setIsBlocked] = useState(false);
    const [showBlockDialog, setShowBlockDialog] = useState(false);

    useTrackProfileView(userId, currentUser?.id);
    const { mutualCount } = useMutualFollowers(currentUser?.id, userId);

    const fetchFollowerCounts = useCallback(async () => {
        if (!userId) return;

        const [followersResult, followingResult] = await Promise.all([
            supabase
                .from("follows")
                .select("*", { count: "exact", head: true })
                .eq("following_id", userId),
            supabase
                .from("follows")
                .select("*", { count: "exact", head: true })
                .eq("follower_id", userId)
        ]);

        setFollowerCount(followersResult.count || 0);
        setFollowingCount(followingResult.count || 0);
    }, [userId]);

    useEffect(() => {
        if (currentUser && userId) {
            checkBlockStatus();
        }
    }, [currentUser, userId]);

    const checkBlockStatus = async () => {
        if (!currentUser || !userId) return;

        const { data } = await supabase
            .from('blocks')
            .select('*')
            .eq('blocker_id', currentUser.id)
            .eq('blocked_id', userId)
            .single();

        setIsBlocked(!!data);
    };

    const handleBlock = async () => {
        if (!currentUser || !userId) return;

        const { error } = await supabase
            .from('blocks')
            .insert({
                blocker_id: currentUser.id,
                blocked_id: userId
            });

        if (error) {
            toast({
                title: "Error",
                description: "Failed to block user",
                variant: "destructive",
            });
        } else {
            setIsBlocked(true);
            toast({
                title: "User blocked",
                description: "You will no longer receive messages from this user.",
            });
        }
    };

    const handleUnblock = async () => {
        if (!currentUser || !userId) return;

        const { error } = await supabase
            .from('blocks')
            .delete()
            .eq('blocker_id', currentUser.id)
            .eq('blocked_id', userId);

        if (error) {
            toast({
                title: "Error",
                description: "Failed to unblock user",
                variant: "destructive",
            });
        } else {
            setIsBlocked(false);
            toast({
                title: "User unblocked",
                description: "You can now receive messages from this user.",
            });
        }
    };

    const handleVerifyUser = async () => {
        if (!userId || !isAdmin) return;

        try {
            const { error } = await supabase
                .from('profiles')
                .update({
                    is_verified: true,
                    verification_category: 'admin'
                })
                .eq('id', userId);

            if (error) throw error;

            toast({
                title: "✅ User Verified!",
                description: "The user has been successfully verified.",
            });

            // Refresh profile to show verification badge
            const { data: updatedProfile } = await supabase
                .from("profiles")
                .select("*")
                .eq("id", userId)
                .single();

            if (updatedProfile) {
                setProfile(updatedProfile);
            }
        } catch (error) {
            console.error('Error verifying user:', error);
            toast({
                title: "Error",
                description: "Failed to verify user",
                variant: "destructive",
            });
        }
    };

    const handleRemoveVerification = async () => {
        if (!userId || !isAdmin) return;

        try {
            const { error } = await supabase
                .from('profiles')
                .update({
                    is_verified: false,
                    verification_category: null
                })
                .eq('id', userId);

            if (error) throw error;

            toast({
                title: "Verification Removed",
                description: "The user's verification has been removed.",
            });

            // Refresh profile
            const { data: updatedProfile } = await supabase
                .from("profiles")
                .select("*")
                .eq("id", userId)
                .single();

            if (updatedProfile) {
                setProfile(updatedProfile);
            }
        } catch (error) {
            console.error('Error removing verification:', error);
            toast({
                title: "Error",
                description: "Failed to remove verification",
                variant: "destructive",
            });
        }
    };

    const fetchData = useCallback(async () => {
        const { data: { user } } = await supabase.auth.getUser();
        setCurrentUser(user);

        if (!userId) {
            navigate("/feed");
            return;
        }

        const { data: profileData, error: profileError } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", userId)
            .single();

        if (profileError || !profileData) {
            toast({
                title: "Error",
                description: "User not found",
                variant: "destructive",
            });
            navigate("/feed");
            return;
        }

        // Sanu's special profile customization
        const isSanu = profileData.username?.toLowerCase() === 'sanu';
        const enhancedProfile: Profile = {
            ...profileData,
            verification_category: isSanu ? 'creator' : profileData.verification_category,
            is_verified: isSanu ? true : profileData.is_verified,
            theme_color: isSanu ? '#FFE6EA' : null, // Light pink theme for Sanu
        };
        setProfile(enhancedProfile);

        // Fetch all data in parallel for better performance
        const [projectsResult, postsResult] = await Promise.all([
            supabase
                .from("projects")
                .select(`
                    *,
                    project_likes(id)
                `)
                .eq("user_id", userId)
                .order('created_at', { ascending: false }),
            supabase
                .from("posts")
                .select(`
                    *,
                    likes(id),
                    comments(id)
                `)
                .eq("user_id", userId)
                .order('created_at', { ascending: false })
        ]);

        setProjects((projectsResult.data as unknown as Project[]) || []);
        setPosts((postsResult.data as unknown as Post[]) || []);

        await fetchFollowerCounts();
        setLoading(false);
    }, [userId, navigate, toast, fetchFollowerCounts]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    if (loading) {
        return <CartoonLoader />;
    }

    return (
        <div
            className="min-h-screen pb-24 transition-colors duration-300"
            style={{
                backgroundColor: profile?.theme_color || 'hsl(var(--background))'
            }}
        >
            <div className="relative h-32 w-full">
                {!profile?.theme_color && <div className="absolute inset-0 gradient-primary" />}
                {profile?.theme_color && <div className="absolute inset-0 bg-black/5" />}
                <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-4 left-4 text-foreground hover:bg-black/10"
                    onClick={() => navigate(-1)}
                >
                    <ArrowLeft className="w-6 h-6" />
                </Button>
            </div>

            <div className="px-3 sm:px-4 -mt-12 sm:-mt-16 relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-4"
                >
                    <Card className="bg-card/80 backdrop-blur-sm border-border">
                        <CardContent className="p-6">
                            <div className="flex items-start justify-between mb-4">
                                <div className="relative">
                                    <div className={`rounded-full ${profile?.verification_category === 'creator'
                                        ? "p-[3px] bg-gradient-to-tr from-[#FFD700] via-[#FDB931] to-[#C0B283] shadow-[0_0_15px_rgba(255,215,0,0.5)]"
                                        : ""
                                        }`}>
                                        <Avatar className={`h-24 w-24 border-4 ${profile?.verification_category === 'creator' ? "border-white" : "border-background"
                                            }`}>
                                            <AvatarImage src={profile?.avatar_url || undefined} loading="lazy" />
                                            <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
                                                {profile?.full_name?.[0] || currentUser?.email?.[0]?.toUpperCase()}
                                            </AvatarFallback>
                                        </Avatar>
                                    </div>
                                    <OnlineIndicator userId={userId!} className="w-5 h-5 absolute bottom-0 right-0 border-4 border-background rounded-full" />
                                </div>
                                <div className="flex flex-wrap gap-2 justify-end">
                                    <FollowButton
                                        userId={userId!}
                                        currentUserId={currentUser?.id}
                                        onFollowChange={fetchFollowerCounts}
                                    />
                                    <StartChatButton
                                        userId={userId!}
                                        currentUserId={currentUser?.id}
                                    />
                                    {currentUser && currentUser.id !== userId && (
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon">
                                                    <MoreVertical className="h-5 w-5" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                {isAdmin ? (
                                                    <>
                                                        {profile?.is_verified ? (
                                                            <DropdownMenuItem
                                                                className="text-orange-600 focus:text-orange-600 cursor-pointer"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleRemoveVerification();
                                                                }}
                                                            >
                                                                Remove Verification
                                                            </DropdownMenuItem>
                                                        ) : (
                                                            <DropdownMenuItem
                                                                className="text-green-600 focus:text-green-600 cursor-pointer"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleVerifyUser();
                                                                }}
                                                            >
                                                                Verify this User
                                                            </DropdownMenuItem>
                                                        )}
                                                    </>
                                                ) : (
                                                    <DropdownMenuItem
                                                        className="text-destructive focus:text-destructive cursor-pointer"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            isBlocked ? handleUnblock() : setShowBlockDialog(true);
                                                        }}
                                                    >
                                                        {isBlocked ? "Unblock User" : "Block User"}
                                                    </DropdownMenuItem>
                                                )}
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    )}
                                </div>
                            </div>

                            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                                {profile?.full_name}
                                <VerifiedBadge isVerified={profile?.is_verified} size={20} />
                            </h1>
                            <div className="flex items-center gap-2">
                                <p className="text-muted-foreground">@{profile?.username}</p>
                                {mutualCount > 0 && currentUser?.id !== userId && (
                                    <Badge
                                        variant="secondary"
                                        className="flex items-center gap-1 bg-primary/10 text-primary hover:bg-primary/20 cursor-pointer transition-colors"
                                        onClick={() => setMutualModalOpen(true)}
                                    >
                                        <Users size={12} />
                                        {mutualCount} mutual
                                    </Badge>
                                )}
                            </div>

                            {profile?.bio && (
                                <p className="text-foreground mt-3">{profile.bio}</p>
                            )}

                            <div className="flex items-center gap-2 mt-3 text-muted-foreground text-sm">
                                <>
                                    <MapPin size={16} />
                                    <span>{profile?.location || "Pune"}</span>
                                </>
                            </div>

                            <div className="flex gap-3 mt-4">
                                {profile?.github_url && (
                                    <a href={profile.github_url} target="_blank" rel="noopener noreferrer">
                                        <Button variant="ghost" size="sm" className="text-foreground">
                                            <Github size={18} />
                                        </Button>
                                    </a>
                                )}
                                {profile?.linkedin_url && (
                                    <a href={profile.linkedin_url} target="_blank" rel="noopener noreferrer">
                                        <Button variant="ghost" size="sm" className="text-foreground">
                                            <Linkedin size={18} />
                                        </Button>
                                    </a>
                                )}
                                {profile?.portfolio_url && (
                                    <a href={profile.portfolio_url} target="_blank" rel="noopener noreferrer">
                                        <Button variant="ghost" size="sm" className="text-foreground">
                                            <Globe size={18} />
                                        </Button>
                                    </a>
                                )}
                            </div>

                            <div className="flex gap-6 mt-4 pt-4 border-t border-border">
                                <div>
                                    <p className="text-xl font-bold text-foreground">{projects.length}</p>
                                    <p className="text-sm text-muted-foreground">Projects</p>
                                </div>
                                <div
                                    className="cursor-pointer hover:text-primary transition-colors"
                                    onClick={() => {
                                        setFollowersModalTab("followers");
                                        setFollowersModalOpen(true);
                                    }}
                                >
                                    <p className="text-xl font-bold text-foreground">{followerCount}</p>
                                    <p className="text-sm text-muted-foreground">Followers</p>
                                </div>
                                <div
                                    className="cursor-pointer hover:text-primary transition-colors"
                                    onClick={() => {
                                        setFollowersModalTab("following");
                                        setFollowersModalOpen(true);
                                    }}
                                >
                                    <p className="text-xl font-bold text-foreground">{followingCount}</p>
                                    <p className="text-sm text-muted-foreground">Following</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {profile?.tech_skills && profile.tech_skills.length > 0 && (
                        <Card className="bg-card/80 backdrop-blur-sm border-border">
                            <CardContent className="p-4">
                                <h3 className="font-semibold text-foreground mb-3">Tech Skills</h3>
                                <div className="flex flex-wrap gap-2">
                                    {profile.tech_skills.map((skill: string) => (
                                        <Badge key={skill} variant="secondary" className="bg-secondary text-secondary-foreground">
                                            {skill}
                                        </Badge>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    <Tabs defaultValue="projects" className="w-full">
                        <TabsList className="grid w-full grid-cols-2 bg-muted/80 backdrop-blur-sm">
                            <TabsTrigger value="projects" className="data-[state=active]:bg-background">
                                Projects
                            </TabsTrigger>
                            <TabsTrigger value="posts" className="data-[state=active]:bg-background">
                                Posts
                            </TabsTrigger>
                        </TabsList>
                        <TabsContent value="projects" className="space-y-3 mt-4">
                            {projects.length === 0 ? (
                                <Card className="bg-card/80 backdrop-blur-sm border-border">
                                    <CardContent className="p-8 text-center">
                                        <p className="text-muted-foreground">No projects yet</p>
                                    </CardContent>
                                </Card>
                            ) : (
                                projects.map((project, index) => (
                                    <Card key={index} className="bg-card/80 backdrop-blur-sm border-border">
                                        <CardContent className="p-4">
                                            <h4 className="font-semibold text-foreground">{project.title}</h4>
                                            <p className="text-sm text-muted-foreground mt-1">{project.description}</p>
                                            <div className="flex items-center justify-between mt-2">
                                                <div className="flex gap-2">
                                                    {project.tech_stack?.slice(0, 3).map((tech: string) => (
                                                        <Badge key={tech} variant="outline" className="text-xs border-primary text-primary">
                                                            {tech}
                                                        </Badge>
                                                    ))}
                                                </div>
                                                <span className="text-sm text-muted-foreground">{project.project_likes?.length || 0} likes</span>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))
                            )}
                        </TabsContent>
                        <TabsContent value="posts" className="space-y-4 mt-4">
                            {posts.length === 0 ? (
                                <p className="text-center text-muted-foreground py-8">No posts yet</p>
                            ) : (
                                posts.map((post) => (
                                    <Card key={post.id} className="bg-card/80 backdrop-blur-sm border-border">
                                        <CardContent className="p-4">
                                            <div className="flex items-center gap-3 mb-3">
                                                <Avatar className="h-10 w-10">
                                                    <AvatarImage src={profile?.avatar_url || undefined} />
                                                    <AvatarFallback>{profile?.username?.[0]}</AvatarFallback>
                                                </Avatar>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))
                            )}
                        </TabsContent>
                    </Tabs>
                </motion.div>
            </div>

            <FollowersModal
                open={followersModalOpen}
                onOpenChange={setFollowersModalOpen}
                userId={userId!}
                currentUserId={currentUser?.id}
                defaultTab={followersModalTab}
            />

            {currentUser?.id && userId && currentUser.id !== userId && (
                <MutualFollowersModal
                    open={mutualModalOpen}
                    onOpenChange={setMutualModalOpen}
                    currentUserId={currentUser.id}
                    profileUserId={userId}
                />
            )}

            <BlockUserDialog
                open={showBlockDialog}
                onOpenChange={setShowBlockDialog}
                onConfirm={() => {
                    handleBlock();
                    setShowBlockDialog(false);
                }}
                username={profile?.username || ""}
            />

            <BottomNav />
        </div>
    );
};

export default React.memo(UserProfile);
