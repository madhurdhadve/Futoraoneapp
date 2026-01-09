import { useState, useRef, memo } from "react";
import { motion, useMotionValue, useTransform, PanInfo } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Github, Linkedin, Globe, MapPin, X, Heart, Code } from "lucide-react";

export interface Profile {
    id: string;
    username: string;
    full_name: string;
    avatar_url: string | null;
    bio: string | null;
    location: string | null;
    tech_skills: string[] | null;
    github_url: string | null;
    linkedin_url: string | null;
    portfolio_url: string | null;
}

interface SwipeCardProps {
    profile: Profile;
    onSwipe: (direction: "left" | "right") => void;
    exitDirection?: "left" | "right" | null;
    draggable?: boolean;
}

export const SwipeCard = memo(({ profile, onSwipe, exitDirection, draggable = true }: SwipeCardProps) => {
    const x = useMotionValue(0);
    const rotate = useTransform(x, [-200, 200], [-15, 15]);
    const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0, 1, 1, 1, 0]);

    // Color feedback
    const rightOpacity = useTransform(x, [50, 150], [0, 1]);
    const leftOpacity = useTransform(x, [-150, -50], [1, 0]);

    const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
        if (info.offset.x > 80) {
            onSwipe("right");
        } else if (info.offset.x < -80) {
            onSwipe("left");
        }
    };

    const exitProps = exitDirection ? {
        x: exitDirection === "left" ? -1000 : 1000,
        opacity: 0,
        transition: { duration: 0.4, ease: "easeIn" as const }
    } : {};

    return (
        <motion.div
            style={{ x, rotate, opacity, zIndex: draggable ? 10 : 0 }}
            drag={draggable ? "x" : false}
            dragConstraints={{ left: -300, right: 300 }}
            dragElastic={0.2}
            onDragEnd={handleDragEnd}
            initial={draggable ? { scale: 1, y: 0, opacity: 1 } : { scale: 0.95, y: 10, opacity: 0.5 }}
            animate={draggable ? { scale: 1, y: 0, opacity: 1 } : { scale: 0.95, y: 10, opacity: 0.5 }}
            exit={exitProps}
            className={`absolute inset-0 w-full h-full p-4 ${draggable ? 'cursor-grab active:cursor-grabbing' : ''}`}
            whileDrag={{ scale: 1.05 }}
        >
            <Card className="w-full h-full overflow-hidden shadow-2xl border-0 bg-transparent rounded-3xl relative">
                {/* Swipe Feedback Overlays */}
                <motion.div style={{ opacity: rightOpacity }} className="absolute inset-0 bg-gradient-to-l from-green-500/40 to-transparent z-30 flex items-center justify-center pointer-events-none">
                    <motion.div
                        initial={{ scale: 0.5 }}
                        animate={{ scale: 1.2 }}
                        className="border-8 border-white text-white rounded-xl p-4 rotate-12 bg-green-500 shadow-2xl"
                    >
                        <span className="text-5xl font-black uppercase tracking-widest">LIKE</span>
                    </motion.div>
                </motion.div>
                <motion.div style={{ opacity: leftOpacity }} className="absolute inset-0 bg-gradient-to-r from-red-500/40 to-transparent z-30 flex items-center justify-center pointer-events-none">
                    <motion.div
                        initial={{ scale: 0.5 }}
                        animate={{ scale: 1.2 }}
                        className="border-8 border-white text-white rounded-xl p-4 -rotate-12 bg-red-500 shadow-2xl"
                    >
                        <span className="text-5xl font-black uppercase tracking-widest">NOPE</span>
                    </motion.div>
                </motion.div>

                {/* Main Card Content */}
                <div className="absolute inset-0 bg-black">
                    {/* Image Container */}
                    <div className="h-full w-full relative">
                        {profile.avatar_url ? (
                            <img src={profile.avatar_url} alt={profile.full_name} className="w-full h-full object-cover" draggable={false} />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500">
                                <span className="text-9xl font-bold text-white/20 select-none">{profile.full_name[0]}</span>
                            </div>
                        )}

                        {/* Gradient Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />

                        {/* Content Overlay */}
                        <div className="absolute bottom-0 inset-x-0 p-6 text-white z-10 pb-24">
                            <div className="flex items-end gap-3 mb-2">
                                <h2 className="text-3xl font-bold leading-none shadow-black drop-shadow-lg">{profile.full_name}</h2>
                                <Badge className="bg-white/20 hover:bg-white/30 text-white border-none backdrop-blur-md mb-1">
                                    98% Match
                                </Badge>
                            </div>

                            <p className="text-white/90 font-medium mb-3 flex items-center gap-2 drop-shadow-md">
                                <span className="text-primary font-bold">@</span>{profile.username}
                                {profile.location && (
                                    <>
                                        <span className="w-1 h-1 bg-white/50 rounded-full mx-1" />
                                        <span className="flex items-center gap-1 text-sm opacity-80">
                                            <MapPin className="w-3 h-3" /> {profile.location}
                                        </span>
                                    </>
                                )}
                            </p>

                            <div className="text-sm text-white/80 line-clamp-2 mb-4 drop-shadow-md">
                                {profile.bio || "Just a developer looking for my player 2."}
                            </div>

                            <div className="flex flex-wrap gap-2">
                                {profile.tech_skills?.slice(0, 4).map(skill => (
                                    <Badge key={skill} variant="secondary" className="bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm border-white/10">
                                        {skill}
                                    </Badge>
                                ))}
                            </div>
                        </div>

                        {/* Action Buttons Overlay (Visual only, actual buttons are below in parent) */}
                        <div className="absolute right-4 top-4 flex flex-col gap-3">
                            {profile.github_url && (
                                <div className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center border border-white/10 text-white">
                                    <Github className="w-5 h-5" />
                                </div>
                            )}
                            {profile.linkedin_url && (
                                <div className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center border border-white/10 text-white">
                                    <Linkedin className="w-5 h-5" />
                                </div>
                            )}
                            {profile.portfolio_url && (
                                <div className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center border border-white/10 text-white">
                                    <Globe className="w-5 h-5" />
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </Card>
        </motion.div>
    );
});
