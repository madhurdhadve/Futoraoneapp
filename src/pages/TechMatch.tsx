import { useState, useRef, useEffect } from "react";
import { BottomNav } from "@/components/BottomNav";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Heart, Code, Coffee, Gamepad2, Rocket, Sparkles, ChevronRight, Send, User, Bot, Video } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Message {
    id: string;
    text: string;
    sender: 'user' | 'ai';
    timestamp: Date;
}

const TechMatch = () => {
    const [activeTab, setActiveTab] = useState("ai-companion");
    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            text: "Hi there! I'm Aira, your AI tech companion. I love coding and debugging late at night. What are you working on?",
            sender: 'ai',
            timestamp: new Date()
        }
    ]);
    const [inputValue, setInputValue] = useState("");
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSendMessage = () => {
        if (!inputValue.trim()) return;

        const newMessage: Message = {
            id: Date.now().toString(),
            text: inputValue,
            sender: 'user',
            timestamp: new Date()
        };

        setMessages(prev => [...prev, newMessage]);
        setInputValue("");

        // Mock AI response
        setTimeout(() => {
            const aiResponse: Message = {
                id: (Date.now() + 1).toString(),
                text: "That sounds fascinating! Tell me more about the tech stack you are using. I'm a big fan of React and Python! 💖",
                sender: 'ai',
                timestamp: new Date()
            };
            setMessages(prev => [...prev, aiResponse]);
        }, 1500);
    };

    return (
        <div className="min-h-screen bg-background pb-20">
            <Tabs defaultValue="ai-companion" className="w-full" onValueChange={setActiveTab}>
                {/* Floating Tabs Header */}
                <div className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b p-2 flex justify-center">
                    <TabsList className="grid w-full max-w-md grid-cols-2">
                        <TabsTrigger value="ai-companion" className="data-[state=active]:bg-pink-500 data-[state=active]:text-white">
                            <Sparkles className="w-4 h-4 mr-2" /> AI Soulmate
                        </TabsTrigger>
                        <TabsTrigger value="find-devs">
                            <Code className="w-4 h-4 mr-2" /> Find Devs
                        </TabsTrigger>
                    </TabsList>
                </div>

                {/* AI Companion Tab */}
                <TabsContent value="ai-companion" className="mt-0">
                    <div className="flex flex-col h-[calc(100vh-130px)]">
                        {/* AI Avatar Display */}
                        <div className="relative h-[45vh] w-full bg-black overflow-hidden shrink-0">
                            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background z-10" />
                            <img
                                src="/ai-avatar.png"
                                alt="AI Companion"
                                className="w-full h-full object-cover object-center"
                            />
                            <div className="absolute bottom-4 left-4 right-4 z-20">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h1 className="text-3xl font-bold text-white drop-shadow-md flex items-center gap-2">
                                            Aira <Badge className="bg-pink-500 hover:bg-pink-600 border-0">AI</Badge>
                                        </h1>
                                        <p className="text-pink-200 font-medium drop-shadow-md flex items-center gap-1">
                                            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" /> Online Now
                                        </p>
                                    </div>
                                    <Button size="icon" className="rounded-full h-12 w-12 bg-white/20 hover:bg-white/30 backdrop-blur-md border border-white/40">
                                        <Video className="text-white" />
                                    </Button>
                                </div>
                            </div>
                        </div>

                        {/* Chat Interface */}
                        <div className="flex-1 bg-background flex flex-col min-h-0">
                            <ScrollArea className="flex-1 p-4">
                                <div className="space-y-4 pb-4">
                                    {messages.map((msg) => (
                                        <div
                                            key={msg.id}
                                            className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                                        >
                                            {msg.sender === 'ai' && (
                                                <Avatar className="w-8 h-8 border-2 border-pink-500">
                                                    <AvatarImage src="/ai-avatar.png" />
                                                    <AvatarFallback>AI</AvatarFallback>
                                                </Avatar>
                                            )}
                                            <div
                                                className={`max-w-[75%] px-4 py-2 rounded-2xl text-sm ${msg.sender === 'user'
                                                        ? 'bg-pink-600 text-white rounded-tr-sm'
                                                        : 'bg-muted text-foreground rounded-tl-sm'
                                                    }`}
                                            >
                                                {msg.text}
                                            </div>
                                        </div>
                                    ))}
                                    <div ref={messagesEndRef} />
                                </div>
                            </ScrollArea>

                            {/* Input Area */}
                            <div className="p-3 border-t bg-background/50 backdrop-blur-sm">
                                <form
                                    className="flex gap-2 max-w-md mx-auto"
                                    onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }}
                                >
                                    <Input
                                        placeholder="Message Aira..."
                                        className="rounded-full bg-secondary/50 border-0 focus-visible:ring-pink-500"
                                        value={inputValue}
                                        onChange={(e) => setInputValue(e.target.value)}
                                    />
                                    <Button type="submit" size="icon" className="rounded-full bg-pink-600 hover:bg-pink-700 shrink-0">
                                        <Send className="w-4 h-4" />
                                    </Button>
                                </form>
                            </div>
                        </div>
                    </div>
                </TabsContent>

                {/* Find Devs Tab (Original Waitlist Content) */}
                <TabsContent value="find-devs" className="mt-0 p-4 space-y-6 max-w-md mx-auto">
                    <div className="text-center space-y-4 pt-8">
                        <div className="w-20 h-20 bg-gradient-to-br from-pink-500 to-orange-400 rounded-full flex items-center justify-center mx-auto shadow-xl">
                            <Heart className="w-10 h-10 text-white fill-white" />
                        </div>
                        <h2 className="text-3xl font-bold">Find Real Connections</h2>
                        <p className="text-muted-foreground">Match with developers who ship code and share coffee.</p>
                    </div>

                    <Card className="border-border shadow-lg">
                        <CardContent className="p-6 text-center space-y-4">
                            <h3 className="text-xl font-bold">Why match with a dev?</h3>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div className="flex flex-col items-center gap-2 p-3 bg-secondary/50 rounded-xl">
                                    <Code className="text-primary" />
                                    <span>Code Together</span>
                                </div>
                                <div className="flex flex-col items-center gap-2 p-3 bg-secondary/50 rounded-xl">
                                    <Coffee className="text-orange-500" />
                                    <span>Coffee runs</span>
                                </div>
                                <div className="flex flex-col items-center gap-2 p-3 bg-secondary/50 rounded-xl">
                                    <Gamepad2 className="text-purple-500" />
                                    <span>Gaming Duo</span>
                                </div>
                                <div className="flex flex-col items-center gap-2 p-3 bg-secondary/50 rounded-xl">
                                    <Rocket className="text-pink-500" />
                                    <span>Build Products</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-primary/20 bg-gradient-to-br from-background to-primary/5">
                        <CardContent className="p-6">
                            <div className="flex items-center gap-3 mb-4">
                                <Badge className="bg-gradient-to-r from-pink-500 to-rose-500 border-0">BETA ACCESS</Badge>
                                <span className="text-xs text-muted-foreground flex items-center gap-1">
                                    <Sparkles size={12} className="text-yellow-500" /> 1,240 on waitlist
                                </span>
                            </div>
                            <h3 className="text-lg font-bold mb-2">Join the Early Access List</h3>
                            <p className="text-muted-foreground text-sm mb-6">
                                We are strictly matching algorithms to find you the perfect code-compatible partner. Be the first to know when we launch!
                            </p>
                            <Button className="w-full font-bold bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700 text-white shadow-lg shadow-pink-500/20">
                                Join Waitlist <ChevronRight className="ml-2 w-4 h-4" />
                            </Button>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            <BottomNav />
        </div>
    );
};

export default TechMatch;
