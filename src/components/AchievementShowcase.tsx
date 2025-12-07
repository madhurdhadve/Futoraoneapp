import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Trophy,
    Share2,
    Lock,
    Award,
    Star,
    Zap,
    Crown,
    Linkedin,
    Footprints,
    PenTool,
    Heart,
    Code,
    Bug,
    Flame
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Achievement {
    id: string;
    title: string;
    description: string;
    icon_name: string;
    xp_reward: number;
    unlocked_at?: string;
}

interface LeaderboardUser {
    id: string;
    username: string;
    avatar_url: string | null;
    xp: number;
    level: number;
}

// Map icon names from database to Lucide components
const IconMap: { [key: string]: React.ElementType } = {
    'Footprints': Footprints,
    'PenTool': PenTool,
    'Heart': Heart,
    'Code': Code,
    'Bug': Bug,
    'Flame': Flame,
    'Trophy': Trophy,
    'Award': Award,
    'Zap': Zap,
    'Star': Star
};

export const AchievementShowcase = ({ userId }: { userId?: string }) => {
    const [activeTab, setActiveTab] = useState<'badges' | 'leaderboard'>('badges');
    const [achievements, setAchievements] = useState<Achievement[]>([]);
    const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // Determine which user to fetch for
                let targetUserId = userId;
                if (!targetUserId) {
                    const { data: { user } } = await supabase.auth.getUser();
                    if (user) targetUserId = user.id;
                }

                if (!targetUserId) return;

                // 1. Fetch all available achievements
                const { data: allAchievements, error: achievementsError } = await supabase
                    .from('achievements')
                    .select('*');

                if (achievementsError) throw achievementsError;

                // 2. Fetch user's unlocked achievements
                const { data: userUnlocks, error: unlocksError } = await supabase
                    .from('user_achievements')
                    .select('achievement_id, unlocked_at')
                    .eq('user_id', targetUserId);

                if (unlocksError) throw unlocksError;

                // Merge data
                const unlocksMap = new Map(userUnlocks?.map(u => [u.achievement_id, u.unlocked_at]));

                const mergedAchievements = allAchievements?.map(ach => ({
                    ...ach,
                    unlocked_at: unlocksMap.get(ach.id) || undefined
                })) || [];

                setAchievements(mergedAchievements);

                // 3. Fetch Leaderboard (Top 10 users by XP)
                const { data: topUsers, error: leaderboardError } = await supabase
                    .from('profiles')
                    .select('id, username, avatar_url, xp, level')
                    .order('xp', { ascending: false })
                    .limit(10);

                if (leaderboardError) throw leaderboardError;

                setLeaderboard(topUsers || []);

            } catch (error) {
                console.error("Error fetching gamification data:", error);
                toast({
                    title: "Error loading achievements",
                    description: "Could not load gamification data.",
                    variant: "destructive",
                });
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [userId, toast]);

    const handleShare = async () => {
        const unlockedCount = achievements.filter(a => a.unlocked_at).length;
        const totalXp = achievements.reduce((acc, curr) => acc + (curr.unlocked_at ? curr.xp_reward : 0), 0);
        const shareText = `I've unlocked ${unlockedCount} achievements and earned ${totalXp} XP on FutoraOne! 🚀`;

        if (navigator.share) {
            try {
                await navigator.share({
                    title: 'My FutoraOne Achievements',
                    text: shareText,
                    url: window.location.href,
                });
            } catch (err) {
                console.error('Error sharing:', err);
            }
        } else {
            navigator.clipboard.writeText(shareText);
            toast({
                title: "Copied to clipboard",
                description: "Show off your stats!",
            });
        }
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: { type: "spring", stiffness: 300, damping: 24 }
        }
    };

    return (
        <Card className="bg-white/10 dark:bg-black/20 backdrop-blur-lg border-white/20 dark:border-white/10 overflow-hidden">
            <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold flex items-center gap-2 bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
                        <Trophy className="text-yellow-500" />
                        Hall of Fame
                    </h2>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 border-blue-400/20 hover:bg-blue-400/10 text-blue-400"
                            onClick={() => window.open(`https://twitter.com/intent/tweet?text=I've just unlocked new achievements on FutoraOne! 🚀 Check out my dev profile!&url=${encodeURIComponent(window.location.href)}`, '_blank')}
                        >
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path></svg>
                        </Button>
                        <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 border-blue-600/20 hover:bg-blue-600/10 text-blue-600"
                            onClick={() => window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`, '_blank')}
                        >
                            <Linkedin className="w-4 h-4" />
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            className="border-primary/20 hover:bg-primary/10"
                            onClick={handleShare}
                        >
                            <Share2 className="w-4 h-4 mr-2" />
                            Share
                        </Button>
                    </div>
                </div>

                <div className="flex bg-muted/20 p-1 rounded-xl mb-6">
                    <button
                        className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${activeTab === 'badges'
                            ? 'bg-primary text-primary-foreground shadow-lg'
                            : 'text-muted-foreground hover:text-foreground hover:bg-white/10'
                            }`}
                        onClick={() => setActiveTab('badges')}
                    >
                        Badges
                    </button>
                    <button
                        className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${activeTab === 'leaderboard'
                            ? 'bg-primary text-primary-foreground shadow-lg'
                            : 'text-muted-foreground hover:text-foreground hover:bg-white/10'
                            }`}
                        onClick={() => setActiveTab('leaderboard')}
                    >
                        Leaderboard
                    </button>
                </div>

                <AnimatePresence mode="wait">
                    {activeTab === 'badges' ? (
                        <motion.div
                            key="badges"
                            variants={containerVariants}
                            initial="hidden"
                            animate="visible"
                            exit={{ opacity: 0, x: -20 }}
                            className="grid grid-cols-2 lg:grid-cols-4 gap-4"
                        >
                            {loading ? (
                                // Skeleton loading state
                                Array(4).fill(0).map((_, i) => (
                                    <div key={i} className="h-32 bg-muted/10 rounded-xl animate-pulse" />
                                ))
                            ) : achievements.map((achievement) => {
                                const IconComponent = IconMap[achievement.icon_name] || Award;
                                return (
                                    <motion.div key={achievement.id} variants={itemVariants}>
                                        <div className={`
                                            relative p-4 rounded-xl border transition-all duration-300 group
                                            ${achievement.unlocked_at
                                                ? 'bg-gradient-to-br from-primary/10 to-purple-500/10 border-primary/20 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/20'
                                                : 'bg-muted/5 border-muted/20 grayscale opacity-70'}
                                        `}>
                                            <div className="absolute top-2 right-2">
                                                {achievement.unlocked_at ? (
                                                    <Star className="w-4 h-4 text-yellow-500 fill-yellow-500 animate-pulse" />
                                                ) : (
                                                    <Lock className="w-4 h-4 text-muted-foreground" />
                                                )}
                                            </div>

                                            <div className={`
                                                w-12 h-12 rounded-full flex items-center justify-center mb-3 text-2xl
                                                ${achievement.unlocked_at ? 'bg-primary/20' : 'bg-muted'}
                                            `}>
                                                <IconComponent className={`w-6 h-6 ${achievement.unlocked_at ? 'text-primary' : 'text-muted-foreground'}`} />
                                            </div>

                                            <h3 className="font-semibold text-sm mb-1">{achievement.title}</h3>
                                            <p className="text-xs text-muted-foreground mb-2 line-clamp-2">{achievement.description}</p>

                                            <div className="flex items-center gap-1 text-xs font-medium text-orange-500">
                                                <Zap className="w-3 h-3" />
                                                +{achievement.xp_reward} XP
                                            </div>

                                            {achievement.unlocked_at && (
                                                <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl pointer-events-none" />
                                            )}
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </motion.div>
                    ) : (
                        <motion.div
                            key="leaderboard"
                            variants={containerVariants}
                            initial="hidden"
                            animate="visible"
                            exit={{ opacity: 0, x: 20 }}
                            className="space-y-4"
                        >
                            {loading ? (
                                // Skeleton loading state
                                Array(3).fill(0).map((_, i) => (
                                    <div key={i} className="h-20 bg-muted/10 rounded-xl animate-pulse" />
                                ))
                            ) : leaderboard.map((user, index) => (
                                <motion.div key={user.id} variants={itemVariants}>
                                    <div className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
                                        <div className="flex-shrink-0 w-8 text-center font-bold text-lg text-muted-foreground">
                                            {index + 1 === 1 ? '🥇' : index + 1 === 2 ? '🥈' : index + 1 === 3 ? '🥉' : `#${index + 1}`}
                                        </div>

                                        <Avatar className="w-12 h-12 border-2 border-primary/20">
                                            <AvatarImage src={user.avatar_url || undefined} />
                                            <AvatarFallback>{user.username ? user.username[0] : 'U'}</AvatarFallback>
                                        </Avatar>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <h3 className="font-semibold truncate">{user.username || 'Anonymous'}</h3>
                                                {index === 0 && <Crown className="w-4 h-4 text-yellow-500 fill-yellow-500" />}
                                            </div>
                                            <p className="text-xs text-muted-foreground">Level {user.level || 1}</p>
                                        </div>

                                        <div className="text-right">
                                            <div className="font-bold text-primary">{(user.xp || 0).toLocaleString()}</div>
                                            <div className="text-xs text-muted-foreground">XP</div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </Card>
    );
};
