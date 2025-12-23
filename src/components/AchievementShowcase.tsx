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
    const [showAllBadges, setShowAllBadges] = useState(false);
    const [currentUserRank, setCurrentUserRank] = useState<{ rank: number, user: LeaderboardUser } | null>(null);
    const [currentViewerId, setCurrentViewerId] = useState<string | null>(null);
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

                setCurrentViewerId(targetUserId);

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

                // 3. Fetch ALL users ordered by XP
                const { data: allUsers, error: leaderboardError } = await supabase
                    .from('profiles')
                    .select('id, username, avatar_url, xp, level')
                    .order('xp', { ascending: false })
                    .limit(100); // Get top 100 for accurate ranking

                if (leaderboardError) throw leaderboardError;

                // Find current user's rank in the full list
                const userIndex = allUsers?.findIndex(u => u.id === targetUserId) ?? -1;
                const userRankNumber = userIndex !== -1 ? userIndex + 1 : null;

                // ALWAYS show only top 3 users
                const displayedUsers = allUsers?.slice(0, 3) || [];

                // Keep track of current user rank for potential display elsewhere
                if (userRankNumber && userRankNumber > 3) {
                    const userData = allUsers[userIndex];
                    setCurrentUserRank({
                        rank: userRankNumber,
                        user: userData
                    });
                } else {
                    setCurrentUserRank(null); // User is in top 3, no need to show separately
                }

                setLeaderboard(displayedUsers);

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

        // Real-time subscription for XP updates
        const channel = supabase
            .channel('xp-updates-achievement')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'profiles' },
                (payload) => {
                    const updatedUser = payload.new as any;
                    // Only refetch if the updated user is in the current leaderboard or is the target user
                    const isInLeaderboard = leaderboard.some(u => u.id === updatedUser.id);
                    const isTargetUser = updatedUser.id === targetUserId;

                    if (isInLeaderboard || isTargetUser) {
                        console.log('Relevant Profile XP updated!', payload);
                        fetchData(); // Refetch leaderboard
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
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

    // Enhanced animation variants
    const containerVariants = {
        hidden: { opacity: 0, scale: 0.95 },
        visible: {
            opacity: 1,
            scale: 1,
            transition: {
                staggerChildren: 0.08,
                delayChildren: 0.1,
                duration: 0.3
            }
        },
        exit: {
            opacity: 0,
            scale: 0.95,
            transition: { duration: 0.2 }
        }
    };

    const itemVariants = {
        hidden: { y: 30, opacity: 0, scale: 0.8, rotateX: -15 },
        visible: {
            y: 0,
            opacity: 1,
            scale: 1,
            rotateX: 0,
            transition: {
                type: "spring",
                stiffness: 400,
                damping: 25,
                mass: 0.8
            }
        }
    };

    const badgeHoverVariants = {
        rest: { scale: 1, rotateY: 0 },
        hover: {
            scale: 1.05,
            rotateY: 5,
            transition: {
                type: "spring",
                stiffness: 400,
                damping: 10
            }
        }
    };

    const shineVariants = {
        initial: { x: '-100%' },
        animate: {
            x: '200%',
            transition: {
                repeat: Infinity,
                duration: 3,
                ease: "linear",
                repeatDelay: 5
            }
        }
    };

    // Determine which achievements to display
    const visibleAchievements = showAllBadges ? achievements : achievements.slice(0, 2);

    return (
        <Card className="bg-white/10 dark:bg-black/20 backdrop-blur-lg border-white/20 dark:border-white/10 overflow-hidden" >
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
                        <>
                            <motion.div
                                key="badges"
                                variants={containerVariants}
                                initial="hidden"
                                animate="visible"
                                exit="exit"
                                className="grid grid-cols-2 lg:grid-cols-4 gap-4"
                                style={{ perspective: 1000 }}
                            >
                                {loading ? (
                                    // Skeleton loading state
                                    Array(2).fill(0).map((_, i) => (
                                        <motion.div
                                            key={i}
                                            className="h-32 bg-muted/10 rounded-xl overflow-hidden"
                                            animate={{ opacity: [0.4, 0.8, 0.4] }}
                                            transition={{ duration: 1.5, repeat: Infinity }}
                                        />
                                    ))
                                ) : visibleAchievements.map((achievement, index) => {
                                    const IconComponent = IconMap[achievement.icon_name] || Award;
                                    return (
                                        <motion.div
                                            key={achievement.id}
                                            variants={itemVariants}
                                            initial="rest"
                                            whileHover={achievement.unlocked_at ? "hover" : "rest"}
                                            custom={index}
                                        >
                                            <motion.div
                                                variants={badgeHoverVariants}
                                                className={`
                                            relative p-4 rounded-xl border transition-all duration-300 overflow-hidden
                                            ${achievement.unlocked_at
                                                        ? 'bg-gradient-to-br from-primary/10 via-purple-500/10 to-pink-500/10 border-primary/30 hover:border-primary/60 hover:shadow-xl hover:shadow-primary/30 cursor-pointer'
                                                        : 'bg-muted/5 border-muted/20 grayscale opacity-60'}
                                        `}
                                            >
                                                {/* Shine effect for unlocked badges */}
                                                {achievement.unlocked_at && (
                                                    <motion.div
                                                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                                                        variants={shineVariants}
                                                        initial="initial"
                                                        animate="animate"
                                                        style={{ skewX: -20 }}
                                                    />
                                                )}

                                                {/* Sparkle particles for hover */}
                                                {achievement.unlocked_at && (
                                                    <>
                                                        <motion.div
                                                            className="absolute top-2 left-2 w-1 h-1 bg-yellow-400 rounded-full"
                                                            animate={{
                                                                scale: [0, 1.5, 0],
                                                                opacity: [0, 1, 0]
                                                            }}
                                                            transition={{
                                                                duration: 2,
                                                                repeat: Infinity,
                                                                delay: index * 0.3
                                                            }}
                                                        />
                                                        <motion.div
                                                            className="absolute bottom-3 right-3 w-1 h-1 bg-pink-400 rounded-full"
                                                            animate={{
                                                                scale: [0, 1.5, 0],
                                                                opacity: [0, 1, 0]
                                                            }}
                                                            transition={{
                                                                duration: 2,
                                                                repeat: Infinity,
                                                                delay: index * 0.3 + 1
                                                            }}
                                                        />
                                                    </>
                                                )}

                                                <div className="absolute top-2 right-2 z-10">
                                                    {achievement.unlocked_at ? (
                                                        <motion.div
                                                            animate={{
                                                                rotate: [0, 10, -10, 0],
                                                                scale: [1, 1.1, 1]
                                                            }}
                                                            transition={{
                                                                duration: 2,
                                                                repeat: Infinity,
                                                                repeatDelay: 3
                                                            }}
                                                        >
                                                            <Star className="w-4 h-4 text-yellow-500 fill-yellow-500 drop-shadow-lg" />
                                                        </motion.div>
                                                    ) : (
                                                        <Lock className="w-4 h-4 text-muted-foreground" />
                                                    )}
                                                </div>

                                                <motion.div
                                                    className={`
                                                w-12 h-12 rounded-full flex items-center justify-center mb-3
                                                ${achievement.unlocked_at ? 'bg-gradient-to-br from-primary/30 to-purple-500/30' : 'bg-muted'}
                                            `}
                                                    whileHover={achievement.unlocked_at ? {
                                                        scale: 1.1,
                                                        rotateZ: 360,
                                                        transition: { duration: 0.6 }
                                                    } : {}}
                                                >
                                                    <IconComponent className={`w-6 h-6 ${achievement.unlocked_at ? 'text-primary drop-shadow-lg' : 'text-muted-foreground'}`} />
                                                </motion.div>

                                                <h3 className="font-semibold text-sm mb-1 relative z-10">{achievement.title}</h3>
                                                <p className="text-xs text-muted-foreground mb-2 line-clamp-2 relative z-10">{achievement.description}</p>

                                                <motion.div
                                                    className="flex items-center gap-1 text-xs font-medium text-orange-500 relative z-10"
                                                    whileHover={{ scale: 1.05 }}
                                                >
                                                    <Zap className="w-3 h-3" />
                                                    +{achievement.xp_reward} XP
                                                </motion.div>
                                            </motion.div>
                                        </motion.div>
                                    );
                                })}
                            </motion.div>

                            {achievements.length > 2 && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="flex justify-center mt-4"
                                >
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="text-muted-foreground hover:text-primary"
                                        onClick={() => setShowAllBadges(!showAllBadges)}
                                    >
                                        {showAllBadges ? "See Less Badges" : `See All Badges (${achievements.length})`}
                                    </Button>
                                </motion.div>
                            )}
                        </>
                    ) : (
                        <motion.div
                            key="leaderboard"
                            variants={containerVariants}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                            className="space-y-4"
                        >
                            {loading ? (
                                // Skeleton loading state
                                Array(3).fill(0).map((_, i) => (
                                    <div key={i} className="h-20 bg-muted/10 rounded-xl animate-pulse" />
                                ))
                            ) : leaderboard.map((user, index) => (
                                <motion.div key={user.id} variants={itemVariants}>
                                    <div className={`flex items-center gap-4 p-4 rounded-xl border transition-colors ${user.id === currentViewerId
                                        ? 'bg-primary/10 border-primary/50'
                                        : 'bg-white/5 border-white/10 hover:bg-white/10'
                                        }`}>
                                        <div className={`flex-shrink-0 w-8 text-center font-bold text-lg ${user.id === currentViewerId ? 'text-primary' : 'text-muted-foreground'
                                            }`}>
                                            {index + 1 === 1 ? '🥇' : index + 1 === 2 ? '🥈' : index + 1 === 3 ? '🥉' : `#${index + 1}`}
                                        </div>

                                        <Avatar className="w-12 h-12 border-2 border-primary/20">
                                            <AvatarImage src={user.avatar_url || undefined} />
                                            <AvatarFallback>{user.username ? user.username[0] : 'U'}</AvatarFallback>
                                        </Avatar>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <h3 className={`font-semibold truncate ${user.id === currentViewerId ? 'text-primary' : ''
                                                    }`}>
                                                    {user.username || 'Anonymous'}
                                                    {user.id === currentViewerId && " (You)"}
                                                </h3>
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

                            {/* See More Button */}
                            {!loading && leaderboard.length > 0 && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="flex justify-center pt-2"
                                >
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="border-primary/20 hover:bg-primary/10 text-primary"
                                        onClick={() => window.open('/hall-of-fame', '_blank')}
                                    >
                                        See Full Hall of Fame
                                    </Button>
                                </motion.div>
                            )}


                            {/* Show current user rank if not in displayed list */}
                            {!loading && currentUserRank && !leaderboard.some(u => u.id === currentUserRank.user.id) && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="pt-2 border-t border-white/10"
                                >
                                    <div className="flex items-center gap-4 p-4 rounded-xl bg-primary/10 border border-primary/20">
                                        <div className="flex-shrink-0 w-8 text-center font-bold text-lg text-primary">
                                            #{currentUserRank.rank}
                                        </div>

                                        <Avatar className="w-12 h-12 border-2 border-primary">
                                            <AvatarImage src={currentUserRank.user.avatar_url || undefined} />
                                            <AvatarFallback>{currentUserRank.user.username ? currentUserRank.user.username[0] : 'U'}</AvatarFallback>
                                        </Avatar>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <h3 className="font-semibold truncate text-primary">You</h3>
                                            </div>
                                            <p className="text-xs text-muted-foreground">Level {currentUserRank.user.level || 1}</p>
                                        </div>

                                        <div className="text-right">
                                            <div className="font-bold text-primary">{(currentUserRank.user.xp || 0).toLocaleString()}</div>
                                            <div className="text-xs text-muted-foreground">XP</div>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </Card >
    );
};
