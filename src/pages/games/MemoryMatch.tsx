import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, RotateCcw, Sparkles, Trophy } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import confetti from "canvas-confetti";
import { motion, AnimatePresence } from "framer-motion";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, RotateCcw, Sparkles, Trophy, Timer, Hash } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import confetti from "canvas-confetti";
import { motion, AnimatePresence } from "framer-motion";
import { useGameSounds } from "@/hooks/useGameSounds";
import { HowToPlay } from "@/components/games/HowToPlay";
import { Card } from "@/components/ui/card";

const CARDS = [
    { id: 1, icon: "🐶", matchId: 1 },
    { id: 2, icon: "🐱", matchId: 2 },
    { id: 3, icon: "🐭", matchId: 3 },
    { id: 4, icon: "🐹", matchId: 4 },
    { id: 5, icon: "🐰", matchId: 5 },
    { id: 6, icon: "🦊", matchId: 6 },
    { id: 7, icon: "🐻", matchId: 7 },
    { id: 8, icon: "🐼", matchId: 8 },
];

interface CardType {
    id: number;
    icon: string;
    matchId: number;
    flipped: boolean;
    matched: boolean;
}

const MemoryMatch = () => {
    const navigate = useNavigate();
    const playSound = useGameSounds();
    const [cards, setCards] = useState<CardType[]>([]);
    const [flippedCards, setFlippedCards] = useState<CardType[]>([]);
    const [isLock, setIsLock] = useState(false);
    const [moves, setMoves] = useState(0);
    const [isWon, setIsWon] = useState(false);
    const [bestScore, setBestScore] = useState<number | null>(null);
    const [timer, setTimer] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);

    // Load Best Score
    useEffect(() => {
        const savedBest = localStorage.getItem("memory_best_score");
        if (savedBest) setBestScore(parseInt(savedBest));
        initializeGame();
    }, []);

    // Timer Logic
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isPlaying && !isWon) {
            interval = setInterval(() => {
                setTimer(t => t + 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [isPlaying, isWon]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const initializeGame = () => {
        playSound('click');
        const gameCards = [...CARDS, ...CARDS].map((card, index) => ({
            ...card,
            id: index,
            flipped: false,
            matched: false
        }));

        gameCards.sort(() => Math.random() - 0.5);
        setCards(gameCards);
        setFlippedCards([]);
        setMoves(0);
        setTimer(0);
        setIsLock(false);
        setIsWon(false);
        setIsPlaying(true);
    };

    const handleCardClick = (id: number) => {
        if (isLock || isWon) return;

        const clickedCard = cards.find(c => c.id === id);
        if (!clickedCard || clickedCard.flipped || clickedCard.matched) return;

        playSound('pop');

        // Flip the card
        const newCards = cards.map(c =>
            c.id === id ? { ...c, flipped: true } : c
        );
        setCards(newCards);

        const newFlippedCards = [...flippedCards, clickedCard];
        setFlippedCards(newFlippedCards);

        if (newFlippedCards.length === 2) {
            setIsLock(true);
            setMoves(m => m + 1);
            checkForMatch(newFlippedCards, newCards);
        }
    };

    const checkForMatch = (currentFlipped: CardType[], currentCards: CardType[]) => {
        const [card1, card2] = currentFlipped;
        const isMatch = card1.matchId === card2.matchId;

        if (isMatch) {
            playSound('win'); // Small success sound
            const matchedCards = currentCards.map(c =>
                c.matchId === card1.matchId ? { ...c, matched: true } : c
            );
            setCards(matchedCards);
            setFlippedCards([]);
            setIsLock(false);

            // Check win
            if (matchedCards.every(c => c.matched)) {
                handleWin();
            }
        } else {
            setTimeout(() => {
                const resetCards = currentCards.map(c =>
                    (c.id === card1.id || c.id === card2.id) ? { ...c, flipped: false } : c
                );
                setCards(resetCards);
                setFlippedCards([]);
                setIsLock(false);
            }, 1000);
        }
    };

    const handleWin = () => {
        setIsWon(true);
        setIsPlaying(false);
        playSound('win');

        // Update Best Score
        if (!bestScore || moves + 1 < bestScore) {
            setBestScore(moves + 1);
            localStorage.setItem("memory_best_score", (moves + 1).toString());
            toast.success("New Best Score!", { icon: "👑" });
        } else {
            toast.success(`Complete in ${moves + 1} moves!`, { icon: "🧠" });
        }

        confetti({
            particleCount: 200,
            spread: 100,
            origin: { y: 0.6 },
            colors: ['#8b5cf6', '#d946ef', '#f43f5e']
        });
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col items-center py-6 px-4">
            {/* Header */}
            <div className="w-full max-w-2xl mb-8 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" onClick={() => navigate("/games")} className="hover:bg-slate-200 dark:hover:bg-slate-800">
                        <ArrowLeft className="w-6 h-6" />
                    </Button>
                    <HowToPlay
                        title="Memory Match"
                        description="Test your memory by finding all matching pairs of cards."
                        rules={[
                            "Click a card to reveal its image.",
                            "Click another card to try and find a match.",
                            "If the cards match, they stay face up.",
                            "If they don't match, they flip back over.",
                            "Find all pairs in the fewest moves possible."
                        ]}
                    />
                </div>

                <h1 className="text-3xl font-black bg-gradient-to-r from-violet-500 to-fuchsia-500 bg-clip-text text-transparent hidden md:block">Memory Match</h1>

                <Button variant="outline" size="icon" onClick={initializeGame} className="rounded-full hover:rotate-180 transition-transform duration-500">
                    <RotateCcw className="w-5 h-5" />
                </Button>
            </div>

            {/* Stats Bar */}
            <div className="flex gap-4 mb-8 w-full max-w-md">
                <Card className="flex-1 p-3 flex flex-col items-center justify-center bg-white/50 backdrop-blur border-violet-100 dark:border-violet-900/20">
                    <div className="flex items-center gap-2 text-violet-500 mb-1">
                        <Hash className="w-4 h-4" />
                        <span className="text-xs font-bold uppercase tracking-wider">Moves</span>
                    </div>
                    <span className="text-2xl font-black text-slate-700 dark:text-slate-200">{moves}</span>
                </Card>
                <Card className="flex-1 p-3 flex flex-col items-center justify-center bg-white/50 backdrop-blur border-violet-100 dark:border-violet-900/20">
                    <div className="flex items-center gap-2 text-pink-500 mb-1">
                        <Timer className="w-4 h-4" />
                        <span className="text-xs font-bold uppercase tracking-wider">Time</span>
                    </div>
                    <span className="text-2xl font-black text-slate-700 dark:text-slate-200">{formatTime(timer)}</span>
                </Card>
                <Card className="flex-1 p-3 flex flex-col items-center justify-center bg-white/50 backdrop-blur border-violet-100 dark:border-violet-900/20">
                    <div className="flex items-center gap-2 text-yellow-500 mb-1">
                        <Trophy className="w-4 h-4" />
                        <span className="text-xs font-bold uppercase tracking-wider">Best</span>
                    </div>
                    <span className="text-2xl font-black text-slate-700 dark:text-slate-200">{bestScore || "-"}</span>
                </Card>
            </div>

            {/* Grid */}
            <div className="p-4 grid grid-cols-4 gap-3 md:gap-4 max-w-xl mx-auto perspective-1000">
                <AnimatePresence>
                    {cards.map((card) => (
                        <motion.div
                            key={card.id}
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: 0.05 * card.id }}
                            onClick={() => handleCardClick(card.id)}
                            className="relative w-16 h-20 sm:w-20 sm:h-24 md:w-24 md:h-28 cursor-pointer group"
                            style={{ perspective: 1000 }}
                        >
                            <motion.div
                                className="w-full h-full relative preserve-3d transition-all duration-500"
                                animate={{ rotateY: card.flipped || card.matched ? 180 : 0 }}
                                transition={{ type: "spring", stiffness: 260, damping: 20 }}
                                style={{ transformStyle: "preserve-3d" }}
                            >
                                {/* Front (Hidden) */}
                                <div
                                    className="absolute w-full h-full backface-hidden rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg flex items-center justify-center border-2 border-white/20 group-hover:scale-105 transition-transform"
                                    style={{ backfaceVisibility: "hidden" }}
                                >
                                    <Sparkles className="text-white/30 w-8 h-8" />
                                </div>

                                {/* Back (Revealed) */}
                                <div
                                    className={`absolute w-full h-full backface-hidden rounded-xl bg-white dark:bg-slate-800 border-2 border-indigo-200 dark:border-indigo-800 shadow-xl flex items-center justify-center text-3xl sm:text-4xl
                                        ${card.matched ? "ring-4 ring-green-400/50 ring-offset-2" : ""}
                                    `}
                                    style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
                                >
                                    {card.icon}
                                </div>
                            </motion.div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {/* Win Message */}
            <AnimatePresence>
                {isWon && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-8 bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-8 py-4 rounded-2xl font-bold shadow-xl flex flex-col items-center gap-2 text-center"
                    >
                        <div className="flex items-center gap-2 text-xl">
                            <Trophy className="w-6 h-6 fill-yellow-300 text-yellow-300" />
                            Level Complete!
                        </div>
                        <p className="text-white/90 font-medium">You found all pairs in {moves} moves.</p>
                        <Button
                            variant="secondary"
                            size="sm"
                            onClick={initializeGame}
                            className="mt-2 w-full font-bold"
                        >
                            Play Again
                        </Button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default MemoryMatch;
