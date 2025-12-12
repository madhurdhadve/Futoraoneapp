import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Plus } from "lucide-react";

interface CreateGroupDialogProps {
    onGroupCreated?: () => void;
}

export function CreateGroupDialog({ onGroupCreated }: CreateGroupDialogProps) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [isPublic, setIsPublic] = useState(true);
    const { toast } = useToast();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("Not authenticated");

            // 1. Create Group
            const { data: group, error: groupError } = await supabase
                .from('groups')
                .insert({
                    name,
                    description,
                    is_public: isPublic,
                    created_by: user.id
                })
                .select()
                .single();

            if (groupError) throw groupError;

            // 2. Add Creator as Admin
            const { error: memberError } = await supabase
                .from('group_members')
                .insert({
                    group_id: group.id,
                    user_id: user.id,
                    role: 'admin'
                });

            if (memberError) throw memberError;

            toast({
                title: "Success!",
                description: "Group created successfully.",
            });

            setOpen(false);
            setName("");
            setDescription("");
            if (onGroupCreated) onGroupCreated();
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message,
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button size="sm" className="gap-2">
                    <Plus className="h-4 w-4" />
                    Create Group
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Create a Community</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Group Name</Label>
                        <Input
                            id="name"
                            placeholder="e.g. React Developers India"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                            id="description"
                            placeholder="What is this group about?"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />
                    </div>

                    <div className="flex items-center justify-between space-x-2">
                        <Label htmlFor="public-mode">Public Group</Label>
                        <Switch
                            id="public-mode"
                            checked={isPublic}
                            onCheckedChange={setIsPublic}
                        />
                    </div>
                    <p className="text-xs text-muted-foreground">
                        {isPublic
                            ? "Anyone can find and join this group."
                            : "Only invited members can join."}
                    </p>

                    <Button type="submit" className="w-full" disabled={loading}>
                        {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                        Create Group
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    );
}
