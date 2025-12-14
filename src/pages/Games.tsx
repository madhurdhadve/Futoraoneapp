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
    Star
} from "lucide-react";
import { motion } from "framer-motion";

const games = [
    {
        id: "dots-and-boxes",
        title: "Dots & Boxes",
        description: "Strategy: Claim the most boxes to win.",
        icon: <Grid className="w-12 h-12 text-white" />,
        gradient: "from-blue-500 to-indigo-600",
        shadow: "shadow-blue-500/30",
        path: "/games/dots-and-boxes",
        difficulty: "Medium"
    },
    {
        id: "tic-tac-toe",
        title: "Tic Tac Toe",
        description: "Classic: The timeless game of X's and O's.",
        icon: <Gamepad2 className="w-12 h-12 text-white" />,
        gradient: "from-emerald-400 to-teal-600",
        shadow: "shadow-emerald-500/30",
        path: "/games/tic-tac-toe",
        difficulty: "Easy"
    },
    {
        id: "memory-match",
        title: "Memory Match",
        description: "Focus: Test your memory finding pairs.",
        icon: <Brain className="w-12 h-12 text-white" />,
        gradient: "from-violet-500 to-purple-600",
        shadow: "shadow-violet-500/30",
        path: "/games/memory-match",
        difficulty: "Hard"
    },
    {
        id: "rock-paper-scissors",
        title: "Rock Paper Scissors",
        description: "Luck: Quick battle of mind games.",
        icon: <Scissors className="w-12 h-12 text-white" />,
        gradient: "from-pink-500 to-rose-600",
        shadow: "shadow-pink-500/30",
        path: "/games/rock-paper-scissors",
        difficulty: "Easy"
    },
    {
        id: "connect-four",
        title: "Connect Four",
        description: "Strategy: Connect 4 discs to win.",
        icon: <CircleDot className="w-12 h-12 text-white" />,
        gradient: "from-orange-400 to-red-600",
        shadow: "shadow-orange-500/30",
        path: "/games/connect-four",
        difficulty: "Medium"
    }
];

const Games = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 md:p-8 pb-32">
            <div className="max-w-7xl mx-auto space-y-12">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => navigate("/")} className="hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full">
                        <ArrowLeft className="w-6 h-6" />
                    </Button>
                    <div>
                        <h1 className="text-4xl md:text-5xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-3">
                            Game Zone <Gamepad2 className="w-10 h-10 text-primary animate-bounce-slow" />
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400 mt-2 text-lg">
                            Immersive games to challenge your friends
                        </p>
                    </div>
                </div>

                {/* Hero / Featured Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-r from-violet-600 via-indigo-600 to-blue-600 text-white shadow-2xl hover:shadow-violet-500/20 transition-shadow duration-500"
                >
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
                    <div className="absolute -right-20 -top-20 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none" />

                    <div className="relative z-10 flex flex-col md:flex-row items-center justify-between p-8 md:p-16 gap-12">
                        <div className="space-y-8 max-w-2xl text-center md:text-left">
                            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/20 backdrop-blur-md border border-white/20 text-sm font-semibold tracking-wide uppercase">
                                <Sparkles className="w-4 h-4 text-yellow-300" />
                                <span>Featured Game</span>
                            </div>
                            <h2 className="text-5xl md:text-7xl font-black leading-tight drop-shadow-xl">
                                Connect Four
                            </h2>
                            <p className="text-xl md:text-2xl text-blue-100 font-medium leading-relaxed max-w-xl">
                                The classic strategy game reimagined. Drop your discs, block your opponent, and connect four for victory!
                            </p>
                            <Button
                                size="lg"
                                className="h-16 px-10 rounded-full bg-white text-violet-600 hover:bg-violet-50 font-bold text-lg shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 group"
                                onClick={() => navigate('/games/connect-four')}
                            >
                                <Play className="w-6 h-6 mr-2 fill-current group-hover:translate-x-1 transition-transform" />
                                Play Now
                            </Button>
                        </div>

                        {/* 3D-like Visual */}
                        <motion.div
                            animate={{ y: [0, -20, 0], rotate: [0, 5, 0] }}
                            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                            className="relative hidden md:block"
                        >
                            <div className="w-[400px] h-[400px] bg-gradient-to-tr from-white/10 to-transparent backdrop-blur-sm rounded-[3rem] border border-white/20 flex items-center justify-center relative shadow-[0_20px_50px_rgba(0,0,0,0.3)]">
                                <div className="absolute inset-4 border-2 border-dashed border-white/20 rounded-[2.5rem]" />
                                <CircleDot className="w-48 h-48 text-white drop-shadow-[0_10px_20px_rgba(0,0,0,0.5)]" />
                                {/* Decor dots */}
                                <div className="absolute top-10 right-10 w-6 h-6 bg-yellow-400 rounded-full shadow-lg animate-pulse" />
                                <div className="absolute bottom-10 left-10 w-6 h-6 bg-red-500 rounded-full shadow-lg animate-pulse delay-75" />
                            </div>
                        </motion.div>
                    </div>
                </motion.div>

                {/* Game Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {games.map((game, index) => (
                        <motion.div
                            key={game.id}
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 + 0.3 }}
                            whileHover={{ y: -10 }}
                        >
                            <Card
                                className="group h-full border-0 shadow-lg hover:shadow-2xl transition-all duration-500 cursor-pointer overflow-hidden bg-white dark:bg-slate-900 rounded-[2rem] relative"
                                onClick={() => navigate(game.path)}
                            >
                                {/* Header Color Block */}
                                <div className={`h-48 bg-gradient-to-br ${game.gradient} relative overflow-hidden flex items-center justify-center p-6 group-hover:h-52 transition-all duration-500`}>
                                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20 mix-blend-overlay" />
                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-500" />

                                    {/* Glass Icon Container */}
                                    <motion.div
                                        className="relative z-10 w-24 h-24 bg-white/20 backdrop-blur-xl rounded-3xl flex items-center justify-center shadow-lg border border-white/30 group-hover:scale-110 transition-transform duration-500"
                                    >
                                        {game.icon}
                                    </motion.div>

                                    {/* Play Button Overlay */}
                                    <div className="absolute bottom-4 right-4 translate-y-20 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                                        <div className="w-12 h-12 bg-white rounded-full text-slate-900 flex items-center justify-center shadow-lg">
                                            <Play className="w-5 h-5 ml-1 fill-current" />
                                        </div>
                                    </div>
                                </div>

                                {/* Content Body */}
                                <div className="p-8 space-y-4">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-2xl font-bold text-slate-900 dark:text-white group-hover:text-primary transition-colors">
                                            {game.title}
                                        </h3>
                                        <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400`}>
                                            {game.difficulty}
                                        </div>
                                    </div>

                                    <p className="text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                                        {game.description}
                                    </p>

                                    {/* Footer / Stats (Optional) */}
                                    <div className="pt-4 flex items-center gap-4 text-sm font-medium text-slate-400 border-t border-slate-100 dark:border-slate-800">
                                        <div className="flex items-center gap-1">
                                            <Trophy className="w-4 h-4 text-yellow-500" />
                                            <span>Leaderboard ready</span>
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Games;
