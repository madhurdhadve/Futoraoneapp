import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { RealtimeChannel } from "@supabase/supabase-js";

export const useUserPresence = (userId: string | undefined) => {
  const [isOnline, setIsOnline] = useState(false);
  const [lastSeen, setLastSeen] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) return;

    const updatePresence = async (online: boolean) => {
      const { data: existingPresence } = await supabase
        .from("user_presence")
        .select("*")
        .eq("user_id", userId)
        .single();

      if (existingPresence) {
        await supabase
          .from("user_presence")
          .update({
            is_online: online,
            last_seen: new Date().toISOString(),
          })
          .eq("user_id", userId);
      } else {
        await supabase.from("user_presence").insert({
          user_id: userId,
          is_online: online,
          last_seen: new Date().toISOString(),
        });
      }
    };

    // Fetch initial presence
    const fetchPresence = async () => {
      const { data } = await supabase
        .from("user_presence")
        .select("*")
        .eq("user_id", userId)
        .single();

      if (data) {
        setIsOnline(data.is_online);
        setLastSeen(data.last_seen);
      }
    };

    fetchPresence();

    // Subscribe to presence changes
    const channel = supabase
      .channel(`presence-${userId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "user_presence",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          if (payload.new) {
            const newData = payload.new as any;
            setIsOnline(newData.is_online);
            setLastSeen(newData.last_seen);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  return { isOnline, lastSeen };
};

export const useCurrentUserPresence = () => {
  const [currentUserId, setCurrentUserId] = useState<string | undefined>();

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setCurrentUserId(user.id);

        // Set user as online
        const { data: existingPresence } = await supabase
          .from("user_presence")
          .select("*")
          .eq("user_id", user.id)
          .single();

        if (existingPresence) {
          await supabase
            .from("user_presence")
            .update({
              is_online: true,
              last_seen: new Date().toISOString(),
            })
            .eq("user_id", user.id);
        } else {
          await supabase.from("user_presence").insert({
            user_id: user.id,
            is_online: true,
            last_seen: new Date().toISOString(),
          });
        }

        // Update presence every 30 seconds
        const interval = setInterval(async () => {
          await supabase
            .from("user_presence")
            .update({
              is_online: true,
              last_seen: new Date().toISOString(),
            })
            .eq("user_id", user.id);
        }, 30000);

        // Set offline on unmount
        return () => {
          clearInterval(interval);
          supabase
            .from("user_presence")
            .update({
              is_online: false,
              last_seen: new Date().toISOString(),
            })
            .eq("user_id", user.id);
        };
      }
    };

    fetchUser();
  }, []);

  return { currentUserId };
};
