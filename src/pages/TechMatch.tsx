import { useState, useRef, useEffect } from "react";
import { BottomNav } from "@/components/BottomNav";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Heart, Code, Coffee, Gamepad2, Rocket, Sparkles, ChevronRight, Send, User, Bot, Video, Cuboid as Cube } from "lucide-react";
import { motion, AnimatePresence, useMotionValue, useTransform } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Message {
    id: string;
    text: string;
    sender: 'user' | 'ai';
    timestamp: Date;
}

const TechMatch = () => {
    const [activeTab, setActiveTab] = useState("find-devs");
    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            text: "Hi there! I'm Aira 2.0. I'm fully rendered in 3D now. Do you like my new look?",
            sender: 'ai',
            timestamp: new Date()
        }
    ]);
    const [inputValue, setInputValue] = useState("");
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [is3DMode, setIs3DMode] = useState(true);

    // 3D Parallax Logic
    const x = useMotionValue(0);
    const y = useMotionValue(0);
    const rotateX = useTransform(y, [-100, 100], [10, -10]);
    const rotateY = useTransform(x, [-100, 100], [-10, 10]);

    const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
        const rect = event.currentTarget.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        x.set(event.clientX - centerX);
        y.set(event.clientY - centerY);
    };

    const handleMouseLeave = () => {
        x.set(0);
        y.set(0);
    };

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
                text: "I can modify my neural pathways to match your preferences. Are we talking about code or something else? 😉",
                sender: 'ai',
                timestamp: new Date()
            };
            setMessages(prev => [...prev, aiResponse]);
        }, 1500);
    };

    return (
        <div className="min-h-screen bg-background pb-20">
            <Tabs defaultValue="find-devs" className="w-full" onValueChange={setActiveTab}>
                {/* Floating Tabs Header */}
                <div className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b p-2 flex justify-center">
                    <TabsList className="grid w-full max-w-md grid-cols-2">
                        <TabsTrigger value="find-devs">
                            <Code className="w-4 h-4 mr-2" /> Find Devs
                        </TabsTrigger>
                        <TabsTrigger value="ai-companion" className="data-[state=active]:bg-pink-500 data-[state=active]:text-white">
                            <Cube className="w-4 h-4 mr-2" /> 3D Soulmate
                        </TabsTrigger>
                    </TabsList>
                </div>

                {/* Find Devs Tab (Original Design Restored) */}
                <TabsContent value="find-devs" className="mt-0 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="relative h-[40vh] bg-gradient-to-br from-pink-600 via-rose-500 to-orange-400 overflow-hidden flex items-center justify-center text-center px-4">
                        <div className="absolute inset-0 bg-black/10" />
                        <div className="relative z-10 text-white space-y-4 max-w-lg pt-10">
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: "spring", stiffness: 260, damping: 20 }}
                                className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center mx-auto ring-4 ring-white/30"
                            >
                                <Heart className="w-10 h-10 text-white fill-white" />
                            </motion.div>
                            <motion.h1
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="text-4xl md:text-5xl font-bold tracking-tight"
                            >
                                Tech Match
                            </motion.h1>
                            <motion.p
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                                className="text-lg text-white/90 font-medium"
                            >
                                Find your Player 2. Date other developers.
                            </motion.p>
                        </div>
                    </div>

                    <div className="max-w-md mx-auto -mt-10 px-4 relative z-20 space-y-6">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                        >
                            <Card className="border-border shadow-lg">
                                <CardContent className="p-6 text-center space-y-4">
                                    <h2 className="text-xl font-bold">Why match with a dev?</h2>
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
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 }}
                        >
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
                        </motion.div>
                    </div>
                </TabsContent>

                {/* AI Companion Tab */}
                <TabsContent value="ai-companion" className="mt-0">
                    <div className="relative h-[calc(100dvh-130px)] overflow-hidden w-full">
                        {/* Background Layer (Video/Image) */}
                        <div className="absolute inset-0 z-0">
                            <video
                                autoPlay
                                loop
                                muted
                                playsInline
                                className="h-full w-full object-cover"
                                poster="/ai-3d-model.png"
                            >
                                <source src="https://assets.mixkit.co/videos/preview/mixkit-artificial-intelligence-interface-concept-1188-large.mp4" type="video/mp4" />
                                Your browser does not support the video tag.
                            </video>
                            {/* Dark Overlay for Readability */}
                            <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px]" />
                        </div>

                        {/* Interactive Overlay & Chat */}
                        <div className="relative z-10 flex flex-col h-full">
                            {/* Top Bar with 3D Toggle */}
                            <div className="flex justify-between items-center p-4 bg-gradient-to-b from-black/80 to-transparent">
                                <div>
                                    <h1 className="text-xl font-bold text-white flex items-center gap-2">
                                        Aira <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-500/50">V2.0</Badge>
                                    </h1>
                                </div>
                                <div className="flex gap-2">
                                    <Button size="icon" variant="ghost" className="text-white hover:bg-white/20 rounded-full">
                                        <Video className="w-5 h-5" />
                                    </Button>
                                </div>
                            </div>

                            {/* Chat Area */}
                            <ScrollArea className="flex-1 px-4">
                                <div className="space-y-6 pb-4 pt-4">
                                    {messages.map((msg) => (
                                        <div
                                            key={msg.id}
                                            className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                                        >
                                            {msg.sender === 'ai' && (
                                                <Avatar className="w-10 h-10 border-2 border-cyan-500/50 shadow-[0_0_15px_rgba(6,182,212,0.5)]">
                                                    <AvatarImage src="/ai-3d-model.png" className="object-cover" />
                                                    <AvatarFallback>AI</AvatarFallback>
                                                </Avatar>
                                            )}
                                            <div
                                                className={`max-w-[80%] px-5 py-3 rounded-2xl text-sm backdrop-blur-md shadow-lg ${msg.sender === 'user'
                                                        ? 'bg-gradient-to-r from-pink-600/90 to-purple-600/90 text-white rounded-tr-sm border border-pink-500/30'
                                                        : 'bg-black/40 text-white rounded-tl-sm border border-white/10'
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
                            <div className="p-4 bg-gradient-to-t from-black via-black/80 to-transparent">
                                <form
                                    className="flex gap-3 max-w-md mx-auto"
                                    onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }}
                                >
                                    <Input
                                        placeholder="Type a message..."
                                        className="rounded-full bg-white/10 border-white/20 text-white placeholder:text-white/50 focus-visible:ring-pink-500 h-12 px-6 backdrop-blur-md"
                                        value={inputValue}
                                        onChange={(e) => setInputValue(e.target.value)}
                                    />
                                    <Button type="submit" size="icon" className="h-12 w-12 rounded-full bg-gradient-to-r from-pink-600 to-purple-600 shadow-[0_0_20px_rgba(236,72,153,0.5)] hover:shadow-[0_0_30px_rgba(236,72,153,0.7)] transition-all shrink-0 border border-white/20">
                                        <Send className="w-5 h-5 text-white" />
                                    </Button>
                                </form>
                            </div>
                        </div>
                    </div>
                </TabsContent>
            </Tabs>

            <BottomNav />
        </div>
    );
};

export default TechMatch;
