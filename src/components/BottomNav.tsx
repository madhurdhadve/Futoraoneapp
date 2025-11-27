import { Button } from "@/components/ui/button";
import { Home, Search, Plus, MessageCircle, User as UserIcon } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useUnreadMessages } from "@/hooks/useUnreadMessages";
import { Badge } from "@/components/ui/badge";

export const BottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [userId, setUserId] = useState<string>();
  const unreadCount = useUnreadMessages(userId);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUserId(user?.id);
    });
  }, []);

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="fixed bottom-0 left-0 right-0 glass-card border-t z-50">
      <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-around">
        <Button
          variant="ghost"
          size="icon"
          className={isActive("/feed") ? "text-primary" : ""}
          onClick={() => navigate("/feed")}
        >
          <Home className="w-6 h-6" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className={isActive("/explore") ? "text-primary" : ""}
          onClick={() => navigate("/explore")}
        >
          <Search className="w-6 h-6" />
        </Button>
        <Button
          size="icon"
          className="gradient-primary text-white rounded-full"
          onClick={() => navigate("/create-post")}
        >
          <Plus className="w-6 h-6" />
        </Button>
        <div className="relative">
          <Button
            variant="ghost"
            size="icon"
            className={isActive("/messages") ? "text-primary" : ""}
            onClick={() => navigate("/messages")}
          >
            <MessageCircle className="w-6 h-6" />
          </Button>
          {unreadCount > 0 && (
            <Badge className="absolute -top-1 -right-1 h-5 min-w-5 flex items-center justify-center p-0 text-xs bg-red-500 text-white border-2 border-background">
              {unreadCount > 99 ? "99+" : unreadCount}
            </Badge>
          )}
        </div>
        <Button
          variant="ghost"
          size="icon"
          className={isActive("/profile") ? "text-primary" : ""}
          onClick={() => navigate("/profile")}
        >
          <UserIcon className="w-6 h-6" />
        </Button>
      </div>
    </nav>
  );
};
