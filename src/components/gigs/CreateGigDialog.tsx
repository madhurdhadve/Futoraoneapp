import { useState } from "react";
import { useForm } from "react-hook-form";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Plus, Zap, Banknote } from "lucide-react";

interface CreateGigForm {
    title: string;
    description: string;
    price: number;
    location: string;
    skills_input: string; // Comma separated string for form
}

export const CreateGigDialog = ({ onGigCreated }: { onGigCreated: () => void }) => {
    const [open, setOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();
    const { register, handleSubmit, reset, formState: { errors } } = useForm<CreateGigForm>();

    const onSubmit = async (data: CreateGigForm) => {
        setIsLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("Not authenticated");

            const skillsArray = data.skills_input.split(',').map(s => s.trim()).filter(Boolean);

            const { error } = await supabase
                .from('gig_listings')
                .insert({
                    user_id: user.id,
                    title: data.title,
                    description: data.description,
                    price: Number(data.price),
                    location: data.location || "Remote",
                    skills_required: skillsArray,
                    status: 'open',
                    currency: 'INR'
                });

            if (error) throw error;

            toast({
                title: "Gig Posted! ⚡",
                description: "Your task is live. Get ready for applications!",
            });

            reset();
            setOpen(false);
            onGigCreated();

        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message,
                variant: "destructive"
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="gap-2 bg-yellow-400 hover:bg-yellow-500 text-black border-0 shadow-md font-semibold">
                    <Plus className="w-4 h-4" />
                    Post Gig
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-2xl">
                        <Zap className="w-6 h-6 text-yellow-500 fill-yellow-500" />
                        Post a Micro-Gig
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-4">
                    <div className="space-y-2">
                        <Label htmlFor="title">Task Title</Label>
                        <Input
                            id="title"
                            placeholder="e.g. Fix React Bug in Navbar"
                            {...register("title", { required: true })}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="price" className="flex items-center gap-2">
                            <Banknote className="w-4 h-4 text-green-600" />
                            Budget (INR)
                        </Label>
                        <Input
                            id="price"
                            type="number"
                            placeholder="e.g. 500"
                            {...register("price", { required: true, min: 1 })}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="skills">Required Skills (comma separated)</Label>
                        <Input
                            id="skills"
                            placeholder="e.g. React, CSS, Node.js"
                            {...register("skills_input", { required: true })}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="location">Location</Label>
                        <Input
                            id="location"
                            placeholder="Remote"
                            defaultValue="Remote"
                            {...register("location")}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">Task Details</Label>
                        <Textarea
                            id="description"
                            placeholder="Describe exactly what needs to be done..."
                            className="h-32"
                            {...register("description", { required: true })}
                        />
                    </div>

                    <Button type="submit" className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-bold" disabled={isLoading}>
                        {isLoading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Posting...
                            </>
                        ) : (
                            "Post Gig Assignment"
                        )}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    );
};
