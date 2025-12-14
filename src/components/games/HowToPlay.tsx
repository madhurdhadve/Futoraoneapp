import React from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { HelpCircle } from "lucide-react";
import { motion } from "framer-motion";

interface HowToPlayProps {
    title: string;
    description: string;
    rules: string[];
}

export const HowToPlay: React.FC<HowToPlayProps> = ({ title, description, rules }) => {
    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full hover:bg-slate-100 dark:hover:bg-slate-800">
                    <HelpCircle className="w-6 h-6 text-slate-500" />
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-black bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent">
                        How to Play {title}
                    </DialogTitle>
                    <DialogDescription className="text-base text-slate-600 dark:text-slate-400">
                        {description}
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    {rules.map((rule, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800"
                        >
                            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-sm">
                                {index + 1}
                            </div>
                            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                {rule}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </DialogContent>
        </Dialog>
    );
};
