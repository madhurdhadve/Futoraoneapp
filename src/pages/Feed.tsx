import React, { useState, useEffect, useCallback } from "react";
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
import { ModeToggle } from "@/components/mode-toggle";
import { useInView } from "react-intersection-observer";
import { FeedSearch } from "@/components/FeedSearch";
import { getPostsFromCache, savePostsToCache } from "@/utils/cache";

// Demo posts for initial content
const DEMO_POSTS = Array.from({ length: 30 }, (_, i) => ({
  id: `demo-post-${i + 1}`,
  content: [
    "Just deployed my first microservice architecture! 🚀 Learning so much about Docker and Kubernetes.",
    "Anyone else excited about the new React 19 features? The compiler optimization is game-changing!",
    "Spent the whole day debugging... turned out to be a missing semicolon. Classic programmer moment 😅",
    "Built a real-time chat app using WebSockets and Node.js. The feeling when it works perfectly is amazing!",
    "TypeScript is a lifesaver for large codebases. Can't imagine going back to vanilla JavaScript now.",
    "Just passed my AWS certification! Cloud computing is the future 🌥️",
    "Working on a machine learning project to predict stock prices. Data preprocessing is harder than expected!",
    "Finally understood how Redux works. State management makes so much more sense now.",
    "Best VS Code extensions? I swear by Prettier, ESLint, and GitLens. What are yours?",
    "Refactored 500 lines of code into 50. Clean code feels so good! 💯",
    "GraphQL vs REST API - which do you prefer? Currently migrating to GraphQL and loving it.",
    "Late night coding session with lots of coffee ☕ Building something cool!",
    "Open source contribution #50! The community is so supportive and amazing.",
    "CSS Grid and Flexbox together? Perfect layout every time. 🎨",
    "Discovered a new algorithm that cut my API response time by 70%! Optimization is an art.",
    "MongoDB or PostgreSQL? Still can't decide for my next project. Help!",
    "Just learned about design patterns. Factory and Singleton are mind-blowing! 🧠",
    "Deployed my portfolio site! Check it out and let me know what you think.",
    "Git rebase vs merge... finally understood the difference. Game changer for clean commit history.",
    "Building a Chrome extension to boost productivity. Beta testers needed!",
    "Svelte is so underrated! The performance and simplicity are incredible.",
    "Just finished a 12-hour hackathon. Exhausted but we won! 🏆",
    "Python's async/await is powerful. Concurrent programming made easy.",
    "Mobile-first design isn't just a trend, it's essential. 📱",
    "Docker containers changed my development workflow completely. No more 'works on my machine' issues!",
    "Learning system design. Scalability is more complex than I thought!",
    "Tailwind CSS is amazing for rapid prototyping. Utility-first ftw!",
    "Just got my first dev job offer! Dreams do come true with hard work! 🎉",
    "Code review taught me more than any tutorial. Collaboration is key.",
    "Working on a side project that might become a startup. Wish me luck! 🚀"
  ][i % 30],
  image_url: [
    'https://images.unsplash.com/photo-1667372393119-3d4c48d07fc9?w=800&h=450&fit=crop', // Docker/containers
    'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&h=450&fit=crop', // React code
    'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=800&h=450&fit=crop', // Code on screen
    'https://images.unsplash.com/photo-1551650975-87deedd944c3?w=800&h=450&fit=crop', // Workspace/WebSockets
    'https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=800&h=450&fit=crop', // TypeScript
    'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&h=450&fit=crop', // Cloud computing
    'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=450&fit=crop', // Data/ML
    'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&h=450&fit=crop', // Code screen
    'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800&h=450&fit=crop', // VS Code
    'https://images.unsplash.com/photo-1542831371-29b0f74f9713?w=800&h=450&fit=crop', // Clean code
    'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&h=450&fit=crop', // API/GraphQL
    'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800&h=450&fit=crop', // Coffee coding
    'https://images.unsplash.com/photo-1556075798-4825dfaaf498?w=800&h=450&fit=crop', // Open source
    'https://images.unsplash.com/photo-1507721999472-8ed4421c4af2?w=800&h=450&fit=crop', // CSS/Design
    'https://images.unsplash.com/photo-1605379399642-870262d3d051?w=800&h=450&fit=crop', // Algorithm
    'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=800&h=450&fit=crop', // Database
    'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&h=450&fit=crop', // Design patterns
    'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=450&fit=crop', // Portfolio
    'https://images.unsplash.com/photo-1556075798-4825dfaaf498?w=800&h=450&fit=crop', // Git
    'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&h=450&fit=crop', // Chrome extension
    'https://images.unsplash.com/photo-1619410283995-43d9134e7656?w=800&h=450&fit=crop', // Svelte/modern
    'https://images.unsplash.com/photo-1504639725590-34d0984388bd?w=800&h=450&fit=crop', // Hackathon
    'https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=800&h=450&fit=crop', // Python
    'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800&h=450&fit=crop', // Mobile-first
    'https://images.unsplash.com/photo-1605745341075-1e8c9e3c3e0a?w=800&h=450&fit=crop', // Docker
    'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&h=450&fit=crop', // System design
    'https://images.unsplash.com/photo-1587620962725-abab7fe55159?w=800&h=450&fit=crop', // Tailwind
    'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&h=450&fit=crop', // Job offer
    'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=800&h=450&fit=crop', // Code review
    'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&h=450&fit=crop'  // Startup
  ][i % 30],
  video_url: null,
  user_id: `test-user-${(i % 30) + 1}`,
  created_at: new Date(Date.now() - (30 - i) * 24 * 60 * 60 * 1000).toISOString(),
  profiles: {
    username: `Testing ${(i % 30) + 1}`,
    full_name: `Testing ${(i % 30) + 1}`,
    avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=Testing${(i % 30) + 1}`,
    is_verified: false
  },
  likes: [],
  comments: [],
  saves: []
}));

interface Post {
  id: string;
  content: string;
  image_url: string | null;
  video_url: string | null;
  user_id: string;
  created_at: string;
  updated_at?: string;
  is_project_update?: boolean;
  project_id?: string | null;
  profiles: {
    username: string;
    full_name: string;
    avatar_url: string | null;
    is_verified?: boolean | null;
  };
  likes: { id: string; user_id: string }[];
  comments: { id: string }[];
  saves?: { id: string; user_id: string }[];
}

const Feed = () => {
  const [user, setUser] = useState<User | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const pageRef = React.useRef(0);
  const [hasMore, setHasMore] = useState(true);
  const { ref, inView } = useInView();
  const POSTS_PER_PAGE = 10;
  const [unreadCount, setUnreadCount] = useState(0);
  const navigate = useNavigate();
  const { toast } = useToast();
  const [filteredPosts, setFilteredPosts] = useState<Post[] | null>(null);

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
    if (inView && hasMore && !loading) {
      pageRef.current += 1;
      fetchPosts();
    }
  }, [inView, hasMore, loading]);

  useEffect(() => {

    if (user) {
      // Load from cache first
      const loadCache = async () => {
        const cachedPosts = await getPostsFromCache();
        if (cachedPosts && cachedPosts.length > 0) {
          // Sort by date desc
          cachedPosts.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
          setPosts(cachedPosts);
          setLoading(false); // Show cached content immediately
        }
      };
      loadCache();

      fetchPosts();
      fetchUnreadCount();

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
            // Reset pagination on new post
            pageRef.current = 0;
            fetchPosts(true);
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
            // For likes, we might want to just update the specific post, but for now re-fetch current page or do nothing if optimistic UI handles it.
            // Actually, re-fetching everything might be too heavy. Let's rely on optimistic UI for likes.
          }
        )

        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'notifications',
            filter: `user_id=eq.${user.id}`
          },
          () => {
            fetchUnreadCount();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user]);

  const fetchPosts = useCallback(async (reset = false) => {
    try {
      if (reset) {
        setLoading(true);
        pageRef.current = 0;
      }

      const currentPage = pageRef.current;
      const from = currentPage * POSTS_PER_PAGE;
      const to = from + POSTS_PER_PAGE - 1;

      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          profiles(username, full_name, avatar_url, is_verified),
          likes(id, user_id),
          comments(id),
          saves(id, user_id)
        `)
        .order('created_at', { ascending: false })
        .range(from, to);

      if (error) throw error;

      const newPosts = data || [];

      if (reset || currentPage === 0) {
        const combinedPosts = [...newPosts, ...DEMO_POSTS];
        combinedPosts.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        setPosts(combinedPosts);

        if (newPosts.length < POSTS_PER_PAGE) {
          setHasMore(false);
        } else {
          setHasMore(true);
        }

        if (currentPage === 0) {
          savePostsToCache(combinedPosts);
        }
      } else {
        if (newPosts.length < POSTS_PER_PAGE) {
          setHasMore(false);
        }
        setPosts(prev => [...prev, ...newPosts]);
      }

    } catch (error) {
      toast({
        title: "Error loading posts",
        description: (error as Error).message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const fetchUnreadCount = async () => {
    if (!user) return;
    const { count } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('is_read', false);
    setUnreadCount(count || 0);
  };

  const toggleLike = useCallback(async (postId: string, isLiked: boolean) => {
    if (!user) return;

    // Optimistic update
    setPosts(currentPosts => currentPosts.map(post => {
      if (post.id === postId) {
        if (isLiked) {
          return { ...post, likes: post.likes.filter(like => like.user_id !== user.id) };
        } else {
          return { ...post, likes: [...post.likes, { id: 'temp-id', user_id: user.id }] };
        }
      }
      return post;
    }));

    try {
      if (isLiked) {
        const { data: likeData } = await supabase
          .from('likes')
          .select('id')
          .eq('user_id', user.id)
          .eq('post_id', postId)
          .single();

        if (likeData) {
          await supabase.from('likes').delete().eq('id', likeData.id);
        }
      } else {
        await supabase.from('likes').insert({
          user_id: user.id,
          post_id: postId,
        });

        const { data: postData } = await supabase
          .from('posts')
          .select('user_id')
          .eq('id', postId)
          .single();

        if (postData && postData.user_id !== user.id) {
          const actorName = user.user_metadata.full_name || user.email?.split('@')[0] || "Someone";
          await sendPushNotification(postData.user_id, `${actorName} liked your post`);
        }
      }
    } catch (error) {
      toast({
        title: "Error",
        description: (error as Error).message,
        variant: "destructive",
      });
      fetchPosts(); // Revert on error
    }
  }, [user, toast, fetchPosts]);

  const toggleSave = useCallback(async (postId: string, isSaved: boolean) => {
    if (!user) return;

    // Optimistic update
    setPosts(currentPosts => currentPosts.map(post => {
      if (post.id === postId) {
        if (isSaved) {
          const newSaves = post.saves ? post.saves.filter(save => save.user_id !== user.id) : [];
          return { ...post, saves: newSaves };
        } else {
          const newSaves = post.saves ? [...post.saves, { id: 'temp-id', user_id: user.id }] : [{ id: 'temp-id', user_id: user.id }];
          return { ...post, saves: newSaves };
        }
      }
      return post;
    }));

    try {
      if (isSaved) {
        const { data: saveData } = await supabase
          .from('saves')
          .select('id')
          .eq('user_id', user.id)
          .eq('post_id', postId)
          .single();

        if (saveData) {
          await supabase.from('saves').delete().eq('id', saveData.id);
        }
      } else {
        await supabase.from('saves').insert({
          user_id: user.id,
          post_id: postId,
        });

        const { data: postData } = await supabase
          .from('posts')
          .select('user_id')
          .eq('id', postId)
          .single();

        if (postData && postData.user_id !== user.id) {
          const actorName = user.user_metadata.full_name || user.email?.split('@')[0] || "Someone";
          await sendPushNotification(postData.user_id, `${actorName} saved your post`);
        }
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
      fetchPosts();
    }
  }, [user, toast, fetchPosts]);

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

  const postsToDisplay = filteredPosts ?? posts;

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
      <header className="sticky top-0 z-50 bg-card border-b border-black/20 dark:border-border shadow-sm">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold gradient-text">FutoraOne</h1>
          <div className="flex items-center gap-4">
            <ModeToggle />
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
              <span className={`absolute top-1 right-1 w-2 h-2 bg-blue-500 rounded-full ${unreadCount > 0 ? 'animate-blink-glow' : ''}`}></span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-3 sm:px-4 py-4 sm:py-6 pb-24">
        <FeedSearch posts={posts} onFilteredPostsChange={setFilteredPosts} />

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
          {postsToDisplay.length === 0 && !loading ? (
            <Card className="p-12 text-center">
              <p className="text-muted-foreground">No posts found.</p>
            </Card>
          ) : (
            <>
              {postsToDisplay.map((post, index) => (
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
              ))}
              {hasMore && !filteredPosts && (
                <div ref={ref} className="py-4">
                  <PostSkeleton />
                </div>
              )}
            </>
          )}
        </div>
      </main>

      <BottomNav />
    </div>
  );
};

export default React.memo(Feed);
