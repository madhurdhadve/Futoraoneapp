import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, Code, X, Settings2, RotateCcw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { SwipeCard, Profile as SwipeProfile } from "@/components/tech-match/SwipeCard";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// Mock Profiles for improved UX
const MOCK_PROFILES: SwipeProfile[] = [
    {
        id: "m1",
        username: "sarah_codes",
        full_name: "Sarah Jenkins",
        avatar_url: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
        bio: "Full-stack wizard 🧙‍♀️ building the next big thing in Web3. Coffee addict ☕️",
        location: "San Fransisco, CA",
        tech_skills: ["React", "Node.js", "Solidity", "TypeScript"],
        github_url: "#",
        linkedin_url: null,
        portfolio_url: "#"
    },
    {
        id: "m2",
        username: "david_ai",
        full_name: "David Chen",
        avatar_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
        bio: "AI Researcher by day, Indie Hacker by night. Let's build something crazy! 🚀",
        location: "New York, NY",
        tech_skills: ["Python", "TensorFlow", "PyTorch", "AWS"],
        github_url: "#",
        linkedin_url: "#",
        portfolio_url: null
    },
    {
        id: "m3",
        username: "emma_design",
        full_name: "Emma Wilson",
        avatar_url: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
        bio: "UI/UX Designer who codes. Pixel perfectionist. 🎨✨",
        location: "London, UK",
        tech_skills: ["Figma", "React", "TailwindCSS", "Three.js"],
        github_url: null,
        linkedin_url: "#",
        portfolio_url: "#"
    },
    {
        id: "m4",
        username: "alex_rust",
        full_name: "Alex Rivera",
        avatar_url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
        bio: "Rustacean 🦀. Obsessed with performance and systems programming.",
        location: "Berlin, DE",
        tech_skills: ["Rust", "C++", "WASM", "Linux"],
        github_url: "#",
        linkedin_url: null,
        portfolio_url: "#"
    },
    {
        id: "m5",
        username: "priya_mobile",
        full_name: "Priya Patel",
        avatar_url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
        bio: "Flutter User Group organizer. Making apps that feel magic. ✨📱",
        location: "Bangalore, IN",
        tech_skills: ["Flutter", "Dart", "Firebase", "Kotlin"],
        github_url: "#",
        linkedin_url: "#",
        portfolio_url: "#"
    }
];

// Common tech skills for filter - moved outside to prevent recreation
const AVAILABLE_SKILLS = ["React", "Node.js", "Python", "TypeScript", "Design", "Flutter", "Rust", "Go", "AWS", "AI/ML"];

export const FindDevsView = () => {
    const { toast } = useToast();
    const navigate = useNavigate();

    // Tech Match Swipe State
    const [potentialMatches, setPotentialMatches] = useState<SwipeProfile[]>([]);
    const [matchDialogOpen, setMatchDialogOpen] = useState(false);
    const [lastMatchedProfile, setLastMatchedProfile] = useState<SwipeProfile | null>(null);
    const [currentUser, setCurrentUser] = useState<any>(null);
    const [exitDirection, setExitDirection] = useState<"left" | "right" | null>(null);
    const [swipedHistory, setSwipedHistory] = useState<SwipeProfile[]>([]);

    const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
    const [filterDialogOpen, setFilterDialogOpen] = useState(false);

    // Memoize toggleSkill to prevent recreation
    const toggleSkill = useCallback((skill: string) => {
        setSelectedSkills(prev =>
            prev.includes(skill)
                ? prev.filter(s => s !== skill)
                : [...prev, skill]
        );
    }, []);

    // Fetch potential matches - optimized dependency array
    useEffect(() => {
        const fetchProfiles = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            // Get users I haven't swiped on yet
            const { data: existingSwipes } = await supabase
                .from('tech_matches')
                .select('liked_id')
                .eq('liker_id', user.id);

            const swipedIds = existingSwipes?.map(s => s.liked_id) || [];

            // Add self to exclusion
            swipedIds.push(user.id);

            let query = supabase
                .from('profiles')
                .select('id, username, full_name, avatar_url, bio, location, tech_skills, github_url, linkedin_url, portfolio_url')
                .not('id', 'in', `(${swipedIds.join(',')})`)
                .limit(20);

            if (selectedSkills.length > 0) {
                // Determine if we can use 'cs' (contains) operator for array column
                // Note: accurate array filtering depends on Supabase/Postgres config. 
                // A text search or 'cs' is common.
                query = query.contains('tech_skills', selectedSkills);
            }

            const { data: profiles } = await query;

            if (profiles && profiles.length > 0) {
                // Cast to MatchProfile type
                setPotentialMatches(profiles as any);
            } else {
                // FALLBACK: Filter Mock Data
                let filteredMock = MOCK_PROFILES;
                if (selectedSkills.length > 0) {
                    filteredMock = MOCK_PROFILES.filter(p =>
                        p.tech_skills?.some(skill => selectedSkills.includes(skill))
                    );
                }
                setPotentialMatches(filteredMock);
            }
        };

        const getCurrentUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setCurrentUser(user);
        };

        fetchProfiles();
        getCurrentUser();
    }, [selectedSkills]);

    // Quick Confetti function - Memoized
    const triggerConfetti = useCallback(() => {
        console.log("Confetti boom! 🎉");
    }, []);

    const handleSwipe = useCallback(async (direction: "left" | "right", profileId: string) => {
        // 1. Set exit direction to trigger animation (UI only)
        setExitDirection(direction);

        // 2. Wait for animation to finish before removing from state
        setTimeout(async () => {
            const swipedProfile = potentialMatches.find(p => p.id === profileId);

            // Remove from stack
            setPotentialMatches(prev => prev.filter(p => p.id !== profileId));
            setExitDirection(null); // Reset for next card

            if (!swipedProfile) return;

            // Add to history for Undo (Local only)
            setSwipedHistory(prev => [...prev, swipedProfile]);

            // Handle Mock Profiles (instant match simulation for demo)
            if (profileId.startsWith('m')) {
                if (direction === 'right') {
                    if (Math.random() > 0.4) { // 40% chance
                        setLastMatchedProfile(swipedProfile);
                        setMatchDialogOpen(true);
                        triggerConfetti();
                    }
                }
                return;
            }

            try {
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) return;

                let status = direction === 'right' ? 'pending' : 'rejected';

                if (direction === 'right') {
                    // Check if they already liked me
                    const { data: reverseLike } = await supabase
                        .from('tech_matches')
                        .select('status')
                        .eq('liker_id', profileId)
                        .eq('liked_id', user.id)
                        .maybeSingle();

                    if (reverseLike && (reverseLike.status === 'pending' || reverseLike.status === 'matched')) {
                        status = 'matched';

                        // Try to update their status to matched (might fail if RLS blocks, but we try)
                        await supabase
                            .from('tech_matches')
                            .update({ status: 'matched' })
                            .eq('liker_id', profileId)
                            .eq('liked_id', user.id);
                    }
                }

                // Insert match record
                const { data, error } = await supabase
                    .from('tech_matches')
                    .insert({
                        liker_id: user.id,
                        liked_id: profileId,
                        status: status
                    })
                    .select()
                    .single();

                if (error) throw error;

                // Check if it was an instant match (either via our logic or DB trigger)
                if (status === 'matched' || data?.status === 'matched') {
                    setLastMatchedProfile(swipedProfile);
                    setMatchDialogOpen(true);
                    triggerConfetti();

                    // Create message conversation immediately
                    // This ensures the chat exists when they click "Send Message"
                    const { error: convError } = await supabase.rpc('get_or_create_conversation', {
                        other_user_id: profileId
                    });
                    if (convError) console.error("Error creating conversation:", convError);

                } else if (direction === 'right') {
                    toast({
                        title: `You liked ${swipedProfile.full_name}`,
                        className: "bg-green-500 text-white border-none duration-1000",
                    });
                }

            } catch (error) {
                console.error("Error swiping:", error);
            }
        }, 300);
    }, [potentialMatches, triggerConfetti, toast]);

    const handleUndo = useCallback(async () => {
        if (swipedHistory.length === 0) return;

        const lastProfile = swipedHistory[swipedHistory.length - 1];

        // Remove from history
        setSwipedHistory(prev => prev.slice(0, -1));

        // Add back to potential matches
        setPotentialMatches(prev => [...prev, lastProfile]);

        toast({ title: "Undoing last swipe..." });
    }, [swipedHistory, toast]);

    const handleStartChat = async () => {
        if (!lastMatchedProfile || !currentUser) return;

        setMatchDialogOpen(false);
        toast({ title: "Starting chat...", description: "Connecting you with your match!" });

        try {
            // Create or get conversation
            const { data, error } = await supabase.rpc('get_or_create_conversation', {
                other_user_id: lastMatchedProfile.id
            });

            if (error) throw error;

            if (data) {
                navigate(`/chat/${data}`);
            } else {
                // Fallback if RPC returns nothing but no error (rare)
                navigate('/messages');
            }

        } catch (error) {
            console.error("Error starting chat:", error);
            toast({
                title: "Error",
                description: "Could not start conversation.",
                variant: "destructive"
            });
        }
    };

    return (
        <div className="mt-0 animate-in fade-in slide-in-from-bottom-4 duration-500 h-[calc(100vh-130px)] flex flex-col">
            {/* Filter Bar */}
            <div className="flex px-4 py-2 gap-2 items-center justify-between">
                <div className="flex gap-2 overflow-x-auto no-scrollbar mask-gradient-r">
                    {selectedSkills.map(skill => (
                        <Badge key={skill} variant="secondary" className="bg-primary/10 text-primary whitespace-nowrap">
                            {skill} <X className="w-3 h-3 ml-1 cursor-pointer" onClick={() => toggleSkill(skill)} />
                        </Badge>
                    ))}
                </div>
                <Button
                    variant={selectedSkills.length > 0 ? "default" : "ghost"}
                    size="icon"
                    className={selectedSkills.length > 0 ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-primary"}
                    onClick={() => setFilterDialogOpen(true)}
                >
                    <Settings2 className="w-5 h-5" />
                </Button>
            </div>

            <div className="flex-1 relative flex items-center justify-center p-4 overflow-hidden max-w-md mx-auto w-full">
                <AnimatePresence>
                    {potentialMatches.length > 0 ? (
                        potentialMatches.slice(-2).map((profile, index, array) => {
                            const isFront = index === array.length - 1;
                            return (
                                <SwipeCard
                                    key={profile.id}
                                    profile={profile}
                                    onSwipe={(dir) => handleSwipe(dir, profile.id)}
                                    exitDirection={isFront ? exitDirection : null}
                                    draggable={isFront}
                                />
                            );
                        })
                    ) : (
                        <div className="text-center space-y-4">
                            <div className="w-20 h-20 bg-secondary/30 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                                <Code className="w-10 h-10 text-muted-foreground" />
                            </div>
                            <h3 className="text-xl font-bold">No matches found</h3>
                            <p className="text-muted-foreground max-w-xs mx-auto">
                                Try adjusting your filters to see more developers.
                            </p>
                            <Button onClick={() => setSelectedSkills([])} variant="outline">
                                Clear Filters
                            </Button>
                        </div>
                    )}
                </AnimatePresence>
            </div>

            {/* Bottom Action Bar */}
            {potentialMatches.length > 0 && (
                <div className="p-6 flex justify-center items-center gap-6 pb-8">
                    <Button
                        size="icon"
                        variant="outline"
                        className="h-12 w-12 rounded-full border-yellow-500/20 text-yellow-500 hover:bg-yellow-500/10 hover:border-yellow-500"
                        onClick={handleUndo}
                        disabled={swipedHistory.length === 0}
                    >
                        <RotateCcw className="w-5 h-5" />
                    </Button>

                    <Button
                        size="lg"
                        variant="outline"
                        className="h-14 w-14 rounded-full border-2 border-red-500/20 text-red-500 hover:bg-red-500/10 hover:border-red-500"
                        onClick={() => handleSwipe("left", potentialMatches[potentialMatches.length - 1].id)}
                    >
                        <X className="w-6 h-6" />
                    </Button>

                    <Button
                        size="lg"
                        className="h-16 w-16 rounded-full bg-gradient-to-r from-green-500 to-emerald-600 shadow-lg shadow-green-500/30 hover:scale-110 transition-transform"
                        onClick={() => handleSwipe("right", potentialMatches[potentialMatches.length - 1].id)}
                    >
                        <Heart className="w-8 h-8 fill-white text-white" />
                    </Button>
                </div>
            )}

            <Dialog open={matchDialogOpen} onOpenChange={setMatchDialogOpen}>
                <DialogContent className="sm:max-w-md text-center border-none bg-gradient-to-br from-gray-900 to-black text-white">
                    <div className="py-8 space-y-6">
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="text-5xl font-black bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent italic"
                        >
                            IT'S A MATCH!
                        </motion.div>

                        <div className="flex justify-center items-center gap-4">
                            <div className="relative">
                                <Avatar className="w-20 h-20 border-4 border-white/20">
                                    <AvatarImage src={currentUser?.user_metadata?.avatar_url || undefined} />
                                    <AvatarFallback>{currentUser?.user_metadata?.full_name?.[0] || 'U'}</AvatarFallback>
                                </Avatar>
                            </div>
                            <Heart className="w-10 h-10 text-pink-500 fill-pink-500 animate-pulse" />
                            <div className="relative">
                                <Avatar className="w-20 h-20 border-4 border-white/20">
                                    <AvatarImage src={lastMatchedProfile?.avatar_url || ''} />
                                    <AvatarFallback>M</AvatarFallback>
                                </Avatar>
                            </div>
                        </div>

                        <p className="text-white/80">
                            You and <span className="font-bold text-white">{lastMatchedProfile?.full_name}</span> both want to connect!
                        </p>

                        <div className="flex flex-col gap-3 pt-4">
                            <Button className="w-full bg-white text-black font-bold hover:bg-white/90" onClick={handleStartChat}>
                                Send a Message
                            </Button>
                            <Button variant="ghost" className="w-full text-white/50 hover:text-white" onClick={() => setMatchDialogOpen(false)}>
                                Keep Swiping
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Filter Dialog */}
            <Dialog open={filterDialogOpen} onOpenChange={setFilterDialogOpen}>
                <DialogContent>
                    <div className="space-y-4">
                        <h3 className="font-bold text-lg">Filter by Tech Stack</h3>
                        <div className="flex flex-wrap gap-2">
                            {AVAILABLE_SKILLS.map(skill => (
                                <Badge
                                    key={skill}
                                    variant={selectedSkills.includes(skill) ? "default" : "outline"}
                                    className="cursor-pointer px-3 py-1.5 text-sm"
                                    onClick={() => toggleSkill(skill)}
                                >
                                    {skill}
                                </Badge>
                            ))}
                        </div>
                        <div className="flex justify-end pt-4">
                            <Button onClick={() => setFilterDialogOpen(false)}>Apply Filters</Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
};
