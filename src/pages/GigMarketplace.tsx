import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { GigListing, GigCard } from "@/components/gigs/GigCard";
import { CreateGigDialog } from "@/components/gigs/CreateGigDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Search, Filter, Briefcase } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { BottomNav } from "@/components/BottomNav";

const GigMarketplace = () => {
    const [gigs, setGigs] = useState<GigListing[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [activeFilter, setActiveFilter] = useState("All");
    const navigate = useNavigate();

    const fetchGigs = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('gig_listings')
                .select(`
          *,
          profiles:user_id (
            full_name,
            username,
            avatar_url
          )
        `)
                .order('created_at', { ascending: false });

            if (error) throw error;

            // Integrate Mock Data if DB is empty
            if (!data || data.length === 0) {
                setGigs(MOCK_GIG_LISTINGS);
            } else {
                setGigs(data);
            }
        } catch (error) {
            console.error("Error fetching gigs:", error);
            // Fallback to mock data on error
            setGigs(MOCK_GIG_LISTINGS);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchGigs();
    }, []);

    const MOCK_GIG_LISTINGS: GigListing[] = [
        {
            id: "1",
            user_id: "u1",
            title: "Build a Landing Page in React",
            description: "Need a responsive landing page for my SaaS product. Designs are ready in Figma. Deadline: 3 days.",
            price: 5000,
            currency: "INR",
            status: "open",
            location: "Remote",
            skills_required: ["React", "Tailwind CSS", "Figma"],
            created_at: new Date().toISOString(),
            profiles: {
                full_name: "Rahul Gupta",
                avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=Rahul",
                username: "rahul_g"
            }
        },
        {
            id: "2",
            user_id: "u2",
            title: "Logo Design for EdTech Startup",
            description: "Looking for a modern, minimalistic logo for an education platform. Need source files and branding guidelines.",
            price: 2500,
            currency: "INR",
            status: "open",
            location: "Remote",
            skills_required: ["Graphic Design", "Illustrator", "Branding"],
            created_at: new Date(Date.now() - 86400000).toISOString(),
            profiles: {
                full_name: "Priya Sharma",
                avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=Priya",
                username: "priya_s"
            }
        },
        {
            id: "3",
            user_id: "u3",
            title: "Fix Authentication Bug in Node.js App",
            description: "We are facing an issue with JWT token refresh expiration. Need an expert to debug and fix it ASAP.",
            price: 3000,
            currency: "INR",
            status: "open",
            location: "Remote",
            skills_required: ["Node.js", "Express", "JWT"],
            created_at: new Date(Date.now() - 172800000).toISOString(),
            profiles: {
                full_name: "Amit Patel",
                avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=Amit",
                username: "amit_backend"
            }
        },
        {
            id: "4",
            user_id: "u4",
            title: "Write 5 SEO Blog Posts for Tech Niche",
            description: "Need high-quality, technical blog posts about Cloud Computing and AI. Each post 1000 words.",
            price: 1500,
            currency: "INR",
            status: "open",
            location: "Remote",
            skills_required: ["Content Writing", "SEO", "Technical Writing"],
            created_at: new Date(Date.now() - 259200000).toISOString(),
            profiles: {
                full_name: "Sneha Kapoor",
                avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sneha",
                username: "sneha_writer"
            }
        },
        {
            id: "5",
            user_id: "u5",
            title: "Convert Website to Mobile App (Flutter)",
            description: "We have a website and need a basic wrapper app or simple Flutter app with webview and notifications.",
            price: 8000,
            currency: "INR",
            status: "open",
            location: "Remote",
            skills_required: ["Flutter", "Android", "iOS"],
            created_at: new Date(Date.now() - 345600000).toISOString(),
            profiles: {
                full_name: "Vikram Singh",
                avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=Vikram",
                username: "vikram_app"
            }
        },
        {
            id: "6",
            user_id: "u6",
            title: "Setup CI/CD Pipeline on GitHub Actions",
            description: "Need to automate deployment to AWS EC2 whenever code is pushed to main branch.",
            price: 4000,
            currency: "INR",
            status: "open",
            location: "Remote",
            skills_required: ["DevOps", "AWS", "GitHub Actions"],
            created_at: new Date(Date.now() - 432000000).toISOString(),
            profiles: {
                full_name: "Arjun Reddy",
                avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=Arjun",
                username: "arun_devops"
            }
        },
        {
            id: "7",
            user_id: "u7",
            title: "Video Editing for YouTube Tech Channel",
            description: "Edit a 10-minute tech review video. Add subtitles, transitions, and background music.",
            price: 2000,
            currency: "INR",
            status: "open",
            location: "Remote",
            skills_required: ["Video Editing", "Premiere Pro", "After Effects"],
            created_at: new Date(Date.now() - 518400000).toISOString(),
            profiles: {
                full_name: "Anjali Das",
                avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=Anjali",
                username: "anjali_yt"
            }
        },
        {
            id: "8",
            user_id: "u8",
            title: "Python Script for Web Scraping",
            description: "Scrape product prices from 3 e-commerce sites and save to CSV. Must handle anti-bot measures.",
            price: 3500,
            currency: "INR",
            status: "open",
            location: "Remote",
            skills_required: ["Python", "Selenium", "BeautifulSoup"],
            created_at: new Date(Date.now() - 604800000).toISOString(),
            profiles: {
                full_name: "Karthik M",
                avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=Karthik",
                username: "karthik_data"
            }
        },
        {
            id: "9",
            user_id: "u9",
            title: "Social Media Manager for Startup",
            description: "Manage Twitter and LinkedIn for a month. Create 3 posts/week and engage with audience.",
            price: 6000,
            currency: "INR",
            status: "open",
            location: "Remote",
            skills_required: ["Social Media", "Marketing", "Copywriting"],
            created_at: new Date(Date.now() - 691200000).toISOString(),
            profiles: {
                full_name: "Meera Nair",
                avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=Meera",
                username: "meera_social"
            }
        },
        {
            id: "10",
            user_id: "u10",
            title: "Teach Me Docker Basics",
            description: "Looking for a 1-hour 1:1 session to understand Docker, Containers, and Docker Compose.",
            price: 1000,
            currency: "INR",
            status: "open",
            location: "Zoom",
            skills_required: ["Docker", "Teaching", "DevOps"],
            created_at: new Date(Date.now() - 777600000).toISOString(),
            profiles: {
                full_name: "Siddharth J",
                avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=Siddharth",
                username: "sid_student"
            }
        }
    ];

    const filteredGigs = gigs.filter(gig => {
        const matchesSearch =
            gig.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            gig.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
            gig.skills_required?.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()));

        // Basic status filter for now
        const matchesFilter = activeFilter === "All" || gig.status === "open";

        return matchesSearch && matchesFilter;
    });

    return (
        <div className="min-h-screen bg-background pb-20">
            {/* Header */}
            <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-lg border-b border-border">
                <div className="container max-w-2xl mx-auto p-4">
                    <div className="flex items-center gap-4 mb-4">
                        <Button variant="ghost" size="icon" onClick={() => navigate('/explore')}>
                            <ArrowLeft className="w-6 h-6" />
                        </Button>
                        <div>
                            <h1 className="text-2xl font-bold bg-gradient-to-r from-yellow-500 to-green-600 bg-clip-text text-transparent flex items-center gap-2">
                                Gig Marketplace
                            </h1>
                            <p className="text-sm text-muted-foreground">Find micro-gigs & earn pocket money</p>
                        </div>
                    </div>

                    <div className="flex gap-2">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                                placeholder="Search React, Logo Design, etc..."
                                className="pl-9 bg-secondary/50 border-0"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <CreateGigDialog onGigCreated={fetchGigs} />
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="container max-w-2xl mx-auto p-4 space-y-4">
                {loading ? (
                    // Skeleton loading
                    Array(3).fill(0).map((_, i) => (
                        <div key={i} className="h-40 rounded-xl bg-muted/20 animate-pulse" />
                    ))
                ) : filteredGigs.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="bg-muted/30 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Briefcase className="w-8 h-8 text-muted-foreground" />
                        </div>
                        <h3 className="text-lg font-semibold">No gigs available yet</h3>
                        <p className="text-muted-foreground mb-6">Be the first to post a task!</p>
                        <CreateGigDialog onGigCreated={fetchGigs} />
                    </div>
                ) : (
                    filteredGigs.map((gig) => (
                        <GigCard key={gig.id} gig={gig} />
                    ))
                )}
            </div>

            <BottomNav />
        </div>
    );
};

export default GigMarketplace;
