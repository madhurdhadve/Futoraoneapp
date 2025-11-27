{/* Create Post Button */ }
<Card className="p-6 mb-6 shadow-lg">
  <div className="flex items-center gap-4">
    <Avatar className="w-12 h-12 border-2 border-primary">
      <AvatarImage src={user?.user_metadata?.avatar_url} />
      <AvatarFallback>{user?.user_metadata?.username?.[0] || "U"}</AvatarFallback>
    </Avatar>
    <Button
      variant="outline"
      className="flex-1 justify-start text-muted-foreground hover:border-primary"
      onClick={() => navigate("/create-post")}
    >
      What's on your mind?
    </Button>
    <Button size="icon" className="gradient-primary text-white">
      <Plus className="w-5 h-5" />
    </Button>
  </div>
</Card>

{/* Posts */ }
<div className="space-y-6">
  {posts.length === 0 ? (
    <Card className="p-12 text-center">
      <p className="text-muted-foreground">No posts yet. Be the first to share something!</p>
    </Card>
  ) : (
    posts.map((post, index) => (
      <motion.div
        key={post.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.1 }}
      >
        <Card className="overflow-hidden shadow-lg">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate(`/user/${post.user_id}`)}>
                <Avatar className="w-12 h-12 border-2 border-primary">
                  <AvatarImage src={post.profiles.avatar_url || undefined} />
                  <AvatarFallback>{post.profiles.username[0]}</AvatarFallback>
                </Avatar>
                <div>

                  <p className="mb-4">{post.content}</p>

                  {post.image_url && (
                    <img
                      src={post.image_url}
                      alt="Post"
                      className="w-full rounded-xl object-cover mb-4"
                    />
                  )}

                  <div className="flex items-center justify-between pt-4 border-t">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleLike(post.id)}
                      className={post.likes.some(like => like.user_id === user?.id) ? "text-secondary" : ""}
                    >
                      <Heart
                        className={`w-5 h-5 mr-2 ${post.likes.some(like => like.user_id === user?.id) ? "fill-secondary" : ""
                          }`}
                      />
                      {post.likes.length}
                    </Button>
                    <Button variant="ghost" size="sm">
                      <MessageCircle className="w-5 h-5 mr-2" />
                      {post.comments.length}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleSave(post.id)}
                      className={post.saves?.some(save => save.user_id === user?.id) ? "text-primary" : ""}
                    >
                      <Bookmark
                        className={`w-5 h-5 mr-2 ${post.saves?.some(save => save.user_id === user?.id) ? "fill-primary" : ""
                          }`}
                      />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleShare(post)}>
                      <Share2 className="w-5 h-5 mr-2" />
                    </Button>
                  </div>

                  {/* Comments Section */}
                  <div className="mt-4 pt-4 border-t">
                    <CommentSection
                      postId={post.id}
                      postAuthorId={post.user_id}
                      currentUser={user}
                    />
                  </div>
                </div>
              </Card>
            </motion.div>
            ))
  )}
          </div>
        </main >

        <BottomNav />
      </div >
    );
};

  export default Feed;
