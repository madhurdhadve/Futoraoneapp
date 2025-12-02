import { memo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Heart, MessageCircle } from "lucide-react";
import { VerifiedBadge } from "@/components/VerifiedBadge";

interface Post {
    id: string;
    content: string;
    image_url: string | null;
    created_at: string;
    likes: { id: string }[];
    comments: { id: string }[];
}

interface Profile {
    username: string;
    full_name: string;
    avatar_url: string | null;
    is_verified?: boolean | null;
}

interface ProfilePostsProps {
    posts: Post[];
    profile: Profile | null;
}

export const ProfilePosts = memo(({ posts, profile }: ProfilePostsProps) => {
    return (
        <>
            {posts.map((post) => (
                <Card key={post.id} className="bg-card border-border">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3 mb-3">
                            <Avatar className="h-10 w-10">
                                <AvatarImage src={profile?.avatar_url || undefined} loading="lazy" />
                                <AvatarFallback>{profile?.username?.[0]}</AvatarFallback>
                            </Avatar>
                            <div>
                                <div className="flex items-center gap-1">
                                    <p className="font-semibold text-foreground">{profile?.full_name}</p>
                                    <VerifiedBadge isVerified={profile?.is_verified} size={14} />
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    {new Date(post.created_at).toLocaleDateString()}
                                </p>
                            </div>
                        </div>
                        <p className="text-foreground mb-3">{post.content}</p>
                        {post.image_url && (
                            <img
                                src={post.image_url}
                                alt="Post"
                                className="w-full rounded-lg object-cover mb-3 max-h-64"
                                loading="lazy"
                            />
                        )}
                        <div className="flex items-center gap-4 text-muted-foreground text-sm">
                            <span className="flex items-center gap-1">
                                <Heart size={16} /> {post.likes?.length || 0}
                            </span>
                            <span className="flex items-center gap-1">
                                <MessageCircle size={16} /> {post.comments?.length || 0}
                            </span>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </>
    );
});

ProfilePosts.displayName = "ProfilePosts";
