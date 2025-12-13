
import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
    Trophy,
    Award,
    Star,
    Zap,
    Footprints,
    PenTool,
    Heart,
    Code,
    Bug,
    Flame
} from "lucide-react";

// Reuse the IconMap logic
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

export const AchievementListener = () => {
    const { toast } = useToast();

    useEffect(() => {
        // Function to setup the subscription
        const setupSubscription = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const channel = supabase
                .channel('achievement-unlocks')
                .on(
                    'postgres_changes',
                    {
                        event: 'INSERT',
                        schema: 'public',
                        table: 'user_achievements',
                        filter: `user_id=eq.${user.id}`
                    },
                    async (payload) => {
                        console.log('Achievement unlocked!', payload);

                        // Fetch achievement details
                        const { data: achievement, error } = await supabase
                            .from('achievements')
                            .select('*')
                            .eq('id', payload.new.achievement_id)
                            .single();

                        if (error || !achievement) {
                            console.error('Error fetching achievement details:', error);
                            return;
                        }

                        // Show toast
                        const IconComponent = IconMap[achievement.icon_name] || Trophy;

                        toast({
                            title: "Achievement Unlocked! 🏆",
                            description: (
                                <div className="flex flex-col gap-1">
                                    <p className="font-semibold text-primary">{achievement.title}</p>
                                    <p className="text-xs">{achievement.description}</p>
                                    <div className="flex items-center gap-1 text-xs text-orange-500 font-medium mt-1">
                                        <Zap className="w-3 h-3" />
                                        +{achievement.xp_reward} XP
                                    </div>
                                </div>
                            ),
                            duration: 5000,
                            className: "border-2 border-primary/20",
                        });

                        // Optional: Play a sound here if we had one
                    }
                )
                .subscribe();

            return () => {
                supabase.removeChannel(channel);
            };
        };

        const cleanup = setupSubscription();

        return () => {
            cleanup.then(unsub => unsub?.());
        };
    }, [toast]);

    return null; // This component handles side effects only
};
