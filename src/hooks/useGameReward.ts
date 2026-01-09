import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import confetti from "canvas-confetti";

interface RewardResponse {
    success: boolean;
    coins?: number;
    message?: string;
    new_balance?: number;
}

export const useGameReward = () => {
    // We now strictly reward WINS as per the engagement engine design
    const processWin = async (gameKey: string) => {
        try {
            // @ts-ignore - RPC types might lag
            const { data, error } = await supabase.rpc("reward_game_win", {
                p_game_key: gameKey,
            });

            if (error) {
                console.error("Reward RPC Error:", error);
                return 0;
            }

            const response = data as RewardResponse;

            if (response && response.success && response.coins) {
                // Engagement Engine: Visual Feedback
                toast.success(`+${response.coins} Coins!`, {
                    description: response.message || "Victory Reward",
                    duration: 3000,
                    className: "bg-yellow-500/10 border-yellow-500/50 text-yellow-500",
                    icon: "🪙"
                });

                // Extra confetti for the coin win
                confetti({
                    particleCount: 30,
                    spread: 60,
                    origin: { y: 0.7 },
                    colors: ['#FFD700', '#FFA500'] // Gold colors
                });

                return response.coins;
            } else if (response && !response.success && response.message) {
                // Daily limit or other info
                toast.info(response.message, {
                    icon: "⏳"
                });
            }
        } catch (e) {
            console.error("Reward System Error:", e);
        }
        return 0;
    };

    return { processWin };
};

