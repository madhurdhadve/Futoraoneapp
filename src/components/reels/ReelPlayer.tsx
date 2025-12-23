import { useState, useRef, useEffect, memo, useCallback } from "react";
import { Heart, MessageCircle, Share2, MoreVertical, Play, Pause, Music2, Bookmark, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";

export interface Reel {
    id: string;
    video_url: string;
    thumbnail_url?: string;
    caption: string;
    likes_count: number;
    comments_count?: number;
    song_name?: string; // Added song name
    user: {
        id: string;
        username: string;
        avatar_url?: string;
    };
}

interface ReelPlayerProps {
    reel: Reel;
    isActive: boolean;
    isMuted: boolean;
    toggleMute?: () => void;
    shouldPreload?: boolean;
}

export const ReelPlayer = memo(({ reel, isActive, isMuted, toggleMute, shouldPreload = false }: ReelPlayerProps) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isLiked, setIsLiked] = useState(false);
    const [isSaved, setIsSaved] = useState(false);
    const [showHeart, setShowHeart] = useState(false);
    const lastTap = useRef<number>(0);
    const { toast } = useToast();

    useEffect(() => {
        if (isActive && videoRef.current) {
            videoRef.current.currentTime = 0;
            videoRef.current.play().catch(() => {
                setIsPlaying(false);
            });
            setIsPlaying(true);
        } else if (!isActive && videoRef.current) {
            videoRef.current.pause();
            setIsPlaying(false);
        }
    }, [isActive]);

    const handleVideoClick = useCallback((e: React.MouseEvent) => {
        const currentTime = new Date().getTime();
        const tapLength = currentTime - lastTap.current;

        if (tapLength < 300 && tapLength > 0) {
            // Double tap detected
            if (!isLiked) {
                setIsLiked(true);
            }
            setShowHeart(true);
            setTimeout(() => setShowHeart(false), 1000);
            e.stopPropagation();
        } else {
            // Single tap - toggle play
            togglePlay();
        }
        lastTap.current = currentTime;
    }, [isLiked]);

    const togglePlay = useCallback(() => {
        if (videoRef.current) {
            if (isPlaying) {
                videoRef.current.pause();
            } else {
                videoRef.current.play();
            }
            setIsPlaying(!isPlaying);
        }
    }, [isPlaying]);

    const handleLike = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
        setIsLiked(prev => !prev);
    }, []);

    const handleSave = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
        setIsSaved(prev => {
            const newState = !prev;
            toast({
                title: newState ? "Saved to collection" : "Removed from collection",
                duration: 2000,
            });
            return newState;
        });
    }, [toast]);

    const handleShare = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
        navigator.clipboard.writeText(window.location.href);
        toast({
            title: "Link copied!",
            description: "Share this reel with your friends",
            duration: 2000,
        });
    }, [toast]);

    // Mock comments for the sheet
    const comments = [
        { id: 1, user: "tech_guru", text: "This is exactly what I needed! 🔥" },
        { id: 2, user: "junior_dev", text: "How did you do that transition?" },
        { id: 3, user: "react_fan", text: "Awesome content as always 👏" },
    ];

    return (
        <div
            className="relative w-full h-[calc(100dvh-64px)] snap-start shrink-0 bg-black flex items-center justify-center overflow-hidden"
            onClick={handleVideoClick}
            style={{ contentVisibility: isActive ? 'auto' : 'hidden', containIntrinsicSize: '100% 100vh' }}
        >
            {/* Video Element */}
            <video
                ref={videoRef}
                src={reel.video_url}
                poster={reel.thumbnail_url}
                className="w-full h-full object-cover"
                loop
                muted={isMuted}
                playsInline
                preload={(isActive || shouldPreload) ? "auto" : "none"} // Optimized preloading
            />

            {/* Play/Pause Overlay Indicator */}
            <AnimatePresence>
                {!isPlaying && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.5 }}
                        className="absolute z-10 bg-black/40 p-4 rounded-full pointer-events-none"
                    >
                        <Play className="text-white w-8 h-8 fill-current" />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Double Tap Heart Animation */}
            <AnimatePresence>
                {showHeart && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1.5 }}
                        exit={{ opacity: 0, scale: 0 }}
                        transition={{ duration: 0.3 }}
                        className="absolute z-20 pointer-events-none"
                    >
                        <Heart className="w-24 h-24 text-white fill-white drop-shadow-lg" />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Overlay UI */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/80 pointer-events-none">
                <div className="absolute bottom-0 left-0 right-0 p-4 pb-6 flex items-end justify-between">

                    {/* Caption & User Info */}
                    <div className="flex-1 mr-12 space-y-3 pointer-events-auto">
                        <div className="flex items-center gap-2">
                            <Avatar className="w-8 h-8 border border-white/20">
                                <AvatarImage src={reel.user.avatar_url} />
                                <AvatarFallback>{reel.user.username[0]}</AvatarFallback>
                            </Avatar>
                            <span className="text-white font-semibold text-sm drop-shadow-md">
                                @{reel.user.username}
                            </span>
                            <Button variant="outline" size="sm" className="h-6 text-xs bg-transparent text-white border-white/40 hover:bg-white/10 hover:text-white ml-2 rounded-full">
                                Follow
                            </Button>
                        </div>

                        <div className="space-y-1">
                            <p className="text-white text-sm line-clamp-2 drop-shadow-md">
                                {reel.caption}
                            </p>
                        </div>

                        {/* Audio Info */}
                        <div className="flex items-center gap-2 text-white/90">
                            <Music2 className="w-4 h-4 animate-pulse" />
                            <div className="text-xs overflow-hidden w-40">
                                <p className="truncate">{reel.song_name || "Original Audio - " + reel.user.username}</p>
                            </div>
                        </div>
                    </div>

                    {/* Right Action Buttons */}
                    <div className="flex flex-col gap-4 items-center pointer-events-auto">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="flex flex-col gap-1 hover:bg-transparent group"
                            onClick={handleLike}
                        >
                            <Heart
                                className={cn("w-7 h-7 transition-all group-active:scale-75", isLiked ? "fill-red-500 text-red-500" : "text-white")}
                            />
                            <span className="text-xs text-white font-medium">{reel.likes_count + (isLiked ? 1 : 0)}</span>
                        </Button>

                        <Sheet>
                            <SheetTrigger asChild>
                                <Button variant="ghost" size="icon" className="flex flex-col gap-1 hover:bg-transparent" onClick={(e) => e.stopPropagation()}>
                                    <MessageCircle className="w-7 h-7 text-white" />
                                    <span className="text-xs text-white font-medium">{reel.comments_count || 0}</span>
                                </Button>
                            </SheetTrigger>
                            <SheetContent side="bottom" className="h-[60vh] rounded-t-3xl bg-black/90 border-t border-white/10 text-white">
                                <SheetHeader>
                                    <SheetTitle className="text-white text-center border-b border-white/10 pb-4">Comments</SheetTitle>
                                </SheetHeader>
                                <div className="flex flex-col h-full pb-10">
                                    <ScrollArea className="flex-1 py-4">
                                        <div className="space-y-4">
                                            {comments.map((comment) => (
                                                <div key={comment.id} className="flex gap-3">
                                                    <Avatar className="w-8 h-8">
                                                        <AvatarFallback className="bg-primary/20 text-primary text-xs">{comment.user[0].toUpperCase()}</AvatarFallback>
                                                    </Avatar>
                                                    <div className="flex-1">
                                                        <p className="text-xs font-bold text-white/90">@{comment.user}</p>
                                                        <p className="text-sm text-white/70">{comment.text}</p>
                                                    </div>
                                                    <Button variant="ghost" size="icon" className="h-6 w-6">
                                                        <Heart className="w-3 h-3 text-white/50" />
                                                    </Button>
                                                </div>
                                            ))}
                                        </div>
                                    </ScrollArea>
                                    <div className="flex gap-2 pt-2 mt-auto">
                                        <Input placeholder="Add a comment..." className="bg-white/10 border-transparent text-white placeholder:text-white/50" />
                                        <Button size="icon" className="shrink-0">
                                            <Send className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            </SheetContent>
                        </Sheet>

                        <Button variant="ghost" size="icon" className="hover:bg-transparent" onClick={handleSave}>
                            <Bookmark className={cn("w-7 h-7 transition-colors", isSaved ? "fill-white text-white" : "text-white")} />
                        </Button>

                        <Button variant="ghost" size="icon" className="hover:bg-transparent" onClick={handleShare}>
                            <Share2 className="w-7 h-7 text-white" />
                        </Button>

                        <Button variant="ghost" size="icon" className="hover:bg-transparent">
                            <MoreVertical className="w-6 h-6 text-white" />
                        </Button>

                        {/* Audio Disc Animation */}
                        <div className="w-8 h-8 rounded-full border-2 border-white/30 bg-black/50 p-1 animate-[spin_5s_linear_infinite] mt-2">
                            <Avatar className="w-full h-full">
                                <AvatarImage src={reel.user.avatar_url} />
                                <AvatarFallback className="text-[8px] bg-primary text-white">Music</AvatarFallback>
                            </Avatar>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
});
