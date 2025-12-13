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
    const [activeTab, setActiveTab] = useState("ai-companion");
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
            <Tabs defaultValue="ai-companion" className="w-full" onValueChange={setActiveTab}>
                {/* Floating Tabs Header */}
                <div className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b p-2 flex justify-center">
                    <TabsList className="grid w-full max-w-md grid-cols-2">
                        <TabsTrigger value="ai-companion" className="data-[state=active]:bg-pink-500 data-[state=active]:text-white">
                            <Cube className="w-4 h-4 mr-2" /> 3D Soulmate
                        </TabsTrigger>
                        <TabsTrigger value="find-devs">
                            <Code className="w-4 h-4 mr-2" /> Find Devs
                        </TabsTrigger>
                    </TabsList>
                </div>

                {/* AI Companion Tab */}
                <TabsContent value="ai-companion" className="mt-0">
                    <div className="flex flex-col h-[calc(100vh-130px)]">
                        {/* 3D Model Display */}
                        <div
                            className="relative h-[50vh] w-full bg-[#0a0a0a] overflow-hidden shrink-0 flex items-center justify-center perspective-1000"
                            onMouseMove={is3DMode ? handleMouseMove : undefined}
                            onMouseLeave={handleMouseLeave}
                        >
                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-pink-900/20 via-[#0a0a0a] to-[#0a0a0a]" />

                            {/* 3D Tilt Container */}
                            <motion.div
                                style={{
                                    rotateX: is3DMode ? rotateX : 0,
                                    rotateY: is3DMode ? rotateY : 0,
                                    transformStyle: "preserve-3d"
                                }}
                                className="relative w-full h-full flex items-center justify-center"
                            >
                                <img
                                    src="/ai-3d-model.png"
                                    alt="3D AI Model"
                                    className="h-full w-auto object-contain relative z-10 drop-shadow-[0_0_30px_rgba(236,72,153,0.3)] transition-transform duration-200"
                                />
                                {/* Holo-ring effect underneath */}
                                <div className="absolute bottom-10 w-40 h-40 border-2 border-pink-500/30 rounded-full rotate-x-60 animate-[spin_10s_linear_infinite]" />
                                <div className="absolute bottom-10 w-60 h-60 border border-cyan-500/20 rounded-full rotate-x-60 animate-[spin_7s_linear_infinite_reverse]" />
                            </motion.div>

                            <div className="absolute top-4 right-4 z-20 flex flex-col gap-2">
                                <Button
                                    size="sm"
                                    variant="outline"
                                    className={`bg-black/50 backdrop-blur border-pink-500/50 ${is3DMode ? "text-pink-400" : "text-gray-400"}`}
                                    onClick={() => setIs3DMode(!is3DMode)}
                                >
                                    <Cube className="w-4 h-4 mr-2" /> 3D View
                                </Button>
                            </div>

                            <div className="absolute bottom-4 left-4 right-4 z-20">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h1 className="text-3xl font-bold text-white drop-shadow-md flex items-center gap-2">
                                            Aira <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-500/50 hover:bg-cyan-500/30">V2.0</Badge>
                                        </h1>
                                        <p className="text-pink-200/80 font-medium text-xs tracking-wider uppercase">
                                            Interactive 3D Model
                                        </p>
                                    </div>
                                    <Button size="icon" className="rounded-full h-12 w-12 bg-pink-600 hover:bg-pink-700 shadow-[0_0_20px_rgba(236,72,153,0.5)] border border-pink-400/50 animate-pulse">
                                        <Video className="text-white w-6 h-6" />
                                    </Button>
                                </div>
                            </div>
                        </div>

                        {/* Chat Interface */}
                        <div className="flex-1 bg-background flex flex-col min-h-0 border-t border-white/10">
                            <ScrollArea className="flex-1 p-4">
                                <div className="space-y-4 pb-4">
                                    {messages.map((msg) => (
                                        <div
                                            key={msg.id}
                                            className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                                        >
                                            {msg.sender === 'ai' && (
                                                <Avatar className="w-8 h-8 border-2 border-cyan-500/50">
                                                    <AvatarImage src="/ai-3d-model.png" className="object-cover" />
                                                    <AvatarFallback>AI</AvatarFallback>
                                                </Avatar>
                                            )}
                                            <div
                                                className={`max-w-[75%] px-4 py-2 rounded-2xl text-sm shadow-sm ${msg.sender === 'user'
                                                        ? 'bg-gradient-to-r from-pink-600 to-purple-600 text-white rounded-tr-sm'
                                                        : 'bg-secondary/80 backdrop-blur text-foreground rounded-tl-sm border border-white/5'
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
                            <div className="p-3 bg-background/80 backdrop-blur-md border-t">
                                <form
                                    className="flex gap-2 max-w-md mx-auto"
                                    onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }}
                                >
                                    <Input
                                        placeholder="Chat with Aira V2..."
                                        className="rounded-full bg-secondary/50 border-white/10 focus-visible:ring-pink-500"
                                        value={inputValue}
                                        onChange={(e) => setInputValue(e.target.value)}
                                    />
                                    <Button type="submit" size="icon" className="rounded-full bg-gradient-to-r from-pink-600 to-purple-600 shadow-lg shrink-0">
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
