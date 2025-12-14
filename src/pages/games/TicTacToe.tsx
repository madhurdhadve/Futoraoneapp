import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, RotateCcw, Trophy, Circle, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import confetti from "canvas-confetti";
import { motion, AnimatePresence } from "framer-motion";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, RotateCcw, Trophy, Circle, X, Cpu, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import confetti from "canvas-confetti";
import { motion, AnimatePresence } from "framer-motion";
import { useGameSounds } from "@/hooks/useGameSounds";
import { HowToPlay } from "@/components/games/HowToPlay";

type Player = "X" | "O" | null;
type GameMode = "PVP" | "AI";
type Difficulty = "EASY" | "HARD";

const TicTacToe = () => {
    const navigate = useNavigate();
    const playSound = useGameSounds();
    const [board, setBoard] = useState<Player[]>(Array(9).fill(null));
    const [xIsNext, setXIsNext] = useState(true);
    const [winner, setWinner] = useState<"X" | "O" | "Draw" | null>(null);
    const [scores, setScores] = useState({ X: 0, O: 0 });
    const [gameMode, setGameMode] = useState<GameMode>("AI");
    const [difficulty, setDifficulty] = useState<Difficulty>("HARD");
    const [isAiTurn, setIsAiTurn] = useState(false);

    // Initial Load Stats
    useEffect(() => {
        const savedScores = localStorage.getItem("tictactoe_scores");
        if (savedScores) setScores(JSON.parse(savedScores));
    }, []);

    // Save Stats
    useEffect(() => {
        localStorage.setItem("tictactoe_scores", JSON.stringify(scores));
    }, [scores]);

    const checkWinner = (squares: Player[]): "X" | "O" | "Draw" | null => {
        const lines = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8],
            [0, 3, 6], [1, 4, 7], [2, 5, 8],
            [0, 4, 8], [2, 4, 6]
        ];
        for (let i = 0; i < lines.length; i++) {
            const [a, b, c] = lines[i];
            if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
                return squares[a] as "X" | "O";
            }
        }
        if (!squares.includes(null)) return "Draw";
        return null;
    };

    // AI MOVE LOGIC
    useEffect(() => {
        if (gameMode === "AI" && !xIsNext && !winner) {
            setIsAiTurn(true);
            const timer = setTimeout(() => {
                makeAiMove();
            }, 600); // Simulate thinking time
            return () => clearTimeout(timer);
        }
    }, [xIsNext, gameMode, winner]);

    const makeAiMove = () => {
        let moveIndex: number;

        if (difficulty === "EASY") {
            // Random available move
            const available = board.map((val, idx) => val === null ? idx : null).filter(val => val !== null) as number[];
            moveIndex = available[Math.floor(Math.random() * available.length)];
        } else {
            // Minimax
            moveIndex = getBestMove(board);
        }

        if (moveIndex !== undefined && moveIndex !== -1) {
            handleMove(moveIndex);
        }
        setIsAiTurn(false);
    };

    const getBestMove = (currentBoard: Player[]): number => {
        let bestScore = -Infinity;
        let move = -1;

        for (let i = 0; i < 9; i++) {
            if (currentBoard[i] === null) {
                currentBoard[i] = "O";
                let score = minimax(currentBoard, 0, false);
                currentBoard[i] = null;
                if (score > bestScore) {
                    bestScore = score;
                    move = i;
                }
            }
        }
        return move;
    };

    const scoresMap = {
        O: 10,
        X: -10,
        Draw: 0
    };

    const minimax = (currentBoard: Player[], depth: number, isMaximizing: boolean): number => {
        const result = checkWinner(currentBoard);
        if (result !== null) {
            return scoresMap[result as keyof typeof scoresMap];
        }

        if (isMaximizing) {
            let bestScore = -Infinity;
            for (let i = 0; i < 9; i++) {
                if (currentBoard[i] === null) {
                    currentBoard[i] = "O";
                    let score = minimax(currentBoard, depth + 1, false);
                    currentBoard[i] = null;
                    bestScore = Math.max(score, bestScore);
                }
            }
            return bestScore;
        } else {
            let bestScore = Infinity;
            for (let i = 0; i < 9; i++) {
                if (currentBoard[i] === null) {
                    currentBoard[i] = "X";
                    let score = minimax(currentBoard, depth + 1, true);
                    currentBoard[i] = null;
                    bestScore = Math.min(score, bestScore);
                }
            }
            return bestScore;
        }
    };

    const handleMove = (i: number) => {
        if (winner || board[i]) return;

        playSound('pop');
        const newBoard = [...board];
        newBoard[i] = xIsNext ? "X" : "O";
        setBoard(newBoard);
        setXIsNext(!xIsNext);

        const calculatedWinner = checkWinner(newBoard);
        if (calculatedWinner) {
            setWinner(calculatedWinner);
            if (calculatedWinner !== "Draw") {
                setScores(prev => ({ ...prev, [calculatedWinner]: prev[calculatedWinner as keyof typeof prev] + 1 }));
                toast.success(`${calculatedWinner === 'O' && gameMode === 'AI' ? 'AI' : 'Player ' + calculatedWinner} Wins!`, { icon: "🏆" });
                playSound('win');
                if (!(gameMode === 'AI' && calculatedWinner === 'O')) {
                    confetti({
                        particleCount: 150,
                        spread: 70,
                        origin: { y: 0.6 },
                        colors: calculatedWinner === "X" ? ['#3b82f6', '#2563eb'] : ['#ec4899', '#db2777']
                    });
                }
            } else {
                toast.info("It's a draw!", { icon: "🤝" });
                playSound('draw');
            }
        }
    };

    const resetGame = () => {
        playSound('click');
        setBoard(Array(9).fill(null));
        setWinner(null);
        setXIsNext(true);
        setIsAiTurn(false);
    };

    const toggleGameMode = () => {
        playSound('click');
        setGameMode(prev => prev === "AI" ? "PVP" : "AI");
        resetGame();
        setScores({ X: 0, O: 0 }); // Reset scores on mode switch
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
                        title="Tic Tac Toe"
                        description="Get three of your marks in a row (up, down, across, or diagonally) to win."
                        rules={[
                            "Players take turns putting their marks in empty squares.",
                            "The first player to get 3 of her marks in a row (up, down, across, or diagonally) is the winner.",
                            "When all 9 squares are full, the game is over. If no player has 3 marks in a row, the game ends in a tie."
                        ]}
                    />
                </div>

                <h1 className="hidden md:block text-3xl font-black bg-gradient-to-r from-emerald-500 to-teal-500 bg-clip-text text-transparent">Tic Tac Toe</h1>

                <div className="flex gap-2">
                    <Button
                        variant={gameMode === "AI" ? "default" : "outline"}
                        size="sm"
                        onClick={toggleGameMode}
                        className="gap-2"
                    >
                        {gameMode === "AI" ? <Cpu className="w-4 h-4" /> : <Users className="w-4 h-4" />}
                        {gameMode === "AI" ? "vs AI" : "PVP"}
                    </Button>
                    <Button variant="outline" size="icon" onClick={resetGame} className="rounded-full hover:rotate-180 transition-transform duration-500">
                        <RotateCcw className="w-5 h-5" />
                    </Button>
                </div>
            </div>

            {/* Scoreboard */}
            <div className="flex gap-4 md:gap-12 mb-12">
                <Card className={`p-4 md:px-8 flex flex-col items-center min-w-[120px] border-2 transition-all duration-300 ${xIsNext && !winner ? "border-blue-500 shadow-lg scale-105 ring-2 ring-blue-200" : "border-transparent"}`}>
                    <X className="w-8 h-8 text-blue-500 mb-2" />
                    <span className="font-bold text-slate-700 dark:text-slate-300">You</span>
                    <span className="text-3xl font-black text-blue-500">{scores.X}</span>
                </Card>
                <div className="flex flex-col justify-center items-center">
                    <span className="text-4xl font-black text-slate-200 dark:text-slate-800">VS</span>
                </div>
                <Card className={`p-4 md:px-8 flex flex-col items-center min-w-[120px] border-2 transition-all duration-300 ${!xIsNext && !winner ? "border-pink-500 shadow-lg scale-105 ring-2 ring-pink-200" : "border-transparent"}`}>
                    <Circle className="w-8 h-8 text-pink-500 mb-2" />
                    <span className="font-bold text-slate-700 dark:text-slate-300">{gameMode === 'AI' ? 'AI' : 'P2'}</span>
                    <span className="text-3xl font-black text-pink-500">{scores.O}</span>
                </Card>
            </div>

            {/* Game Board */}
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="p-6 bg-white dark:bg-card rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-slate-100 dark:border-slate-800"
            >
                <div className="grid grid-cols-3 gap-3 relative">
                    {/* Interaction Blocker for AI Turn */}
                    {isAiTurn && !winner && (
                        <div className="absolute inset-0 z-10 cursor-wait bg-transparent" />
                    )}

                    {board.map((square, i) => (
                        <motion.button
                            key={i}
                            whileHover={!square && !winner && !isAiTurn ? { scale: 1.05 } : {}}
                            whileTap={!square && !winner && !isAiTurn ? { scale: 0.95 } : {}}
                            className={`w-20 h-20 sm:w-24 sm:h-24 md:w-32 md:h-32 rounded-2xl text-5xl font-bold flex items-center justify-center transition-colors duration-200 
                                ${!square && !winner ? "hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer bg-slate-50 dark:bg-slate-900" : "cursor-default"}
                                ${square === "X" ? "bg-blue-50 dark:bg-blue-900/20 text-blue-500" : square === "O" ? "bg-pink-50 dark:bg-pink-900/20 text-pink-500" : ""}
                            `}
                            onClick={() => !isAiTurn && handleMove(i)}
                            disabled={isAiTurn}
                        >
                            <AnimatePresence mode="wait">
                                {square === "X" && (
                                    <motion.div
                                        initial={{ scale: 0, rotate: -45 }}
                                        animate={{ scale: 1, rotate: 0 }}
                                        transition={{ type: "spring", stiffness: 300, damping: 20 }}
                                    >
                                        <X className="w-12 h-12 sm:w-16 sm:h-16" strokeWidth={3} />
                                    </motion.div>
                                )}
                                {square === "O" && (
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ type: "spring", stiffness: 300, damping: 20 }}
                                    >
                                        <Circle className="w-12 h-12 sm:w-16 sm:h-16" strokeWidth={3} />
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.button>
                    ))}
                </div>
            </motion.div>

            {/* Turn Indicator / Winner Message */}
            <div className="mt-12 h-16 flex flex-col items-center gap-2">
                <AnimatePresence mode="wait">
                    {winner ? (
                        <motion.div
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: -20, opacity: 0 }}
                            className="bg-slate-900 text-white px-8 py-3 rounded-full font-bold shadow-xl flex items-center gap-3 text-lg"
                        >
                            <Trophy className="w-6 h-6 text-yellow-400" />
                            {winner === "Draw" ? "Game Draw!" : `${winner === 'O' && gameMode === 'AI' ? 'AI' : 'Player ' + winner} Wins!`}
                        </motion.div>
                    ) : (
                        <motion.div
                            key={xIsNext ? "X" : "O"}
                            initial={{ y: 10, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: -10, opacity: 0 }}
                            className="text-xl font-medium flex items-center gap-2 bg-white dark:bg-card px-6 py-2 rounded-full shadow-sm"
                        >
                            It's <span className={xIsNext ? "text-blue-500 font-bold" : "text-pink-500 font-bold"}>
                                {gameMode === 'AI' && !xIsNext ? "AI's" : (xIsNext ? "Your" : "P2's")}
                            </span> Turn
                        </motion.div>
                    )}
                </AnimatePresence>

                {gameMode === 'AI' && !winner && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                            playSound('click');
                            setDifficulty(d => d === "EASY" ? "HARD" : "EASY");
                        }}
                        className="text-xs text-muted-foreground"
                    >
                        Difficulty: <span className="font-bold ml-1">{difficulty}</span>
                    </Button>
                )}
            </div>
        </div>
    );
};

export default TicTacToe;
