import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { AVATAR_OPTIONS } from '@/utils/avatars';
import { cn } from '@/lib/utils';

export default function SelectAvatar() {
    const navigate = useNavigate();
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [currentAvatar, setCurrentAvatar] = useState<string | null>(null);
    const [selectedAvatar, setSelectedAvatar] = useState<string | null>(null);
    const [userId, setUserId] = useState<string | null>(null);

    useEffect(() => {
        const fetchCurrentAvatar = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                navigate('/auth');
                return;
            }

            setUserId(user.id);

            const { data: profile } = await supabase
                .from('profiles')
                .select('avatar_url')
                .eq('id', user.id)
                .single();

            if (profile?.avatar_url) {
                setCurrentAvatar(profile.avatar_url);
                setSelectedAvatar(profile.avatar_url);
            }
        };

        fetchCurrentAvatar();
    }, [navigate]);

    const handleSave = async () => {
        if (!userId || !selectedAvatar) return;

        setLoading(true);
        try {
            const { error } = await supabase
                .from('profiles')
                .update({ avatar_url: selectedAvatar })
                .eq('id', userId);

            if (error) throw error;

            toast({
                title: 'Avatar updated!',
                description: 'Your profile avatar has been updated successfully.',
            });

            navigate('/profile');
        } catch (error) {
            toast({
                title: 'Error',
                description: (error as Error).message,
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background p-4">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <Button
                        variant="ghost"
                        onClick={() => navigate('/profile')}
                        className="gap-2"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Profile
                    </Button>

                    <Button
                        onClick={handleSave}
                        disabled={loading || !selectedAvatar || selectedAvatar === currentAvatar}
                        className="gradient-primary"
                    >
                        {loading ? 'Saving...' : 'Save Avatar'}
                    </Button>
                </div>

                {/* Title */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold mb-2">Choose Your Avatar</h1>
                    <p className="text-muted-foreground">Select a cartoon avatar for your profile</p>
                </div>

                {/* Avatar Grid */}
                <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-4">
                    {AVATAR_OPTIONS.map((avatar) => {
                        const isSelected = selectedAvatar === avatar.url;

                        return (
                            <motion.button
                                key={avatar.id}
                                type="button"
                                onClick={() => setSelectedAvatar(avatar.url)}
                                className={cn(
                                    "relative aspect-square rounded-full overflow-hidden border-2 transition-all",
                                    isSelected
                                        ? "border-primary shadow-lg shadow-primary/50 scale-105"
                                        : "border-white/20 hover:border-primary/50 hover:scale-105"
                                )}
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                {/* Avatar Image */}
                                <img
                                    src={avatar.url}
                                    alt={avatar.name}
                                    className="w-full h-full object-cover"
                                    loading="lazy"
                                />

                                {/* Selection Indicator */}
                                {isSelected && (
                                    <motion.div
                                        initial={{ scale: 0, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        className="absolute inset-0 bg-primary/20 flex items-center justify-center backdrop-blur-sm"
                                    >
                                        <div className="bg-primary rounded-full p-2">
                                            <Check className="w-6 h-6 text-white" />
                                        </div>
                                    </motion.div>
                                )}

                                {/* Hover Effect */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 hover:opacity-100 transition-opacity" />
                            </motion.button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};
