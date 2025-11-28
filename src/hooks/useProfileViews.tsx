import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export const useTrackProfileView = (profileId: string | undefined, currentUserId: string | undefined) => {
  useEffect(() => {
    const trackView = async () => {
      if (!profileId || !currentUserId || profileId === currentUserId) return;

      // Record the profile view
      await supabase.from("profile_views").insert({
        profile_id: profileId,
        viewer_id: currentUserId,
      });

      // Create notification for profile owner
      await supabase.from("notifications").insert({
        user_id: profileId,
        actor_id: currentUserId,
        type: "profile_view",
      });
    };

    trackView();
  }, [profileId, currentUserId]);
};
