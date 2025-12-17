import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Send, Bot, Sparkles, User, Lightbulb } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Message {
    id: string;
    text: string;
    sender: 'user' | 'ai';
    type?: 'text' | 'action';
    actionData?: any;
}

interface AICofounderChatProps {
    onApplyFilter?: (filter: string) => void;
}

export const AICofounderChat = ({ onApplyFilter }: AICofounderChatProps) => {
    const [messages, setMessages] = useState<Message[]>([
        {
            id: "1",
            text: "Namaste! I'm your AI Co-founder Arya. I can help you validate your idea, suggest equity splits, or find the perfect match. What's on your mind today?",
            sender: 'ai',
            type: 'text'
        }
    ]);
    const [inputValue, setInputValue] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isTyping]);

    const handleSendMessage = async () => {
        if (!inputValue.trim()) return;

        const userMsg: Message = {
            id: Date.now().toString(),
            text: inputValue,
            sender: 'user'
        };

        setMessages(prev => [...prev, userMsg]);
        setInputValue("");
        setIsTyping(true);

        // Simulate AI processing
        setTimeout(() => {
            const response = generateResponse(userMsg.text);
            setMessages(prev => [...prev, {
                id: (Date.now() + 1).toString(),
                text: response.text,
                sender: 'ai',
                type: response.type,
                actionData: response.actionData
            }]);
            setIsTyping(false);
        }, 1500);
    };

    const generateResponse = (input: string): { text: string, type?: 'text' | 'action', actionData?: any } => {
        const lowerInput = input.toLowerCase();

        if (lowerInput.includes("match") || lowerInput.includes("find") || lowerInput.includes("looking for")) {
            return {
                text: "I can help you find a co-founder. Based on current trends, are you looking for a technical partner or a business lead? I can filter the listings for you.",
                type: 'action', // In a real app, this would trigger UI changes
                actionData: {
                    suggestions: ["Fintech", "HealthTech", "AI/ML"]
                }
            };
        }

        if (lowerInput.includes("equity") || lowerInput.includes("share")) {
            return {
                text: "Equity is tricky! For an early-stage CTO, 10-50% is standard depending on whether they take a salary. Are you pre-revenue?",
                type: 'text'
            };
        }

        if (lowerInput.includes("idea") || lowerInput.includes("validate")) {
            return {
                text: "Great ideas need validation. Have you spoken to at least 10 potential users? I suggest creating a landing page MVP first.",
                type: 'text'
            };
        }

        // Default response
        return {
            text: "That's interesting! Tell me more about your startup vision. I'm here to help you refine your pitch.",
            type: 'text'
        };
    };

    return (
        <Card className="h-[500px] flex flex-col border-none shadow-none bg-transparent">
            <CardContent className="flex-1 p-4 flex flex-col h-full">
                <ScrollArea className="flex-1 pr-4" ref={scrollRef}>
                    <div className="space-y-4">
                        {messages.map((msg) => (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                key={msg.id}
                                className={`flex gap-3 ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
                            >
                                <Avatar className={`w-8 h-8 ${msg.sender === 'ai' ? 'border-pink-500/50' : 'border-blue-500/50'} border-2`}>
                                    {msg.sender === 'ai' ? (
                                        <AvatarImage src="/lovable-uploads/ai-avatar.png" />
                                    ) : null}
                                    <AvatarFallback className={msg.sender === 'ai' ? 'bg-pink-100 text-pink-700' : 'bg-blue-100 text-blue-700'}>
                                        {msg.sender === 'ai' ? <Bot size={16} /> : <User size={16} />}
                                    </AvatarFallback>
                                </Avatar>

                                <div className={`space-y-2 max-w-[80%]`}>
                                    <div className={`p-3 rounded-2xl text-sm ${msg.sender === 'user'
                                        ? 'bg-primary text-primary-foreground rounded-tr-none'
                                        : 'bg-muted text-foreground rounded-tl-none'
                                        }`}>
                                        {msg.text}
                                    </div>

                                    {msg.actionData && msg.actionData.suggestions && (
                                        <div className="flex flex-wrap gap-2 mt-2">
                                            {msg.actionData.suggestions.map((s: string) => (
                                                <Button
                                                    key={s}
                                                    variant="outline"
                                                    size="sm"
                                                    className="text-xs h-7 border-pink-500/30 text-pink-600 hover:bg-pink-50"
                                                    onClick={() => onApplyFilter && onApplyFilter(s)}
                                                >
                                                    <Sparkles className="w-3 h-3 mr-1" />
                                                    See {s} Matches
                                                </Button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        ))}

                        {isTyping && (
                            <div className="flex gap-3">
                                <Avatar className="w-8 h-8 border-2 border-pink-500/50">
                                    <AvatarFallback className="bg-pink-100"><Bot size={16} /></AvatarFallback>
                                </Avatar>
                                <div className="bg-muted p-3 rounded-2xl rounded-tl-none w-16 flex items-center justify-center">
                                    <div className="flex gap-1">
                                        <div className="w-2 h-2 bg-foreground/30 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                        <div className="w-2 h-2 bg-foreground/30 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                        <div className="w-2 h-2 bg-foreground/30 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </ScrollArea>

                <div className="mt-4 flex gap-2">
                    <Input
                        placeholder="Ask your AI Co-founder..."
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                        className="rounded-full bg-secondary/50 border-0 focus-visible:ring-1 focus-visible:ring-pink-500 px-4"
                    />
                    <Button
                        size="icon"
                        className="rounded-full bg-gradient-to-r from-pink-500 to-orange-500 hover:opacity-90 transition-opacity"
                        onClick={handleSendMessage}
                    >
                        <Send className="w-4 h-4" />
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
};
