import React from "react";
import { motion } from "framer-motion";

/**
 * Cute bouncing dots loading animation
 * Playful and friendly design
 */
export const CartoonLoader = () => {
    return (
        <div className="min-h-screen bg-background flex items-center justify-center">
            <div className="text-center">
                {/* Bouncing Dots Container */}
                <div className="flex items-end justify-center gap-3 h-20 mb-6">
                    {[0, 1, 2].map((index) => (
                        <motion.div
                            key={index}
                            className="w-4 h-4 rounded-full"
                            style={{
                                background: index === 0
                                    ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                                    : index === 1
                                        ? "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)"
                                        : "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
                                boxShadow: `0 4px 12px ${index === 0
                                    ? "rgba(102, 126, 234, 0.4)"
                                    : index === 1
                                        ? "rgba(245, 87, 108, 0.4)"
                                        : "rgba(0, 242, 254, 0.4)"
                                    }`,
                            }}
                            animate={{
                                y: [0, -30, 0],
                                scale: [1, 1.2, 1],
                            }}
                            transition={{
                                duration: 0.6,
                                repeat: Infinity,
                                ease: "easeInOut",
                                delay: index * 0.15,
                            }}
                        />
                    ))}
                </div>

                {/* Loading Text */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                >
                    <h2 className="text-lg font-semibold text-foreground mb-1">
                        Loading
                        <motion.span
                            animate={{ opacity: [0, 1, 0] }}
                            transition={{ duration: 1.5, repeat: Infinity, delay: 0 }}
                        >
                            .
                        </motion.span>
                        <motion.span
                            animate={{ opacity: [0, 1, 0] }}
                            transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
                        >
                            .
                        </motion.span>
                        <motion.span
                            animate={{ opacity: [0, 1, 0] }}
                            transition={{ duration: 1.5, repeat: Infinity, delay: 0.4 }}
                        >
                            .
                        </motion.span>
                    </h2>
                    <FunFact />
                </motion.div>

                {/* Decorative pulse effect */}
                <motion.div
                    className="absolute inset-0 pointer-events-none flex items-center justify-center"
                    animate={{
                        scale: [1, 1.5, 1],
                        opacity: [0, 0.1, 0],
                    }}
                    transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeOut",
                    }}
                >
                    <div
                        className="w-32 h-32 rounded-full"
                        style={{
                            background: "radial-gradient(circle, rgba(102, 126, 234, 0.2) 0%, transparent 70%)",
                        }}
                    />
                </motion.div>
            </div>
        </div>
    );
};

const FACTS = [
    "The first computer bug was an actual moth.",
    "Python is named after Monty Python, not the snake.",
    "JavaScript was created in just 10 days.",
    "The first website is still online.",
    "GIT stands for Global Information Tracker (maybe).",
    "There are over 700 programming languages.",
    "SpaceX runs on Linux.",
    "Minecraft was coded in Java."
];

const FunFact = () => {
    const [fact, setFact] = React.useState(FACTS[0]);

    React.useEffect(() => {
        const interval = setInterval(() => {
            setFact(FACTS[Math.floor(Math.random() * FACTS.length)]);
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    return (
        <motion.p
            key={fact}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="text-sm text-muted-foreground mt-2 max-w-xs mx-auto italic"
        >
            "{fact}"
        </motion.p>
    );
};

CartoonLoader.displayName = "CartoonLoader";
