import { Button } from "@/components/ui/button";
import { Home, Search, Plus, Sparkles, User as UserIcon } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

export const BottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();

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
        <Button
          variant="ghost"
          size="icon"
          className={isActive("/ai-roadmap") ? "text-primary" : ""}
          onClick={() => navigate("/ai-roadmap")}
        >
          <Sparkles className="w-6 h-6" />
        </Button>
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
