import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Trophy,
    Share2,
    Lock,
    Award,
    Star,
    Zap,
    TrendingUp,
    Crown,
    Linkedin
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
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

const MOCK_ACHIEVEMENTS = [
    { id: '1', title: 'First Steps', description: 'Create your first post', icon_name: 'Footprints', xp_reward: 50, unlocked_at: new Date().toISOString() },
    { id: '2', title: 'Code Warrior', description: 'Share 5 code snippets', icon_name: 'Code', xp_reward: 150, unlocked_at: new Date().toISOString() },
    { id: '3', title: 'Streak Master', description: 'Login for 7 days in a row', icon_name: 'Flame', xp_reward: 500, unlocked_at: undefined },
    { id: '4', title: 'Social Butterfly', description: 'Receive 50 likes', icon_name: 'Heart', xp_reward: 300, unlocked_at: undefined },
];

const MOCK_LEADERBOARD = [
    { id: '1', username: 'SarahDev', avatar_url: null, xp: 15400, level: 15 },
    { id: '2', username: 'AlexCoder', avatar_url: null, xp: 12300, level: 12 },
    { id: '3', username: 'MikeTech', avatar_url: null, xp: 9800, level: 9 },
];

export const AchievementShowcase = ({ userId }: { userId?: string }) => {
    const [activeTab, setActiveTab] = useState<'badges' | 'leaderboard'>('badges');
    const [achievements, setAchievements] = useState<Achievement[]>(MOCK_ACHIEVEMENTS);
    const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>(MOCK_LEADERBOARD);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();

    useEffect(() => {
        // In a real app, fetch from Supabase here
        setTimeout(() => setLoading(false), 1000);
    }, []);

    const handleShare = async () => {
        const shareText = `I've unlocked ${achievements.filter(a => a.unlocked_at).length} achievements and earned ${achievements.reduce((acc, curr) => acc + (curr.unlocked_at ? curr.xp_reward : 0), 0)} XP on FutoraOne! 🚀`;

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
                            {achievements.map((achievement) => (
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
                                            {/* Placeholder for dynamic icons */}
                                            <Award className={`w-6 h-6 ${achievement.unlocked_at ? 'text-primary' : 'text-muted-foreground'}`} />
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
                            ))}
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
                            {leaderboard.map((user, index) => (
                                <motion.div key={user.id} variants={itemVariants}>
                                    <div className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
                                        <div className="flex-shrink-0 w-8 text-center font-bold text-lg text-muted-foreground">
                                            {index + 1 === 1 ? '🥇' : index + 1 === 2 ? '🥈' : index + 1 === 3 ? '🥉' : `#${index + 1}`}
                                        </div>

                                        <Avatar className="w-12 h-12 border-2 border-primary/20">
                                            <AvatarImage src={user.avatar_url || undefined} />
                                            <AvatarFallback>{user.username[0]}</AvatarFallback>
                                        </Avatar>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <h3 className="font-semibold truncate">{user.username}</h3>
                                                {index === 0 && <Crown className="w-4 h-4 text-yellow-500 fill-yellow-500" />}
                                            </div>
                                            <p className="text-xs text-muted-foreground">Level {user.level} Master</p>
                                        </div>

                                        <div className="text-right">
                                            <div className="font-bold text-primary">{user.xp.toLocaleString()}</div>
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
