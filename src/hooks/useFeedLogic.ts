import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { getPostsFromCache, savePostsToCache } from "@/utils/cache";
import { triggerHeartConfetti } from "@/utils/confetti";
import { sendPushNotification } from "@/utils/notifications";
import { DEMO_POSTS } from "@/constants/feedData";
import type { User } from "@supabase/supabase-js";

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

const profileCache = new Map<string, any>();

export const useFeedLogic = () => {
    const [user, setUser] = useState<User | null>(null);
    const [userProfile, setUserProfile] = useState<{ xp: number; level: number; current_streak: number } | null>(null);
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);
    const pageRef = useRef(0);
    const [hasMore, setHasMore] = useState(true);
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

    const fetchUserProfile = useCallback(async (userId: string) => {
        if (profileCache.has(userId)) {
            setUserProfile(profileCache.get(userId));
            return;
        }

        const { data, error } = await supabase
            .from('profiles')
            .select('xp, level, current_streak')
            .eq('id', userId)
            .maybeSingle();

        if (!error && data) {
            profileCache.set(userId, data);
            setUserProfile(data as any);
        }
    }, []);

    const fetchPosts = useCallback(async () => {
        try {
            const { data, error } = await supabase
                .from('posts')
                .select('*, profiles(username, full_name, avatar_url, is_verified), likes(id, user_id), comments(id), saves(id, user_id)')
                .order('created_at', { ascending: false })
                .range(pageRef.current * POSTS_PER_PAGE, (pageRef.current + 1) * POSTS_PER_PAGE - 1);

            if (error) throw error;

            const formattedPosts: Post[] = (data || []).map(post => ({
                ...post,
                likes: post.likes || [],
                comments: post.comments || [],
                saves: post.saves || []
            }));

            let allPosts = formattedPosts;
            if (pageRef.current === 0 && formattedPosts.length < 5) {
                allPosts = [...formattedPosts, ...DEMO_POSTS];
            }

            if (pageRef.current === 0) {
                setPosts(allPosts);
                savePostsToCache(allPosts.slice(0, 20));
            } else {
                setPosts(prev => [...prev, ...allPosts]);
            }

            if (formattedPosts.length < POSTS_PER_PAGE) {
                setHasMore(false);
            }
        } catch (error: any) {
            console.error('Error fetching posts:', error);
            toast({
                title: "Error loading posts",
                description: error.message,
                variant: "destructive",
            });
            if (pageRef.current === 0) {
                const cached = await getPostsFromCache();
                if (cached) setPosts(cached);
            }
        } finally {
            setLoading(false);
        }
    }, [toast]);

    const fetchUnreadCount = useCallback(async () => {
        const { count } = await supabase
            .from('notifications')
            .select('*', { count: 'exact', head: true })
            .eq('read', false);
        setUnreadCount(count || 0);
    }, []);

    useEffect(() => {
        if (user) {
            const loadCache = async () => {
                const cachedPosts = (await getPostsFromCache()) as any;
                if (cachedPosts && cachedPosts.length > 0) {
                    cachedPosts.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
                    setPosts(cachedPosts);
                    setLoading(false);
                }
            };
            loadCache();

            fetchPosts();
            fetchUnreadCount();

            const channel = supabase
                .channel('posts-changes')
                .on(
                    'postgres_changes',
                    {
                        event: 'INSERT',
                        schema: 'public',
                        table: 'posts'
                    },
                    (payload) => {
                        const newPost = payload.new as Post;
                        supabase
                            .from('posts')
                            .select(`
                                *,
                                profiles(username, full_name, avatar_url, is_verified),
                                likes(id, user_id),
                                comments(id),
                                saves(id, user_id)
                            `)
                            .eq('id', newPost.id)
                            .single()
                            .then(({ data }) => {
                                if (data) {
                                    const formattedPost: Post = {
                                        ...data,
                                        likes: data.likes || [],
                                        comments: data.comments || [],
                                        saves: data.saves || []
                                    };
                                    setPosts(prev => {
                                        if (prev.some(p => p.id === formattedPost.id)) return prev;
                                        return [formattedPost, ...prev];
                                    });
                                }
                            });
                    }
                )
                .subscribe();

            const notificationChannel = supabase
                .channel('notifications-count')
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
                supabase.removeChannel(notificationChannel);
            };
        }
    }, [user, fetchPosts, fetchUnreadCount]);

    const toggleLike = useCallback(async (postId: string, isLiked: boolean) => {
        if (!user) return;

        const isDemoPost = postId.startsWith('demo-post-');

        setPosts(currentPosts => currentPosts.map(post => {
            if (post.id === postId) {
                if (isLiked) {
                    const newLikes = post.likes ? post.likes.filter(like => like.user_id !== user.id) : [];
                    return { ...post, likes: newLikes };
                } else {
                    const newLikes = post.likes ? [...post.likes, { id: 'temp-id', user_id: user.id }] : [{ id: 'temp-id', user_id: user.id }];
                    return { ...post, likes: newLikes };
                }
            }
            return post;
        }));

        if (isDemoPost) {
            if (!isLiked) triggerHeartConfetti();
            return;
        }

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
                triggerHeartConfetti();
                await supabase.from('likes').insert({
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
                    await sendPushNotification(postData.user_id, `${actorName} liked your post`);
                }
            }
        } catch (error: any) {
            toast({
                title: "Error",
                description: (error as Error).message,
                variant: "destructive",
            });
            fetchPosts();
        }
    }, [user, toast, fetchPosts]);

    const toggleSave = useCallback(async (postId: string, isSaved: boolean) => {
        if (!user) return;

        const isDemoPost = postId.startsWith('demo-post-');

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
                    sendPushNotification(postData.user_id, `${actorName} saved your post`).catch(console.error);
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
    }, [toast, fetchPosts]);

    const handleLogout = useCallback(async () => {
        await supabase.auth.signOut();
        navigate("/");
    }, [navigate]);

    const loadMore = useCallback(() => {
        if (!loading && hasMore) {
            pageRef.current += 1;
            fetchPosts();
        }
    }, [loading, hasMore, fetchPosts]);

    return useMemo(() => ({
        user,
        userProfile,
        posts,
        loading,
        hasMore,
        unreadCount,
        setPosts,
        loadMore,
        fetchPosts,
        toggleLike,
        toggleSave,
        handleShare,
        handleDeletePost,
        handleLogout
    }), [user, userProfile, posts, loading, hasMore, unreadCount, loadMore, fetchPosts, toggleLike, toggleSave, handleShare, handleDeletePost, handleLogout]);
};

export type { Post };
