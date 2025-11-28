import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight, Heart, Send } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export interface Story {
    id: string;
    url: string;
    type: "image" | "video";
    duration?: number; // in seconds
    user: {
        id: string;
        username: string;
        avatar_url: string;
    };
    createdAt: string;
}

interface StoryViewerProps {
    stories: Story[];
    initialStoryIndex?: number;
    onClose: () => void;
    onNextUser?: () => void;
    onPrevUser?: () => void;
}

export const StoryViewer = ({
    stories,
    initialStoryIndex = 0,
    onClose,
    onNextUser,
    onPrevUser
}: StoryViewerProps) => {
    const [currentIndex, setCurrentIndex] = useState(initialStoryIndex);
    const [progress, setProgress] = useState(0);
    const [isPaused, setIsPaused] = useState(false);
    const [inputValue, setInputValue] = useState("");

    const currentStory = stories[currentIndex];
    const DURATION = currentStory.duration ? currentStory.duration * 1000 : 5000; // Default 5s
    const UPDATE_INTERVAL = 50;

    const handleNext = useCallback(() => {
        if (currentIndex < stories.length - 1) {
            setCurrentIndex(prev => prev + 1);
            setProgress(0);
        } else {
            onNextUser?.();
        }
    }, [currentIndex, stories.length, onNextUser]);

    const handlePrev = useCallback(() => {
        if (currentIndex > 0) {
            setCurrentIndex(prev => prev - 1);
            setProgress(0);
        } else {
            onPrevUser?.();
        }
    }, [currentIndex, onPrevUser]);

    useEffect(() => {
        if (isPaused) return;

        const interval = setInterval(() => {
            setProgress(prev => {
                if (prev >= 100) {
                    handleNext();
                    return 0;
                }
                return prev + (100 / (DURATION / UPDATE_INTERVAL));
            });
        }, UPDATE_INTERVAL);

        return () => clearInterval(interval);
    }, [currentIndex, isPaused, DURATION, handleNext]);

    // Reset progress when story changes
    useEffect(() => {
        setProgress(0);
    }, [currentIndex]);

    const handleTap = (e: React.MouseEvent<HTMLDivElement>) => {
        // Don't trigger if clicking controls
        if ((e.target as HTMLElement).closest('button, input')) return;

        const width = e.currentTarget.offsetWidth;
        const x = e.clientX;

        if (x < width * 0.3) {
            handlePrev();
        } else {
            handleNext();
        }
    };

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="fixed inset-0 z-50 bg-black flex items-center justify-center"
            >
                {/* Close Button */}
                <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-4 right-4 z-50 text-white hover:bg-white/20"
                    onClick={onClose}
                >
                    <X className="w-6 h-6" />
                </Button>

                {/* Main Content Area */}
                <div
                    className="relative w-full max-w-md h-full md:h-[90vh] md:rounded-2xl overflow-hidden bg-gray-900"
                    onMouseDown={() => setIsPaused(true)}
                    onMouseUp={() => setIsPaused(false)}
                    onTouchStart={() => setIsPaused(true)}
                    onTouchEnd={() => setIsPaused(false)}
                    onClick={handleTap}
                >
                    {/* Progress Bars */}
                    <div className="absolute top-0 left-0 right-0 z-20 flex gap-1 p-2">
                        {stories.map((story, index) => (
                            <div key={story.id} className="h-1 flex-1 bg-white/30 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-white transition-all duration-100 ease-linear"
                                    style={{
                                        width: index < currentIndex ? '100%' :
                                            index === currentIndex ? `${progress}%` : '0%'
                                    }}
                                />
                            </div>
                        ))}
                    </div>

                    {/* User Info */}
                    <div className="absolute top-4 left-0 right-0 z-20 p-4 pt-6 flex items-center gap-3">
                        <Avatar className="w-8 h-8 border border-white/50">
                            <AvatarImage src={currentStory.user.avatar_url} />
                            <AvatarFallback>{currentStory.user.username[0]}</AvatarFallback>
                        </Avatar>
                        <span className="text-white font-semibold text-sm drop-shadow-md">
                            {currentStory.user.username}
                        </span>
                        <span className="text-white/70 text-xs ml-auto">
                            {new Date(currentStory.createdAt).toLocaleDateString()}
                        </span>
                    </div>

                    {/* Media */}
                    <div className="w-full h-full flex items-center justify-center bg-black">
                        {currentStory.type === 'image' ? (
                            <img
                                src={currentStory.url}
                                alt="Story"
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <video
                                src={currentStory.url}
                                autoPlay
                                muted
                                playsInline
                                className="w-full h-full object-cover"
                            />
                        )}
                    </div>

                    {/* Footer / Reply */}
                    <div className="absolute bottom-0 left-0 right-0 z-20 p-4 bg-gradient-to-t from-black/80 to-transparent">
                        <div className="flex items-center gap-3">
                            <Input
                                placeholder="Send message..."
                                className="bg-transparent border-white/30 text-white placeholder:text-white/70 rounded-full h-10 focus-visible:ring-white/50"
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                onClick={(e) => e.stopPropagation()}
                                onFocus={() => setIsPaused(true)}
                                onBlur={() => setIsPaused(false)}
                            />
                            <Button
                                size="icon"
                                variant="ghost"
                                className="text-white hover:bg-white/20 rounded-full"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    // Handle like
                                }}
                            >
                                <Heart className="w-6 h-6" />
                            </Button>
                            <Button
                                size="icon"
                                variant="ghost"
                                className="text-white hover:bg-white/20 rounded-full"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    // Handle send
                                }}
                            >
                                <Send className="w-6 h-6" />
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Desktop Navigation Arrows */}
                <div className="hidden md:block absolute left-4 top-1/2 -translate-y-1/2">
                    <Button variant="ghost" size="icon" className="text-white hover:bg-white/20 rounded-full w-12 h-12" onClick={onPrevUser}>
                        <ChevronLeft className="w-8 h-8" />
                    </Button>
                </div>
                <div className="hidden md:block absolute right-4 top-1/2 -translate-y-1/2">
                    <Button variant="ghost" size="icon" className="text-white hover:bg-white/20 rounded-full w-12 h-12" onClick={onNextUser}>
                        <ChevronRight className="w-8 h-8" />
                    </Button>
                </div>

            </motion.div>
        </AnimatePresence>
    );
};
