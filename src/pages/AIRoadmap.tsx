import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Sparkles, Send, Loader2 } from "lucide-react";
import { BottomNav } from "@/components/BottomNav";
import type { User } from "@supabase/supabase-js";
import { useAIMentor } from "@/hooks/useAIMentor";

export default function AIRoadmap() {
    const [user, setUser] = useState<User | null>(null);
    const [query, setQuery] = useState("");
    const [roadmap, setRoadmap] = useState("");
    const [loading, setLoading] = useState(false);
    const [chatHistory, setChatHistory] = useState<{ role: string; content: string }[]>([]);
    const navigate = useNavigate();
    const { toast } = useToast();

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (!session) {
                navigate("/auth");
            } else {
                setUser(session.user);
            }
        });
    }, [navigate]);

    const { sendMessage, messages: aiMessages, isLoading: isAiLoading } = useAIMentor();

    // Effect to handle AI response updates
    useEffect(() => {
        if (aiMessages.length > 0) {
            const lastMsg = aiMessages[aiMessages.length - 1];
            if (lastMsg.role === 'assistant') {
                setRoadmap(lastMsg.content);
                // Also update local chat history for display consistency if needed, 
                // but we might just want to rely on aiMessages for the latest state.
                // However, the existing UI uses chatHistory state. 
                // Let's sync them or just swap to use aiMessages directly.
                // For simplicity/least-refactor, we'll sync the *latest* response content.
            }
        }
    }, [aiMessages]);

    const generateRoadmap = async () => {
        if (!query.trim()) {
            toast({
                title: "Please enter a topic",
                description: "Tell me what you want to learn!",
                variant: "destructive",
            });
            return;
        }

        // Add user message to local chat history for immediate feedback
        const userMessage = { role: "user", content: query };
        setChatHistory(prev => [...prev, userMessage]);

        try {
            await sendMessage(query, 'roadmap');

            toast({
                title: "Generating Roadmap...",
                description: "This may take a few seconds.",
            });
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to generate roadmap. Please try again.",
                variant: "destructive",
            });
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-muted/30 to-background pb-24">
            {/* Header */}
            <header className="sticky top-0 z-50 glass-card border-b">
                <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
                    <Button variant="ghost" onClick={() => navigate("/feed")}>
                        <ArrowLeft className="w-5 h-5 mr-2" />
                        Back
                    </Button>
                    <h1 className="text-xl font-bold gradient-text flex items-center gap-2">
                        <Sparkles className="w-6 h-6" />
                        AI Roadmap
                    </h1>
                    <div className="w-20"></div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-2xl mx-auto px-4 py-6">
                <Card className="p-6 mb-6 bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/20">
                    <div className="flex items-start gap-4">
                        <div className="p-3 bg-primary/20 rounded-full">
                            <Sparkles className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold mb-2">Your Personal AI Learning Guide</h2>
                            <p className="text-muted-foreground">
                                Tell me what you want to learn, and I'll create a personalized roadmap just for you!
                                Whether it's React, Python, Machine Learning, or any tech skill - I've got you covered.
                            </p>
                        </div>
                    </div>
                </Card>

                {/* Chat History */}
                <div className="space-y-4 mb-6">
                    {chatHistory.map((message, index) => (
                        <Card
                            key={index}
                            className={`p-4 ${message.role === "user" ? "ml-12 bg-primary/5" : "mr-12 bg-secondary/5"}`}
                        >
                            <div className="flex items-start gap-3">
                                <div className={`p-2 rounded-full ${message.role === "user" ? "bg-primary/20" : "bg-secondary/20"}`}>
                                    {message.role === "user" ? (
                                        <span className="text-sm font-semibold">You</span>
                                    ) : (
                                        <Sparkles className="w-4 h-4" />
                                    )}
                                </div>
                                <div className="flex-1">
                                    {message.role === "assistant" ? (
                                        <div className="prose prose-sm max-w-none">
                                            <pre className="whitespace-pre-wrap font-sans text-sm">{message.content}</pre>
                                        </div>
                                    ) : (
                                        <p>{message.content}</p>
                                    )}
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>

                {/* Input Area - Only show if no roadmap generated */}
                {chatHistory.length === 0 && (
                    <>
                        <Card className="p-8 shadow-2xl border-2 border-primary/30 bg-gradient-to-br from-card via-card/95 to-card/80 backdrop-blur-md">
                            <div className="space-y-4">
                                <div>
                                    <label className="text-sm font-semibold mb-3 block flex items-center gap-2">
                                        <Sparkles className="w-4 h-4 text-primary" />
                                        What do you want to learn?
                                    </label>
                                    <Textarea
                                        placeholder="e.g., React, Python, Machine Learning, Web Development, Full Stack Development..."
                                        value={query}
                                        onChange={(e) => setQuery(e.target.value)}
                                        onKeyPress={(e) => e.key === "Enter" && !e.shiftKey && !loading && (e.preventDefault(), generateRoadmap())}
                                        className="text-base min-h-[100px] resize-y border-2 border-primary/40 focus:border-primary/70 bg-background/50 rounded-lg p-4 transition-all"
                                        rows={4}
                                    />
                                    <p className="text-xs text-muted-foreground mt-2">
                                        💡 Tip: Be specific! Try "React with TypeScript" or "Python for Data Science"
                                    </p>
                                </div>
                                <Button
                                    onClick={generateRoadmap}
                                    disabled={loading || !query.trim()}
                                    className="w-full gradient-primary text-white shadow-lg hover:shadow-2xl transition-all transform hover:scale-[1.02] active:scale-[0.98]"
                                    size="lg"
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                            Generating Your Roadmap...
                                        </>
                                    ) : (
                                        <>
                                            <Sparkles className="w-5 h-5 mr-2" />
                                            Generate Roadmap
                                        </>
                                    )}
                                </Button>
                            </div>
                        </Card>

                        {/* Quick Suggestions */}
                        <div className="mt-6">
                            <p className="text-sm text-muted-foreground mb-3">Popular topics:</p>
                            <div className="flex flex-wrap gap-2">
                                {["React Development", "Python Backend", "Machine Learning", "DevOps", "Mobile Development"].map((topic) => (
                                    <Button
                                        key={topic}
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setQuery(topic)}
                                        className="text-xs"
                                    >
                                        {topic}
                                    </Button>
                                ))}
                            </div>
                        </div>
                    </>
                )}

                {/* Floating "New Roadmap" Button - Only show after roadmap is generated */}
                {chatHistory.length > 0 && (
                    <Button
                        onClick={() => {
                            setChatHistory([]);
                            setRoadmap("");
                            setQuery("");
                        }}
                        className="fixed bottom-28 right-6 rounded-full shadow-2xl gradient-primary text-white w-14 h-14 flex items-center justify-center hover:scale-110 transition-transform z-40"
                        size="icon"
                    >
                        <Sparkles className="w-6 h-6" />
                    </Button>
                )}
            </main>

            <BottomNav />
        </div>
    );
}
