import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowLeft, Eye } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { BottomNav } from "@/components/BottomNav";

interface ProfileView {
  id: string;
  viewed_at: string;
  profiles: {
    id: string;
    username: string;
    full_name: string;
    avatar_url: string | null;
  };
}

const ProfileViews = () => {
  const navigate = useNavigate();
  const [views, setViews] = useState<ProfileView[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfileViews();
  }, []);

  const fetchProfileViews = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from("profile_views")
      .select(
        `
        id,
        viewed_at,
        profiles!profile_views_viewer_id_fkey(id, username, full_name, avatar_url)
      `
      )
      .eq("profile_id", user.id)
      .order("viewed_at", { ascending: false })
      .limit(50);

    if (data) {
      setViews(data as any);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="sticky top-0 z-10 bg-background border-b border-border">
        <div className="flex items-center gap-4 p-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-6 h-6" />
          </Button>
          <h1 className="text-xl font-bold text-foreground">Profile Views</h1>
        </div>
      </div>

      <div className="p-4">
        {loading ? (
          <p className="text-center text-muted-foreground py-8">Loading...</p>
        ) : views.length === 0 ? (
          <Card className="bg-card border-border">
            <CardContent className="p-8 text-center">
              <Eye className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No profile views yet</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {views.map((view) => (
              <Card
                key={view.id}
                className="bg-card border-border cursor-pointer hover:bg-muted transition-colors"
                onClick={() => navigate(`/user/${view.profiles.id}`)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={view.profiles.avatar_url || undefined} />
                      <AvatarFallback>
                        {view.profiles.username[0]?.toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-semibold text-foreground">
                        {view.profiles.full_name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        @{view.profiles.username}
                      </p>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(view.viewed_at), {
                        addSuffix: true,
                      })}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
};

export default ProfileViews;
