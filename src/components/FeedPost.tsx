import { memo, useState, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Heart, MessageCircle, Share2, Bookmark, MoreVertical, Edit, Trash } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useInView } from "react-intersection-observer";
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
  const [showComments, setShowComments] = useState(false);

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
  const handleLikeClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isLiked) {
      triggerHeartConfetti();
    }
    onLike(post.id, isLiked);
  }, [isLiked, onLike, post.id]);

  const handleSaveClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onSave(post.id, !!isSaved);
  }, [isSaved, onSave, post.id]);

  const handleShareClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onShare(post);
  }, [onShare, post]);

  const handleProfileClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/user/${post.user_id}`);
  }, [navigate, post.user_id]);

  const handlePostClick = useCallback(() => {
    navigate(`/post/${post.id}`);
  }, [navigate, post.id]);

  // Memoize sanitized content to prevent expensive recalculations
  const sanitizedContent = useMemo(
    () => DOMPurify.sanitize(post.content.replace(/\n/g, '<br />')),
    [post.content]
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: Math.min(index * 0.05, 0.3), type: "spring", stiffness: 80, damping: 15 }}
      whileHover={{ y: -2, scale: 1.005 }}
      className="group"
      style={{ willChange: "transform, opacity", contentVisibility: "auto" }}
      layout="position"
    >
      <Card
        className="overflow-hidden shadow-md hover:shadow-2xl border border-border/50 hover:border-primary/20 transition-all duration-300 bg-card/60 backdrop-blur-sm"
        style={{ contentVisibility: index > 5 ? 'auto' : 'visible', containIntrinsicSize: '0 500px' }}
      >
        {/* Subtle gradient overlay on hover */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 pointer-events-none" />

        <div className="p-6 relative z-10">
          <div className="flex items-center justify-between mb-4">
            <motion.div
              className="flex items-center gap-3 cursor-pointer"
              onClick={handleProfileClick}
              whileHover={{ x: 2 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Avatar className="w-12 h-12 border-2 border-primary ring-2 ring-primary/10 hover:ring-primary/30 transition-all">
                <AvatarImage
                  src={post.profiles.avatar_url || undefined}
                  loading={index < 2 ? "eager" : "lazy"}
                  decoding="async"
                />
                <AvatarFallback className="bg-gradient-to-br from-primary/20 to-secondary/20">{post.profiles.username[0]}</AvatarFallback>
              </Avatar>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="font-semibold hover:text-primary transition-colors">{post.profiles.full_name}</h3>
                  <VerifiedBadge isVerified={post.profiles.is_verified} size={14} />
                </div>
                <p className="text-xs text-muted-foreground">
                  @{post.profiles.username} · {new Date(post.created_at).toLocaleDateString()} · {calculateReadTime(post.content)}
                </p>
              </div>
            </motion.div>
            {isOwner && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity">
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
            className="mb-4 prose dark:prose-invert max-w-none cursor-pointer hover:opacity-90 transition-opacity leading-relaxed"
            onClick={handlePostClick}
            dangerouslySetInnerHTML={{ __html: sanitizedContent }}
          />

          {post.image_url && (
            <>
              <motion.img
                src={post.image_url}
                alt="Post"
                className="w-full rounded-2xl object-cover mb-4 cursor-pointer shadow-md"
                loading={index < 3 ? "eager" : "lazy"}
                {...({ fetchpriority: index < 3 ? "high" : "auto" } as any)}
                decoding="async"
                onClick={() => setLightboxOpen(true)}
                whileHover={{ scale: 1.01 }}
                transition={{ type: "spring", stiffness: 200 }}
              />
              <ImageLightbox
                imageUrl={post.image_url}
                isOpen={lightboxOpen}
                onClose={() => setLightboxOpen(false)}
              />
            </>
          )}

          {post.video_url && (
            <PostVideo
              src={post.video_url}
              index={index}
            />
          )}

          <div className="flex items-center justify-between pt-4 border-t border-border/50">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLikeClick}
                className={`${isLiked ? "text-red-500 hover:text-red-600" : "hover:text-red-500"} transition-colors`}
              >
                <Heart
                  className={`w-5 h-5 mr-1.5 ${isLiked ? "fill-red-500" : ""} transition-all`}
                />
                <span className="font-medium">{post.likes.length}</span>
              </Button>
            </motion.div>

            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                variant="ghost"
                size="sm"
                className={`transition-colors ${showComments ? "text-blue-500" : "hover:text-blue-500"}`}
                onClick={() => setShowComments(!showComments)}
              >
                <MessageCircle className="w-5 h-5 mr-1.5" />
                <span className="font-medium">{post.comments.length}</span>
              </Button>
            </motion.div>

            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSaveClick}
                className={`${isSaved ? "text-primary hover:text-primary/80" : "hover:text-primary"} transition-colors`}
              >
                <Bookmark
                  className={`w-5 h-5 mr-1.5 ${isSaved ? "fill-primary" : ""} transition-all`}
                />
              </Button>
            </motion.div>

            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button variant="ghost" size="sm" onClick={handleShareClick} className="hover:text-green-500 transition-colors">
                <Share2 className="w-5 h-5" />
              </Button>
            </motion.div>
          </div>

          {/* Comments Section */}
          <AnimatePresence>
            {showComments && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="mt-4 pt-4 border-t border-border/50">
                  <CommentSection
                    postId={post.id}
                    postAuthorId={post.user_id}
                    currentUser={currentUser}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </Card>
    </motion.div>
  );
}, (prevProps, nextProps) => {
  // Custom comparison function for performance
  return (
    prevProps.post.id === nextProps.post.id &&
    prevProps.post.likes.length === nextProps.post.likes.length &&
    prevProps.post.comments.length === nextProps.post.comments.length &&
    prevProps.post.saves?.length === nextProps.post.saves?.length &&
    prevProps.currentUser?.id === nextProps.currentUser?.id
  );
});

FeedPost.displayName = "FeedPost";

// Internal specialized video component for lazy buffering
const PostVideo = memo(({ src, index }: { src: string; index: number }) => {
  const { ref, inView } = useInView({
    triggerOnce: true,
    rootMargin: "100px 0px", // Pre-fetch slightly before it hits viewport
  });

  return (
    <div ref={ref} className="w-full rounded-2xl mb-4 shadow-md overflow-hidden bg-muted/20 min-h-[200px] flex items-center justify-center">
      {inView ? (
        <video
          src={src}
          controls
          className="w-full h-full"
          preload={index < 2 ? "auto" : "metadata"}
          playsInline
        />
      ) : (
        <div className="w-full h-full animate-pulse bg-muted" />
      )}
    </div>
  );
});

PostVideo.displayName = "PostVideo";
