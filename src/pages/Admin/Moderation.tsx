import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    Check,
    X,
    AlertTriangle,
    MessageSquare,
    Image as ImageIcon,
    Flag,
    Trash2
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area";

const ModerationPage = () => {
    const [posts, setPosts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedPostComments, setSelectedPostComments] = useState<any[]>([]);
    const [isCommentsOpen, setIsCommentsOpen] = useState(false);
    const [currentPostId, setCurrentPostId] = useState<string | null>(null);
    const { toast } = useToast();

    useEffect(() => {
        fetchPosts();
    }, []);

    const fetchPosts = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from("posts")
                .select(`
                    *,
                    profiles:user_id (
                        username,
                        avatar_url
                    )
                `)
                .order("created_at", { ascending: false })
                .limit(20);

            if (error) throw error;
            setPosts(data || []);
        } catch (error) {
            console.error("Error fetching posts:", error);
        } finally {
            setLoading(false);
        }
    };

    const deletePost = async (postId: string) => {
        try {
            const { error } = await supabase
                .from("posts")
                .delete()
                .eq("id", postId);

            if (error) throw error;

            setPosts(posts.filter(p => p.id !== postId));
            toast({
                title: "Post Deleted",
                description: "The post has been permanently removed.",
            });
        } catch (error) {
            console.error("Error deleting post:", error);
            toast({
                title: "Error",
                description: "Failed to delete post",
                variant: "destructive",
            });
        }
    };

    const fetchComments = async (postId: string) => {
        setCurrentPostId(postId);
        try {
            const { data, error } = await supabase
                .from("comments")
                .select(`
                    *,
                    profiles:user_id (
                        username,
                        avatar_url
                    )
                `)
                .eq("post_id", postId)
                .order("created_at", { ascending: false });

            if (error) throw error;
            setSelectedPostComments(data || []);
            setIsCommentsOpen(true);
        } catch (error) {
            console.error("Error fetching comments:", error);
        }
    };

    const deleteComment = async (commentId: string) => {
        try {
            const { error } = await supabase
                .from("comments")
                .delete()
                .eq("id", commentId);

            if (error) throw error;

            setSelectedPostComments(selectedPostComments.filter(c => c.id !== commentId));
            toast({
                title: "Comment Deleted",
                description: "The comment has been removed.",
            });
        } catch (error) {
            console.error("Error deleting comment:", error);
            toast({
                title: "Error",
                description: "Failed to delete comment",
                variant: "destructive",
            });
        }
    };

    return (
        <AdminLayout>
            <div className="space-y-6">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Content Moderation</h2>
                    <p className="text-muted-foreground mt-1">Review and manage usage content.</p>
                </div>

                <Tabs defaultValue="posts" className="space-y-4">
                    <TabsList>
                        <TabsTrigger value="posts">Recent Posts</TabsTrigger>
                        {/* We can add 'Reported' tab later when we have specific reporting table */}
                    </TabsList>

                    <TabsContent value="posts" className="space-y-4">
                        {loading ? (
                            <div>Loading posts...</div>
                        ) : posts.map((post) => (
                            <Card key={post.id} className="overflow-hidden">
                                <CardHeader className="bg-muted/30 pb-3">
                                    <div className="flex justify-between items-start">
                                        <div className="flex gap-3">
                                            <Avatar className="w-10 h-10 border">
                                                <AvatarImage src={post.profiles?.avatar_url} />
                                                <AvatarFallback>{post.profiles?.username?.[0] || "U"}</AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <h4 className="font-semibold text-sm">{post.profiles?.username || "Unknown User"}</h4>
                                                </div>
                                                <p className="text-xs text-muted-foreground mt-0.5">
                                                    {new Date(post.created_at).toLocaleString()}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="pt-4">
                                    <div className="space-y-3">
                                        <div className="bg-muted/50 p-4 rounded-md text-sm">
                                            {post.content}
                                        </div>
                                        {post.image_url && (
                                            <div className="relative aspect-video w-full max-w-md rounded-md overflow-hidden bg-muted">
                                                <img src={post.image_url} alt="Post content" className="w-full h-full object-cover" />
                                            </div>
                                        )}
                                        <div className="flex gap-3 pt-2 justify-end">
                                            <Dialog open={isCommentsOpen && currentPostId === post.id} onOpenChange={(open) => {
                                                if (!open) {
                                                    setIsCommentsOpen(false);
                                                    setCurrentPostId(null);
                                                }
                                            }}>
                                                <DialogTrigger asChild>
                                                    <Button variant="outline" className="gap-2" onClick={() => fetchComments(post.id)}>
                                                        <MessageSquare className="w-4 h-4" />
                                                        View Comments
                                                    </Button>
                                                </DialogTrigger>
                                                <DialogContent className="max-w-2xl max-h-[80vh]">
                                                    <DialogHeader>
                                                        <DialogTitle>Comments</DialogTitle>
                                                        <DialogDescription>
                                                            Managing comments for this post.
                                                        </DialogDescription>
                                                    </DialogHeader>
                                                    <ScrollArea className="h-[50vh] pr-4">
                                                        <div className="space-y-4">
                                                            {selectedPostComments.length === 0 ? (
                                                                <p className="text-center text-muted-foreground py-4">No comments found.</p>
                                                            ) : selectedPostComments.map(comment => (
                                                                <div key={comment.id} className="flex gap-3 items-start border-b pb-4 last:border-0">
                                                                    <Avatar className="w-8 h-8">
                                                                        <AvatarImage src={comment.profiles?.avatar_url} />
                                                                        <AvatarFallback>{comment.profiles?.username?.[0]}</AvatarFallback>
                                                                    </Avatar>
                                                                    <div className="flex-1 space-y-1">
                                                                        <div className="flex items-center justify-between">
                                                                            <p className="text-sm font-medium">{comment.profiles?.username}</p>
                                                                            <span className="text-xs text-muted-foreground">{new Date(comment.created_at).toLocaleDateString()}</span>
                                                                        </div>
                                                                        <p className="text-sm text-foreground/90">{comment.content}</p>
                                                                    </div>
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="icon"
                                                                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                                                        onClick={() => deleteComment(comment.id)}
                                                                    >
                                                                        <Trash2 className="w-4 h-4" />
                                                                    </Button>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </ScrollArea>
                                                </DialogContent>
                                            </Dialog>

                                            <Button
                                                variant="destructive"
                                                className="gap-2 bg-red-600 hover:bg-red-700"
                                                onClick={() => {
                                                    if (confirm("Are you sure you want to delete this post?")) {
                                                        deletePost(post.id);
                                                    }
                                                }}
                                            >
                                                <X className="w-4 h-4" />
                                                Delete Post
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </TabsContent>
                </Tabs>
            </div>
        </AdminLayout>
    );
};

export default ModerationPage;
