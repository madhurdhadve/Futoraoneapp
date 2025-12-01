import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export const useMutualFollowers = (currentUserId: string | undefined, profileUserId: string | undefined) => {
  const [mutualCount, setMutualCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMutualFollowers = async () => {
      if (!currentUserId || !profileUserId || currentUserId === profileUserId) {
        setLoading(false);
        return;
      }

      // Find followers who follow both the current user and the profile user
      const { data, error } = await supabase
        .from("follows")
        .select("follower_id")
        .eq("following_id", currentUserId);

      if (error || !data) {
        setLoading(false);
        return;
      }

      const currentUserFollowerIds = data.map(f => f.follower_id);

      if (currentUserFollowerIds.length === 0) {
        setMutualCount(0);
        setLoading(false);
        return;
      }

      // Count how many of these followers also follow the profile user
      const { count } = await supabase
        .from("follows")
        .select("*", { count: "exact", head: true })
        .eq("following_id", profileUserId)
        .in("follower_id", currentUserFollowerIds);

      setMutualCount(count || 0);
      setLoading(false);
    };

    fetchMutualFollowers();
  }, [currentUserId, profileUserId]);

  return { mutualCount, loading };
};
