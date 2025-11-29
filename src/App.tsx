import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useOneSignal } from "@/hooks/useOneSignal";
import { useCurrentUserPresence } from "@/hooks/useUserPresence";
import Index from "./pages/Index";
import Welcome from "./pages/Welcome";
import Auth from "./pages/Auth";
import Feed from "./pages/Feed";
import CreatePost from "./pages/CreatePost";
import Explore from "./pages/Explore";
import Notifications from "./pages/Notifications";
import Profile from "./pages/Profile";
import Projects from "./pages/Projects";
import AIRoadmap from "./pages/AIRoadmap";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import About from "./pages/About";
import NotFound from "./pages/NotFound";
import CategoryPage from "./pages/CategoryPage";
import TopicPage from "./pages/TopicPage";
import ProjectDetails from "./pages/ProjectDetails";
import SearchResults from "./pages/SearchResults";
import UserProfile from "./pages/UserProfile";
import ChatPage from "./pages/ChatPage";
import AIPage from "./pages/AIPage";
import Messages from "./pages/Messages";
import Chat from "./pages/Chat";
import CreateStory from "./pages/CreateStory";
import StoryView from "./pages/StoryView";
import ProfileViews from "./pages/ProfileViews";
import AllPeople from "./pages/AllPeople";
import Highlights from "./pages/Highlights";
import Collections from "./pages/Collections";
import Recommendations from "./pages/Recommendations";
const queryClient = new QueryClient();

const App = () => {
  useOneSignal(); // Initialize OneSignal integration
  useCurrentUserPresence(); // Track user online status

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Welcome />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/feed" element={<Feed />} />
            <Route path="/create-post" element={<CreatePost />} />
            <Route path="/explore" element={<Explore />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/user/:userId" element={<UserProfile />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/ai-roadmap" element={<AIRoadmap />} />
            <Route path="/ai-tools" element={<AIPage />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/about" element={<About />} />
            <Route path="/category/:category" element={<CategoryPage />} />
            <Route path="/topic/:topic" element={<TopicPage />} />
            <Route path="/project/:projectId" element={<ProjectDetails />} />
            <Route path="/search" element={<SearchResults />} />
            <Route path="/messages" element={<Messages />} />
            <Route path="/people" element={<AllPeople />} />
            <Route path="/chat/:conversationId" element={<Chat />} />
            <Route path="/create-story" element={<CreateStory />} />
            <Route path="/story/:userId" element={<StoryView />} />
            <Route path="/profile-views" element={<ProfileViews />} />
            <Route path="/highlights" element={<Highlights />} />
            <Route path="/collections" element={<Collections />} />
            <Route path="/recommendations" element={<Recommendations />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
