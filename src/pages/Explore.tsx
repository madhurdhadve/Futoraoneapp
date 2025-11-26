import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, TrendingUp, Code, Brain, Shield, Cloud, Cpu, Blocks } from "lucide-react";
import { motion } from "framer-motion";
import { BottomNav } from "@/components/BottomNav";
import { useToast } from "@/hooks/use-toast";

const Explore = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();

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
    // You can navigate to a filtered feed or projects page
    navigate(`/feed?category=${encodeURIComponent(categoryName)}`);
  };

  const handleTopicClick = (tag: string) => {
    toast({
      title: `#${tag}`,
      description: `Viewing all posts with #${tag}`,
    });
    navigate(`/feed?tag=${encodeURIComponent(tag)}`);
  };

  const handleProjectClick = (projectTitle: string) => {
    toast({
      title: projectTitle,
      description: "Opening project details...",
    });
    navigate("/projects");
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      toast({
        title: "Searching...",
        description: `Looking for "${searchQuery}"`,
      });
      navigate(`/feed?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-card border-b border-border p-4">
        <h1 className="text-2xl font-bold text-foreground mb-4">Explore</h1>
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
                  className="cursor-pointer hover:border-primary transition-all bg-card border-border hover:shadow-lg"
                  onClick={() => handleCategoryClick(category.name)}
                >
                  <CardContent className="p-4 flex items-center gap-3">
                    <div className={`${category.color} p-3 rounded-lg`}>
                      <category.icon className="text-white" size={24} />
                    </div>
                    <span className="font-semibold text-foreground">{category.name}</span>
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
                  className="cursor-pointer hover:border-primary transition-all bg-card border-border hover:shadow-lg"
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
                  className="cursor-pointer hover:border-primary transition-all bg-card border-border hover:shadow-lg"
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
