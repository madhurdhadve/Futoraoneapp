import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

declare global {
    interface Window {
        OneSignal: any;
    }
}

export const useOneSignal = () => {
    useEffect(() => {
        const initOneSignal = async () => {
            // Wait for OneSignal to be available
            if (window.OneSignal) {
                try {
                    // Get the player ID (device ID) using the helper function
                    // We need to dynamically import the helper to avoid circular dependencies or initialization issues
                    const { getOneSignalUserId } = await import('@/lib/onesignal');
                    const playerId = await getOneSignalUserId();

                    if (playerId) {
                        console.log('OneSignal Player ID:', playerId);

                        // Get current user
                        const { data: { user } } = await supabase.auth.getUser();

                        if (user) {
                            // Update user profile with player ID
                            const { error } = await supabase
                                .from('profiles')
                                .update({ one_signal_player_id: playerId })
                                .eq('id', user.id);

                            if (error) {
                                console.error('Error updating OneSignal ID:', error);
                            }
                        }
                    }
                } catch (error) {
                    console.error('Error getting OneSignal ID:', error);
                }
            }
        };

        // Check periodically for OneSignal
        const interval = setInterval(() => {
            if (window.OneSignal) {
                initOneSignal();
                clearInterval(interval);
            }
        }, 1000);

        // Clear interval after 30 seconds to prevent infinite polling
        setTimeout(() => clearInterval(interval), 30000);

        return () => clearInterval(interval);
    }, []);
};
