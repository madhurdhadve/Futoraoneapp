import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useOneSignal } from "@/hooks/useOneSignal";
import { useCurrentUserPresence } from "@/hooks/useUserPresence";

// Lazy load all page components for code splitting
const Index = lazy(() => import("./pages/Index"));
const Welcome = lazy(() => import("./pages/Welcome"));
const Auth = lazy(() => import("./pages/Auth"));
const Feed = lazy(() => import("./pages/Feed"));
const CreatePost = lazy(() => import("./pages/CreatePost"));
const Explore = lazy(() => import("./pages/Explore"));
const Notifications = lazy(() => import("./pages/Notifications"));
const Profile = lazy(() => import("./pages/Profile"));
const Projects = lazy(() => import("./pages/Projects"));
const AIRoadmap = lazy(() => import("./pages/AIRoadmap"));
const Terms = lazy(() => import("./pages/Terms"));
const Privacy = lazy(() => import("./pages/Privacy"));
const About = lazy(() => import("./pages/About"));
const NotFound = lazy(() => import("./pages/NotFound"));
const CategoryPage = lazy(() => import("./pages/CategoryPage"));
const TopicPage = lazy(() => import("./pages/TopicPage"));
const ProjectDetails = lazy(() => import("./pages/ProjectDetails"));
const SearchResults = lazy(() => import("./pages/SearchResults"));
const UserProfile = lazy(() => import("./pages/UserProfile"));
const ChatPage = lazy(() => import("./pages/ChatPage"));
const AIPage = lazy(() => import("./pages/AIPage"));
const Messages = lazy(() => import("./pages/Messages"));
const Chat = lazy(() => import("./pages/Chat"));
const CreateStory = lazy(() => import("./pages/CreateStory"));
const StoryView = lazy(() => import("./pages/StoryView"));
const ProfileViews = lazy(() => import("./pages/ProfileViews"));
const AllPeople = lazy(() => import("./pages/AllPeople"));

const queryClient = new QueryClient();

// Loading fallback component
const LoadingFallback = () => (
  <div className="min-h-screen bg-background flex items-center justify-center">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
      <p className="text-muted-foreground">Loading...</p>
    </div>
  </div>
);

const App = () => {
  useOneSignal(); // Initialize OneSignal integration
  useCurrentUserPresence(); // Track user online status

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Suspense fallback={<LoadingFallback />}>
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
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
