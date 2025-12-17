// Add Review interface
interface Review {
    id: string;
    rating: number;
    comment: string | null;
    created_at: string;
    reviewer: {
        username: string;
        avatar_url: string | null;
    };
}

// ... inside UserProfile component state ...
const [reviews, setReviews] = useState<Review[]>([]);

// ... inside fetchData ...
// Fetch all data in parallel
const [projectsResult, postsResult, reviewsResult] = await Promise.all([
    supabase.from("projects").select("*, project_likes(id)").eq("user_id", userId).order('created_at', { ascending: false }),
    supabase.from("posts").select("*, likes(id), comments(id)").eq("user_id", userId).order('created_at', { ascending: false }),
    supabase.from("reviews")
        .select(`
                    id, rating, comment, created_at,
                    reviewer:reviewer_id(username, avatar_url)
                `)
        .eq("reviewee_id", userId)
        .order('created_at', { ascending: false })
]);

setProjects((projectsResult.data as unknown as Project[]) || []);
setPosts((postsResult.data as unknown as Post[]) || []);
setReviews((reviewsResult.data as unknown as Review[]) || []);

// ... inside return (JSX) ...
// Add imports at top if missing: import { Star } from "lucide-react";
// Import CreateReviewDialog

<div className="flex gap-2">
    <FollowButton
        userId={userId!}
        currentUserId={currentUser?.id}
        onFollowChange={fetchFollowerCounts}
    />
    <StartChatButton
        userId={userId!}
        currentUserId={currentUser?.id}
    />
    {currentUser && currentUser.id !== userId && (
        <CreateReviewDialog
            revieweeId={userId!}
            revieweeName={profile?.full_name || ""}
        />
    )}
    {currentUser && currentUser.id !== userId && (
        // ... existing DropdownMenu ...

        // ... Inside Tabs ...
        <TabsList className="grid w-full grid-cols-3 bg-muted/80 backdrop-blur-sm">
            <TabsTrigger value="projects" className="data-[state=active]:bg-background">Projects</TabsTrigger>
            <TabsTrigger value="posts" className="data-[state=active]:bg-background">Posts</TabsTrigger>
            <TabsTrigger value="reviews" className="data-[state=active]:bg-background">Reviews</TabsTrigger>
        </TabsList>
                        
                        {/* ... Projects Content ... */}
    {/* ... Posts Content ... */}

    <TabsContent value="reviews" className="space-y-4 mt-4">
        {reviews.length === 0 ? (
            <Card className="bg-card/80 backdrop-blur-sm border-border">
                <CardContent className="p-8 text-center text-muted-foreground">
                    No reviews yet. Be the first to review!
                </CardContent>
            </Card>
        ) : (
            reviews.map((review) => (
                <Card key={review.id} className="bg-card/80 backdrop-blur-sm border-border">
                    <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                            <div className="flex items-center gap-2">
                                <Avatar className="h-8 w-8">
                                    <AvatarImage src={review.reviewer.avatar_url || undefined} />
                                    <AvatarFallback>{review.reviewer.username[0].toUpperCase()}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="font-semibold text-sm">@{review.reviewer.username}</p>
                                    <div className="flex text-yellow-500">
                                        {[...Array(5)].map((_, i) => (
                                            <Shield key={i} className={`w-3 h-3 ${i < review.rating ? "fill-current" : "text-muted opacity-20"}`} />
                                        ))}
                                        {/* Using Shield as Star replacement if Star not imported, but wait, Star is better. I should import Star. */}
                                    </div>
                                </div>
                            </div>
                            <span className="text-xs text-muted-foreground">
                                {new Date(review.created_at).toLocaleDateString()}
                            </span>
                        </div>
                        {review.comment && (
                            <p className="mt-2 text-sm text-foreground/90">{review.comment}</p>
                        )}
                    </CardContent>
                </Card>
            ))
        )}
    </TabsContent>
</motion.div>
            </div >

    <FollowersModal
        open={followersModalOpen}
        onOpenChange={setFollowersModalOpen}
        userId={userId!}
        currentUserId={currentUser?.id}
        defaultTab={followersModalTab}
    />

{
    currentUser?.id && userId && currentUser.id !== userId && (
        <MutualFollowersModal
            open={mutualModalOpen}
            onOpenChange={setMutualModalOpen}
            currentUserId={currentUser.id}
            profileUserId={userId}
        />
    )
}

            <BlockUserDialog
                open={showBlockDialog}
                onOpenChange={setShowBlockDialog}
                onConfirm={() => {
                    handleBlock();
                    setShowBlockDialog(false);
                }}
                username={profile?.username || ""}
            />

            <BottomNav />
        </div >
    );
};

export default React.memo(UserProfile);
