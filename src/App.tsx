import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient } from "@tanstack/react-query";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { createSyncStoragePersister } from "@tanstack/query-sync-storage-persister";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useOneSignal } from "@/hooks/useOneSignal";
import { useCurrentUserPresence } from "@/hooks/useUserPresence";
import { ThemeProvider } from "@/components/theme-provider";
import ScrollToTop from "@/components/ScrollToTop";
import { CartoonLoader } from "@/components/CartoonLoader";

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
const ProjectIdeas = lazy(() => import("./pages/ProjectIdeas"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const AIEnhancer = lazy(() => import("./pages/AIEnhancer"));
const AudioRooms = lazy(() => import("./pages/AudioRooms"));
const LiveCoding = lazy(() => import("./pages/LiveCoding"));
const FoundersCorner = lazy(() => import("./pages/FoundersCorner"));
const GigMarketplace = lazy(() => import("./pages/GigMarketplace"));
const TechReels = lazy(() => import("./pages/TechReels"));
const GroupChat = lazy(() => import("./pages/GroupChat"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      gcTime: 1000 * 60 * 60 * 24, // 24 hours
    },
  },
});

const persister = createSyncStoragePersister({
  storage: window.localStorage,
});

const App = () => {
  useOneSignal(); // Initialize OneSignal integration
  useCurrentUserPresence(); // Track user online status

  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{ persister }}
    >
      <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <ScrollToTop />
            <Suspense fallback={<CartoonLoader />}>
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
                <Route path="/project-ideas" element={<ProjectIdeas />} />
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/ai-enhancer" element={<AIEnhancer />} />
                <Route path="/audio-rooms" element={<AudioRooms />} />
                <Route path="/live-coding" element={<LiveCoding />} />
                <Route path="/founders-corner" element={<FoundersCorner />} />
                <Route path="/gig-marketplace" element={<GigMarketplace />} />
                <Route path="/tech-reels" element={<TechReels />} />
                <Route path="/messages/group/:groupId" element={<GroupChat />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </BrowserRouter>
        </TooltipProvider>
      </ThemeProvider>
    </PersistQueryClientProvider>
  );
};

export default App;
