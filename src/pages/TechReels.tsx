import React, { useState, useEffect, useCallback, memo, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Reel, ReelPlayer } from "@/components/reels/ReelPlayer";
import { Loader2, Volume2, VolumeX } from "lucide-react";
import { BottomNav } from "@/components/BottomNav";
import { Button } from "@/components/ui/button";
import { useInView } from "react-intersection-observer";

// Mock data moved outside to be reusable
const MOCK_REELS: Reel[] = [
    {
        id: '1',
        video_url: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
        caption: 'Mastering VS Code shortcuts in 60s! 🚀 #vscode #programming',
        likes_count: 1240,
        comments_count: 45,
        song_name: 'Chill Lo-Fi Coding Beats',
        user: { id: 'u1', username: 'code_wizard', avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Wizard' }
    },
    {
        id: '2',
        video_url: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
        caption: 'The beauty of clean code ✨ #coding #aesthetic #satisfying',
        likes_count: 850,
        comments_count: 12,
        song_name: 'Synthwave Night',
        user: { id: 'u2', username: 'dev_artist', avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Artist' }
    },
    {
        id: '3',
        video_url: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
        caption: 'Late night debugging sessions be like... 😅 #debugging #developer #nightowl',
        likes_count: 3200,
        comments_count: 128,
        song_name: 'Debugging Depression',
        user: { id: 'u3', username: 'night_owl_dev', avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Night' }
    },
    {
        id: '4',
        video_url: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
        caption: 'Inside the cloud ☁️ Data Center Tour! #server #cloud #tech',
        likes_count: 5400,
        comments_count: 300,
        song_name: 'Techno Server Hum',
        user: { id: 'u4', username: 'cloud_engineer', avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Cloud' }
    },
    {
        id: '5',
        video_url: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
        caption: 'My setup upgrade! Dual monitors is a game changer 🖥️🖥️ #setup #productivity',
        likes_count: 900,
        comments_count: 56,
        song_name: 'Productivity Boost',
        user: { id: 'u5', username: 'setup_king', avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Setup' }
    }
];

// Component to handle individual reel visibility
const ReelWrapper = memo(({ reel, index, currentActiveIndex, isMuted, shouldPreload = false }: {
    reel: Reel;
    index: number;
    currentActiveIndex: React.MutableRefObject<number>; // Pass ref for active index
    isMuted: boolean;
    shouldPreload?: boolean;
}) => {
    const { ref, inView } = useInView({
        threshold: 0.75, // Trigger when 75% visible
        triggerOnce: false,
    });

    // Determine if this reel is the currently active one based on inView and the global active index
    const isActive = inView && index === currentActiveIndex.current;

    // Update the global active index when this reel comes into view
    useEffect(() => {
        if (inView) {
            currentActiveIndex.current = index;
        }
    }, [inView, index, currentActiveIndex]);

    return (
        <div ref={ref} className="h-screen snap-start snap-always flex items-center justify-center relative">
            <ReelPlayer
                reel={reel}
                isActive={isActive}
                isMuted={isMuted}
                shouldPreload={shouldPreload}
            />
        </div>
    );
});

ReelWrapper.displayName = "ReelWrapper";

const TechReels = memo(() => {
    const [reels, setReels] = useState<Reel[]>([]);
    const [loading, setLoading] = useState(true);
    const [isMuted, setIsMuted] = useState(true);
    const currentActiveIndex = useRef(0);

    useEffect(() => {
        fetchReels();
    }, []);

    const toggleMute = useCallback(() => {
        setIsMuted(prev => !prev);
    }, []);

    const fetchReels = async () => {
        try {
            const { data, error } = await supabase
                .from('reels')
                .select(`
          *,
          user:user_id (
            id,
            username,
            avatar_url
          )
        `)
                .order('created_at', { ascending: false })
                .limit(10);

            if (error) {
                console.warn("Error fetching reels, using fallback data:", error);
                setReels(MOCK_REELS);
                return;
            }

            if (data && data.length > 0) {
                setReels(data as unknown as Reel[]);
            } else {
                setReels(MOCK_REELS);
            }
        } catch (error) {
            console.error("Unexpected error fetching reels:", error);
            setReels(MOCK_REELS);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="h-[100dvh] bg-black text-white flex flex-col overflow-hidden">
            {/* Header / Top Bar */}
            <div className="absolute top-0 left-0 right-0 z-50 p-4 flex justify-between items-center bg-gradient-to-b from-black/50 to-transparent pointer-events-none">
                <h1 className="font-bold text-xl drop-shadow-md">Tech Reels</h1>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={toggleMute}
                    className="pointer-events-auto text-white hover:bg-white/20"
                >
                    {isMuted ? <VolumeX /> : <Volume2 />}
                </Button>
            </div>

            {/* Main Snap Feed */}
            <div
                className="flex-1 overflow-y-scroll snap-y snap-mandatory scrollbar-hide overscroll-contain"
                style={{ scrollSnapType: 'y mandatory', WebkitOverflowScrolling: 'touch' }}
            >
                {loading ? (
                    <div className="h-full flex items-center justify-center">
                        <Loader2 className="w-10 h-10 animate-spin text-primary" />
                    </div>
                ) : (
                    reels.map((reel, index) => {
                        // Preload the current and next 2 reels
                        const shouldPreload = index >= currentActiveIndex.current && index <= currentActiveIndex.current + 2;
                        return (
                            <ReelWrapper
                                key={reel.id}
                                reel={reel}
                                index={index}
                                currentActiveIndex={currentActiveIndex}
                                isMuted={isMuted}
                                shouldPreload={shouldPreload}
                            />
                        );
                    })
                )}
            </div>

            <BottomNav />
        </div>
    );
});

TechReels.displayName = "TechReels";

export default TechReels;
