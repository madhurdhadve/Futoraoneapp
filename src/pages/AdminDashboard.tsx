import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { 
  ArrowLeft, CheckCircle, XCircle, Clock, Shield, AlertCircle, 
  Users, FileText, BarChart3, Eye, Trash2, BadgeCheck, MessageSquare,
  Heart, Image, Video, Ban, RefreshCw, TrendingUp, Activity,
  UserX, Download, Settings, Bell
} from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { VerifiedBadge } from "@/components/VerifiedBadge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

interface VerificationRequest {
  id: string;
  user_id: string;
  reason: string;
  category: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  reviewed_at: string | null;
  reviewer_notes: string | null;
  profiles: {
    username: string;
    full_name: string;
    avatar_url: string | null;
  };
}

interface UserProfile {
  id: string;
  username: string;
  full_name: string;
  avatar_url: string | null;
  bio: string | null;
  is_verified: boolean | null;
  created_at: string;
  location: string | null;
  followers_count?: number;
  following_count?: number;
  posts_count?: number;
}

interface Post {
  id: string;
  content: string;
  image_url: string | null;
  video_url: string | null;
  created_at: string;
  user_id: string;
  profiles?: {
    username: string;
    full_name: string;
    avatar_url: string | null;
  };
  likes_count?: number;
  comments_count?: number;
}

interface Stats {
  totalUsers: number;
  verifiedUsers: number;
  totalPosts: number;
  totalComments: number;
  totalLikes: number;
  totalFollows: number;
  pendingVerifications: number;
  activeToday: number;
}

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isAdmin, loading: adminLoading } = useIsAdmin();
  
  // Main tab state
  const [mainTab, setMainTab] = useState("overview");
  
  // Verification state
  const [requests, setRequests] = useState<VerificationRequest[]>([]);
  const [selectedRequests, setSelectedRequests] = useState<Set<string>>(new Set());
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [verificationTab, setVerificationTab] = useState("pending");
  const [reviewDialog, setReviewDialog] = useState<{ open: boolean; request: VerificationRequest | null }>({
    open: false,
    request: null,
  });
  const [reviewNotes, setReviewNotes] = useState("");
  
  // Users state
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [userSearch, setUserSearch] = useState("");
  const [filteredUsers, setFilteredUsers] = useState<UserProfile[]>([]);
  
  // Posts state
  const [posts, setPosts] = useState<Post[]>([]);
  const [postSearch, setPostSearch] = useState("");
  const [filteredPosts, setFilteredPosts] = useState<Post[]>([]);
  
  // Stats state
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    verifiedUsers: 0,
    totalPosts: 0,
    totalComments: 0,
    totalLikes: 0,
    totalFollows: 0,
    pendingVerifications: 0,
    activeToday: 0,
  });
  
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  // Fetch stats
  const fetchStats = useCallback(async () => {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const [usersRes, postsRes, commentsRes, verificationsRes, likesRes, followsRes, activeTodayRes] = await Promise.all([
        supabase.from('profiles').select('id, is_verified'),
        supabase.from('posts').select('id', { count: 'exact', head: true }),
        supabase.from('comments').select('id', { count: 'exact', head: true }),
        supabase.from('verification_requests').select('id').eq('status', 'pending'),
        supabase.from('likes').select('id', { count: 'exact', head: true }),
        supabase.from('follows').select('id', { count: 'exact', head: true }),
        supabase.from('user_presence').select('user_id', { count: 'exact', head: true }).eq('is_online', true),
      ]);

      const usersData = usersRes.data || [];
      setStats({
        totalUsers: usersData.length,
        verifiedUsers: usersData.filter(u => u.is_verified).length,
        totalPosts: postsRes.count || 0,
        totalComments: commentsRes.count || 0,
        totalLikes: likesRes.count || 0,
        totalFollows: followsRes.count || 0,
        pendingVerifications: verificationsRes.data?.length || 0,
        activeToday: activeTodayRes.count || 0,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  }, []);

  // Fetch all users
  const fetchUsers = useCallback(async () => {
    try {
      const { data: usersData, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Get counts for each user
      const usersWithCounts = await Promise.all(
        (usersData || []).map(async (user) => {
          const [followersRes, followingRes, postsRes] = await Promise.all([
            supabase.from('follows').select('id', { count: 'exact', head: true }).eq('following_id', user.id),
            supabase.from('follows').select('id', { count: 'exact', head: true }).eq('follower_id', user.id),
            supabase.from('posts').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
          ]);

          return {
            ...user,
            followers_count: followersRes.count || 0,
            following_count: followingRes.count || 0,
            posts_count: postsRes.count || 0,
          };
        })
      );

      setUsers(usersWithCounts);
      setFilteredUsers(usersWithCounts);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  }, []);

  // Fetch all posts
  const fetchPosts = useCallback(async () => {
    try {
      const { data: postsData, error } = await supabase
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;

      // Get profile and counts for each post
      const postsWithDetails = await Promise.all(
        (postsData || []).map(async (post) => {
          const [profileRes, likesRes, commentsRes] = await Promise.all([
            supabase.from('profiles').select('username, full_name, avatar_url').eq('id', post.user_id).single(),
            supabase.from('likes').select('id', { count: 'exact', head: true }).eq('post_id', post.id),
            supabase.from('comments').select('id', { count: 'exact', head: true }).eq('post_id', post.id),
          ]);

          return {
            ...post,
            profiles: profileRes.data || { username: 'Unknown', full_name: 'Unknown', avatar_url: null },
            likes_count: likesRes.count || 0,
            comments_count: commentsRes.count || 0,
          };
        })
      );

      setPosts(postsWithDetails);
      setFilteredPosts(postsWithDetails);
    } catch (error) {
      console.error('Error fetching posts:', error);
    }
  }, []);

  // Fetch verification requests
  const fetchRequests = useCallback(async () => {
    try {
      let query = supabase
        .from('verification_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (verificationTab !== 'all') {
        query = query.eq('status', verificationTab);
      }

      if (filterCategory !== 'all') {
        query = query.eq('category', filterCategory);
      }

      const { data: requestsData, error } = await query;

      if (error) throw error;

      const requestsWithProfiles = await Promise.all(
        (requestsData || []).map(async (request) => {
          const { data: profile } = await supabase
            .from('profiles')
            .select('username, full_name, avatar_url')
            .eq('id', request.user_id)
            .single();

          return {
            ...request,
            profiles: profile || { username: 'Unknown', full_name: 'Unknown User', avatar_url: null },
          } as VerificationRequest;
        })
      );

      setRequests(requestsWithProfiles);
    } catch (error) {
      console.error('Error fetching requests:', error);
      toast({
        title: "Error",
        description: "Failed to fetch verification requests",
        variant: "destructive",
      });
    }
  }, [verificationTab, filterCategory, toast]);

  // Filter users based on search
  useEffect(() => {
    if (userSearch.trim() === '') {
      setFilteredUsers(users);
    } else {
      const search = userSearch.toLowerCase();
      setFilteredUsers(users.filter(u => 
        u.username.toLowerCase().includes(search) ||
        u.full_name.toLowerCase().includes(search)
      ));
    }
  }, [userSearch, users]);

  // Filter posts based on search
  useEffect(() => {
    if (postSearch.trim() === '') {
      setFilteredPosts(posts);
    } else {
      const search = postSearch.toLowerCase();
      setFilteredPosts(posts.filter(p => 
        p.content.toLowerCase().includes(search) ||
        p.profiles?.username.toLowerCase().includes(search)
      ));
    }
  }, [postSearch, posts]);

  // Initial data fetch
  useEffect(() => {
    if (adminLoading) return;
    
    if (!isAdmin) {
      toast({
        title: "Access Denied",
        description: "You don't have permission to access this page",
        variant: "destructive",
      });
      navigate('/feed');
      return;
    }

    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchStats(), fetchUsers(), fetchPosts(), fetchRequests()]);
      setLoading(false);
    };

    loadData();
  }, [isAdmin, adminLoading, navigate, fetchStats, fetchUsers, fetchPosts, fetchRequests, toast]);

  // Refetch verification requests when tab changes
  useEffect(() => {
    if (isAdmin && mainTab === 'verifications') {
      fetchRequests();
    }
  }, [verificationTab, filterCategory, isAdmin, mainTab, fetchRequests]);

  const handleAction = async (requestId: string, action: 'approve' | 'reject', notes?: string) => {
    setProcessing(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const response = await supabase.functions.invoke('manage-verification', {
        body: { requestId, action, reviewerNotes: notes },
      });

      if (response.error) throw response.error;

      toast({
        title: action === 'approve' ? "✅ Approved!" : "❌ Rejected",
        description: `Verification request has been ${action}ed`,
      });

      setSelectedRequests(new Set());
      setReviewDialog({ open: false, request: null });
      setReviewNotes("");
      fetchRequests();
      fetchStats();
    } catch (error) {
      console.error('Error processing request:', error);
      toast({
        title: "Error",
        description: "Failed to process verification request",
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleBulkAction = async (action: 'approve' | 'reject') => {
    if (selectedRequests.size === 0) return;

    setProcessing(true);
    const promises = Array.from(selectedRequests).map(id => 
      handleAction(id, action)
    );

    await Promise.all(promises);
    setSelectedRequests(new Set());
    setProcessing(false);
  };

  const toggleSelection = (id: string) => {
    const newSelected = new Set(selectedRequests);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedRequests(newSelected);
  };

  const selectAll = () => {
    if (selectedRequests.size === requests.length) {
      setSelectedRequests(new Set());
    } else {
      setSelectedRequests(new Set(requests.map(r => r.id)));
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (!confirm('Are you sure you want to delete this post?')) return;
    
    try {
      const { error } = await supabase.from('posts').delete().eq('id', postId);
      if (error) throw error;
      
      toast({ title: "Post deleted successfully" });
      fetchPosts();
      fetchStats();
    } catch (error) {
      console.error('Error deleting post:', error);
      toast({ title: "Error deleting post", variant: "destructive" });
    }
  };

  const handleToggleVerification = async (userId: string, currentStatus: boolean | null) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ is_verified: !currentStatus })
        .eq('id', userId);
      
      if (error) throw error;
      
      toast({ title: `User ${!currentStatus ? 'verified' : 'unverified'} successfully` });
      fetchUsers();
      fetchStats();
    } catch (error) {
      console.error('Error toggling verification:', error);
      toast({ title: "Error updating verification status", variant: "destructive" });
    }
  };

  const handleDeleteUser = async (userId: string, username: string) => {
    try {
      // Delete user's posts first
      await supabase.from('posts').delete().eq('user_id', userId);
      // Delete user's comments
      await supabase.from('comments').delete().eq('user_id', userId);
      // Delete user's likes
      await supabase.from('likes').delete().eq('user_id', userId);
      // Delete follows
      await supabase.from('follows').delete().or(`follower_id.eq.${userId},following_id.eq.${userId}`);
      // Delete profile
      const { error } = await supabase.from('profiles').delete().eq('id', userId);
      
      if (error) throw error;
      
      toast({ title: `User @${username} deleted successfully` });
      fetchUsers();
      fetchStats();
    } catch (error) {
      console.error('Error deleting user:', error);
      toast({ title: "Error deleting user", variant: "destructive" });
    }
  };

  const handleRefreshData = async () => {
    setLoading(true);
    await Promise.all([fetchStats(), fetchUsers(), fetchPosts(), fetchRequests()]);
    setLoading(false);
    toast({ title: "Data refreshed successfully" });
  };

  if (adminLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  const categoryEmoji: Record<string, string> = {
    developer: "💻",
    creator: "🎨",
    business: "🚀",
    other: "⭐",
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="container max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="icon" onClick={() => navigate('/feed')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <Shield className="h-6 w-6 text-primary" />
              <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            </div>
            <p className="text-muted-foreground">Manage users, posts, and verification requests</p>
          </div>
          <Button variant="outline" onClick={handleRefreshData} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {/* Main Navigation */}
        <Tabs value={mainTab} onValueChange={setMainTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">
              <BarChart3 className="h-4 w-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="users">
              <Users className="h-4 w-4 mr-2" />
              Users ({stats.totalUsers})
            </TabsTrigger>
            <TabsTrigger value="posts">
              <FileText className="h-4 w-4 mr-2" />
              Posts ({stats.totalPosts})
            </TabsTrigger>
            <TabsTrigger value="verifications">
              <BadgeCheck className="h-4 w-4 mr-2" />
              Verifications
              {stats.pendingVerifications > 0 && (
                <Badge variant="destructive" className="ml-2">{stats.pendingVerifications}</Badge>
              )}
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Total Users</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-primary" />
                    <span className="text-3xl font-bold">{stats.totalUsers}</span>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Verified Users</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <BadgeCheck className="h-5 w-5 text-blue-500" />
                    <span className="text-3xl font-bold">{stats.verifiedUsers}</span>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Total Posts</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-green-500" />
                    <span className="text-3xl font-bold">{stats.totalPosts}</span>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Pending Verifications</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-yellow-500" />
                    <span className="text-3xl font-bold">{stats.pendingVerifications}</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Total Likes</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <Heart className="h-5 w-5 text-red-500" />
                    <span className="text-3xl font-bold">{stats.totalLikes}</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Total Comments</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5 text-purple-500" />
                    <span className="text-3xl font-bold">{stats.totalComments}</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Total Follows</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-emerald-500" />
                    <span className="text-3xl font-bold">{stats.totalFollows}</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Online Now</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <Activity className="h-5 w-5 text-green-400" />
                    <span className="text-3xl font-bold">{stats.activeToday}</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
              {/* Recent Users */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Users</CardTitle>
                  <CardDescription>Latest registered users</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {users.slice(0, 5).map((user) => (
                      <div key={user.id} className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={user.avatar_url || undefined} />
                          <AvatarFallback>{user.full_name[0]}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1">
                            <p className="font-medium truncate">{user.full_name}</p>
                            <VerifiedBadge isVerified={user.is_verified} size={14} />
                          </div>
                          <p className="text-sm text-muted-foreground">@{user.username}</p>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {new Date(user.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Recent Posts */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Posts</CardTitle>
                  <CardDescription>Latest posts on the platform</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {posts.slice(0, 5).map((post) => (
                      <div key={post.id} className="flex items-start gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={post.profiles?.avatar_url || undefined} />
                          <AvatarFallback>{post.profiles?.full_name?.[0] || '?'}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium">@{post.profiles?.username}</p>
                          <p className="text-sm text-muted-foreground truncate">{post.content}</p>
                          <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Heart className="h-3 w-3" /> {post.likes_count}
                            </span>
                            <span className="flex items-center gap-1">
                              <MessageSquare className="h-3 w-3" /> {post.comments_count}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users">
            <div className="mb-4">
              <Input
                placeholder="Search users by name or username..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                className="max-w-md"
              />
            </div>
            
            <div className="grid gap-4">
              {filteredUsers.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No users found</p>
                  </CardContent>
                </Card>
              ) : (
                filteredUsers.map((user) => (
                  <Card key={user.id}>
                    <CardContent className="py-4">
                      <div className="flex items-center gap-4">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={user.avatar_url || undefined} />
                          <AvatarFallback>{user.full_name[0]}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold">{user.full_name}</span>
                            <VerifiedBadge isVerified={user.is_verified} size={16} />
                          </div>
                          <p className="text-sm text-muted-foreground">@{user.username}</p>
                          {user.bio && (
                            <p className="text-sm text-muted-foreground mt-1 truncate">{user.bio}</p>
                          )}
                        </div>
                        <div className="hidden md:flex items-center gap-6 text-sm">
                          <div className="text-center">
                            <p className="font-bold">{user.posts_count}</p>
                            <p className="text-muted-foreground">Posts</p>
                          </div>
                          <div className="text-center">
                            <p className="font-bold">{user.followers_count}</p>
                            <p className="text-muted-foreground">Followers</p>
                          </div>
                          <div className="text-center">
                            <p className="font-bold">{user.following_count}</p>
                            <p className="text-muted-foreground">Following</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate(`/user/${user.username}`)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                          <Button
                            variant={user.is_verified ? "destructive" : "default"}
                            size="sm"
                            onClick={() => handleToggleVerification(user.id, user.is_verified)}
                          >
                            <BadgeCheck className="h-4 w-4 mr-1" />
                            {user.is_verified ? 'Unverify' : 'Verify'}
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="outline" size="sm" className="text-red-500 hover:text-red-600 hover:bg-red-50">
                                <UserX className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete User</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete @{user.username}? This will permanently remove their profile, posts, comments, likes, and all related data. This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  className="bg-red-600 hover:bg-red-700"
                                  onClick={() => handleDeleteUser(user.id, user.username)}
                                >
                                  Delete User
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          {/* Posts Tab */}
          <TabsContent value="posts">
            <div className="mb-4">
              <Input
                placeholder="Search posts by content or username..."
                value={postSearch}
                onChange={(e) => setPostSearch(e.target.value)}
                className="max-w-md"
              />
            </div>
            
            <div className="grid gap-4">
              {filteredPosts.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No posts found</p>
                  </CardContent>
                </Card>
              ) : (
                filteredPosts.map((post) => (
                  <Card key={post.id}>
                    <CardContent className="py-4">
                      <div className="flex items-start gap-4">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={post.profiles?.avatar_url || undefined} />
                          <AvatarFallback>{post.profiles?.full_name?.[0] || '?'}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold">{post.profiles?.full_name}</span>
                            <span className="text-muted-foreground">@{post.profiles?.username}</span>
                            <span className="text-xs text-muted-foreground">
                              • {new Date(post.created_at).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-sm mt-1">{post.content}</p>
                          {(post.image_url || post.video_url) && (
                            <div className="flex items-center gap-2 mt-2">
                              {post.image_url && (
                                <Badge variant="outline">
                                  <Image className="h-3 w-3 mr-1" />
                                  Image
                                </Badge>
                              )}
                              {post.video_url && (
                                <Badge variant="outline">
                                  <Video className="h-3 w-3 mr-1" />
                                  Video
                                </Badge>
                              )}
                            </div>
                          )}
                          <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Heart className="h-4 w-4" /> {post.likes_count} likes
                            </span>
                            <span className="flex items-center gap-1">
                              <MessageSquare className="h-4 w-4" /> {post.comments_count} comments
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate(`/user/${post.profiles?.username}`)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeletePost(post.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          {/* Verifications Tab */}
          <TabsContent value="verifications">
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger className="w-full sm:w-[200px]">
                  <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="developer">💻 Developer</SelectItem>
                  <SelectItem value="creator">🎨 Creator</SelectItem>
                  <SelectItem value="business">🚀 Business</SelectItem>
                  <SelectItem value="other">⭐ Other</SelectItem>
                </SelectContent>
              </Select>

              {selectedRequests.size > 0 && verificationTab === 'pending' && (
                <div className="flex gap-2">
                  <Button
                    onClick={() => handleBulkAction('approve')}
                    disabled={processing}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Approve ({selectedRequests.size})
                  </Button>
                  <Button
                    onClick={() => handleBulkAction('reject')}
                    disabled={processing}
                    variant="destructive"
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Reject ({selectedRequests.size})
                  </Button>
                </div>
              )}
            </div>

            <Tabs value={verificationTab} onValueChange={setVerificationTab}>
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="pending">
                  <Clock className="h-4 w-4 mr-2" />
                  Pending
                </TabsTrigger>
                <TabsTrigger value="approved">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Approved
                </TabsTrigger>
                <TabsTrigger value="rejected">
                  <XCircle className="h-4 w-4 mr-2" />
                  Rejected
                </TabsTrigger>
                <TabsTrigger value="all">All</TabsTrigger>
              </TabsList>

              <TabsContent value={verificationTab} className="mt-6">
                {verificationTab === 'pending' && requests.length > 0 && (
                  <div className="mb-4">
                    <Button variant="outline" size="sm" onClick={selectAll}>
                      {selectedRequests.size === requests.length ? 'Deselect All' : 'Select All'}
                    </Button>
                  </div>
                )}

                {requests.length === 0 ? (
                  <Card>
                    <CardContent className="py-12 text-center">
                      <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">No verification requests found</p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid gap-4">
                    {requests.map((request) => (
                      <Card key={request.id}>
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div className="flex items-start gap-4 flex-1">
                              {verificationTab === 'pending' && (
                                <Checkbox
                                  checked={selectedRequests.has(request.id)}
                                  onCheckedChange={() => toggleSelection(request.id)}
                                />
                              )}
                              <div className="flex-1">
                                <CardTitle className="flex items-center gap-2">
                                  {request.profiles?.username || 'Unknown User'}
                                  <Badge variant="secondary">
                                    {categoryEmoji[request.category]} {request.category}
                                  </Badge>
                                </CardTitle>
                                <CardDescription>
                                  {request.profiles?.full_name} • Submitted {new Date(request.created_at).toLocaleDateString()}
                                </CardDescription>
                              </div>
                            </div>
                            <Badge variant={
                              request.status === 'approved' ? 'default' :
                              request.status === 'rejected' ? 'destructive' :
                              'secondary'
                            }>
                              {request.status}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            <div>
                              <p className="text-sm font-medium mb-2">Reason for Verification:</p>
                              <p className="text-sm text-muted-foreground">{request.reason}</p>
                            </div>

                            {request.reviewer_notes && (
                              <div>
                                <p className="text-sm font-medium mb-2">Reviewer Notes:</p>
                                <p className="text-sm text-muted-foreground">{request.reviewer_notes}</p>
                              </div>
                            )}

                            {request.status === 'pending' && (
                              <div className="flex gap-2 pt-2">
                                <Button
                                  onClick={() => setReviewDialog({ open: true, request })}
                                  className="bg-green-600 hover:bg-green-700"
                                  disabled={processing}
                                >
                                  <CheckCircle className="h-4 w-4 mr-2" />
                                  Approve
                                </Button>
                                <Button
                                  onClick={() => handleAction(request.id, 'reject')}
                                  variant="destructive"
                                  disabled={processing}
                                >
                                  <XCircle className="h-4 w-4 mr-2" />
                                  Reject
                                </Button>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </TabsContent>
        </Tabs>
      </div>

      {/* Review Dialog */}
      <Dialog open={reviewDialog.open} onOpenChange={(open) => setReviewDialog({ open, request: null })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve Verification Request</DialogTitle>
            <DialogDescription>
              Add optional notes about this approval (visible to the user)
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea
              placeholder="e.g., Verified based on portfolio and GitHub contributions"
              value={reviewNotes}
              onChange={(e) => setReviewNotes(e.target.value)}
              rows={4}
            />
            <div className="flex gap-2">
              <Button
                onClick={() => {
                  if (reviewDialog.request) {
                    handleAction(reviewDialog.request.id, 'approve', reviewNotes);
                  }
                }}
                disabled={processing}
                className="bg-green-600 hover:bg-green-700 flex-1"
              >
                {processing ? 'Processing...' : 'Confirm Approval'}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setReviewDialog({ open: false, request: null });
                  setReviewNotes("");
                }}
                disabled={processing}
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminDashboard;
