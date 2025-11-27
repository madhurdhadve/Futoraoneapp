import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Bot, Sparkles, Code, FileText, Lightbulb, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const AIPage = () => {
    const navigate = useNavigate();
    const [hoveredCard, setHoveredCard] = useState<string | null>(null);

    const tools = [
        {
            id: "roadmap",
            title: "AI Roadmap Generator",
            description: "Generate personalized learning paths for any technology.",
            icon: <Sparkles className="w-8 h-8 text-cyan-400" />,
            color: "from-cyan-500/20 to-blue-500/20",
            border: "hover:border-cyan-500/50",
            action: () => navigate("/ai-roadmap"),
        },
        {
            id: "code-assistant",
            title: "Code Assistant",
            description: "Get instant help with debugging and code optimization.",
            icon: <Code className="w-8 h-8 text-purple-400" />,
            color: "from-purple-500/20 to-pink-500/20",
            border: "hover:border-purple-500/50",
            action: () => { }, // Placeholder
            comingSoon: true,
        },
        {
            id: "project-ideas",
            title: "Project Ideas",
            description: "Generate unique project ideas based on your skills.",
            icon: <Lightbulb className="w-8 h-8 text-yellow-400" />,
            color: "from-yellow-500/20 to-orange-500/20",
            border: "hover:border-yellow-500/50",
            action: () => { }, // Placeholder
            comingSoon: true,
        },
        {
            id: "resume-review",
            title: "Resume Reviewer",
            description: "AI-powered analysis to improve your developer resume.",
            icon: <FileText className="w-8 h-8 text-green-400" />,
            color: "from-green-500/20 to-emerald-500/20",
            border: "hover:border-green-500/50",
            action: () => { }, // Placeholder
            comingSoon: true,
        },
    ];

    return (
        <div className="min-h-screen bg-black text-white overflow-hidden relative">
            {/* Background Effects */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-900/30 rounded-full blur-[100px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-900/30 rounded-full blur-[100px]" />
            </div>

            <header className="relative z-10 p-4 flex items-center border-b border-white/10 bg-black/50 backdrop-blur-md">
                <Button
                    variant="ghost"
                    onClick={() => navigate("/feed")}
                    className="text-gray-400 hover:text-white hover:bg-white/10"
                >
                    <ArrowLeft className="w-5 h-5 mr-2" />
                    Back
                </Button>
                <h1 className="ml-4 text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-purple-400">
                    Futora AI
                </h1>
            </header>

            <main className="relative z-10 max-w-4xl mx-auto px-4 py-12">
                <div className="text-center mb-16">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <div className="inline-flex items-center justify-center p-3 mb-6 rounded-full bg-gradient-to-r from-cyan-500/10 to-purple-500/10 border border-white/10">
                            <Bot className="w-6 h-6 text-cyan-400 mr-2" />
                            <span className="text-sm font-medium text-cyan-200">AI-Powered Developer Tools</span>
                        </div>
                        <h2 className="text-4xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white via-gray-200 to-gray-400">
                            Supercharge Your Workflow
                        </h2>
                        <p className="text-lg text-gray-400 max-w-2xl mx-auto">
                            Access a suite of advanced AI tools designed to help you learn faster, code better, and build amazing projects.
                        </p>
                    </motion.div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {tools.map((tool, index) => (
                        <motion.div
                            key={tool.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            onHoverStart={() => setHoveredCard(tool.id)}
                            onHoverEnd={() => setHoveredCard(null)}
                        >
                            <Card
                                className={`h-full p-6 bg-gradient-to-br ${tool.color} border border-white/10 ${tool.border} transition-all duration-300 cursor-pointer group relative overflow-hidden`}
                                onClick={tool.action}
                            >
                                <div className="relative z-10">
                                    <div className="mb-4 p-3 bg-black/40 rounded-xl w-fit backdrop-blur-sm border border-white/5 group-hover:scale-110 transition-transform duration-300">
                                        {tool.icon}
                                    </div>
                                    <h3 className="text-xl font-bold mb-2 text-white group-hover:text-cyan-300 transition-colors">
                                        {tool.title}
                                    </h3>
                                    <p className="text-gray-400 text-sm mb-4">
                                        {tool.description}
                                    </p>

                                    {tool.comingSoon ? (
                                        <span className="inline-block px-3 py-1 text-xs font-medium bg-white/10 rounded-full text-gray-300 border border-white/5">
                                            Coming Soon
                                        </span>
                                    ) : (
                                        <div className="flex items-center text-cyan-400 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-[-10px] group-hover:translate-x-0">
                                            Try Now <Zap className="w-4 h-4 ml-1" />
                                        </div>
                                    )}
                                </div>

                                {/* Hover Glow Effect */}
                                {hoveredCard === tool.id && (
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent skew-x-12 translate-x-[-100%] animate-shimmer" />
                                )}
                            </Card>
                        </motion.div>
                    ))}
                </div>
            </main>
        </div>
    );
};

export default AIPage;
