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
    const [activeFilter, setActiveFilter] = useState("All"); // could filter by "Open", "Remote" etc.
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
            setGigs(data || []);
        } catch (error) {
            console.error("Error fetching gigs:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchGigs();
    }, []);

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
                        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
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
