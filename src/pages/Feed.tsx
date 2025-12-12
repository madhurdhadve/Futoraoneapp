import React, { useState, useEffect, useCallback, useMemo, lazy, Suspense } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Bell, Bot, Zap, Film } from "lucide-react";
import { PostSkeleton } from "@/components/PostSkeleton";
import { BottomNav } from "@/components/BottomNav";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { User } from "@supabase/supabase-js";
import { sendPushNotification } from "@/utils/notifications";
import { FeedPost } from "@/components/FeedPost";

import { useInView } from "react-intersection-observer";

import { getPostsFromCache, savePostsToCache } from "@/utils/cache";
import GamificationWidget from "@/components/GamificationWidget";
import AIMentor from "@/components/AIMentor";

// Lazy load Stories component for better initial load
const Stories = lazy(() => import("@/components/Stories").then(m => ({ default: m.Stories })));

// Demo posts content arrays - defined once outside component
const DEMO_CONTENT = [
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
];

const DEMO_IMAGES = [
  'https://images.unsplash.com/photo-1667372393119-3d4c48d07fc9?w=400&h=225&fit=crop',
  'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400&h=225&fit=crop',
  'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=400&h=225&fit=crop',
  'https://images.unsplash.com/photo-1551650975-87deedd944c3?w=400&h=225&fit=crop',
  'https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=400&h=225&fit=crop',
  'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=400&h=225&fit=crop',
  'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=225&fit=crop',
  'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400&h=225&fit=crop',
  'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400&h=225&fit=crop',
  'https://images.unsplash.com/photo-1542831371-29b0f74f9713?w=400&h=225&fit=crop',
];

// Generate demo posts once at module level (not on every render)
const DEMO_POSTS = Array.from({ length: 10 }, (_, i) => ({
  id: `demo-post-${i + 1}`,
  content: DEMO_CONTENT[i],
  image_url: DEMO_IMAGES[i],
  video_url: null,
  user_id: `test-user-${i + 1}`,
  created_at: new Date(Date.now() - (10 - i) * 24 * 60 * 60 * 1000).toISOString(),
  profiles: {
    username: `TechUser${i + 1}`,
    full_name: `Tech User ${i + 1}`,
    avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=Tech${i + 1}`,
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
  const [userProfile, setUserProfile] = useState<{ xp: number; level: number; current_streak: number } | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const pageRef = React.useRef(0);
  const [hasMore, setHasMore] = useState(true);
  const { ref, inView } = useInView();
  const POSTS_PER_PAGE = 10;
  const [unreadCount, setUnreadCount] = useState(0);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Check authentication
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
      } else {
        setUser(session.user);
        fetchUserProfile(session.user.id);
      }
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session) {
        navigate("/auth");
      } else {
        setUser(session.user);
        fetchUserProfile(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const fetchUserProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('xp, level, current_streak')
      .eq('id', userId)
      .single();

    if (!error && data) {
      setUserProfile(data);
    }
  };

  // Optimize static widgets with useMemo to prevent re-renders
  const gamificationWidget = useMemo(() => (
    <GamificationWidget
      userXP={userProfile?.xp || 0}
      userLevel={userProfile?.level || 1}
      streak={userProfile?.current_streak || 0}
    />
  ), [userProfile]);

  const aiMentor = useMemo(() => <AIMentor />, []);
  const bottomNav = useMemo(() => <BottomNav />, []);

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

    // Skip database operations for demo posts (they have non-UUID IDs)
    const isDemoPost = postId.startsWith('demo-post-');

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

    // Don't persist demo post interactions
    if (isDemoPost) return;

    try {
      if (isLiked) {
        const { data: likeData } = await supabase
          .from('likes')
          .select('id')
          .eq('user_id', user.id)
          .eq('post_id', postId)
          .maybeSingle();

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

          // Award XP for liking (Example gamification integration)
          // In a real app, this should be a DB trigger or a separate API call
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

    // Skip database operations for demo posts
    const isDemoPost = postId.startsWith('demo-post-');

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

    // Don't persist demo post interactions
    if (isDemoPost) return;

    try {
      if (isSaved) {
        const { data: saveData } = await supabase
          .from('saves')
          .select('id')
          .eq('user_id', user.id)
          .eq('post_id', postId)
          .maybeSingle();

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
          .maybeSingle();

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
        timeout: 2000,
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
        <header className="sticky top-0 z-50 bg-card border-b border-black/20 dark:border-border shadow-sm">
          <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
            <h1 className="text-2xl font-bold gradient-text">FutoraOne</h1>
            <div className="flex items-center gap-4">
              <Button size="icon" variant="ghost" className="relative w-12 h-12 mr-2 bg-primary/5 rounded-full" disabled>
                <Zap className="w-8 h-8 text-primary/50" />
              </Button>
              <Button size="icon" variant="ghost" className="relative w-10 h-10 mr-2" disabled>
                <Film className="w-6 h-6 text-muted-foreground" />
              </Button>
              <Button size="icon" variant="ghost" className="relative" disabled>
                <Bell className="w-5 h-5 text-muted-foreground" />
              </Button>
            </div>
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

            <Button
              size="icon"
              variant="ghost"
              className="relative w-12 h-12 mr-2 animate-blink-glow bg-primary/10 rounded-full hover:bg-primary/20 transition-all"
              onClick={() => navigate("/ai-tools")}
            >
              <Zap className="w-8 h-8 text-primary" />
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-sky-500"></span>
              </span>
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="relative w-10 h-10 mr-2 hover:bg-muted transition-all"
              onClick={() => navigate("/tech-reels")}
            >
              <Film className="w-6 h-6 text-foreground" />
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


        {/* Stories - Lazy loaded */}
        <div className="mb-6">
          <Suspense fallback={<div className="h-24 bg-muted/50 rounded-lg animate-pulse" />}>
            <Stories />
          </Suspense>
        </div>

        {/* Gamification Widget */}
        <div className="mb-6">
          {gamificationWidget}
        </div>

        {/* Posts */}
        <div className="space-y-6">
          {posts.length === 0 && !loading ? (
            <Card className="p-12 text-center">
              <p className="text-muted-foreground">No posts found.</p>
            </Card>
          ) : (
            <>
              {posts.map((post, index) => (
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
              {hasMore && (
                <div ref={ref} className="py-4">
                  <PostSkeleton />
                </div>
              )}
            </>
          )}
        </div>
      </main>

      <BottomNav />
      {aiMentor}
    </div>
  );
};

export default React.memo(Feed);
