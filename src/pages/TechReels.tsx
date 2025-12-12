import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Reel, ReelPlayer } from "@/components/reels/ReelPlayer";
import { Loader2, Volume2, VolumeX } from "lucide-react";
import { BottomNav } from "@/components/BottomNav";
import { useInView } from "react-intersection-observer";
import { Button } from "@/components/ui/button";

const TechReels = () => {
    const [reels, setReels] = useState<Reel[]>([]);
    const [loading, setLoading] = useState(true);
    const [isMuted, setIsMuted] = useState(true);
    const [activeReelIndex, setActiveReelIndex] = useState(0);

    useEffect(() => {
        fetchReels();
    }, []);

    const toggleMute = useCallback(() => {
        setIsMuted(prev => !prev);
    }, []);

    // Mock data moved outside to be reusable
    const MOCK_REELS: Reel[] = [
        {
            id: '1',
            video_url: 'https://assets.mixkit.co/videos/preview/mixkit-typing-code-in-a-terminal-close-up-1650-large.mp4',
            caption: 'Mastering VS Code shortcuts in 60s! 🚀 #vscode #programming',
            likes_count: 1240,
            comments_count: 45,
            song_name: 'Chill Lo-Fi Coding Beats',
            user: { id: 'u1', username: 'code_wizard', avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Wizard' }
        },
        {
            id: '2',
            video_url: 'https://assets.mixkit.co/videos/preview/mixkit-matrix-style-code-animation-running-down-1845-large.mp4',
            caption: 'The beauty of clean code ✨ #coding #aesthetic #satisfying',
            likes_count: 850,
            comments_count: 12,
            song_name: 'Synthwave Night',
            user: { id: 'u2', username: 'dev_artist', avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Artist' }
        },
        {
            id: '3',
            video_url: 'https://assets.mixkit.co/videos/preview/mixkit-programmer-working-in-a-dark-room-41641-large.mp4',
            caption: 'Late night debugging sessions be like... 😅 #debugging #developer #nightowl',
            likes_count: 3200,
            comments_count: 128,
            song_name: 'Debugging Depression',
            user: { id: 'u3', username: 'night_owl_dev', avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Night' }
        },
        {
            id: '4',
            video_url: 'https://assets.mixkit.co/videos/preview/mixkit-server-room-with-supercomputers-hardware-41643-large.mp4',
            caption: 'Inside the cloud ☁️ Data Center Tour! #server #cloud #tech',
            likes_count: 5400,
            comments_count: 300,
            song_name: 'Techno Server Hum',
            user: { id: 'u4', username: 'cloud_engineer', avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Cloud' }
        },
        {
            id: '5',
            video_url: 'https://assets.mixkit.co/videos/preview/mixkit-software-developer-working-at-a-computer-screen-41638-large.mp4',
            caption: 'My setup upgrade! Dual monitors is a game changer 🖥️🖥️ #setup #productivity',
            likes_count: 900,
            comments_count: 56,
            song_name: 'Productivity Boost',
            user: { id: 'u5', username: 'setup_king', avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Setup' }
        }
    ];

    const fetchReels = async () => {
        try {
            // Temporary: Since we might not have data, we'll use some mock data if DB is empty
            // but let's try to fetch first
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



    const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
        const container = e.currentTarget;
        const index = Math.round(container.scrollTop / container.clientHeight);
        if (activeReelIndex !== index) {
            setActiveReelIndex(index);
        }
    }, [activeReelIndex]);

    return (
        <div className="h-screen bg-black text-white flex flex-col">
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
                className="flex-1 overflow-y-scroll snap-y snap-mandatory scrollbar-hide"
                onScroll={handleScroll}
            >
                {loading ? (
                    <div className="h-full flex items-center justify-center">
                        <Loader2 className="w-10 h-10 animate-spin text-primary" />
                    </div>
                ) : (
                    reels.map((reel, index) => (
                        <ReelPlayer
                            key={reel.id}
                            reel={reel}
                            isActive={index === activeReelIndex}
                            isMuted={isMuted}
                            toggleMute={toggleMute}
                        />
                    ))
                )}
            </div>

            <BottomNav />
        </div>
    );
};

export default TechReels;
