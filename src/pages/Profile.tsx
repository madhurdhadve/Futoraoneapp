import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LogOut, Github, Linkedin, Globe, MapPin, Edit, Eye } from "lucide-react";
import { motion } from "framer-motion";
import type { User } from "@supabase/supabase-js";
import { useToast } from "@/hooks/use-toast";
import { EditProfileDialog } from "@/components/EditProfileDialog";
import { BottomNav } from "@/components/BottomNav";
import { FollowersModal } from "@/components/FollowersModal";
import { ProfileProjects } from "@/components/ProfileProjects";
import { ProfilePosts } from "@/components/ProfilePosts";

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
  banner_url: string | null;
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

const Profile = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [followerCount, setFollowerCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [followersModalOpen, setFollowersModalOpen] = useState(false);
  const [followersModalTab, setFollowersModalTab] = useState<"followers" | "following">("followers");

  useEffect(() => {
    const fetchUserData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth");
        return;
      }
      setUser(user);

      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      setProfile(profileData as unknown as Profile);

      // Fetch user's projects
      const { data: projectsData } = await supabase
        .from("projects")
        .select(`
          *,
          project_likes(id)
        `)
        .eq("user_id", user.id)
        .order('created_at', { ascending: false });

      setProjects((projectsData as unknown as Project[]) || []);

      // Fetch user's posts
      const { data: postsData } = await supabase
        .from("posts")
        .select(`
          *,
          likes(id),
          comments(id)
        `)
        .eq("user_id", user.id)
        .order('created_at', { ascending: false });

      setPosts((postsData as unknown as Post[]) || []);

      await fetchFollowerCounts(user.id);
      setLoading(false);
    };

    fetchUserData();
  }, [navigate]);

  const fetchFollowerCounts = async (userId: string) => {
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

  const refreshProfile = async () => {
    if (!user) return;
    const { data: profileData } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();
    setProfile(profileData as unknown as Profile);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast({ title: "Logged out successfully" });
    navigate("/");
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
      {/* Header with Cover */}
      <div
        className="relative h-32 w-full bg-cover bg-center"
        style={{
          backgroundImage: profile?.banner_url
            ? `url(${profile.banner_url})`
            : undefined
        }}
      >
        {!profile?.banner_url && <div className="absolute inset-0 gradient-primary" />}
      </div>

      <div className="px-3 sm:px-4 -mt-12 sm:-mt-16 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          {/* Profile Info */}
          <Card className="bg-card border-border">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <Avatar className="h-24 w-24 border-4 border-background">
                  <AvatarImage src={profile?.avatar_url} loading="lazy" />
                  <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
                    {profile?.full_name?.[0] || user?.email?.[0]?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-foreground"
                    onClick={() => navigate("/profile-views")}
                  >
                    <Eye className="w-5 h-5" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-border text-foreground"
                    onClick={() => setEditDialogOpen(true)}
                  >
                    <Edit size={16} className="mr-2" />
                    Edit
                  </Button>
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

              {/* Social Links */}
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

              {/* Stats */}
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

          {/* Tech Skills */}
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

          {/* Projects Tabs */}
          <Tabs defaultValue="posts" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-muted">
              <TabsTrigger value="posts" className="data-[state=active]:bg-background">
                Posts
              </TabsTrigger>
              <TabsTrigger value="projects" className="data-[state=active]:bg-background">
                Projects
              </TabsTrigger>
            </TabsList>
            <TabsContent value="posts" className="space-y-4 mt-4">
              {posts.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No posts yet</p>
              ) : (
                <ProfilePosts posts={posts} profile={profile} />
              )}
            </TabsContent>
            <TabsContent value="projects" className="space-y-3 mt-4">
              {projects.length === 0 ? (
                <Card className="bg-card border-border">
                  <CardContent className="p-8 text-center">
                    <p className="text-muted-foreground">No projects yet</p>
                    <Button
                      onClick={() => navigate("/projects")}
                      className="mt-4 gradient-primary text-white"
                    >
                      Create Your First Project
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <ProfileProjects projects={projects} />
              )}
            </TabsContent>
          </Tabs>

          {/* Logout Button */}
          <Button
            onClick={handleLogout}
            variant="outline"
            className="w-full border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
          >
            <LogOut size={18} className="mr-2" />
            Logout
          </Button>
        </motion.div>
      </div>

      <EditProfileDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        profile={profile}
        onUpdate={refreshProfile}
      />

      <FollowersModal
        open={followersModalOpen}
        onOpenChange={setFollowersModalOpen}
        userId={user?.id || ""}
        currentUserId={user?.id}
        defaultTab={followersModalTab}
      />

      <BottomNav />
    </div>
  );
};

export default Profile;
