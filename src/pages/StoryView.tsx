import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface Story {
  id: string;
  user_id: string;
  media_url: string;
  media_type: string;
  created_at: string;
  caption: string | null;
  profiles: {
    username: string;
    avatar_url: string | null;
  };
}

const StoryView = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [stories, setStories] = useState<Story[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStories();
  }, [userId]);

  useEffect(() => {
    if (stories.length > 0) {
      trackView();
    }
  }, [currentIndex, stories]);

  const fetchStories = async () => {
    if (!userId) return;

    const { data } = await supabase
      .from("stories")
      .select(
        `
        id,
        user_id,
        media_url,
        media_type,
        created_at,
        caption,
        profiles!stories_user_id_fkey(username, avatar_url)
      `
      )
      .eq("user_id", userId)
      .gt("expires_at", new Date().toISOString())
      .order("created_at", { ascending: true });

    if (data) {
      setStories(data as any);
    }
    setLoading(false);
  };

  const trackView = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || !stories[currentIndex]) return;

    await supabase.from("story_views").insert({
      story_id: stories[currentIndex].id,
      viewer_id: user.id,
    });
  };

  const goToNext = () => {
    if (currentIndex < stories.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      navigate("/feed");
    }
  };

  const goToPrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <p className="text-white">Loading...</p>
      </div>
    );
  }

  if (stories.length === 0) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <p className="text-white">No stories available</p>
      </div>
    );
  }

  const currentStory = stories[currentIndex];

  return (
    <div className="min-h-screen bg-black relative">
      {/* Progress bars */}
      <div className="absolute top-0 left-0 right-0 z-20 flex gap-1 p-2">
        {stories.map((_, index) => (
          <div
            key={index}
            className="flex-1 h-1 bg-white/30 rounded-full overflow-hidden"
          >
            <div
              className={`h-full bg-white transition-all ${
                index < currentIndex
                  ? "w-full"
                  : index === currentIndex
                  ? "w-1/2"
                  : "w-0"
              }`}
            />
          </div>
        ))}
      </div>

      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-20 p-4 pt-6 bg-gradient-to-b from-black/50 to-transparent">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10 border-2 border-white">
              <AvatarImage src={currentStory.profiles.avatar_url || undefined} />
              <AvatarFallback>{currentStory.profiles.username[0]?.toUpperCase()}</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-white font-semibold">{currentStory.profiles.username}</p>
              <p className="text-white/70 text-xs">
                {formatDistanceToNow(new Date(currentStory.created_at), { addSuffix: true })}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white/20"
            onClick={() => navigate("/feed")}
          >
            <X className="w-6 h-6" />
          </Button>
        </div>
      </div>

      {/* Story content */}
      <div className="h-screen flex items-center justify-center">
        {currentStory.media_type === "image" ? (
          <img
            src={currentStory.media_url}
            alt="Story"
            className="max-h-screen w-full object-contain"
          />
        ) : (
          <video
            src={currentStory.media_url}
            controls
            autoPlay
            className="max-h-screen w-full object-contain"
          />
        )}
      </div>

      {/* Caption */}
      {currentStory.caption && (
        <div className="absolute bottom-20 left-0 right-0 p-4 bg-gradient-to-t from-black/50 to-transparent">
          <p className="text-white text-center">{currentStory.caption}</p>
        </div>
      )}

      {/* Navigation areas */}
      <div className="absolute inset-0 flex">
        <button
          onClick={goToPrevious}
          className="flex-1 cursor-pointer"
          disabled={currentIndex === 0}
        >
          {currentIndex > 0 && (
            <ChevronLeft className="absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 text-white opacity-50 hover:opacity-100" />
          )}
        </button>
        <button onClick={goToNext} className="flex-1 cursor-pointer">
          {currentIndex < stories.length - 1 && (
            <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 text-white opacity-50 hover:opacity-100" />
          )}
        </button>
      </div>
    </div>
  );
};

export default StoryView;
