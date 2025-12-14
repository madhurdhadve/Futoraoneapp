import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, RotateCcw, Trophy, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import confetti from "canvas-confetti";
import { motion, AnimatePresence } from "framer-motion";

const GRID_SIZE = 4; // 4x4 dots = 3x3 boxes

interface Line {
    r: number;
    c: number;
    vertical: boolean;
}

const DotsAndBoxes = () => {
    const navigate = useNavigate();
    const [hLines, setHLines] = useState<number[][]>(
        Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE - 1).fill(0))
    );
    const [vLines, setVLines] = useState<number[][]>(
        Array(GRID_SIZE - 1).fill(null).map(() => Array(GRID_SIZE).fill(0))
    );
    const [boxes, setBoxes] = useState<number[][]>(
        Array(GRID_SIZE - 1).fill(null).map(() => Array(GRID_SIZE - 1).fill(0))
    );
    const [currentPlayer, setCurrentPlayer] = useState<1 | 2>(1);
    const [scores, setScores] = useState({ 1: 0, 2: 0 });
    const [winner, setWinner] = useState<number | null>(null);

    const resetGame = () => {
        setHLines(Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE - 1).fill(0)));
        setVLines(Array(GRID_SIZE - 1).fill(null).map(() => Array(GRID_SIZE).fill(0)));
        setBoxes(Array(GRID_SIZE - 1).fill(null).map(() => Array(GRID_SIZE - 1).fill(0)));
        setCurrentPlayer(1);
        setScores({ 1: 0, 2: 0 });
        setWinner(null);
    };

    const checkBoxes = (
        h: number[][],
        v: number[][],
        lastMove: { r: number; c: number; vertical: boolean }
    ) => {
        let captured = false;
        const newBoxes = [...boxes.map(row => [...row])];

        const checkPossibilities = [];
        if (lastMove.vertical) {
            if (lastMove.c > 0) checkPossibilities.push({ r: lastMove.r, c: lastMove.c - 1 });
            if (lastMove.c < GRID_SIZE - 1) checkPossibilities.push({ r: lastMove.r, c: lastMove.c });
        } else {
            if (lastMove.r > 0) checkPossibilities.push({ r: lastMove.r - 1, c: lastMove.c });
            if (lastMove.r < GRID_SIZE - 1) checkPossibilities.push({ r: lastMove.r, c: lastMove.c });
        }

        for (const box of checkPossibilities) {
            const hasTop = h[box.r][box.c] !== 0;
            const hasBottom = h[box.r + 1][box.c] !== 0;
            const hasLeft = v[box.r][box.c] !== 0;
            const hasRight = v[box.r][box.c + 1] !== 0;

            if (hasTop && hasBottom && hasLeft && hasRight && newBoxes[box.r][box.c] === 0) {
                newBoxes[box.r][box.c] = currentPlayer;
                captured = true;
            }
        }

        if (captured) {
            setBoxes(newBoxes);
            const p1Score = newBoxes.flat().filter(b => b === 1).length;
            const p2Score = newBoxes.flat().filter(b => b === 2).length;
            setScores({ 1: p1Score, 2: p2Score });

            if (p1Score + p2Score === (GRID_SIZE - 1) * (GRID_SIZE - 1)) {
                if (p1Score > p2Score) setWinner(1);
                else if (p2Score > p1Score) setWinner(2);
                else setWinner(0);
            }
            return true;
        }
        return false;
    };

    const handleLineClick = (r: number, c: number, vertical: boolean) => {
        if (winner !== null) return;
        if (vertical && vLines[r][c] !== 0) return;
        if (!vertical && hLines[r][c] !== 0) return;

        let newHLines = hLines;
        let newVLines = vLines;

        if (vertical) {
            newVLines = [...vLines.map(row => [...row])];
            newVLines[r][c] = currentPlayer;
            setVLines(newVLines);
        } else {
            newHLines = [...hLines.map(row => [...row])];
            newHLines[r][c] = currentPlayer;
            setHLines(newHLines);
        }

        const captured = checkBoxes(newHLines, newVLines, { r, c, vertical });
        if (!captured) {
            setCurrentPlayer(currentPlayer === 1 ? 2 : 1);
        }
    };

    useEffect(() => {
        if (winner !== null) {
            if (winner === 0) {
                toast.info("It's a draw!", { icon: "🤝" });
            } else {
                toast.success(`Player ${winner} Wins!`, { icon: "🏆" });
                confetti({
                    particleCount: 150,
                    spread: 70,
                    origin: { y: 0.6 },
                    colors: winner === 1 ? ['#3b82f6', '#1d4ed8'] : ['#ec4899', '#be185d']
                });
            }
        }
    }, [winner]);

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col items-center py-6 px-4">
            {/* Header */}
            <div className="w-full max-w-2xl mb-6 flex items-center justify-between">
                <Button variant="ghost" size="icon" onClick={() => navigate("/games")} className="hover:bg-slate-200 dark:hover:bg-slate-800">
                    <ArrowLeft className="w-6 h-6" />
                </Button>
                <h1 className="text-3xl font-black bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Dots & Boxes</h1>
                <Button variant="outline" size="icon" onClick={resetGame} className="rounded-full hover:rotate-180 transition-transform duration-500">
                    <RotateCcw className="w-5 h-5" />
                </Button>
            </div>

            {/* Score Board */}
            <div className="flex gap-4 md:gap-12 mb-8">
                <Card className={`p-4 md:px-8 flex flex-col items-center min-w-[120px] border-2 transition-all duration-300 ${currentPlayer === 1 && !winner ? "border-blue-500 shadow-lg scale-105 ring-2 ring-blue-200" : "border-transparent"}`}>
                    <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-full mb-2">
                        <User className="w-6 h-6 text-blue-500" />
                    </div>
                    <span className="font-bold text-slate-700 dark:text-slate-300">Player 1</span>
                    <span className="text-3xl font-black text-blue-500">{scores[1]}</span>
                </Card>
                <div className="flex flex-col justify-center items-center">
                    <span className="text-xs font-bold text-slate-400">VS</span>
                </div>
                <Card className={`p-4 md:px-8 flex flex-col items-center min-w-[120px] border-2 transition-all duration-300 ${currentPlayer === 2 && !winner ? "border-pink-500 shadow-lg scale-105 ring-2 ring-pink-200" : "border-transparent"}`}>
                    <div className="bg-pink-100 dark:bg-pink-900/30 p-2 rounded-full mb-2">
                        <User className="w-6 h-6 text-pink-500" />
                    </div>
                    <span className="font-bold text-slate-700 dark:text-slate-300">Player 2</span>
                    <span className="text-3xl font-black text-pink-500">{scores[2]}</span>
                </Card>
            </div>

            {/* Game Board */}
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="p-8 bg-white dark:bg-card rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.1)] select-none touch-none border border-slate-100 dark:border-slate-800"
            >
                <div className="flex flex-col">
                    {Array(GRID_SIZE).fill(0).map((_, r) => (
                        <div key={`row-${r}`} className="flex flex-col">
                            {/* Row of Dots and Horizontal Lines */}
                            <div className="flex items-center">
                                {Array(GRID_SIZE).fill(0).map((_, c) => (
                                    <React.Fragment key={`dot-${r}-${c}`}>
                                        <div className="w-4 h-4 rounded-full bg-slate-800 dark:bg-slate-200 z-20 shadow-sm" />
                                        {c < GRID_SIZE - 1 && (
                                            <div
                                                onClick={() => handleLineClick(r, c, false)}
                                                className={`h-4 w-16 cursor-pointer transition-all duration-300 relative group
                                                    ${hLines[r][c] !== 0 ? "z-10" : "z-0 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full"}
                                                `}
                                            >
                                                {hLines[r][c] !== 0 && (
                                                    <motion.div
                                                        initial={{ scaleX: 0 }}
                                                        animate={{ scaleX: 1 }}
                                                        className={`absolute inset-0 h-2 my-1 rounded-full ${hLines[r][c] === 1 ? "bg-blue-500" : "bg-pink-500"}`}
                                                    />
                                                )}
                                            </div>
                                        )}
                                    </React.Fragment>
                                ))}
                            </div>

                            {/* Row of Vertical Lines and Boxes */}
                            {r < GRID_SIZE - 1 && (
                                <div className="flex items-center h-16">
                                    {Array(GRID_SIZE).fill(0).map((_, c) => (
                                        <React.Fragment key={`vline-${r}-${c}`}>
                                            <div
                                                onClick={() => handleLineClick(r, c, true)}
                                                className={`w-4 h-full cursor-pointer transition-all duration-300 relative group -ml-[0.5px]
                                                    ${vLines[r][c] !== 0 ? "z-10" : "z-0 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full"}
                                                `}
                                            >
                                                {vLines[r][c] !== 0 && (
                                                    <motion.div
                                                        initial={{ scaleY: 0 }}
                                                        animate={{ scaleY: 1 }}
                                                        className={`absolute inset-0 w-2 mx-1 rounded-full ${vLines[r][c] === 1 ? "bg-blue-500" : "bg-pink-500"}`}
                                                    />
                                                )}
                                            </div>
                                            {c < GRID_SIZE - 1 && (
                                                <div className="w-16 h-full flex items-center justify-center">
                                                    <AnimatePresence>
                                                        {boxes[r][c] !== 0 && (
                                                            <motion.div
                                                                initial={{ scale: 0, rotate: -45 }}
                                                                animate={{ scale: 1, rotate: 0 }}
                                                                className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-sm 
                                                                    ${boxes[r][c] === 1 ? "bg-blue-100 text-blue-600" : "bg-pink-100 text-pink-600"}
                                                                `}
                                                            >
                                                                <User className="w-6 h-6" />
                                                            </motion.div>
                                                        )}
                                                    </AnimatePresence>
                                                </div>
                                            )}
                                        </React.Fragment>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </motion.div>

            <div className="mt-8 h-12">
                <AnimatePresence mode="wait">
                    {winner !== null ? (
                        <motion.div
                            initial={{ y: 10, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            className="text-xl font-bold flex items-center gap-2 bg-slate-900 text-white px-6 py-2 rounded-full"
                        >
                            <Trophy className="w-5 h-5 text-yellow-400" />
                            {winner === 0 ? "It's a Draw!" : `Player ${winner} Wins!`}
                        </motion.div>
                    ) : (
                        <motion.p
                            key={currentPlayer}
                            initial={{ y: 10, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: -10, opacity: 0 }}
                            className="text-muted-foreground font-medium flex items-center gap-2"
                        >
                            <span className={currentPlayer === 1 ? "text-blue-500 font-bold" : "text-pink-500 font-bold"}>
                                Player {currentPlayer}'s
                            </span> Turn
                        </motion.p>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default DotsAndBoxes;
