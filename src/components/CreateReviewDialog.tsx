import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Star } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";

interface ReviewDialogProps {
    revieweeId: string;
    revieweeName: string;
}

export function CreateReviewDialog({ revieweeId, revieweeName }: ReviewDialogProps) {
    const [open, setOpen] = useState(false);
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { toast } = useToast();
    const queryClient = useQueryClient();

    const handleSubmit = async () => {
        if (rating === 0) {
            toast({
                title: "Rating required",
                description: "Please select a star rating",
                variant: "destructive",
            });
            return;
        }

        setIsSubmitting(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("Not authenticated");

            const { error } = await supabase
                .from("reviews")
                .insert({
                    reviewer_id: user.id,
                    reviewee_id: revieweeId,
                    rating,
                    comment,
                });

            if (error) {
                if (error.code === '23505') { // Unique violation
                    throw new Error("You have already reviewed this user.");
                }
                throw error;
            };

            toast({
                title: "Review submitted",
                description: "Thank you for your feedback!",
            });

            setOpen(false);
            setRating(0);
            setComment("");

            // Invalidate queries to refresh data
            queryClient.invalidateQueries({ queryKey: ["reviews", revieweeId] });
            queryClient.invalidateQueries({ queryKey: ["profile", revieweeId] }); // To refresh trust score

        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message || "Failed to submit review",
                variant: "destructive",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" className="gap-2">
                    <Star className="w-4 h-4" />
                    Write Review
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Review {revieweeName}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="flex justify-center gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <button
                                key={star}
                                type="button"
                                onClick={() => setRating(star)}
                                className="focus:outline-none transition-transform hover:scale-110"
                            >
                                <Star
                                    className={`w-8 h-8 ${star <= rating
                                            ? "fill-yellow-400 text-yellow-400"
                                            : "text-muted-foreground"
                                        }`}
                                />
                            </button>
                        ))}
                    </div>
                    <div className="text-center text-sm text-muted-foreground">
                        {rating === 0 ? "Select a rating" : `${rating} out of 5 stars`}
                    </div>
                    <Textarea
                        placeholder="Share your experience working with this person..."
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        className="min-h-[100px]"
                    />
                    <div className="flex justify-end gap-2">
                        <Button variant="ghost" onClick={() => setOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleSubmit} disabled={isSubmitting}>
                            {isSubmitting ? "Submitting..." : "Post Review"}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
