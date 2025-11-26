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

    const generateRoadmap = async () => {
        if (!query.trim()) {
            toast({
                title: "Please enter a topic",
                description: "Tell me what you want to learn!",
                variant: "destructive",
            });
            return;
        }

        setLoading(true);

        // Add user message to chat
        const userMessage = { role: "user", content: query };
        setChatHistory(prev => [...prev, userMessage]);

        try {
            // Simulated AI response (you can integrate with OpenAI API later)
            const aiResponse = generateMockRoadmap(query);

            setRoadmap(aiResponse);
            setChatHistory(prev => [...prev, { role: "assistant", content: aiResponse }]);
            setQuery("");

            toast({
                title: "Roadmap Generated!",
                description: "Your personalized learning path is ready.",
            });
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to generate roadmap. Please try again.",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const generateMockRoadmap = (topic: string) => {
        const topicLower = topic.toLowerCase();

        if (topicLower.includes("react") || topicLower.includes("frontend")) {
            return `# 🚀 React Developer Roadmap

## Phase 1: Fundamentals (2-3 months)
✅ HTML5 & CSS3 mastery
✅ JavaScript ES6+ features
✅ DOM manipulation
✅ Async JavaScript (Promises, Async/Await)
✅ Git & GitHub basics

## Phase 2: React Basics (2 months)
✅ JSX and Components
✅ Props and State
✅ Hooks (useState, useEffect, useContext)
✅ Event Handling
✅ Conditional Rendering
✅ Lists and Keys

## Phase 3: Advanced React (2-3 months)
✅ Custom Hooks
✅ Context API & State Management
✅ React Router
✅ Performance Optimization
✅ Code Splitting & Lazy Loading
✅ Error Boundaries

## Phase 4: Ecosystem & Tools (2 months)
✅ TypeScript with React
✅ State Management (Redux/Zustand)
✅ Styling (Tailwind CSS, Styled Components)
✅ Testing (Jest, React Testing Library)
✅ Build Tools (Vite, Webpack)

## Phase 5: Real-World Projects
✅ Build a Todo App
✅ Create a Weather Dashboard
✅ Develop an E-commerce Site
✅ Build a Social Media Clone
✅ Contribute to Open Source

## Resources:
📚 Official React Docs
🎥 FreeCodeCamp React Course
💻 React Projects on GitHub
🌐 React Community Forums

Keep coding and never stop learning! 🎯`;
        } else if (topicLower.includes("python") || topicLower.includes("backend")) {
            return `# 🐍 Python Backend Developer Roadmap

## Phase 1: Python Basics (1-2 months)
✅ Python Syntax & Data Types
✅ Control Flow & Loops
✅ Functions & Modules
✅ OOP Concepts
✅ File Handling
✅ Error Handling

## Phase 2: Web Frameworks (2-3 months)
✅ Flask Basics
✅ Django Framework
✅ FastAPI
✅ RESTful API Design
✅ Authentication & Authorization
✅ Database Integration

## Phase 3: Databases (2 months)
✅ SQL (PostgreSQL, MySQL)
✅ NoSQL (MongoDB)
✅ ORMs (SQLAlchemy, Django ORM)
✅ Database Design
✅ Migrations

## Phase 4: Advanced Topics (2-3 months)
✅ Async Programming
✅ Celery & Task Queues
✅ Caching (Redis)
✅ Testing (pytest, unittest)
✅ Docker & Containerization
✅ CI/CD Pipelines

## Phase 5: Deployment & DevOps (1-2 months)
✅ Linux Basics
✅ AWS/GCP/Azure
✅ Nginx/Apache
✅ Monitoring & Logging
✅ Security Best Practices

## Projects:
✅ REST API for Blog
✅ E-commerce Backend
✅ Real-time Chat Application
✅ Microservices Architecture

Start building and deploy your first API! 🚀`;
        } else {
            return `# 🎯 ${topic} Learning Roadmap

## Phase 1: Foundation (2-3 months)
✅ Understand the basics and core concepts
✅ Learn the fundamental syntax and principles
✅ Study best practices and conventions
✅ Set up your development environment
✅ Join relevant communities

## Phase 2: Intermediate Skills (3-4 months)
✅ Deep dive into advanced features
✅ Work on small projects
✅ Learn related tools and frameworks
✅ Study design patterns
✅ Read documentation thoroughly

## Phase 3: Advanced Mastery (4-6 months)
✅ Build complex projects
✅ Contribute to open source
✅ Optimize performance
✅ Learn testing strategies
✅ Study system design

## Phase 4: Professional Level (Ongoing)
✅ Build a portfolio
✅ Network with professionals
✅ Stay updated with trends
✅ Mentor others
✅ Specialize in a niche

## Resources:
📚 Official Documentation
🎥 Online Courses (Udemy, Coursera)
💻 GitHub Projects
🌐 Community Forums
📝 Technical Blogs

Remember: Consistency is key! Code every day! 💪`;
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

                {/* Input Area */}
                <Card className="p-6 sticky bottom-24">
                    <div className="space-y-4">
                        <div>
                            <label className="text-sm font-medium mb-2 block">What do you want to learn?</label>
                            <Input
                                placeholder="e.g., React, Python, Machine Learning, Web Development..."
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                onKeyPress={(e) => e.key === "Enter" && !loading && generateRoadmap()}
                                className="text-base"
                            />
                        </div>
                        <Button
                            onClick={generateRoadmap}
                            disabled={loading || !query.trim()}
                            className="w-full gradient-primary text-white"
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
                {chatHistory.length === 0 && (
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
                )}
            </main>

            <BottomNav />
        </div>
    );
}
