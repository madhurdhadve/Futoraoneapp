import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Users } from "lucide-react";

interface MutualFollower {
  id: string;
  username: string;
  full_name: string;
  avatar_url: string | null;
}

interface MutualFollowersModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentUserId: string;
  profileUserId: string;
}

export const MutualFollowersModal = ({
  open,
  onOpenChange,
  currentUserId,
  profileUserId,
}: MutualFollowersModalProps) => {
  const [mutualFollowers, setMutualFollowers] = useState<MutualFollower[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (open) {
      fetchMutualFollowers();
    }
  }, [open, currentUserId, profileUserId]);

  const fetchMutualFollowers = async () => {
    setLoading(true);

    // Get followers of current user
    const { data: currentUserFollowers } = await supabase
      .from("follows")
      .select("follower_id")
      .eq("following_id", currentUserId);

    if (!currentUserFollowers || currentUserFollowers.length === 0) {
      setMutualFollowers([]);
      setLoading(false);
      return;
    }

    const currentUserFollowerIds = currentUserFollowers.map(f => f.follower_id);

    // Get followers of profile user who are also followers of current user
    const { data: mutualData } = await supabase
      .from("follows")
      .select(`
        follower_id,
        profiles!follows_follower_id_fkey(id, username, full_name, avatar_url)
      `)
      .eq("following_id", profileUserId)
      .in("follower_id", currentUserFollowerIds);

    if (mutualData) {
      setMutualFollowers(
        mutualData
          .map((f: any) => f.profiles)
          .filter(Boolean)
      );
    }

    setLoading(false);
  };

  const handleUserClick = (userId: string) => {
    onOpenChange(false);
    navigate(`/user/${userId}`);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users size={20} />
            Mutual Followers
          </DialogTitle>
        </DialogHeader>
        
        {loading ? (
          <p className="text-center text-muted-foreground py-8">Loading...</p>
        ) : mutualFollowers.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">No mutual followers</p>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {mutualFollowers.map((user) => (
              <div
                key={user.id}
                className="flex items-center gap-3 p-3 hover:bg-muted rounded-lg transition-colors cursor-pointer"
                onClick={() => handleUserClick(user.id)}
              >
                <Avatar className="h-12 w-12">
                  <AvatarImage src={user.avatar_url || undefined} />
                  <AvatarFallback>{user.username[0]?.toUpperCase()}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold text-foreground">{user.full_name}</p>
                  <p className="text-sm text-muted-foreground">@{user.username}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
