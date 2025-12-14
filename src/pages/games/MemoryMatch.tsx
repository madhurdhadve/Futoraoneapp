import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, RotateCcw, Sparkles, Trophy } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import confetti from "canvas-confetti";
import { motion, AnimatePresence } from "framer-motion";

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
    const [cards, setCards] = useState<CardType[]>([]);
    const [flippedCards, setFlippedCards] = useState<CardType[]>([]);
    const [isLock, setIsLock] = useState(false);
    const [moves, setMoves] = useState(0);
    const [isWon, setIsWon] = useState(false);

    const initializeGame = () => {
        // duplicate cards to create pairs
        const gameCards = [...CARDS, ...CARDS].map((card, index) => ({
            ...card,
            id: index, // unique render id
            flipped: false,
            matched: false
        }));

        // shuffle
        gameCards.sort(() => Math.random() - 0.5);
        setCards(gameCards);
        setFlippedCards([]);
        setMoves(0);
        setIsLock(false);
        setIsWon(false);
    };

    useEffect(() => {
        initializeGame();
    }, []);

    const handleCardClick = (id: number) => {
        if (isLock) return;

        const clickedCard = cards.find(c => c.id === id);
        if (!clickedCard || clickedCard.flipped || clickedCard.matched) return;

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
            const matchedCards = currentCards.map(c =>
                c.matchId === card1.matchId ? { ...c, matched: true } : c
            );
            setCards(matchedCards);
            setFlippedCards([]);
            setIsLock(false);

            // Check win
            if (matchedCards.every(c => c.matched)) {
                setIsWon(true);
                setTimeout(() => {
                    toast.success(`You Won in ${moves + 1} moves!`, { icon: "🧠" });
                    confetti({
                        particleCount: 200,
                        spread: 100,
                        origin: { y: 0.6 },
                        colors: ['#FF69B4', '#4169E1', '#FFD700']
                    });
                }, 500);
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

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col items-center py-6 px-4">
            {/* Header */}
            <div className="w-full max-w-2xl mb-8 flex items-center justify-between">
                <Button variant="ghost" size="icon" onClick={() => navigate("/games")} className="hover:bg-slate-200 dark:hover:bg-slate-800">
                    <ArrowLeft className="w-6 h-6" />
                </Button>
                <div className="flex flex-col items-center">
                    <h1 className="text-3xl font-black bg-gradient-to-r from-violet-500 to-fuchsia-500 bg-clip-text text-transparent">Memory Match</h1>
                </div>
                <Button variant="outline" size="icon" onClick={initializeGame} className="rounded-full hover:rotate-180 transition-transform duration-500">
                    <RotateCcw className="w-5 h-5" />
                </Button>
            </div>

            {/* Stats */}
            <div className="mb-8 flex items-center gap-4 bg-white dark:bg-card px-6 py-2 rounded-full shadow-sm border border-slate-100 dark:border-slate-800">
                <span className="text-muted-foreground font-medium">Moves</span>
                <span className="text-2xl font-bold text-violet-600">{moves}</span>
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
                            className="relative w-16 h-20 sm:w-20 sm:h-24 md:w-24 md:h-28 cursor-pointer"
                            style={{ perspective: 1000 }}
                        >
                            <motion.div
                                className="w-full h-full relative preserve-3d"
                                animate={{ rotateY: card.flipped || card.matched ? 180 : 0 }}
                                transition={{ type: "spring", stiffness: 260, damping: 20 }}
                                style={{ transformStyle: "preserve-3d" }}
                            >
                                {/* Front (Hidden) */}
                                <div
                                    className="absolute w-full h-full backface-hidden rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg flex items-center justify-center border-2 border-white/20"
                                    style={{ backfaceVisibility: "hidden" }}
                                >
                                    <Sparkles className="text-white/30 w-8 h-8" />
                                </div>

                                {/* Back (Revealed) */}
                                <div
                                    className={`absolute w-full h-full backface-hidden rounded-xl bg-white dark:bg-slate-800 border-2 border-indigo-200 dark:border-indigo-800 shadow-xl flex items-center justify-center text-3xl sm:text-4xl
                                        ${card.matched ? "ring-2 ring-green-400 ring-offset-2" : ""}
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
                        className="mt-8 bg-green-500 text-white px-8 py-3 rounded-full font-bold shadow-xl flex items-center gap-2"
                    >
                        <Trophy className="w-5 h-5 fill-current" />
                        Complete!
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default MemoryMatch;
