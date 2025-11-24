import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Heart, MessageCircle, Share2, Plus, Home, Search, Bell, User as UserIcon, LogOut } from "lucide-react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import type { User } from "@supabase/supabase-js";

interface Post {
  id: string;
  content: string;
  image_url: string | null;
  created_at: string;
  profiles: {
    username: string;
    full_name: string;
    avatar_url: string | null;
  };
  likes: { id: string; user_id: string }[];
  comments: { id: string }[];
}

const Feed = () => {
  const [user, setUser] = useState<User | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Check authentication
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/auth");
      } else {
        setUser(session.user);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session) {
        navigate("/auth");
      } else {
        setUser(session.user);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  useEffect(() => {
    if (user) {
      fetchPosts();
      
      // Subscribe to realtime updates
      const channel = supabase
        .channel('posts-changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'posts'
          },
          () => {
            fetchPosts();
          }
        )
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'likes'
          },
          () => {
            fetchPosts();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user]);

  const fetchPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          profiles(username, full_name, avatar_url),
          likes(id, user_id),
          comments(id)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPosts(data || []);
    } catch (error: any) {
      toast({
        title: "Error loading posts",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleLike = async (postId: string) => {
    if (!user) return;

    const post = posts.find(p => p.id === postId);
    const hasLiked = post?.likes.some(like => like.user_id === user.id);

    try {
      if (hasLiked) {
        const likeId = post?.likes.find(like => like.user_id === user.id)?.id;
        await supabase.from('likes').delete().eq('id', likeId);
      } else {
        await supabase.from('likes').insert({
          user_id: user.id,
          post_id: postId,
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen gradient-primary flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

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
            <Button size="icon" variant="ghost" onClick={handleLogout}>
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-4 py-6 pb-24">
        {/* Create Post Button */}
        <Card className="p-6 mb-6 shadow-lg">
          <div className="flex items-center gap-4">
            <Avatar className="w-12 h-12 border-2 border-primary">
              <AvatarImage src={user?.user_metadata?.avatar_url} />
              <AvatarFallback>{user?.user_metadata?.username?.[0] || "U"}</AvatarFallback>
            </Avatar>
            <Button 
              variant="outline" 
              className="flex-1 justify-start text-muted-foreground hover:border-primary"
              onClick={() => navigate("/create-post")}
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
          {posts.length === 0 ? (
            <Card className="p-12 text-center">
              <p className="text-muted-foreground">No posts yet. Be the first to share something!</p>
            </Card>
          ) : (
            posts.map((post, index) => (
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
                        <AvatarImage src={post.profiles.avatar_url || undefined} />
                        <AvatarFallback>{post.profiles.username[0]}</AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-semibold">{post.profiles.full_name}</h3>
                        <p className="text-sm text-muted-foreground">
                          @{post.profiles.username} · {new Date(post.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <p className="mb-4">{post.content}</p>

                    {post.image_url && (
                      <img
                        src={post.image_url}
                        alt="Post"
                        className="w-full rounded-xl object-cover mb-4"
                      />
                    )}

                    <div className="flex items-center justify-between pt-4 border-t">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleLike(post.id)}
                        className={post.likes.some(like => like.user_id === user?.id) ? "text-secondary" : ""}
                      >
                        <Heart
                          className={`w-5 h-5 mr-2 ${
                            post.likes.some(like => like.user_id === user?.id) ? "fill-secondary" : ""
                          }`}
                        />
                        {post.likes.length}
                      </Button>
                      <Button variant="ghost" size="sm">
                        <MessageCircle className="w-5 h-5 mr-2" />
                        {post.comments.length}
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Share2 className="w-5 h-5 mr-2" />
                        Share
                      </Button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))
          )}
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
            <UserIcon className="w-6 h-6" />
          </Button>
        </div>
      </nav>
    </div>
  );
};

export default Feed;
