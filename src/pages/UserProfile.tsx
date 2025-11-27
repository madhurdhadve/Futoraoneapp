import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Github, Linkedin, Globe, MapPin, Heart, MessageCircle } from "lucide-react";
import { motion } from "framer-motion";
import type { User } from "@supabase/supabase-js";
import { useToast } from "@/hooks/use-toast";
import { BottomNav } from "@/components/BottomNav";
import { FollowButton } from "@/components/FollowButton";
import { FollowersModal } from "@/components/FollowersModal";
import { StartChatButton } from "@/components/StartChatButton";

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
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<Profile | null>(null);
    const [loading, setLoading] = useState(true);
    const [projects, setProjects] = useState<Project[]>([]);
    const [posts, setPosts] = useState<Post[]>([]);
    const [followerCount, setFollowerCount] = useState(0);
    const [followingCount, setFollowingCount] = useState(0);
    const [followersModalOpen, setFollowersModalOpen] = useState(false);
    const [followersModalTab, setFollowersModalTab] = useState<"followers" | "following">("followers");

    useEffect(() => {
        fetchData();
    }, [userId]);

    const fetchData = async () => {
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

        setProfile(profileData);

        const { data: projectsData } = await supabase
            .from("projects")
            .select(`
        *,
        project_likes(id)
      `)
            .eq("user_id", userId)
            .order('created_at', { ascending: false });

        setProjects((projectsData as unknown as Project[]) || []);

        const { data: postsData } = await supabase
            .from("posts")
            .select(`
        *,
        likes(id),
        comments(id)
      `)
            .eq("user_id", userId)
            .order('created_at', { ascending: false });

        setPosts((postsData as unknown as Post[]) || []);

        await fetchFollowerCounts();
        setLoading(false);
    };

    const fetchFollowerCounts = async () => {
        if (!userId) return;

        const { count: followers } = await supabase
            .from("follows")
            .select("*", { count: "exact", head: true })
            .eq("following_id", userId);

        const { count: following } = await supabase
            .from("follows")
            .select("*", { count: "exact", head: true })
            .eq("follower_id", userId);

        setFollowerCount(followers || 0);
        setFollowingCount(following || 0);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center pb-20">
                <p className="text-muted-foreground">Loading profile...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background pb-24">
            <div className="relative h-32 gradient-primary">
                <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-4 left-4 text-white hover:bg-white/20"
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
                    <Card className="bg-card border-border">
                        <CardContent className="p-6">
                            <div className="flex items-start justify-between mb-4">
                                <Avatar className="h-24 w-24 border-4 border-background">
                                    <AvatarImage src={profile?.avatar_url || undefined} />
                                    <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
                                        {profile?.full_name?.[0] || profile?.username?.[0]?.toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>
                            <div className="flex gap-2">
                                <FollowButton
                                    userId={userId!}
                                    currentUserId={currentUser?.id}
                                    onFollowChange={fetchFollowerCounts}
                                />
                                <StartChatButton
                                    userId={userId!}
                                    currentUserId={currentUser?.id}
                                />
                            </div>
                            </div>

                            <h1 className="text-2xl font-bold text-foreground">{profile?.full_name}</h1>
                            <p className="text-muted-foreground">@{profile?.username}</p>

                            {profile?.bio && (
                                <p className="text-foreground mt-3">{profile.bio}</p>
                            )}

                            <div className="flex items-center gap-2 mt-3 text-muted-foreground text-sm">
                                {profile?.location && (
                                    <>
                                        <MapPin size={16} />
                                        <span>{profile.location}</span>
                                    </>
                                )}
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
                        <Card className="bg-card border-border">
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
                        <TabsList className="grid w-full grid-cols-2 bg-muted">
                            <TabsTrigger value="projects" className="data-[state=active]:bg-background">
                                Projects
                            </TabsTrigger>
                            <TabsTrigger value="posts" className="data-[state=active]:bg-background">
                                Posts
                            </TabsTrigger>
                        </TabsList>
                        <TabsContent value="projects" className="space-y-3 mt-4">
                            {projects.length === 0 ? (
                                <Card className="bg-card border-border">
                                    <CardContent className="p-8 text-center">
                                        <p className="text-muted-foreground">No projects yet</p>
                                    </CardContent>
                                </Card>
                            ) : (
                                projects.map((project, index) => (
                                    <Card key={index} className="bg-card border-border">
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
                                    <Card key={post.id} className="bg-card border-border">
                                        <CardContent className="p-4">
                                            <div className="flex items-center gap-3 mb-3">
                                                <Avatar className="h-10 w-10">
                                                    <AvatarImage src={profile?.avatar_url || undefined} />
                                                    <AvatarFallback>{profile?.username?.[0]}</AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <p className="font-semibold text-foreground">{profile?.full_name}</p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {new Date(post.created_at).toLocaleDateString()}
                                                    </p>
                                                </div>
                                            </div>
                                            <p className="text-foreground mb-3">{post.content}</p>
                                            {post.image_url && (
                                                <img
                                                    src={post.image_url}
                                                    alt="Post"
                                                    className="w-full rounded-lg object-cover mb-3 max-h-64"
                                                />
                                            )}
                                            <div className="flex items-center gap-4 text-muted-foreground text-sm">
                                                <span className="flex items-center gap-1">
                                                    <Heart size={16} /> {post.likes?.length || 0}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <MessageCircle size={16} /> {post.comments?.length || 0}
                                                </span>
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

            <BottomNav />
        </div>
    );
};

export default UserProfile;
