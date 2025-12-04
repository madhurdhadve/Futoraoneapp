import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Heart, MessageCircle, UserPlus, Eye } from "lucide-react";
import { motion } from "framer-motion";
import { BottomNav } from "@/components/BottomNav";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import type { User } from "@supabase/supabase-js";
import { formatDistanceToNow } from "date-fns";
import { VerifiedBadge } from "@/components/VerifiedBadge";
import { CartoonLoader } from "@/components/CartoonLoader";

interface Notification {
  id: string;
  type: string;
  created_at: string;
  is_read: boolean;
  post_id: string | null;
  actor: {
    id: string;
    username: string;
    full_name: string;
    avatar_url: string | null;
    is_verified?: boolean | null;
  } | null;
  post?: {
    content: string;
  } | null;
}

const Notifications = () => {
  const [user, setUser] = useState<User | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/auth");
      } else {
        setUser(session.user);
        fetchNotifications(session.user.id);
      }
    });
  }, [navigate]);

  const fetchNotifications = async (userId: string) => {
    setLoading(true);
    const { data, error } = await supabase
      .from("notifications")
      .select(`
        *,
        actor:profiles!notifications_actor_id_fkey(id, username, full_name, avatar_url, is_verified),
        post:posts(content)
      `)
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(50);

    if (!error && data) {
      setNotifications(data as unknown as Notification[]);
    }
    setLoading(false);
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "like":
        return Heart;
      case "comment":
        return MessageCircle;
      case "follow":
        return UserPlus;
      case "profile_view":
        return Eye;
      default:
        return Heart;
    }
  };

  const getNotificationText = (notif: Notification) => {
    switch (notif.type) {
      case "like":
        return "liked your post";
      case "comment":
        return "commented on your post";
      case "follow":
        return "started following you";
      case "profile_view":
        return "viewed your profile";
      default:
        return "interacted with you";
    }
  };

  const getIconColor = (type: string) => {
    switch (type) {
      case "like":
        return "text-red-500";
      case "comment":
        return "text-blue-500";
      case "follow":
        return "text-green-500";
      case "profile_view":
        return "text-purple-500";
      default:
        return "text-muted-foreground";
    }
  };

  const handleNotificationClick = async (notif: Notification) => {
    // Mark as read
    await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("id", notif.id);

    // Navigate based on notification type
    if (notif.type === "follow" && notif.actor) {
      navigate(`/user/${notif.actor.id}`);
    } else if (notif.post_id) {
      navigate(`/feed`); // Navigate to feed where the post is
    }
  };


  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-card border-b border-border p-3 sm:p-4">
        <h1 className="text-xl sm:text-2xl font-bold text-foreground">Notifications</h1>
      </div>

      <div className="p-3 sm:p-4 space-y-3">
        {loading ? (
          <CartoonLoader />
        ) : notifications.length === 0 ? (
          <Card className="bg-card border-border">
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground">No notifications yet</p>
            </CardContent>
          </Card>
        ) : (
          notifications.map((notification, index) => {
            const Icon = getNotificationIcon(notification.type);
            return (
              <motion.div
                key={notification.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card
                  className={`cursor-pointer hover:border-primary transition-all bg-card border-border ${!notification.is_read ? "bg-primary/5" : ""
                    }`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <CardContent className="p-3 sm:p-4">
                    <div className="flex items-start gap-3">
                      <div className="relative shrink-0">
                        <Avatar className="h-10 w-10 sm:h-12 sm:w-12">
                          <AvatarImage src={notification.actor?.avatar_url || undefined} />
                          <AvatarFallback className="bg-muted text-muted-foreground">
                            {notification.actor?.username[0]?.toUpperCase() || "?"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="absolute -bottom-1 -right-1 bg-background rounded-full p-1">
                          <Icon className={getIconColor(notification.type)} size={12} />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm sm:text-base text-foreground">
                          <span className="font-semibold inline-flex items-center gap-1">
                            {notification.actor?.full_name || "Someone"}
                            <VerifiedBadge isVerified={notification.actor?.is_verified} size={14} />
                          </span>{" "}
                          <span className="text-muted-foreground">{getNotificationText(notification)}</span>
                        </p>
                        {notification.post?.content && (
                          <p className="text-xs sm:text-sm text-muted-foreground mt-1 line-clamp-2">
                            {notification.post.content}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground mt-2">
                          {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })
        )}
      </div>

      <BottomNav />
    </div>
  );
};

export default React.memo(Notifications);
