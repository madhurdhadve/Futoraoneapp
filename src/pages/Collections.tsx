import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Plus, Lock, Unlock, Trash2 } from "lucide-react";
import { BottomNav } from "@/components/BottomNav";

interface Collection {
  id: string;
  name: string;
  description: string | null;
  is_private: boolean;
  collection_items: { post_id: string; posts: { image_url: string | null } }[];
}

const Collections = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [collections, setCollections] = useState<Collection[]>([]);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    is_private: false,
  });

  useEffect(() => {
    fetchCollections();
  }, []);

  const fetchCollections = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from("saved_collections")
      .select(`
        *,
        collection_items(
          post_id,
          posts(image_url)
        )
      `)
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    setCollections((data as any) || []);
  };

  const createCollection = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || !formData.name.trim()) return;

    const { error } = await supabase
      .from("saved_collections")
      .insert({
        user_id: user.id,
        name: formData.name,
        description: formData.description || null,
        is_private: formData.is_private,
      });

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Collection created!" });
      setFormData({ name: "", description: "", is_private: false });
      setShowCreateDialog(false);
      fetchCollections();
    }
  };

  const deleteCollection = async (collectionId: string) => {
    const { error } = await supabase
      .from("saved_collections")
      .delete()
      .eq("id", collectionId);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Collection deleted!" });
      fetchCollections();
    }
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="p-4">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-foreground">Saved Collections</h1>
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="w-4 h-4 mr-2" />
            New
          </Button>
        </div>

        <div className="space-y-4">
          {collections.map((collection) => (
            <Card key={collection.id} className="group">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-foreground">{collection.name}</h3>
                      {collection.is_private ? (
                        <Lock className="w-4 h-4 text-muted-foreground" />
                      ) : (
                        <Unlock className="w-4 h-4 text-muted-foreground" />
                      )}
                    </div>
                    {collection.description && (
                      <p className="text-sm text-muted-foreground">{collection.description}</p>
                    )}
                    <p className="text-xs text-muted-foreground mt-1">
                      {collection.collection_items.length} posts
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => deleteCollection(collection.id)}
                  >
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>

                <div
                  className="grid grid-cols-4 gap-1 cursor-pointer"
                  onClick={() => navigate(`/collection/${collection.id}`)}
                >
                  {collection.collection_items.slice(0, 4).map((item, idx) => (
                    <div key={idx} className="aspect-square rounded overflow-hidden bg-muted">
                      {item.posts?.image_url ? (
                        <img
                          src={item.posts.image_url}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-muted" />
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Collection</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Collection Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Design Inspiration"
              />
            </div>
            <div>
              <Label htmlFor="description">Description (optional)</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="What's this collection about?"
                rows={3}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="private">Private Collection</Label>
              <Switch
                id="private"
                checked={formData.is_private}
                onCheckedChange={(checked) => setFormData({ ...formData, is_private: checked })}
              />
            </div>
            <Button onClick={createCollection} className="w-full">
              Create Collection
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <BottomNav />
    </div>
  );
};

export default Collections;
