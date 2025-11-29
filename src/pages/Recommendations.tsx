import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { UserPlus, X } from "lucide-react";
import { BottomNav } from "@/components/BottomNav";
import { FollowButton } from "@/components/FollowButton";

interface Recommendation {
  id: string;
  recommended_user_id: string;
  reason: string | null;
  profiles: {
    id: string;
    username: string;
    full_name: string;
    avatar_url: string | null;
    bio: string | null;
  };
}

const Recommendations = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    fetchRecommendations();
  }, []);

  const fetchRecommendations = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    setCurrentUserId(user.id);

    // Get users the current user follows
    const { data: following } = await supabase
      .from("follows")
      .select("following_id")
      .eq("follower_id", user.id);

    const followingIds = following?.map(f => f.following_id) || [];

    // Find users who are followed by people you follow, but you don't follow yet
    const { data: suggestions } = await supabase
      .from("follows")
      .select(`
        following_id,
        profiles:profiles!follows_following_id_fkey(*)
      `)
      .in("follower_id", followingIds)
      .not("following_id", "in", `(${[user.id, ...followingIds].join(",")})`)
      .limit(20);

    if (suggestions) {
      // Count mutual connections for each suggestion
      const grouped: Record<string, { profile: any; count: number }> = {};
      suggestions.forEach((s: any) => {
        const uid = s.following_id;
        if (!grouped[uid]) {
          grouped[uid] = { profile: s.profiles, count: 0 };
        }
        grouped[uid].count++;
      });

      const recs: Recommendation[] = Object.entries(grouped).map(([uid, data]) => ({
        id: uid,
        recommended_user_id: uid,
        reason: `${data.count} mutual connection${data.count > 1 ? "s" : ""}`,
        profiles: data.profile,
      }));

      setRecommendations(recs);
    }
  };

  const dismissRecommendation = (userId: string) => {
    setRecommendations(recommendations.filter(r => r.recommended_user_id !== userId));
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="p-4">
        <h1 className="text-2xl font-bold text-foreground mb-6">Suggested For You</h1>

        <div className="space-y-4">
          {recommendations.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-muted-foreground">No recommendations at the moment</p>
              </CardContent>
            </Card>
          ) : (
            recommendations.map((rec) => (
              <Card key={rec.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div
                      className="flex items-center gap-3 flex-1 cursor-pointer"
                      onClick={() => navigate(`/user/${rec.recommended_user_id}`)}
                    >
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={rec.profiles.avatar_url || undefined} />
                        <AvatarFallback>
                          {rec.profiles.username[0]?.toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="font-semibold text-foreground">{rec.profiles.full_name}</p>
                        <p className="text-sm text-muted-foreground">@{rec.profiles.username}</p>
                        {rec.reason && (
                          <p className="text-xs text-primary mt-1">{rec.reason}</p>
                        )}
                        {rec.profiles.bio && (
                          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                            {rec.profiles.bio}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <FollowButton
                        userId={rec.recommended_user_id}
                        currentUserId={currentUserId}
                        onFollowChange={() => dismissRecommendation(rec.recommended_user_id)}
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => dismissRecommendation(rec.recommended_user_id)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

export default Recommendations;
