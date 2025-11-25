import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LogOut, Settings, Github, Linkedin, Globe, MapPin } from "lucide-react";
import { motion } from "framer-motion";
import type { User } from "@supabase/supabase-js";
import { useToast } from "@/hooks/use-toast";

const Profile = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

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

      setProfile(profileData);
      setLoading(false);
    };

    fetchUserData();
  }, [navigate]);

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

  const techSkills = ["React", "TypeScript", "Python", "AI/ML", "Cloud"];
  const userProjects = [
    { title: "AI Chatbot", likes: 145, tech: ["Python", "TensorFlow"] },
    { title: "E-commerce Platform", likes: 89, tech: ["React", "Node.js"] },
  ];

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header with Cover */}
      <div className="relative h-32 gradient-primary" />

      <div className="px-4 -mt-16 relative z-10">
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
                  <AvatarImage src={profile?.avatar_url} />
                  <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
                    {profile?.full_name?.[0] || user?.email?.[0]?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <Button variant="outline" size="sm" className="border-border text-foreground">
                  <Settings size={16} className="mr-2" />
                  Edit Profile
                </Button>
              </div>

              <h1 className="text-2xl font-bold text-foreground">{profile?.full_name}</h1>
              <p className="text-muted-foreground">@{profile?.username}</p>
              
              {profile?.bio && (
                <p className="text-foreground mt-3">{profile.bio}</p>
              )}

              <div className="flex items-center gap-2 mt-3 text-muted-foreground text-sm">
                <MapPin size={16} />
                <span>San Francisco, CA</span>
              </div>

              {/* Social Links */}
              <div className="flex gap-3 mt-4">
                <Button variant="ghost" size="sm" className="text-foreground">
                  <Github size={18} />
                </Button>
                <Button variant="ghost" size="sm" className="text-foreground">
                  <Linkedin size={18} />
                </Button>
                <Button variant="ghost" size="sm" className="text-foreground">
                  <Globe size={18} />
                </Button>
              </div>

              {/* Stats */}
              <div className="flex gap-6 mt-4 pt-4 border-t border-border">
                <div>
                  <p className="text-xl font-bold text-foreground">12</p>
                  <p className="text-sm text-muted-foreground">Projects</p>
                </div>
                <div>
                  <p className="text-xl font-bold text-foreground">1.2K</p>
                  <p className="text-sm text-muted-foreground">Followers</p>
                </div>
                <div>
                  <p className="text-xl font-bold text-foreground">432</p>
                  <p className="text-sm text-muted-foreground">Following</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tech Skills */}
          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <h3 className="font-semibold text-foreground mb-3">Tech Skills</h3>
              <div className="flex flex-wrap gap-2">
                {techSkills.map((skill) => (
                  <Badge key={skill} variant="secondary" className="bg-secondary text-secondary-foreground">
                    {skill}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Projects Tabs */}
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
              {userProjects.map((project, index) => (
                <Card key={index} className="bg-card border-border">
                  <CardContent className="p-4">
                    <h4 className="font-semibold text-foreground">{project.title}</h4>
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex gap-2">
                        {project.tech.map((tech) => (
                          <Badge key={tech} variant="outline" className="text-xs border-primary text-primary">
                            {tech}
                          </Badge>
                        ))}
                      </div>
                      <span className="text-sm text-muted-foreground">{project.likes} likes</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>
            <TabsContent value="posts" className="mt-4">
              <p className="text-center text-muted-foreground py-8">No posts yet</p>
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
    </div>
  );
};

export default Profile;
