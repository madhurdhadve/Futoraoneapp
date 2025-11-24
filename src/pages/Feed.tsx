import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Heart, MessageCircle, Share2, Plus, Home, Search, Bell, User } from "lucide-react";
import { motion } from "framer-motion";

const Feed = () => {
  const [liked, setLiked] = useState<{ [key: number]: boolean }>({});

  const posts = [
    {
      id: 1,
      author: "Sarah Chen",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
      time: "2 hours ago",
      content: "Just finished an amazing sunset hike! The view was absolutely breathtaking 🌅",
      image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80",
      likes: 234,
      comments: 18,
    },
    {
      id: 2,
      author: "Mike Johnson",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Mike",
      time: "5 hours ago",
      content: "Coffee and coding - the perfect combination ☕💻",
      image: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=800&q=80",
      likes: 189,
      comments: 12,
    },
  ];

  const toggleLike = (postId: number) => {
    setLiked((prev) => ({ ...prev, [postId]: !prev[postId] }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-muted/30 to-background">
      {/* Header */}
      <header className="sticky top-0 z-50 glass-card border-b">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold gradient-text">FutoraOne</h1>
          <div className="flex items-center gap-4">
            <Button size="icon" variant="ghost" className="relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-secondary rounded-full"></span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-4 py-6 pb-24">
        {/* Create Post */}
        <Card className="p-6 mb-6 shadow-lg">
          <div className="flex items-center gap-4">
            <Avatar className="w-12 h-12 border-2 border-primary">
              <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=User" />
              <AvatarFallback>You</AvatarFallback>
            </Avatar>
            <Button 
              variant="outline" 
              className="flex-1 justify-start text-muted-foreground hover:border-primary"
            >
              What's on your mind?
            </Button>
            <Button size="icon" className="gradient-primary text-white">
              <Plus className="w-5 h-5" />
            </Button>
          </div>
        </Card>

        {/* Posts */}
        <div className="space-y-6">
          {posts.map((post, index) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="overflow-hidden shadow-lg">
                <div className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Avatar className="w-12 h-12 border-2 border-primary">
                      <AvatarImage src={post.avatar} />
                      <AvatarFallback>{post.author[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold">{post.author}</h3>
                      <p className="text-sm text-muted-foreground">{post.time}</p>
                    </div>
                  </div>

                  <p className="mb-4">{post.content}</p>

                  {post.image && (
                    <img
                      src={post.image}
                      alt="Post"
                      className="w-full rounded-xl object-cover mb-4"
                    />
                  )}

                  <div className="flex items-center justify-between pt-4 border-t">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleLike(post.id)}
                      className={liked[post.id] ? "text-secondary" : ""}
                    >
                      <Heart
                        className={`w-5 h-5 mr-2 ${
                          liked[post.id] ? "fill-secondary" : ""
                        }`}
                      />
                      {post.likes + (liked[post.id] ? 1 : 0)}
                    </Button>
                    <Button variant="ghost" size="sm">
                      <MessageCircle className="w-5 h-5 mr-2" />
                      {post.comments}
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Share2 className="w-5 h-5 mr-2" />
                      Share
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 glass-card border-t">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-around">
          <Button variant="ghost" size="icon" className="text-primary">
            <Home className="w-6 h-6" />
          </Button>
          <Button variant="ghost" size="icon">
            <Search className="w-6 h-6" />
          </Button>
          <Button size="icon" className="gradient-primary text-white rounded-full">
            <Plus className="w-6 h-6" />
          </Button>
          <Button variant="ghost" size="icon">
            <Bell className="w-6 h-6" />
          </Button>
          <Button variant="ghost" size="icon">
            <User className="w-6 h-6" />
          </Button>
        </div>
      </nav>
    </div>
  );
};

export default Feed;
