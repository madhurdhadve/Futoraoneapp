import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient } from "@tanstack/react-query";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { createSyncStoragePersister } from "@tanstack/query-sync-storage-persister";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useFCM } from "@/hooks/useFCM";

import { ThemeProvider } from "@/components/theme-provider";
import ScrollToTop from "@/components/ScrollToTop";
import { CartoonLoader } from "@/components/CartoonLoader";
import { AchievementListener } from "@/components/AchievementListener";
import { UserPresenceProvider } from "@/contexts/UserPresenceContext";

// Core pages - Eager loaded for speed
import Index from "./pages/Index";
import Welcome from "./pages/Welcome";
import Auth from "./pages/Auth";
import Feed from "./pages/Feed";
// import Profile from "./pages/Profile"; // Removed static import to use lazy loading

// Lazy load other pages
const Explore = lazy(() => import("./pages/Explore"));
const CreatePost = lazy(() => import("./pages/CreatePost"));
const Notifications = lazy(() => import("./pages/Notifications"));
const Profile = lazy(() => import("./pages/Profile")); // Restore lazy profile
const Projects = lazy(() => import("./pages/Projects"));
const AIRoadmap = lazy(() => import("./pages/AIRoadmap"));
const Terms = lazy(() => import("./pages/Terms"));
const Privacy = lazy(() => import("./pages/Privacy"));
const About = lazy(() => import("./pages/About"));
const NotFound = lazy(() => import("./pages/NotFound"));
const CategoryPage = lazy(() => import("./pages/CategoryPage"));
const TopicPage = lazy(() => import("./pages/TopicPage"));
const ProjectDetails = lazy(() => import("./pages/ProjectDetails"));
const PostDetails = lazy(() => import("./pages/PostDetails"));
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
const AdminDashboard = lazy(() => import("./pages/Admin/Dashboard"));
const AdminUsers = lazy(() => import("./pages/Admin/Users"));
const AdminModeration = lazy(() => import("./pages/Admin/Moderation"));
const AdminAnalytics = lazy(() => import("./pages/Admin/Analytics"));
const AdminFinance = lazy(() => import("./pages/Admin/Finance"));
const AdminSettings = lazy(() => import("./pages/Admin/Settings"));
const AIEnhancer = lazy(() => import("./pages/AIEnhancer"));

const FoundersCorner = lazy(() => import("./pages/FoundersCorner"));
const GigMarketplace = lazy(() => import("./pages/GigMarketplace"));
const ApplicationsDashboard = lazy(() => import("./pages/ApplicationsDashboard"));
const TechReels = lazy(() => import("./pages/TechReels"));
const TechMatch = lazy(() => import("./pages/TechMatch"));

const GroupChat = lazy(() => import("./pages/GroupChat"));

const Games = lazy(() => import("./pages/Games"));
const DotsAndBoxes = lazy(() => import("./pages/games/DotsAndBoxes"));
const TicTacToe = lazy(() => import("./pages/games/TicTacToe"));
const MemoryMatch = lazy(() => import("./pages/games/MemoryMatch"));
const RockPaperScissors = lazy(() => import("./pages/games/RockPaperScissors"));
const ConnectFour = lazy(() => import("./pages/games/ConnectFour"));
const ReflexMaster = lazy(() => import("./pages/games/ReflexMaster"));
const WordBlitz = lazy(() => import("./pages/games/WordBlitz"));
const NumberMerge = lazy(() => import("./pages/games/NumberMerge"));
const PatternPro = lazy(() => import("./pages/games/PatternPro"));
const SpeedMath = lazy(() => import("./pages/games/SpeedMath"));
const Settings = lazy(() => import("./pages/Settings"));
const LeaderboardFull = lazy(() => import("./pages/LeaderboardFull"));
const HallOfFameFull = lazy(() => import("./pages/HallOfFameFull"));
const SelectAvatar = lazy(() => import("./pages/SelectAvatar"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      gcTime: 1000 * 60 * 60, // 1 hour
      staleTime: 1000 * 60 * 5, // 5 minutes (keep data fresh but avoid instant refetches)
    },
  },
});

const persister = createSyncStoragePersister({
  storage: window.localStorage,
});

const App = () => {
  // Note: We'll initialize FCM when user logs in via the auth flow


  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{ persister }}
    >
      <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <AchievementListener />
          <UserPresenceProvider>
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
                  <Route path="/settings" element={<Settings />} />
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
                  <Route path="/admin/users" element={<AdminUsers />} />
                  <Route path="/admin/moderation" element={<AdminModeration />} />
                  <Route path="/admin/analytics" element={<AdminAnalytics />} />
                  <Route path="/admin/finance" element={<AdminFinance />} />
                  <Route path="/admin/settings" element={<AdminSettings />} />
                  <Route path="/ai-enhancer" element={<AIEnhancer />} />

                  <Route path="/founders-corner" element={<FoundersCorner />} />
                  <Route path="/gig-marketplace" element={<GigMarketplace />} />
                  <Route path="/applications" element={<ApplicationsDashboard />} />
                  <Route path="/tech-reels" element={<TechReels />} />
                  <Route path="/tech-match" element={<TechMatch />} />
                  <Route path="/messages/group/:groupId" element={<GroupChat />} />
                  <Route path="/post/:postId" element={<PostDetails />} />

                  {/* Games */}
                  <Route path="/games" element={<Games />} />
                  <Route path="/games/dots-and-boxes" element={<DotsAndBoxes />} />
                  <Route path="/games/tic-tac-toe" element={<TicTacToe />} />
                  <Route path="/games/memory-match" element={<MemoryMatch />} />
                  <Route path="/games/rock-paper-scissors" element={<RockPaperScissors />} />
                  <Route path="/games/connect-four" element={<ConnectFour />} />
                  <Route path="/games/reflex-master" element={<ReflexMaster />} />
                  <Route path="/games/word-blitz" element={<WordBlitz />} />
                  <Route path="/games/number-merge" element={<NumberMerge />} />
                  <Route path="/games/pattern-pro" element={<PatternPro />} />
                  <Route path="/games/speed-math" element={<SpeedMath />} />

                  <Route path="/leaderboard" element={<LeaderboardFull />} />
                  <Route path="/hall-of-fame" element={<HallOfFameFull />} />
                  <Route path="/select-avatar" element={<SelectAvatar />} />

                  {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
            </BrowserRouter>
          </UserPresenceProvider>
        </TooltipProvider>
      </ThemeProvider>
    </PersistQueryClientProvider>
  );
};

export default App;
