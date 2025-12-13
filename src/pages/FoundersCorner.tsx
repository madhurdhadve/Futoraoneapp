import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { FounderListing, FounderListingCard } from "@/components/co-founder/FounderListingCard";
import { CreateListingDialog } from "@/components/co-founder/CreateListingDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Search, Filter } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { BottomNav } from "@/components/BottomNav";

const FoundersCorner = () => {
    const [listings, setListings] = useState<FounderListing[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [activeFilter, setActiveFilter] = useState("All");
    const navigate = useNavigate();

    const fetchListings = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('founder_listings')
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
                setListings(MOCK_FOUNDER_LISTINGS);
            } else {
                setListings(data);
            }
        } catch (error) {
            console.error("Error fetching listings:", error);
            // Fallback to mock data on error/empty
            setListings(MOCK_FOUNDER_LISTINGS);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchListings();
    }, []);

    const MOCK_FOUNDER_LISTINGS: FounderListing[] = [
        {
            id: "1",
            user_id: "u1",
            role_needed: "CTO / Tech Lead",
            idea_description: "Building a decentralized marketplace for freelance designers. I handle business & marketing, need someone who can build the MVP on Solana/Polkadot.",
            equity_range: "30-40%",
            stage: "Idea Phase",
            industry: "Fintech",
            location: "Remote",
            created_at: new Date().toISOString(),
            profiles: {
                full_name: "Aisha Verma",
                avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=Aisha",
                username: "aisha_v"
            }
        },
        {
            id: "2",
            user_id: "u2",
            role_needed: "Marketing Co-founder",
            idea_description: "An AI-powered edtech platform that personalizes curriculum for ADHD students. MVP is ready, need someone to drive user acquisition.",
            equity_range: "15-25%",
            stage: "MVP Ready",
            industry: "Edtech",
            location: "Bangalore",
            created_at: new Date(Date.now() - 86400000).toISOString(),
            profiles: {
                full_name: "Rohan Das",
                avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=Rohan",
                username: "rohan_d"
            }
        },
        {
            id: "3",
            user_id: "u3",
            role_needed: "Full Stack Dev",
            idea_description: "SaaS tool for automated legal document review for Indian SMBs. Need a strong developer with NLP experience.",
            equity_range: "20-30%",
            stage: "Early Revenue",
            industry: "SaaS",
            location: "Mumbai / Remote",
            created_at: new Date(Date.now() - 172800000).toISOString(),
            profiles: {
                full_name: "Priya Nair",
                avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=Priya",
                username: "priya_n"
            }
        },
        {
            id: "4",
            user_id: "u4",
            role_needed: "Product Designer (UI/UX)",
            idea_description: "Revolutionizing the chai-drinking experience with a smart IoT tea maker and subscription app.",
            equity_range: "10-20%",
            stage: "Prototype",
            industry: "IoT / FoodTech",
            location: "Delhi",
            created_at: new Date(Date.now() - 259200000).toISOString(),
            profiles: {
                full_name: "Vikram Singh",
                avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=Vikram",
                username: "vikram_s"
            }
        },
        {
            id: "5",
            user_id: "u5",
            role_needed: "AI Researcher / Engineer",
            idea_description: "Developing a generative AI model specifically for Indian regional languages to help rural education.",
            equity_range: "25-35%",
            stage: "Research",
            industry: "AI/ML",
            location: "Remote",
            created_at: new Date(Date.now() - 345600000).toISOString(),
            profiles: {
                full_name: "Dr. Anjali Gupta",
                avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=Anjali",
                username: "anjali_ai"
            }
        },
        {
            id: "6",
            user_id: "u6",
            role_needed: "Sales Head",
            idea_description: "B2B SaaS platform for warehouse logistics optimization. We have the product, need someone to close enterprise deals.",
            equity_range: "10-15% + Comm",
            stage: "Growth",
            industry: "SaaS",
            location: "Pune",
            created_at: new Date(Date.now() - 432000000).toISOString(),
            profiles: {
                full_name: "Karthik R",
                avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=Karthik",
                username: "karthik_logistics"
            }
        },
        {
            id: "7",
            user_id: "u7",
            role_needed: "Mobile App Dev (Flutter)",
            idea_description: "Social fitness app connecting gym buddies in Tier 2 cities. Designs ready, backend ready.",
            equity_range: "5-10%",
            stage: "Development",
            industry: "HealthTech",
            location: "Hyderabad",
            created_at: new Date(Date.now() - 518400000).toISOString(),
            profiles: {
                full_name: "Sneha Reddy",
                avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sneha",
                username: "sneha_fit"
            }
        },
        {
            id: "8",
            user_id: "u8",
            role_needed: "Blockchain Dev",
            idea_description: "Secure medical record storage on blockchain to give patients full control of their data.",
            equity_range: "30-40%",
            stage: "Idea Phase",
            industry: "MedTech / Web3",
            location: "Remote",
            created_at: new Date(Date.now() - 604800000).toISOString(),
            profiles: {
                full_name: "Arun Kumar",
                avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=Arun",
                username: "arun_med3"
            }
        },
        {
            id: "9",
            user_id: "u9",
            role_needed: "Operations Lead",
            idea_description: "Aggregator for EV charging stations across India. Need someone to manage partnerships and ground ops.",
            equity_range: "10-20%",
            stage: "Seed Funded",
            industry: "CleanTech",
            location: "Bangalore",
            created_at: new Date(Date.now() - 691200000).toISOString(),
            profiles: {
                full_name: "Meera Patel",
                avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=Meera",
                username: "meera_ev"
            }
        },
        {
            id: "10",
            user_id: "u10",
            role_needed: "Game Developer (Unity)",
            idea_description: "Building a mythology-based RPG game rooted in Indian history. Need a passionate Unity dev.",
            equity_range: "20-30%",
            stage: "Pre-Production",
            industry: "Gaming",
            location: "Remote",
            created_at: new Date(Date.now() - 777600000).toISOString(),
            profiles: {
                full_name: "Siddharth M",
                avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=Siddharth",
                username: "sid_games"
            }
        }
    ];

    const filteredListings = listings.filter(listing => {
        const matchesSearch =
            listing.role_needed.toLowerCase().includes(searchTerm.toLowerCase()) ||
            listing.idea_description.toLowerCase().includes(searchTerm.toLowerCase()) ||
            listing.industry.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesFilter = activeFilter === "All" || listing.industry === activeFilter;

        return matchesSearch && matchesFilter;
    });

    return (
        <div className="min-h-screen bg-background pb-20">
            {/* Header */}
            <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-lg border-b border-border">
                <div className="container max-w-2xl mx-auto p-4">
                    <div className="flex items-center gap-4 mb-4">
                        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
                            <ArrowLeft className="w-6 h-6" />
                        </Button>
                        <div className="flex-1">
                            <h1 className="text-2xl font-bold bg-gradient-to-r from-orange-500 to-pink-600 bg-clip-text text-transparent">
                                Founders Corner
                            </h1>
                            <p className="text-sm text-muted-foreground flex gap-2 items-center">
                                Find your perfect co-founder
                                <span className="text-xs px-2 py-0.5 bg-secondary rounded-full cursor-pointer hover:bg-secondary/80 text-foreground" onClick={() => navigate("/category/Founder's Corner")}>
                                    View Stories ↗
                                </span>
                            </p>
                        </div>
                    </div>

                    <div className="flex gap-2">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                                placeholder="Search roles, ideas..."
                                className="pl-9 bg-secondary/50 border-0"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <CreateListingDialog onPostCreated={fetchListings} />
                    </div>

                    {/* Filters */}
                    <div className="flex gap-2 mt-4 overflow-x-auto pb-2 scrollbar-hide">
                        {["All", "Fintech", "Edtech", "AI/ML", "SaaS"].map((filter) => (
                            <Badge
                                key={filter}
                                variant={activeFilter === filter ? "default" : "outline"}
                                className={`cursor-pointer whitespace-nowrap px-4 py-1.5 ${activeFilter === filter
                                    ? "bg-foreground text-background"
                                    : "hover:bg-secondary"
                                    }`}
                                onClick={() => setActiveFilter(filter)}
                            >
                                {filter}
                            </Badge>
                        ))}
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="container max-w-2xl mx-auto p-4 space-y-4">
                {loading ? (
                    // Skeleton loading
                    Array(3).fill(0).map((_, i) => (
                        <div key={i} className="h-48 rounded-xl bg-muted/20 animate-pulse" />
                    ))
                ) : filteredListings.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="bg-muted/30 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Filter className="w-8 h-8 text-muted-foreground" />
                        </div>
                        <h3 className="text-lg font-semibold">No listings found</h3>
                        <p className="text-muted-foreground mb-6">Be the first to post a co-founder listing!</p>
                        <CreateListingDialog onPostCreated={fetchListings} />
                    </div>
                ) : (
                    filteredListings.map((listing) => (
                        <FounderListingCard key={listing.id} listing={listing} />
                    ))
                )}
            </div>

            <BottomNav />
        </div>
    );
};

export default FoundersCorner;
