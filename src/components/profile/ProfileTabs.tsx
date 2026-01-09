import { memo } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star } from "lucide-react";

// Types derived from original file
interface Project {
    id: string;
    title: string;
    description: string;
    tech_stack: string[];
    project_likes: { id: string }[];
}

interface Post {
    id: string;
    content: string;
    image_url: string | null;
    created_at: string;
    likes: { id: string }[];
    comments: { id: string }[];
}

interface Review {
    id: string;
    rating: number;
    comment: string | null;
    created_at: string;
    reviewer: {
        username: string;
        avatar_url: string | null;
    };
}

interface ProfileTabsProps {
    projects: Project[];
    posts: Post[];
    reviews: Review[];
    profile: any;
}

export const ProfileTabs = memo(({ projects, posts, reviews, profile }: ProfileTabsProps) => {
    return (
        <Tabs defaultValue="projects" className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-muted/80 backdrop-blur-sm">
                <TabsTrigger value="projects" className="data-[state=active]:bg-background">
                    Projects
                </TabsTrigger>
                <TabsTrigger value="posts" className="data-[state=active]:bg-background">
                    Posts
                </TabsTrigger>
                <TabsTrigger value="reviews" className="data-[state=active]:bg-background">
                    Reviews
                </TabsTrigger>
            </TabsList>
            <TabsContent value="projects" className="space-y-3 mt-4">
                {projects.length === 0 ? (
                    <Card className="bg-card/80 backdrop-blur-sm border-border">
                        <CardContent className="p-8 text-center">
                            <p className="text-muted-foreground">No projects yet</p>
                        </CardContent>
                    </Card>
                ) : (
                    projects.map((project, index) => (
                        <Card key={index} className="bg-card/80 backdrop-blur-sm border-border">
                            <CardContent className="p-4">
                                <h4 className="font-semibold text-foreground">{project.title}</h4>
                                <p className="text-sm text-muted-foreground mt-1">{project.description}</p>
                                <div className="flex items-center justify-between mt-2">
                                    <div className="flex gap-2">
                                        {project.tech_stack?.slice(0, 3).map((tech: string) => (
                                            <Badge key={tech} variant="outline" className="text-xs border-primary text-primary">
                                                {tech}
                                            </Badge>
                                        ))}
                                    </div>
                                    <span className="text-sm text-muted-foreground">{project.project_likes?.length || 0} likes</span>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </TabsContent>
            <TabsContent value="posts" className="space-y-4 mt-4">
                {posts.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">No posts yet</p>
                ) : (
                    posts.map((post) => (
                        <Card key={post.id} className="bg-card/80 backdrop-blur-sm border-border">
                            <CardContent className="p-4">
                                <div className="flex items-center gap-3 mb-3">
                                    <Avatar className="h-10 w-10">
                                        <AvatarImage src={profile?.avatar_url || undefined} />
                                        <AvatarFallback>{profile?.username?.[0]}</AvatarFallback>
                                    </Avatar>
                                    {/* Content handling should ideally be richer, reuse Post component if possible */}
                                    <div className="text-sm">
                                        {post.content.substring(0, 100)}...
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </TabsContent>
            <TabsContent value="reviews" className="space-y-4 mt-4">
                {reviews.length === 0 ? (
                    <Card className="bg-card/80 backdrop-blur-sm border-border">
                        <CardContent className="p-8 text-center text-muted-foreground">
                            No reviews yet. Be the first to review!
                        </CardContent>
                    </Card>
                ) : (
                    reviews.map((review) => (
                        <Card key={review.id} className="bg-card/80 backdrop-blur-sm border-border">
                            <CardContent className="p-4">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-2">
                                        <Avatar className="h-8 w-8">
                                            <AvatarImage src={review.reviewer.avatar_url || undefined} />
                                            <AvatarFallback>{review.reviewer.username[0].toUpperCase()}</AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <p className="font-semibold text-sm">@{review.reviewer.username}</p>
                                            <div className="flex text-yellow-500">
                                                {[...Array(5)].map((_, i) => (
                                                    <Star key={i} className={`w-3 h-3 ${i < review.rating ? "fill-current" : "text-muted opacity-20"}`} />
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                    <span className="text-xs text-muted-foreground">
                                        {new Date(review.created_at).toLocaleDateString()}
                                    </span>
                                </div>
                                {review.comment && (
                                    <p className="mt-2 text-sm text-foreground/90">{review.comment}</p>
                                )}
                            </CardContent>
                        </Card>
                    ))
                )}
            </TabsContent>
        </Tabs>
    );
});

ProfileTabs.displayName = "ProfileTabs";
