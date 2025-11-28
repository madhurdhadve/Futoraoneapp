import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Upload, Image as ImageIcon } from "lucide-react";
import { BottomNav } from "@/components/BottomNav";

const CreateStory = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);
  const [caption, setCaption] = useState("");
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/") && !file.type.startsWith("video/")) {
        toast({
          title: "Invalid file type",
          description: "Please select an image or video file",
          variant: "destructive",
        });
        return;
      }
      setMediaFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleCreateStory = async () => {
    if (!mediaFile) {
      toast({
        title: "No media selected",
        description: "Please select an image or video",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Upload media to storage
      const fileExt = mediaFile.name.split(".").pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;

      const { error: uploadError, data: uploadData } = await supabase.storage
        .from("post-images")
        .upload(fileName, mediaFile);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("post-images")
        .getPublicUrl(fileName);

      // Create story
      const { error: storyError } = await supabase.from("stories").insert({
        user_id: user.id,
        media_url: publicUrl,
        media_type: mediaFile.type.startsWith("image/") ? "image" : "video",
        caption: caption || null,
      });

      if (storyError) throw storyError;

      toast({
        title: "Story created!",
        description: "Your story will expire in 24 hours",
      });

      navigate("/feed");
    } catch (error: any) {
      console.error("Error creating story:", error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="sticky top-0 z-10 bg-background border-b border-border">
        <div className="flex items-center gap-4 p-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="w-6 h-6" />
          </Button>
          <h1 className="text-xl font-bold text-foreground">Create Story</h1>
        </div>
      </div>

      <div className="p-4 space-y-4">
        <Card className="bg-card border-border">
          <CardContent className="p-6 space-y-4">
            {previewUrl ? (
              <div className="relative aspect-[9/16] max-h-[500px] rounded-lg overflow-hidden bg-muted">
                {mediaFile?.type.startsWith("image/") ? (
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <video
                    src={previewUrl}
                    controls
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center aspect-[9/16] max-h-[500px] border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-primary transition-colors">
                <ImageIcon className="w-12 h-12 text-muted-foreground mb-2" />
                <span className="text-sm text-muted-foreground">
                  Click to upload image or video
                </span>
                <Input
                  type="file"
                  accept="image/*,video/*"
                  className="hidden"
                  onChange={handleFileSelect}
                />
              </label>
            )}

            <Textarea
              placeholder="Add a caption (optional)"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              className="bg-background border-border text-foreground"
              rows={3}
            />

            {mediaFile && (
              <div className="flex gap-2">
                <Button
                  onClick={handleCreateStory}
                  disabled={uploading}
                  className="flex-1"
                >
                  {uploading ? "Creating..." : "Share Story"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setMediaFile(null);
                    setPreviewUrl(null);
                  }}
                >
                  Clear
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <BottomNav />
    </div>
  );
};

export default CreateStory;
