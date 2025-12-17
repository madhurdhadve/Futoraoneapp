import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Briefcase, Clock, IndianRupee, FileText } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface GigApplication {
    id: string;
    applicant_id: string;
    proposal: string;
    bid_amount: number;
    expected_timeline: string;
    created_at: string;
    status: string;
    applicant: {
        full_name: string;
        username: string;
        avatar_url: string | null;
    };
}

interface ViewGigApplicationsDialogProps {
    gigId: string;
    gigTitle: string;
}

export const ViewGigApplicationsDialog = ({ gigId, gigTitle }: ViewGigApplicationsDialogProps) => {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [applications, setApplications] = useState<GigApplication[]>([]);

    useEffect(() => {
        if (open) {
            fetchApplications();
        }
    }, [open, gigId]);

    const fetchApplications = async () => {
        setLoading(true);
        try {
            // Check UUID validity
            const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(gigId);

            if (!isUuid) {
                setApplications([]);
                setLoading(false);
                return;
            }

            const { data, error } = await supabase
                .from('gig_applications')
                .select(`
                    *,
                    applicant:applicant_id (
                        full_name,
                        username,
                        avatar_url
                    )
                `)
                .eq('gig_id', gigId)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setApplications(data || []);
        } catch (error) {
            console.error("Error fetching applications:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleHire = async (applicationId: string, applicantId: string, bidAmount: number) => {
        try {
            setLoading(true);

            // 1. Update Application Status
            const { error: appError } = await supabase
                .from('gig_applications')
                .update({ status: 'accepted' })
                .eq('id', applicationId);

            if (appError) throw appError;

            // 2. Update Gig Status
            const { error: gigError } = await supabase
                .from('gig_listings')
                .update({ status: 'assigned' })
                .eq('id', gigId);

            if (gigError) throw gigError;

            // 3. Close dialog and maybe refresh (handled by parent usually, but we can just close)
            setOpen(false);
            // Optionally trigger a toast or callback
            // window.location.reload(); // Simple reload for now or use a context recharge
        } catch (error) {
            console.error("Error hiring:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" className="w-full gap-2 border-yellow-500/30 text-yellow-600 hover:bg-yellow-50 dark:text-yellow-400 dark:hover:bg-yellow-900/10">
                    <FileText className="w-4 h-4" />
                    View Proposals
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] max-h-[80vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle>Proposals for {gigTitle}</DialogTitle>
                    <DialogDescription>
                        Review bids and proposals from freelancers.
                    </DialogDescription>
                </DialogHeader>

                <div className="flex-1 overflow-hidden mt-4">
                    {loading ? (
                        <div className="flex justify-center py-12">
                            <Loader2 className="w-8 h-8 animate-spin text-primary" />
                        </div>
                    ) : applications.length === 0 ? (
                        <div className="text-center py-12 bg-muted/30 rounded-lg border border-dashed">
                            <Briefcase className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                            <h3 className="font-semibold text-lg">No proposals yet</h3>
                            <p className="text-muted-foreground">Wait for freelancers to discover your gig!</p>
                        </div>
                    ) : (
                        <ScrollArea className="h-[50vh] pr-4">
                            <div className="space-y-4">
                                {applications.map((app) => (
                                    <div key={app.id} className="p-4 rounded-xl border bg-card hover:bg-muted/30 transition-colors">
                                        <div className="flex justify-between items-start mb-3">
                                            <div className="flex items-center gap-3">
                                                <Avatar className="h-10 w-10 border">
                                                    <AvatarImage src={app.applicant?.avatar_url || undefined} />
                                                    <AvatarFallback>{app.applicant?.full_name?.[0]}</AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <h4 className="font-semibold">{app.applicant?.full_name}</h4>
                                                    <p className="text-xs text-muted-foreground">@{app.applicant?.username}</p>
                                                </div>
                                            </div>
                                            <div className="flex flex-col items-end gap-1">
                                                <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-green-200">
                                                    ₹{app.bid_amount}
                                                </Badge>
                                                <span className="text-xs text-muted-foreground">
                                                    {formatDistanceToNow(new Date(app.created_at), { addSuffix: true })}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground mb-2">
                                            <Clock className="w-3.5 h-3.5" />
                                            Timeline: {app.expected_timeline}
                                        </div>

                                        <div className="bg-muted/50 p-3 rounded-lg text-sm mb-3">
                                            <p className="whitespace-pre-wrap">{app.proposal}</p>
                                        </div>

                                        <Button
                                            className="w-full bg-green-600 hover:bg-green-700 text-white"
                                            onClick={() => handleHire(app.id, app.applicant_id, app.bid_amount)}
                                        >
                                            Hire Applicant
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </ScrollArea>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
};
