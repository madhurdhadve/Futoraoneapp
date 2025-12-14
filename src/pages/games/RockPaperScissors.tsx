import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, RotateCcw, Hand, Scissors, Scroll, Trophy, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import confetti from "canvas-confetti";
import { motion, AnimatePresence } from "framer-motion";

type Choice = "rock" | "paper" | "scissors" | null;

const CHOICES = [
    { id: "rock", icon: <Scroll className="w-12 h-12 md:w-16 md:h-16 text-stone-500" />, label: "Rock", beats: "scissors", color: "bg-stone-100 dark:bg-stone-900/50" },
    { id: "paper", icon: <Hand className="w-12 h-12 md:w-16 md:h-16 text-yellow-500" />, label: "Paper", beats: "rock", color: "bg-yellow-50 dark:bg-yellow-900/20" },
    { id: "scissors", icon: <Scissors className="w-12 h-12 md:w-16 md:h-16 text-pink-500" />, label: "Scissors", beats: "paper", color: "bg-pink-50 dark:bg-pink-900/20" },
];

const RockPaperScissors = () => {
    const navigate = useNavigate();
    const [p1Choice, setP1Choice] = useState<Choice>(null);
    const [p2Choice, setP2Choice] = useState<Choice>(null);
    const [turn, setTurn] = useState<1 | 2>(1); // Player 1 or 2
    const [result, setResult] = useState<string | null>(null);
    const [scores, setScores] = useState({ 1: 0, 2: 0 });
    const [isRevealed, setIsRevealed] = useState(false);

    const handleChoice = (choiceId: string) => {
        if (turn === 1) {
            setP1Choice(choiceId as Choice);
            setTurn(2);
            toast.info("Player 1 Made a Choice!", { position: "top-center" });
        } else {
            setP2Choice(choiceId as Choice);
            setTurn(1);
            setIsRevealed(true);
            determineWinner(p1Choice!, choiceId as Choice);
        }
    };

    const determineWinner = (c1: Choice, c2: Choice) => {
        if (c1 === c2) {
            setResult("Draw");
            toast.info("It's a Draw!", { icon: "🤝" });
        } else {
            const choice1 = CHOICES.find(c => c.id === c1);
            if (choice1?.beats === c2) {
                setResult("Player 1 Wins");
                setScores(s => ({ ...s, 1: s[1] + 1 }));
                triggerWin();
            } else {
                setResult("Player 2 Wins");
                setScores(s => ({ ...s, 2: s[2] + 1 }));
                triggerWin();
            }
        }
    };

    const triggerWin = () => {
        confetti({
            particleCount: 150,
            spread: 80,
            origin: { y: 0.6 },
            colors: ['#8b5cf6', '#d946ef']
        });
    };

    const resetRound = () => {
        setP1Choice(null);
        setP2Choice(null);
        setTurn(1);
        setResult(null);
        setIsRevealed(false);
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col items-center py-6 px-4">
            {/* Header */}
            <div className="w-full max-w-2xl mb-8 flex items-center justify-between">
                <Button variant="ghost" size="icon" onClick={() => navigate("/games")} className="hover:bg-slate-200 dark:hover:bg-slate-800">
                    <ArrowLeft className="w-6 h-6" />
                </Button>
                <div className="flex flex-col items-center gap-1">
                    <h1 className="text-3xl font-black bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">RPS Battle</h1>
                    <div className="flex items-center gap-1 text-xs font-medium text-muted-foreground uppercase tracking-widest">
                        <Zap className="w-3 h-3 text-orange-400" /> PVP Arena
                    </div>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setScores({ 1: 0, 2: 0 })} className="hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-500">
                    <RotateCcw className="w-6 h-6" />
                </Button>
            </div>

            {/* Score Board */}
            <div className="flex justify-between w-full max-w-lg px-4 mb-12">
                <div className="flex flex-col items-center p-4 bg-white dark:bg-card rounded-2xl shadow-sm w-32 relative overflow-hidden">
                    <div className="absolute top-0 w-full h-1 bg-blue-500" />
                    <span className="font-bold text-sm text-blue-500 mb-1">Player 1</span>
                    <span className="text-4xl font-black text-slate-800 dark:text-slate-200">{scores[1]}</span>
                </div>
                <div className="flex flex-col justify-center">
                    <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center font-black text-slate-500">VS</div>
                </div>
                <div className="flex flex-col items-center p-4 bg-white dark:bg-card rounded-2xl shadow-sm w-32 relative overflow-hidden">
                    <div className="absolute top-0 w-full h-1 bg-pink-500" />
                    <span className="font-bold text-sm text-pink-500 mb-1">Player 2</span>
                    <span className="text-4xl font-black text-slate-800 dark:text-slate-200">{scores[2]}</span>
                </div>
            </div>

            {/* Battle Arena */}
            <div className="flex-1 flex flex-col items-center justify-center w-full max-w-2xl relative min-h-[400px]">
                <AnimatePresence mode="wait">
                    {!isRevealed ? (
                        <motion.div
                            key="selection"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="text-center w-full"
                        >
                            <h2 className="text-3xl md:text-5xl font-black mb-12 flex items-center justify-center gap-3">
                                {turn === 1 ? (
                                    <span className="text-blue-500">Player 1's Turn</span>
                                ) : (
                                    <span className="text-pink-500">Player 2's Turn</span>
                                )}
                            </h2>

                            <div className="flex flex-wrap justify-center gap-6 md:gap-10">
                                {CHOICES.map((choice, index) => (
                                    <motion.button
                                        key={choice.id}
                                        initial={{ opacity: 0, y: 50 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                        whileHover={{ scale: 1.1, rotate: 5 }}
                                        whileTap={{ scale: 0.9 }}
                                        onClick={() => handleChoice(choice.id)}
                                        className={`p-6 md:p-10 ${choice.color} rounded-3xl shadow-lg border-2 border-transparent hover:border-sidebar-primary/20 backdrop-blur-sm transition-all`}
                                    >
                                        {choice.icon}
                                        <div className="mt-4 font-bold text-slate-600 dark:text-slate-400">{choice.label}</div>
                                    </motion.button>
                                ))}
                            </div>
                            <p className="text-muted-foreground mt-12 animate-pulse">Choose your weapon wisely...</p>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="reveal"
                            className="w-full flex flex-col items-center"
                        >
                            <div className="flex justify-between w-full md:w-[120%] mb-12 items-center">
                                {/* Player 1 Reveal */}
                                <motion.div
                                    initial={{ x: -100, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    className="flex flex-col items-center gap-4"
                                >
                                    <span className="text-blue-500 font-bold text-xl">Player 1</span>
                                    <div className="w-32 h-32 md:w-48 md:h-48 bg-white dark:bg-card rounded-full shadow-2xl flex items-center justify-center border-4 border-blue-500/20">
                                        <motion.div
                                            initial={{ scale: 0, rotate: -180 }}
                                            animate={{ scale: 1, rotate: 0 }}
                                            transition={{ type: "spring", bounce: 0.5 }}
                                        >
                                            {CHOICES.find(c => c.id === p1Choice)?.icon}
                                        </motion.div>
                                    </div>
                                </motion.div>

                                {/* VS with thunder effect */}
                                <div className="hidden md:flex flex-col items-center">
                                    <Zap className="w-20 h-20 text-yellow-400 animate-[pulse_0.2s_ease-in-out_infinite]" />
                                </div>

                                {/* Player 2 Reveal */}
                                <motion.div
                                    initial={{ x: 100, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    className="flex flex-col items-center gap-4"
                                >
                                    <span className="text-pink-500 font-bold text-xl">Player 2</span>
                                    <div className="w-32 h-32 md:w-48 md:h-48 bg-white dark:bg-card rounded-full shadow-2xl flex items-center justify-center border-4 border-pink-500/20">
                                        <motion.div
                                            initial={{ scale: 0, rotate: 180 }}
                                            animate={{ scale: 1, rotate: 0 }}
                                            transition={{ type: "spring", bounce: 0.5 }}
                                        >
                                            {CHOICES.find(c => c.id === p2Choice)?.icon}
                                        </motion.div>
                                    </div>
                                </motion.div>
                            </div>

                            <motion.h2
                                initial={{ scale: 0.5, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ delay: 0.5, type: "spring" }}
                                className="text-4xl md:text-6xl font-black mb-12 px-12 py-4 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white rounded-2xl shadow-xl transform -rotate-2"
                            >
                                {result}
                            </motion.h2>

                            <Button size="lg" onClick={resetRound} className="text-lg px-8 py-6 rounded-full font-bold shadow-lg hover:shadow-xl hover:scale-105 transition-all">
                                <RotateCcw className="w-5 h-5 mr-2" />
                                Play Again
                            </Button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default RockPaperScissors;
