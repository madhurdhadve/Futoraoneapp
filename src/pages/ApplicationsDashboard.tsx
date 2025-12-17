import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Inbox, Send, Briefcase, Zap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { ViewFounderApplicationsDialog } from "@/components/co-founder/ViewFounderApplicationsDialog";
import { ViewGigApplicationsDialog } from "@/components/gigs/ViewGigApplicationsDialog";
import { supabase } from "@/integrations/supabase/client";
import { BottomNav } from "@/components/BottomNav";

const ApplicationsDashboard = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [founderListings, setFounderListings] = useState<any[]>([]);
    const [gigListings, setGigListings] = useState<any[]>([]);
    const [sentFounderApps, setSentFounderApps] = useState<any[]>([]);
    const [sentGigApps, setSentGigApps] = useState<any[]>([]);
    const { toast } = useToast();

    useEffect(() => {
        fetchReceivedData();
    }, []);

    const fetchReceivedData = async () => {
        setLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                setLoading(false);
                return;
            }

            // Fetch founder listings with application counts
            const { data: founderData, error: founderError } = await supabase
                .from('founder_listings')
                .select(`
                    *,
                    applications:founder_applications(count)
                `)
                .eq('user_id', user.id);

            if (founderError) throw founderError;
            setFounderListings(founderData || []);

            // Fetch gigs with application counts
            const { data: gigData, error: gigError } = await supabase
                .from('gig_listings')
                .select(`
                    *,
                    applications:gig_applications(count)
                `)
                .eq('user_id', user.id);

            if (gigError) throw gigError;
            setGigListings(gigData || []);

            // Fetch sent founder applications
            const { data: sentFounderData, error: sentFounderError } = await supabase
                .from('founder_applications')
                .select(`
                    *,
                    listing:founder_listings(*)
                `)
                .eq('applicant_id', user.id);

            if (sentFounderError) throw sentFounderError;
            setSentFounderApps(sentFounderData || []);

            // Fetch sent gig applications
            const { data: sentGigData, error: sentGigError } = await supabase
                .from('gig_applications')
                .select(`
                    *,
                    listing:gig_listings(*)
                `)
                .eq('applicant_id', user.id);

            if (sentGigError) throw sentGigError;
            setSentGigApps(sentGigData || []);


        } catch (error) {
            console.error("Error fetching dashboard data:", error);
            toast({
                title: "Error",
                description: "Failed to load dashboard data.",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background pb-20">
            {/* Header */}
            <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-lg border-b border-border">
                <div className="container max-w-2xl mx-auto p-4 flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
                        <ArrowLeft className="w-6 h-6" />
                    </Button>
                    <div>
                        <h1 className="text-xl font-bold">Applications Dashboard</h1>
                        <p className="text-sm text-muted-foreground">Manage your requests and listings</p>
                    </div>
                </div>
            </div>

            <div className="container max-w-2xl mx-auto p-4">
                <Tabs defaultValue="received" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 mb-6">
                        <TabsTrigger value="received" className="gap-2">
                            <Inbox className="w-4 h-4" />
                            Received
                        </TabsTrigger>
                        <TabsTrigger value="sent" className="gap-2">
                            <Send className="w-4 h-4" />
                            Sent
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="received" className="space-y-4">
                        <div className="grid gap-6">
                            {/* Founder Listings Section */}
                            <div>
                                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                                    <span className="bg-primary/10 text-primary p-1 rounded">
                                        <Inbox className="w-4 h-4" />
                                    </span>
                                    Founder Listings
                                </h3>
                                {loading ? (
                                    <p className="text-muted-foreground">Loading...</p>
                                ) : founderListings.length === 0 ? (
                                    <Card className="bg-muted/30 border-dashed">
                                        <CardContent className="py-8 text-center text-muted-foreground">
                                            No founder listings posted yet.
                                        </CardContent>
                                    </Card>
                                ) : (
                                    <div className="grid gap-4">
                                        {founderListings.map(listing => (
                                            <Card key={listing.id} className="overflow-hidden">
                                                <CardContent className="p-4 flex items-center justify-between">
                                                    <div>
                                                        <h4 className="font-semibold truncate">{listing.role_needed}</h4>
                                                        <p className="text-sm text-muted-foreground truncate">{listing.industry} • {listing.location}</p>
                                                    </div>
                                                    <Badge variant={(listing.applications?.[0]?.count || 0) > 0 ? "default" : "secondary"}>
                                                        {listing.applications?.[0]?.count || 0} Applicants
                                                    </Badge>
                                                </CardContent>
                                                <div className="bg-muted/50 p-2 flex justify-end">
                                                    <ViewFounderApplicationsDialog
                                                        listingId={listing.id}
                                                        listingRole={listing.role_needed}
                                                    />
                                                </div>
                                            </Card>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Gigs Section */}
                            <div>
                                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                                    <span className="bg-yellow-500/10 text-yellow-600 p-1 rounded">
                                        <Zap className="w-4 h-4" />
                                    </span>
                                    Gig Listings
                                </h3>
                                {loading ? (
                                    <p className="text-muted-foreground">Loading...</p>
                                ) : gigListings.length === 0 ? (
                                    <Card className="bg-muted/30 border-dashed">
                                        <CardContent className="py-8 text-center text-muted-foreground">
                                            No gigs posted yet.
                                        </CardContent>
                                    </Card>
                                ) : (
                                    <div className="grid gap-4">
                                        {gigListings.map(gig => (
                                            <Card key={gig.id} className="overflow-hidden">
                                                <CardContent className="p-4 flex items-center justify-between">
                                                    <div>
                                                        <h4 className="font-semibold truncate">{gig.title}</h4>
                                                        <p className="text-sm text-muted-foreground truncate">₹{gig.price} • {gig.status}</p>
                                                    </div>
                                                    <Badge variant={(gig.applications?.[0]?.count || 0) > 0 ? "default" : "secondary"} className={(gig.applications?.[0]?.count || 0) > 0 ? "bg-yellow-500 hover:bg-yellow-600" : ""}>
                                                        {gig.applications?.[0]?.count || 0} Proposals
                                                    </Badge>
                                                </CardContent>
                                                <div className="bg-muted/50 p-2 flex justify-end">
                                                    <ViewGigApplicationsDialog
                                                        gigId={gig.id}
                                                        gigTitle={gig.title}
                                                    />
                                                </div>
                                            </Card>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="sent" className="space-y-4">
                        <div className="grid gap-6">
                            {/* Sent Founder Apps */}
                            <div>
                                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                                    <span className="bg-primary/10 text-primary p-1 rounded">
                                        <Briefcase className="w-4 h-4" />
                                    </span>
                                    Founder Roles Applied
                                </h3>
                                {loading ? (
                                    <p className="text-muted-foreground">Loading...</p>
                                ) : sentFounderApps.length === 0 ? (
                                    <Card className="bg-muted/30 border-dashed">
                                        <CardContent className="py-8 text-center text-muted-foreground">
                                            You haven't applied to any co-founder roles yet.
                                        </CardContent>
                                    </Card>
                                ) : (
                                    <div className="grid gap-4">
                                        {sentFounderApps.map(app => (
                                            <Card key={app.id} className="overflow-hidden">
                                                <CardContent className="p-4">
                                                    <div className="flex justify-between items-start mb-2">
                                                        <div>
                                                            <h4 className="font-semibold">{app.listing?.role_needed || "Unknown Role"}</h4>
                                                            <p className="text-sm text-muted-foreground">{app.listing?.industry}</p>
                                                        </div>
                                                        <Badge variant="outline">{new Date(app.created_at).toLocaleDateString()}</Badge>
                                                    </div>
                                                    <div className="bg-muted p-3 rounded-md text-sm italic">
                                                        "{app.message}"
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Sent Gig Apps */}
                            <div>
                                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                                    <span className="bg-yellow-500/10 text-yellow-600 p-1 rounded">
                                        <Zap className="w-4 h-4" />
                                    </span>
                                    Gigs Applied
                                </h3>
                                {loading ? (
                                    <p className="text-muted-foreground">Loading...</p>
                                ) : sentGigApps.length === 0 ? (
                                    <Card className="bg-muted/30 border-dashed">
                                        <CardContent className="py-8 text-center text-muted-foreground">
                                            You haven't applied to any gigs yet.
                                        </CardContent>
                                    </Card>
                                ) : (
                                    <div className="grid gap-4">
                                        {sentGigApps.map(app => (
                                            <Card key={app.id} className="overflow-hidden">
                                                <CardContent className="p-4">
                                                    <div className="flex justify-between items-start mb-2">
                                                        <div>
                                                            <h4 className="font-semibold">{app.listing?.title || "Unknown Gig"}</h4>
                                                            <p className="text-sm text-muted-foreground">Bid: ₹{app.bid_amount}</p>
                                                        </div>
                                                        <Badge variant="outline">{new Date(app.created_at).toLocaleDateString()}</Badge>
                                                    </div>
                                                    <div className="bg-muted p-3 rounded-md text-sm italic">
                                                        "{app.proposal}"
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </TabsContent>
                </Tabs>
            </div>

            <BottomNav />
        </div>
    );
};

export default ApplicationsDashboard;
