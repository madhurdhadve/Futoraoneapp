import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export const useMutualFollowers = (currentUserId: string | undefined, profileUserId: string | undefined) => {
  const [mutualCount, setMutualCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchMutualFollowers = useCallback(async () => {
    if (!currentUserId || !profileUserId || currentUserId === profileUserId) {
      setMutualCount(0);
      setLoading(false);
      return;
    }

    // Optimize: Fetch both in parallel and filter client-side
    const [currentUserFollowersResult, profileUserFollowersResult] = await Promise.all([
      supabase
        .from("follows")
        .select("follower_id")
        .eq("following_id", currentUserId),
      supabase
        .from("follows")
        .select("follower_id")
        .eq("following_id", profileUserId)
    ]);

    if (currentUserFollowersResult.error || profileUserFollowersResult.error) {
      setLoading(false);
      return;
    }

    const currentUserFollowerIds = new Set(
      currentUserFollowersResult.data?.map(f => f.follower_id) || []
    );
    
    const profileUserFollowerIds = profileUserFollowersResult.data?.map(f => f.follower_id) || [];
    
    // Count mutual followers
    const mutuals = profileUserFollowerIds.filter(id => currentUserFollowerIds.has(id));
    
    setMutualCount(mutuals.length);
    setLoading(false);
  }, [currentUserId, profileUserId]);

  useEffect(() => {
    fetchMutualFollowers();
  }, [fetchMutualFollowers]);

  return { mutualCount, loading };
};
