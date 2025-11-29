import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2 } from "lucide-react";
import { BottomNav } from "@/components/BottomNav";

interface Highlight {
  id: string;
  title: string;
  cover_image_url: string | null;
  story_highlight_items: { story_id: string; stories: { media_url: string } }[];
}

const Highlights = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [highlights, setHighlights] = useState<Highlight[]>([]);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    fetchHighlights();
  }, []);

  const fetchHighlights = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    setCurrentUserId(user.id);

    const { data } = await supabase
      .from("story_highlights")
      .select(`
        *,
        story_highlight_items(
          story_id,
          stories(media_url)
        )
      `)
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    setHighlights((data as any) || []);
  };

  const createHighlight = async () => {
    if (!currentUserId || !newTitle.trim()) return;

    const { error } = await supabase
      .from("story_highlights")
      .insert({
        user_id: currentUserId,
        title: newTitle,
      });

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Highlight created!" });
      setNewTitle("");
      setShowCreateDialog(false);
      fetchHighlights();
    }
  };

  const deleteHighlight = async (highlightId: string) => {
    const { error } = await supabase
      .from("story_highlights")
      .delete()
      .eq("id", highlightId);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Highlight deleted!" });
      fetchHighlights();
    }
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="p-4">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-foreground">Story Highlights</h1>
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="w-4 h-4 mr-2" />
            New
          </Button>
        </div>

        <div className="grid grid-cols-3 gap-4">
          {highlights.map((highlight) => (
            <Card key={highlight.id} className="relative group">
              <CardContent className="p-0">
                <div
                  className="aspect-square rounded-lg overflow-hidden cursor-pointer"
                  onClick={() => navigate(`/highlight/${highlight.id}`)}
                >
                  {highlight.story_highlight_items[0]?.stories?.media_url ? (
                    <img
                      src={highlight.story_highlight_items[0].stories.media_url}
                      alt={highlight.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-muted flex items-center justify-center">
                      <span className="text-muted-foreground">No stories</span>
                    </div>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-black/50 hover:bg-black/70"
                  onClick={() => deleteHighlight(highlight.id)}
                >
                  <Trash2 className="w-4 h-4 text-white" />
                </Button>
                <p className="text-center mt-2 text-sm font-medium">{highlight.title}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Highlight</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="e.g., Travel, Food, Projects"
              />
            </div>
            <Button onClick={createHighlight} className="w-full">
              Create Highlight
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <BottomNav />
    </div>
  );
};

export default Highlights;
