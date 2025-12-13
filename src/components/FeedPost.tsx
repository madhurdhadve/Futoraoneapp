import { memo, useState, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Heart, MessageCircle, Share2, Bookmark, MoreVertical, Edit, Trash } from "lucide-react";
import { motion } from "framer-motion";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { CommentSection } from "@/components/CommentSection";
import type { User } from "@supabase/supabase-js";
import { useNavigate } from "react-router-dom";
import { VerifiedBadge } from "@/components/VerifiedBadge";
import { ImageLightbox } from "@/components/ImageLightbox";
import { triggerHeartConfetti } from "@/utils/confetti";
import { calculateReadTime } from "@/utils/readTime";
import DOMPurify from 'dompurify';

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
    is_verified?: boolean | null;
  };
  likes: { id: string; user_id: string }[];
  comments: { id: string }[];
  saves?: { id: string; user_id: string }[];
}

interface FeedPostProps {
  post: Post;
  currentUser: User | null;
  onLike: (postId: string, isLiked: boolean) => void;
  onSave: (postId: string, isSaved: boolean) => void;
  onShare: (post: Post) => void;
  onDelete: (postId: string) => void;
  index: number;
}

export const FeedPost = memo(({ post, currentUser, onLike, onSave, onShare, onDelete, index }: FeedPostProps) => {
  const navigate = useNavigate();
  const [lightboxOpen, setLightboxOpen] = useState(false);

  // Memoize computed values to prevent recalculation on every render
  const isLiked = useMemo(
    () => post.likes.some(like => like.user_id === currentUser?.id),
    [post.likes, currentUser?.id]
  );

  const isSaved = useMemo(
    () => post.saves?.some(save => save.user_id === currentUser?.id),
    [post.saves, currentUser?.id]
  );

  const isOwner = useMemo(
    () => post.user_id === currentUser?.id,
    [post.user_id, currentUser?.id]
  );

  // Memoize event handler to prevent recreation
  const handleLikeClick = useCallback(() => {
    if (!isLiked) {
      triggerHeartConfetti();
    }
    onLike(post.id, isLiked);
  }, [isLiked, onLike, post.id]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <Card className="overflow-hidden shadow-lg border-2 border-black/30 dark:border-border">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate(`/user/${post.user_id}`)}>
              <Avatar className="w-12 h-12 border-2 border-primary">
                <AvatarImage src={post.profiles.avatar_url || undefined} loading="lazy" />
                <AvatarFallback>{post.profiles.username[0]}</AvatarFallback>
              </Avatar>
              <div>
                <div className="flex items-center gap-1">
                  <h3 className="font-semibold hover:text-primary transition-colors">{post.profiles.full_name}</h3>
                  <VerifiedBadge isVerified={post.profiles.is_verified} size={14} />
                </div>
                <p className="text-sm text-muted-foreground">
                  @{post.profiles.username} · {new Date(post.created_at).toLocaleDateString()} · {calculateReadTime(post.content)}
                </p>
              </div>
            </div>
            {isOwner && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreVertical className="w-5 h-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => navigate(`/create-post?edit=${post.id}`)}>
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Post
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => onDelete(post.id)}
                    className="text-destructive"
                  >
                    <Trash className="w-4 h-4 mr-2" />
                    Delete Post
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>

          <div
            className="mb-4 prose dark:prose-invert max-w-none cursor-pointer hover:opacity-95 transition-opacity"
            onClick={() => navigate(`/post/${post.id}`)}
            dangerouslySetInnerHTML={{
              __html: DOMPurify.sanitize(post.content.replace(/\n/g, '<br />'))
            }}
          />

          {post.image_url && (
            <>
              <img
                src={post.image_url}
                alt="Post"
                className="w-full rounded-xl object-cover mb-4 cursor-pointer hover:opacity-90 transition-opacity"
                loading="lazy"
                onClick={() => setLightboxOpen(true)}
              />
              <ImageLightbox
                imageUrl={post.image_url}
                isOpen={lightboxOpen}
                onClose={() => setLightboxOpen(false)}
              />
            </>
          )}

          {post.video_url && (
            <video
              src={post.video_url}
              controls
              className="w-full rounded-xl mb-4"
              preload="metadata"
            />
          )}

          <div className="flex items-center justify-between pt-4 border-t">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLikeClick}
              className={isLiked ? "text-secondary" : ""}
            >
              <Heart
                className={`w-5 h-5 mr-2 ${isLiked ? "fill-secondary" : ""}`}
              />
              {post.likes.length}
            </Button>
            <Button variant="ghost" size="sm">
              <MessageCircle className="w-5 h-5 mr-2" />
              {post.comments.length}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onSave(post.id, !!isSaved)}
              className={isSaved ? "text-primary" : ""}
            >
              <Bookmark
                className={`w-5 h-5 mr-2 ${isSaved ? "fill-primary" : ""}`}
              />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => onShare(post)}>
              <Share2 className="w-5 h-5 mr-2" />
            </Button>
          </div>



          {/* Comments Section */}
          <div className="mt-4 pt-4 border-t">
            <CommentSection
              postId={post.id}
              postAuthorId={post.user_id}
              currentUser={currentUser}
            />
          </div>
        </div>
      </Card>
    </motion.div>
  );
});

FeedPost.displayName = "FeedPost";
