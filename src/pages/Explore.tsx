import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, TrendingUp, Code, Brain, Shield, Cloud, Cpu, Blocks, Users } from "lucide-react";
import { motion } from "framer-motion";
import { BottomNav } from "@/components/BottomNav";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { FollowButton } from "@/components/FollowButton";
import { StartChatButton } from "@/components/StartChatButton";
import { OnlineIndicator } from "@/components/OnlineIndicator";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/mode-toggle";
import type { User } from "@supabase/supabase-js";

interface UserProfile {
  id: string;
  username: string;
  full_name: string;
  avatar_url: string | null;
  follower_count?: number;
}

const Explore = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [people, setPeople] = useState<UserProfile[]>([]);
  const [loadingPeople, setLoadingPeople] = useState(true);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    fetchCurrentUser();
    fetchPeople();
  }, []);

  const fetchCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setCurrentUser(user);
  };

  const fetchPeople = async () => {
    setLoadingPeople(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();

      const { data, error } = await supabase
        .from("profiles")
        .select("id, username, full_name, avatar_url")
        .neq("id", user?.id || "")
        .order("created_at", { ascending: false })
        .limit(4);

      if (error) throw error;

      const usersWithCounts = await Promise.all(
        (data || []).map(async (profile) => {
          const { count } = await supabase
            .from("follows")
            .select("*", { count: "exact", head: true })
            .eq("following_id", profile.id);

          return {
            ...profile,
            follower_count: count || 0,
          };
        })
      );

      setPeople(usersWithCounts);
    } catch (error) {
      console.error("Error fetching people:", error);
    } finally {
      setLoadingPeople(false);
    }
  };

  const categories = [
    { name: "AI & ML", icon: Brain, color: "bg-blue-500" },
    { name: "Web Dev", icon: Code, color: "bg-green-500" },
    { name: "Cybersecurity", icon: Shield, color: "bg-red-500" },
    { name: "Cloud", icon: Cloud, color: "bg-purple-500" },
    { name: "Robotics", icon: Cpu, color: "bg-yellow-500" },
    { name: "Blockchain", icon: Blocks, color: "bg-orange-500" },
  ];

  const trendingTopics = [
    { tag: "ChatGPT-5", posts: "2.4K" },
    { tag: "ReactJS", posts: "1.8K" },
    { tag: "Python", posts: "3.2K" },
    { tag: "DevOps", posts: "1.5K" },
    { tag: "MachineLearning", posts: "2.9K" },
  ];

  const trendingProjects = [
    {
      title: "AI Image Generator",
      author: "Sarah Chen",
      likes: 342,
      tech: ["Python", "TensorFlow", "React"],
    },
    {
      title: "Blockchain Voting System",
      author: "Mike Johnson",
      likes: 289,
      tech: ["Solidity", "Web3", "Node.js"],
    },
    {
      title: "Real-time Chat App",
      author: "Emma Davis",
      likes: 456,
      tech: ["WebSocket", "React", "Express"],
    },
  ];

  const handleCategoryClick = (categoryName: string) => {
    toast({
      title: `Exploring ${categoryName}`,
      description: `Showing posts and projects related to ${categoryName}`,
    });
    navigate(`/category/${encodeURIComponent(categoryName)}`);
  };

  const handleTopicClick = (tag: string) => {
    toast({
      title: `#${tag}`,
      description: `Viewing all posts with #${tag}`,
    });
    navigate(`/topic/${encodeURIComponent(tag)}`);
  };

  const handleProjectClick = (projectTitle: string) => {
    toast({
      title: projectTitle,
      description: "Opening project details...",
    });
    navigate(`/project/${encodeURIComponent(projectTitle)}`);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      toast({
        title: "Searching...",
        description: `Looking for "${searchQuery}"`,
      });
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-card border-b border-border p-4">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-foreground">Explore</h1>
          <ModeToggle />
        </div>
        <form onSubmit={handleSearch}>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={20} />
            <Input
              type="text"
              placeholder="Search projects, topics, people..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-background border-border text-foreground"
            />
          </div>
        </form>
      </div>

      <div className="p-4 space-y-6">
        {/* People to Follow - NOW AT THE TOP */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Users className="text-primary" size={24} />
            <h2 className="text-xl font-bold text-foreground">People to Follow</h2>
          </div>

          {loadingPeople ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[1, 2, 3, 4].map((i) => (
                <Card key={i} className="bg-card border-border animate-pulse">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-muted shrink-0" />
                      <div className="flex-1 space-y-2 min-w-0">
                        <div className="h-4 bg-muted rounded w-2/3" />
                        <div className="h-3 bg-muted rounded w-1/2" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : people.length === 0 ? (
            <Card className="bg-card border-border">
              <CardContent className="p-8 text-center">
                <Users className="w-12 h-12 mx-auto mb-2 text-muted-foreground" />
                <p className="text-muted-foreground">No users found</p>
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                {people.map((user, index) => (
                  <motion.div
                    key={user.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="bg-card border-2 border-black/30 dark:border-border hover:border-primary transition-all hover:shadow-lg">
                      <CardContent className="p-3 sm:p-4">
                        <div className="flex items-start gap-3 mb-3">
                          <div
                            className="relative cursor-pointer shrink-0"
                            onClick={() => navigate(`/user/${user.id}`)}
                          >
                            <Avatar className="h-12 w-12">
                              <AvatarImage src={user.avatar_url || undefined} />
                              <AvatarFallback className="bg-primary text-primary-foreground">
                                {user.username[0]?.toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <OnlineIndicator userId={user.id} />
                          </div>
                          <div
                            className="flex-1 min-w-0 cursor-pointer"
                            onClick={() => navigate(`/user/${user.id}`)}
                          >
                            <p className="font-semibold text-foreground truncate">
                              {user.full_name}
                            </p>
                            <p className="text-sm text-muted-foreground truncate">
                              @{user.username}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              <span className="font-semibold text-foreground">
                                {user.follower_count}
                              </span>{" "}
                              followers
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <FollowButton
                            userId={user.id}
                            currentUserId={currentUser?.id}
                          />
                          <StartChatButton
                            userId={user.id}
                            currentUserId={currentUser?.id}
                          />
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>

              <div className="flex justify-center">
                <Button
                  variant="outline"
                  onClick={() => navigate("/people")}
                  className="w-full sm:w-auto border-primary text-primary hover:bg-primary hover:text-primary-foreground animate-blink-glow"
                >
                  See All People
                </Button>
              </div>
            </>
          )}
        </section>

        {/* Categories */}
        <section>
          <h2 className="text-xl font-bold text-foreground mb-4">Tech Categories</h2>
          <div className="grid grid-cols-2 gap-3">
            {categories.map((category, index) => (
              <motion.div
                key={category.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card
                  className="cursor-pointer border-2 border-black/30 dark:border-border hover:border-primary transition-all bg-card hover:shadow-lg"
                  onClick={() => handleCategoryClick(category.name)}
                >
                  <CardContent className="p-3 flex items-center gap-2">
                    <div className={`${category.color} p-2.5 rounded-lg shrink-0`}>
                      <category.icon className="text-white" size={20} />
                    </div>
                    <span className="font-semibold text-foreground text-sm sm:text-base truncate min-w-0 flex-1" title={category.name}>
                      {category.name}
                    </span>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Trending Topics */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="text-primary" size={24} />
            <h2 className="text-xl font-bold text-foreground">Trending Topics</h2>
          </div>
          <div className="space-y-3">
            {trendingTopics.map((topic, index) => (
              <motion.div
                key={topic.tag}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card
                  className="cursor-pointer border-2 border-black/30 dark:border-border hover:border-primary transition-all bg-card hover:shadow-lg"
                  onClick={() => handleTopicClick(topic.tag)}
                >
                  <CardContent className="p-4 flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-foreground">#{topic.tag}</p>
                      <p className="text-sm text-muted-foreground">{topic.posts} posts</p>
                    </div>
                    <Badge variant="secondary" className="bg-primary text-primary-foreground">
                      Trending
                    </Badge>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Trending Projects */}
        <section>
          <h2 className="text-xl font-bold text-foreground mb-4">Top Projects</h2>
          <div className="space-y-3">
            {trendingProjects.map((project, index) => (
              <motion.div
                key={project.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card
                  className="cursor-pointer border-2 border-black/30 dark:border-border hover:border-primary transition-all bg-card hover:shadow-lg"
                  onClick={() => handleProjectClick(project.title)}
                >
                  <CardContent className="p-4">
                    <h3 className="font-bold text-foreground mb-1">{project.title}</h3>
                    <p className="text-sm text-muted-foreground mb-3">by {project.author}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex gap-2 flex-wrap">
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
              </motion.div>
            ))}
          </div>
        </section>
      </div>
      <BottomNav />
    </div>
  );
};

export default Explore;
