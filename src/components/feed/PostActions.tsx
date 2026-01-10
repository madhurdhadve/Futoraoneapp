import { memo, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Heart, MessageCircle, Share2, Bookmark } from "lucide-react";
import { motion } from "framer-motion";

interface PostActionsProps {
    likeCount: number;
    commentCount: number;
    isLiked: boolean;
    isSaved: boolean;
    showComments: boolean;
    onLike: (e: React.MouseEvent) => void;
    onComment: () => void;
    onSave: (e: React.MouseEvent) => void;
    onShare: (e: React.MouseEvent) => void;
}

export const PostActions = memo(({
    likeCount,
    commentCount,
    isLiked,
    isSaved,
    showComments,
    onLike,
    onComment,
    onSave,
    onShare
}: PostActionsProps) => {

    const likeButtonClass = useMemo(() =>
        `${isLiked ? "text-red-500 hover:text-red-600" : "hover:text-red-500"} transition-colors`,
        [isLiked]
    );

    const commentButtonClass = useMemo(() =>
        `transition-colors ${showComments ? "text-blue-500" : "hover:text-blue-500"}`,
        [showComments]
    );

    const saveButtonClass = useMemo(() =>
        `${isSaved ? "text-primary hover:text-primary/80" : "hover:text-primary"} transition-colors`,
        [isSaved]
    );

    return (
        <div className="flex items-center justify-between pt-4 border-t border-border/50">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={onLike}
                    className={likeButtonClass}
                >
                    <Heart
                        className={`w-5 h-5 mr-1.5 ${isLiked ? "fill-red-500" : ""} transition-all`}
                    />
                    <span className="font-medium">{likeCount}</span>
                </Button>
            </motion.div>

            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                    variant="ghost"
                    size="sm"
                    className={commentButtonClass}
                    onClick={onComment}
                >
                    <MessageCircle className="w-5 h-5 mr-1.5" />
                    <span className="font-medium">{commentCount}</span>
                </Button>
            </motion.div>

            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={onSave}
                    className={saveButtonClass}
                >
                    <Bookmark
                        className={`w-5 h-5 mr-1.5 ${isSaved ? "fill-primary" : ""} transition-all`}
                    />
                </Button>
            </motion.div>

            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button variant="ghost" size="sm" onClick={onShare} className="hover:text-green-500 transition-colors">
                    <Share2 className="w-5 h-5" />
                </Button>
            </motion.div>
        </div>
    );
});

PostActions.displayName = "PostActions";
