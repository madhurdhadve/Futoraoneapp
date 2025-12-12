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
            setListings(data || []);
        } catch (error) {
            console.error("Error fetching listings:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchListings();
    }, []);

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
                        <div>
                            <h1 className="text-2xl font-bold bg-gradient-to-r from-orange-500 to-pink-600 bg-clip-text text-transparent">
                                Founders Corner
                            </h1>
                            <p className="text-sm text-muted-foreground">Find your perfect co-founder</p>
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
