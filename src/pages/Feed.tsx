import React, { Suspense, lazy, useMemo, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { PostSkeleton } from "@/components/PostSkeleton";
import { BottomNav } from "@/components/BottomNav";
import { FeedPost } from "@/components/FeedPost";
import { useInView } from "react-intersection-observer";
import GamificationWidget from "@/components/GamificationWidget";
import AIMentor from "@/components/AIMentor";
import { FeedHeader } from "@/components/feed/FeedHeader";
import { FeedSkeleton } from "@/components/feed/FeedSkeleton";
import { useFeedLogic } from "@/hooks/useFeedLogic";

// Lazy load Stories component
const Stories = lazy(() => import("@/components/Stories").then(m => ({ default: m.Stories })));

const Feed = () => {
  const {
    user,
    userProfile,
    posts,
    loading,
    hasMore,
    unreadCount,
    loadMore,
    toggleLike,
    toggleSave,
    handleShare,
    handleDeletePost
  } = useFeedLogic();

  const { ref, inView } = useInView();

  useEffect(() => {
    if (inView && hasMore && !loading) {
      loadMore();
    }
  }, [inView, hasMore, loading, loadMore]);

  // Optimize static widgets with useMemo
  const gamificationWidget = useMemo(() => (
    <GamificationWidget
      userXP={userProfile?.xp || 0}
      userLevel={userProfile?.level || 1}
      streak={userProfile?.current_streak || 0}
    />
  ), [userProfile]);

  const aiMentor = useMemo(() => <AIMentor />, []);

  if (loading && posts.length === 0) {
    return <FeedSkeleton />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-muted/30 to-background">
      <FeedHeader unreadCount={unreadCount} />

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-3 sm:px-4 py-4 sm:py-6 pb-24">
        {/* Stories - Lazy loaded */}
        <div className="mb-6">
          <Suspense fallback={<div className="h-24 bg-muted/50 rounded-lg animate-pulse" />}>
            <Stories />
          </Suspense>
        </div>

        {/* Gamification Widget */}
        <div className="mb-6">
          {gamificationWidget}
        </div>

        {/* Posts */}
        <div className="space-y-6">
          {posts.length === 0 && !loading ? (
            <Card className="p-12 text-center">
              <p className="text-muted-foreground">No posts found.</p>
            </Card>
          ) : (
            <>
              {posts.map((post, index) => (
                <FeedPost
                  key={post.id}
                  post={post}
                  currentUser={user}
                  onLike={toggleLike}
                  onSave={toggleSave}
                  onShare={handleShare}
                  onDelete={handleDeletePost}
                  index={index}
                />
              ))}
              {hasMore && (
                <div ref={ref} className="py-4">
                  <PostSkeleton />
                </div>
              )}
            </>
          )}
        </div>
      </main>

      <BottomNav />
      {aiMentor}
    </div>
  );
};

export default React.memo(Feed);
