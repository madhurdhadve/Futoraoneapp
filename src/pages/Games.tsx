import React from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    Grid,
    Gamepad2,
    Brain,
    Scissors,
    CircleDot,
    ArrowLeft,
    Trophy,
    Sparkles,
    Play,
    Zap
} from "lucide-react";
import { motion } from "framer-motion";

const games = [
    {
        id: "dots-and-boxes",
        title: "Dots & Boxes",
        description: "Strategy: Claim the most boxes to win.",
        icon: <Grid className="w-10 h-10 md:w-12 md:h-12 text-white" />,
        gradient: "from-blue-500 to-indigo-600",
        shadow: "shadow-blue-500/30",
        path: "/games/dots-and-boxes",
        difficulty: "Medium",
        dotColor: "bg-yellow-400"
    },
    {
        id: "tic-tac-toe",
        title: "Tic Tac Toe",
        description: "Classic: The timeless game of X's and O's.",
        icon: <Gamepad2 className="w-10 h-10 md:w-12 md:h-12 text-white" />,
        gradient: "from-emerald-400 to-teal-600",
        shadow: "shadow-emerald-500/30",
        path: "/games/tic-tac-toe",
        difficulty: "Easy",
        dotColor: "bg-pink-400"
    },
    {
        id: "memory-match",
        title: "Memory Match",
        description: "Focus: Test your memory finding pairs.",
        icon: <Brain className="w-10 h-10 md:w-12 md:h-12 text-white" />,
        gradient: "from-violet-500 to-purple-600",
        shadow: "shadow-violet-500/30",
        path: "/games/memory-match",
        difficulty: "Hard",
        dotColor: "bg-cyan-400"
    },
    {
        id: "rock-paper-scissors",
        title: "Rock Paper Scissors",
        description: "Luck: Quick battle of mind games.",
        icon: <Scissors className="w-10 h-10 md:w-12 md:h-12 text-white" />,
        gradient: "from-pink-500 to-rose-600",
        shadow: "shadow-pink-500/30",
        path: "/games/rock-paper-scissors",
        difficulty: "Easy",
        dotColor: "bg-blue-400"
    },
    {
        id: "connect-four",
        title: "Connect Four",
        description: "Strategy: Connect 4 discs to win.",
        icon: <CircleDot className="w-10 h-10 md:w-12 md:h-12 text-white" />,
        gradient: "from-orange-400 to-red-600",
        shadow: "shadow-orange-500/30",
        path: "/games/connect-four",
        difficulty: "Medium",
        dotColor: "bg-purple-400"
    }
];

const Games = React.memo(() => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 md:p-8 pb-32">
            <div className="max-w-7xl mx-auto space-y-8 md:space-y-12">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => navigate("/")} className="hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full">
                        <ArrowLeft className="w-6 h-6" />
                    </Button>
                    <div>
                        <h1 className="text-3xl md:text-5xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-3">
                            Game Zone <Gamepad2 className="w-8 h-8 md:w-10 md:h-10 text-primary animate-bounce-slow" />
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400 mt-1 md:mt-2 text-base md:text-lg mobile:text-sm">
                            Immersive games to challenge your friends
                        </p>
                    </div>
                </div>

                {/* Hero / Featured Section (Mobile Optimized) */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="relative overflow-hidden rounded-[2rem] md:rounded-[2.5rem] bg-gradient-to-r from-violet-600 via-indigo-600 to-blue-600 text-white shadow-2xl hover:shadow-violet-500/20 transition-shadow duration-500"
                    style={{ willChange: "transform, opacity" }}
                >
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
                    {/* Decorative blurred blob */}
                    <div className="absolute -right-20 -top-20 w-64 h-64 md:w-96 md:h-96 bg-white/10 rounded-full blur-3xl pointer-events-none" />

                    <div className="relative z-10 flex flex-col md:flex-row items-center justify-between p-6 md:p-16 gap-8 md:gap-12">
                        <div className="space-y-6 md:space-y-8 max-w-2xl text-center md:text-left w-full">
                            <div className="inline-flex items-center justify-center md:justify-start gap-2 px-4 py-1.5 rounded-full bg-white/20 backdrop-blur-md border border-white/20 text-xs md:text-sm font-semibold tracking-wide uppercase mx-auto md:mx-0">
                                <Sparkles className="w-4 h-4 text-yellow-300" />
                                <span>Featured Game</span>
                            </div>
                            <h2 className="text-4xl md:text-7xl font-black leading-tight drop-shadow-xl">
                                Connect Four
                            </h2>
                            <p className="text-lg md:text-2xl text-blue-100 font-medium leading-relaxed max-w-xl mx-auto md:mx-0">
                                The classic strategy game reimagined. Drop your discs, block your opponent, and connect four for victory!
                            </p>
                            <Button
                                size="lg"
                                className="w-full md:w-auto h-14 md:h-16 px-10 rounded-full bg-white text-violet-600 hover:bg-violet-50 font-bold text-lg shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 group"
                                onClick={() => navigate('/games/connect-four')}
                            >
                                <Play className="w-6 h-6 mr-2 fill-current group-hover:translate-x-1 transition-transform" />
                                Play Now
                            </Button>
                        </div>

                        {/* 3D-like Visual (Hidden on super small screens, visible on tablet+) */}
                        <motion.div
                            animate={{ y: [0, -20, 0], rotate: [0, 5, 0] }}
                            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                            className="relative hidden md:block"
                            style={{ willChange: "transform" }}
                        >
                            <div className="w-[300px] h-[300px] md:w-[400px] md:h-[400px] bg-gradient-to-tr from-white/10 to-transparent backdrop-blur-sm rounded-[3rem] border border-white/20 flex items-center justify-center relative shadow-[0_20px_50px_rgba(0,0,0,0.3)]">
                                <div className="absolute inset-4 border-2 border-dashed border-white/20 rounded-[2.5rem]" />
                                <CircleDot className="w-32 h-32 md:w-48 md:h-48 text-white drop-shadow-[0_10px_20px_rgba(0,0,0,0.5)]" />
                                {/* Decor dots */}
                                <div className="absolute top-8 right-8 w-4 h-4 md:w-6 md:h-6 bg-yellow-400 rounded-full shadow-lg animate-pulse" />
                                <div className="absolute bottom-8 left-8 w-4 h-4 md:w-6 md:h-6 bg-red-500 rounded-full shadow-lg animate-pulse delay-75" />
                            </div>
                        </motion.div>
                    </div>
                </motion.div>

                {/* Game Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                    {games.map((game, index) => (
                        <motion.div
                            key={game.id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.1 }}
                            whileHover={{ y: -5 }}
                            className="h-full"
                            style={{ willChange: "transform, opacity" }}
                        >
                            <Card
                                className="group h-full border-0 shadow-lg hover:shadow-2xl transition-all duration-500 cursor-pointer overflow-hidden bg-white dark:bg-slate-900 rounded-[2rem] relative flex flex-col"
                                onClick={() => navigate(game.path)}
                            >
                                {/* Premium Header Color Block */}
                                <div className={`h-40 md:h-48 bg-gradient-to-br ${game.gradient} relative overflow-hidden flex items-center justify-center p-6 group-hover:h-44 md:group-hover:h-52 transition-all duration-500`}>
                                    {/* Tech Pattern Overlay */}
                                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20 mix-blend-overlay" />

                                    {/* Large Tint Overlay on Hover */}
                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-500" />

                                    {/* Central Icon Container - The "Badge" Look */}
                                    <motion.div
                                        className="relative z-10 w-20 h-20 md:w-24 md:h-24 bg-white/20 backdrop-blur-md rounded-[1.5rem] flex items-center justify-center shadow-lg border border-white/30 group-hover:scale-110 transition-transform duration-500"
                                        style={{ willChange: "transform" }}
                                    >
                                        {/* Internal Dashed Border for Detail */}
                                        <div className="absolute inset-2 border border-dashed border-white/40 rounded-[1rem]" />

                                        {/* Corner Dots for Detail */}
                                        <div className={`absolute top-3 right-3 w-2 h-2 rounded-full ${game.dotColor} shadow-sm`} />
                                        <div className="absolute bottom-3 left-3 w-2 h-2 rounded-full bg-white/50 shadow-sm" />

                                        {/* Main Icon */}
                                        <div className="drop-shadow-md">
                                            {game.icon}
                                        </div>
                                    </motion.div>

                                    {/* Play Button Overlay */}
                                    <div className="absolute bottom-3 right-3 translate-y-20 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                                        <div className="w-10 h-10 md:w-12 md:h-12 bg-white rounded-full text-slate-900 flex items-center justify-center shadow-lg">
                                            <Play className="w-4 h-4 md:w-5 md:h-5 ml-1 fill-current" />
                                        </div>
                                    </div>
                                </div>

                                {/* Content Body */}
                                <div className="p-6 md:p-8 space-y-3 md:space-y-4 flex-1 flex flex-col">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white group-hover:text-primary transition-colors">
                                            {game.title}
                                        </h3>
                                        {/* Game Badges */}
                                        <div className="flex gap-2">
                                            {game.title === "Tic Tac Toe" && <Zap className="w-4 h-4 text-yellow-500 fill-current" />}
                                            {game.title === "Connect Four" && <Trophy className="w-4 h-4 text-blue-500 fill-current" />}
                                        </div>
                                    </div>

                                    <p className="text-slate-500 dark:text-slate-400 leading-relaxed font-medium text-sm md:text-base flex-1">
                                        {game.description}
                                    </p>

                                    {/* Footer / Stats */}
                                    <div className="pt-4 flex items-center justify-between text-xs md:text-sm font-semibold text-slate-400 border-t border-slate-100 dark:border-slate-800 uppercase tracking-wide">
                                        <span className="bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md">
                                            {game.difficulty}
                                        </span>
                                        <span className="flex items-center gap-1 group-hover:text-primary transition-colors">
                                            Details <ArrowLeft className="w-3 h-3 rotate-180" />
                                        </span>
                                    </div>
                                </div>
                            </Card>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
});

export default Games;
