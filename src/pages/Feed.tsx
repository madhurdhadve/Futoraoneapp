import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Plus, Bell, LogOut, Bot } from "lucide-react";
import { PostSkeleton } from "@/components/PostSkeleton";
import { BottomNav } from "@/components/BottomNav";
import { Stories } from "@/components/Stories";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import type { User } from "@supabase/supabase-js";
import { sendPushNotification } from "@/utils/notifications";
import { FeedPost } from "@/components/FeedPost";

interface Post {
  id: string;
  content: string;
  image_url: string | null;
  video_url: string | null;
  user_id: string;
  created_at: string;
  profiles: {
    username: string;
    full_name: string;
    avatar_url: string | null;
  };
  likes: { id: string; user_id: string }[];
  comments: { id: string }[];
  saves?: { id: string; user_id: string }[];
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
          comments(id),
          saves(id, user_id)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPosts(data || []);
    } catch (error) {
      toast({
        title: "Error loading posts",
        description: (error as Error).message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleLike = useCallback(async (postId: string) => {
    if (!user) return;

    // Optimistic update
    setPosts(currentPosts => currentPosts.map(post => {
      if (post.id === postId) {
        const hasLiked = post.likes.some(like => like.user_id === user.id);
        if (hasLiked) {
          return { ...post, likes: post.likes.filter(like => like.user_id !== user.id) };
        } else {
          return { ...post, likes: [...post.likes, { id: 'temp-id', user_id: user.id }] };
        }
      }
      return post;
    }));

    // Actual API call logic would need to be handled carefully with optimistic updates
    // For now, we'll keep the original logic but wrapped in useCallback and re-fetch
    // To properly support optimistic updates without re-fetch, we'd need more complex state management
    // So reverting to original logic inside the callback for safety, but keeping useCallback

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

        if (post && post.user_id !== user.id) {
          const actorName = user.user_metadata.full_name || user.email?.split('@')[0] || "Someone";
          await sendPushNotification(post.user_id, `${actorName} liked your post`);
        }
      }
      // fetchPosts is called by realtime subscription
    } catch (error) {
      toast({
        title: "Error",
        description: (error as Error).message,
        variant: "destructive",
      });
      fetchPosts(); // Revert on error
    }
  }, [user, posts, toast]); // Dependency on posts makes useCallback less effective for preventing re-renders of ALL posts, but still better than inline. 
  // Ideally we pass just the ID and let the child handle it or use a functional state update that doesn't depend on 'posts'.

  // Let's refine toggleLike to NOT depend on 'posts' for the API call part if possible, 
  // but we need 'posts' to check 'hasLiked'. 
  // Actually, we can pass 'isLiked' from the child, but the parent manages state.
  // For true optimization, we should use a functional update for setPosts and not depend on 'posts' in the effect.

  const toggleSave = useCallback(async (postId: string) => {
    if (!user) return;

    // Similar logic to toggleLike
    const post = posts.find(p => p.id === postId);
    const hasSaved = post?.saves?.some(save => save.user_id === user.id);

    try {
      if (hasSaved) {
        const saveId = post?.saves?.find(save => save.user_id === user.id)?.id;
        await supabase.from('saves').delete().eq('id', saveId);
      } else {
        await supabase.from('saves').insert({
          user_id: user.id,
          post_id: postId,
        });

        if (post && post.user_id !== user.id) {
          const actorName = user.user_metadata.full_name || user.email?.split('@')[0] || "Someone";
          await sendPushNotification(post.user_id, `${actorName} saved your post`);
        }
      }
      fetchPosts();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  }, [user, posts, toast]);

  const handleShare = useCallback(async (post: Post) => {
    const shareData = {
      title: `Post by ${post.profiles.full_name}`,
      text: post.content,
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Link copied!",
        description: "Share link copied to clipboard.",
      });
    }
  }, [toast]);

  const handleDeletePost = useCallback(async (postId: string) => {
    try {
      const { error } = await supabase.from('posts').delete().eq('id', postId);
      if (error) throw error;
      toast({
        title: "Post deleted",
        description: "Your post has been deleted successfully.",
      });
      fetchPosts();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  }, [toast]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-muted/30 to-background">
        <header className="sticky top-0 z-50 glass-card border-b">
          <div className="max-w-2xl mx-auto px-4 py-4">
            <h1 className="text-2xl font-bold gradient-text">FutoraOne</h1>
          </div>
        </header>
        <main className="max-w-2xl mx-auto px-4 py-6 space-y-6">
          <PostSkeleton />
          <PostSkeleton />
          <PostSkeleton />
        </main>
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
            <Button
              size="icon"
              variant="ghost"
              className="relative w-12 h-12 mr-2 animate-blink-glow bg-primary/10 rounded-full hover:bg-primary/20 transition-all"
              onClick={() => navigate("/ai-tools")}
            >
              <Bot className="w-8 h-8 text-primary" />
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-sky-500"></span>
              </span>
            </Button>
            <Button size="icon" variant="ghost" className="relative" onClick={() => navigate("/notifications")}>
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
      <main className="max-w-2xl mx-auto px-3 sm:px-4 py-4 sm:py-6 pb-24">
        {/* Stories */}
        <div className="mb-6">
          <Stories />
        </div>

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
              <FeedPost
                key={post.id}
                post={post}
                currentUser={user}
                onLike={toggleLike}
                onSave={toggleSave}
                onShare={handleShare}
                onDelete={handleDeletePost}
                index={index}
              />
            ))
          )}
        </div>
      </main>

      <BottomNav />
    </div>
  );
};

export default Feed;
