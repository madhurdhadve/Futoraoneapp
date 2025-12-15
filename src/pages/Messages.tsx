import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { BottomNav } from "@/components/BottomNav";
import { MessageCircle, Search, Users, ExternalLink } from "lucide-react";
import { Input } from "@/components/ui/input";
import { formatDistanceToNow } from "date-fns";
import type { User } from "@supabase/supabase-js";
import { Badge } from "@/components/ui/badge";
import { CartoonLoader } from "@/components/CartoonLoader";
import { CreateGroupDialog } from "@/components/chat/CreateGroupDialog";
import { GroupsList } from "@/components/chat/GroupsList";
import { OnlineIndicator } from "@/components/OnlineIndicator";
import { motion, AnimatePresence } from "framer-motion";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
  ContextMenuSeparator,
} from "@/components/ui/context-menu";
import { Pin, PinOff, Archive as ArchiveIcon, Trash2 } from "lucide-react";

interface ConversationWithDetails {
  id: string;
  updated_at: string;
  otherUser: {
    id: string;
    username: string;
    full_name: string;
    avatar_url: string | null;
  };
  lastMessage: {
    content: string;
    created_at: string;
  } | null;
  unreadCount: number;
  is_pinned?: boolean;
  is_archived?: boolean;
}

const ConversationItem = React.memo(({
  conv,
  onClick,
  onPin,
  onArchive
}: {
  conv: ConversationWithDetails,
  onClick: (id: string) => void,
  onPin: (id: string, current: boolean) => void,
  onArchive: (id: string, current: boolean) => void
}) => (
  <motion.div
    layout
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, height: 0 }}
    whileHover={{ scale: 1.01 }}
    transition={{ duration: 0.2 }}
  >
    <ContextMenu>
      <ContextMenuTrigger>
        <Card
          className={`border-0 shadow-sm hover:shadow-md transition-all cursor-pointer bg-card/50 hover:bg-card mb-2 ${conv.unreadCount > 0 ? 'bg-primary/5 ring-1 ring-primary/10' : ''} ${conv.is_pinned ? 'border-l-4 border-l-primary bg-primary/5' : ''}`}
          onClick={() => onClick(conv.id)}
        >
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center gap-4">
              <div className="relative">
                <Avatar className="h-14 w-14 border-2 border-background shadow-sm">
                  <AvatarImage src={conv.otherUser.avatar_url || undefined} className="object-cover" />
                  <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/10 text-primary font-bold">
                    {conv.otherUser.username[0]?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <OnlineIndicator userId={conv.otherUser.id} className="w-3.5 h-3.5 border-[3px]" />
              </div>

              <div className="flex-1 min-w-0 grid gap-1">
                <div className="flex items-center justify-between">
                  <h3 className={`font-semibold text-base truncate flex items-center gap-2 ${conv.unreadCount > 0 ? 'text-foreground' : 'text-foreground/90'}`}>
                    {conv.otherUser.full_name}
                    {conv.is_pinned && <Pin className="w-3.5 h-3.5 text-primary fill-primary rotate-45" />}
                  </h3>
                  {conv.lastMessage && (
                    <span className={`text-xs whitespace-nowrap ${conv.unreadCount > 0 ? 'text-primary font-medium' : 'text-muted-foreground'}`}>
                      {formatDistanceToNow(new Date(conv.lastMessage.created_at), { addSuffix: false }).replace('about ', '')}
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between gap-2">
                  <p className={`text-sm truncate pr-2 ${conv.unreadCount > 0 ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
                    {conv.lastMessage?.content || <span className="text-muted-foreground italic">No messages yet</span>}
                  </p>
                  {conv.unreadCount > 0 && (
                    <Badge className="h-5 min-w-[1.25rem] px-1 flex items-center justify-center bg-primary text-primary-foreground text-[10px] rounded-full shadow-sm animate-in zoom-in">
                      {conv.unreadCount}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </ContextMenuTrigger>
      <ContextMenuContent className="w-48">
        <ContextMenuItem onClick={(e) => { e.stopPropagation(); onPin(conv.id, !!conv.is_pinned); }}>
          {conv.is_pinned ? (
            <>
              <PinOff className="mr-2 h-4 w-4" /> Unpin Chat
            </>
          ) : (
            <>
              <Pin className="mr-2 h-4 w-4" /> Pin Chat
            </>
          )}
        </ContextMenuItem>
        <ContextMenuItem onClick={(e) => { e.stopPropagation(); onArchive(conv.id, !!conv.is_archived); }}>
          {conv.is_archived ? (
            <>
              <ArrowLeft className="mr-2 h-4 w-4" /> Unarchive
            </>
          ) : (
            <>
              <ArchiveIcon className="mr-2 h-4 w-4" /> Archive Chat
            </>
          )}
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem className="text-destructive focus:text-destructive">
          <Trash2 className="mr-2 h-4 w-4" /> Delete
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  </motion.div>
));

import { ActiveUsersList } from "@/components/chat/ActiveUsersList";
import { MessageSquarePlus, Filter, Archive, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

// ... (keep existing imports)

const Messages = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [conversations, setConversations] = useState<ConversationWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<'direct' | 'groups'>('direct');
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);

  // ... (keep existing effects and functions)

  const [showArchived, setShowArchived] = useState(false);

  useEffect(() => {
    // Check authentication
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
      } else {
        setUser(session.user);
      }
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session) {
        navigate("/auth");
      } else {
        setUser(session.user);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);


  const fetchConversations = useCallback(async () => {
    if (!user) return;
    try {
      // Step 1: Fetch all conversation participations for current user
      const { data: conversationsData, error } = await supabase
        .from('conversation_participants')
        .select(`
          conversation_id,
          is_pinned,
          is_archived,
          conversations (
            updated_at
          )
        `)
        .eq('user_id', user.id)
        .limit(50); // Limit to most recent 50 conversations for performance

      if (error) throw error;
      if (!conversationsData || conversationsData.length === 0) {
        setConversations([]);
        return;
      }

      const convIds = conversationsData.map((cp: any) => cp.conversation_id);

      // Step 2: Batch fetch all other participants in ONE query
      const { data: allParticipants } = await supabase
        .from('conversation_participants')
        .select('conversation_id, profiles:user_id(id, username, full_name, avatar_url)')
        .in('conversation_id', convIds)
        .neq('user_id', user.id);

      // Step 3: Batch fetch last message for each conversation
      const lastMessagesPromises = convIds.map(convId =>
        supabase
          .from('messages')
          .select('conversation_id, content, created_at, is_read, sender_id')
          .eq('conversation_id', convId)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle()
      );
      const lastMessagesResults = await Promise.all(lastMessagesPromises);

      // Step 4: Batch fetch unread counts
      const unreadCountsPromises = convIds.map(convId =>
        supabase
          .from('messages')
          .select('*', { count: 'exact', head: true })
          .eq('conversation_id', convId)
          .eq('is_read', false)
          .neq('sender_id', user.id)
      );
      const unreadCountsResults = await Promise.all(unreadCountsPromises);

      // Step 5: Combine all data
      const userConversations = (conversationsData as any[]).map((cp: any, idx: number) => {
        const participant = allParticipants?.find((p: any) => p.conversation_id === cp.conversation_id);
        const lastMsg = lastMessagesResults[idx]?.data;
        const unreadCount = unreadCountsResults[idx]?.count || 0;

        return {
          id: cp.conversation_id,
          updated_at: cp.conversations.updated_at,
          is_pinned: cp.is_pinned,
          is_archived: cp.is_archived,
          otherUser: participant?.profiles,
          lastMessage: lastMsg,
          unreadCount
        };
      });

      // Sort: Pinned first, then by date
      const sorted = userConversations
        .filter(c => c.otherUser) // Filter out conversations where user might be deleted
        .sort((a, b) => {
          if (a.is_pinned && !b.is_pinned) return -1;
          if (!a.is_pinned && b.is_pinned) return 1;

          const dateA = new Date(a.lastMessage?.created_at || a.updated_at).getTime();
          const dateB = new Date(b.lastMessage?.created_at || b.updated_at).getTime();
          return dateB - dateA;
        });

      setConversations(sorted as ConversationWithDetails[]);
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Initial Fetch
  useEffect(() => {
    if (user) fetchConversations();
  }, [user, fetchConversations]);

  // Realtime subscription
  useEffect(() => {
    if (!user) return;
    const channel = supabase.channel('chat_updates')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'messages' },
        () => fetchConversations())
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'conversation_participants', filter: `user_id=eq.${user.id}` },
        () => fetchConversations())
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user, fetchConversations]);

  const handlePin = useCallback(async (id: string, current: boolean) => {
    if (!user) return;
    try {
      // Optimistic update
      setConversations(prev => prev.map(c =>
        c.id === id ? { ...c, is_pinned: !current } : c
      ).sort((a, b) => {
        // Re-sort logic needed for optimistic
        const isPinnedA = a.id === id ? !current : a.is_pinned;
        const isPinnedB = b.id === id ? !current : b.is_pinned;
        if (isPinnedA && !isPinnedB) return -1;
        if (!isPinnedA && isPinnedB) return 1;
        const dateA = new Date(a.lastMessage?.created_at || a.updated_at).getTime();
        const dateB = new Date(b.lastMessage?.created_at || b.updated_at).getTime();
        return dateB - dateA;
      }));

      const { error } = await supabase
        .from('conversation_participants')
        .update({ is_pinned: !current })
        .eq('conversation_id', id)
        .eq('user_id', user.id);

      if (error) throw error;
      toast.success(current ? "Chat unpinned" : "Chat pinned");
    } catch (err) {
      toast.error("Failed to update pin status");
      fetchConversations(); // Revert on error
    }
  }, [user, fetchConversations]);

  const handleArchive = useCallback(async (id: string, current: boolean) => {
    if (!user) return;
    try {
      // Optimistic update
      setConversations(prev => prev.map(c =>
        c.id === id ? { ...c, is_archived: !current } : c
      ));

      const { error } = await supabase
        .from('conversation_participants')
        .update({ is_archived: !current })
        .eq('conversation_id', id)
        .eq('user_id', user.id);

      if (error) throw error;
      toast.success(current ? "Chat unarchived" : "Chat archived");
    } catch (err) {
      toast.error("Failed to update archive status");
      fetchConversations();
    }
  }, [user, fetchConversations]);


  const filteredConversations = React.useMemo(() => conversations.filter(conv => {
    const matchesSearch = conv.otherUser.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conv.otherUser.username.toLowerCase().includes(searchQuery.toLowerCase());

    // Logic: If showing archived, only show archived. If not, only show active.
    // ALSO: If searching, search EVERYTHING (optional UX choice, here I'll stick to tabs)
    const matchesTab = showArchived ? conv.is_archived : !conv.is_archived;

    const matchesUnread = showUnreadOnly ? conv.unreadCount > 0 : true;
    return matchesSearch && matchesTab && matchesUnread;
  }), [conversations, searchQuery, showArchived, showUnreadOnly]);

  return (
    <div className="min-h-screen bg-background pb-20 relative">
      {/* Sticky Premium Header */}
      <div className="sticky top-0 z-30 bg-background/80 backdrop-blur-md border-b border-border/50">
        <div className="p-3 sm:p-4 space-y-4 max-w-3xl mx-auto">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent flex items-center gap-2">
              Messages
            </h1>
            <div className="flex gap-2">
              {activeTab === 'groups' && <CreateGroupDialog onGroupCreated={() => { }} />}
              <Button variant="ghost" size="icon" className="rounded-full" onClick={() => navigate('/search')}>
                <MessageSquarePlus className="w-6 h-6 text-primary" />
              </Button>
            </div>
          </div>

          {/* Custom Tabs */}
          <div className="flex p-1 bg-secondary/30 rounded-xl relative">
            <div
              className={`absolute top-1 bottom-1 w-[calc(50%-4px)] bg-background rounded-lg shadow-sm transition-all duration-300 ease-spring ${activeTab === 'direct' ? 'left-1' : 'left-[calc(50%+4px)]'}`}
            />
            <button
              className={`relative z-10 flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold rounded-lg transition-colors ${activeTab === 'direct' ? 'text-foreground' : 'text-muted-foreground hover:text-foreground/80'}`}
              onClick={() => { setActiveTab('direct'); setShowArchived(false); }}
            >
              <MessageCircle className="w-4 h-4" />
              Direct
            </button>
            <button
              className={`relative z-10 flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold rounded-lg transition-colors ${activeTab === 'groups' ? 'text-foreground' : 'text-muted-foreground hover:text-foreground/80'}`}
              onClick={() => setActiveTab('groups')}
            >
              <Users className="w-4 h-4" />
              Communities
            </button>
          </div>

          {/* Search & Filter Row */}
          {activeTab === 'direct' && (
            <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
              <div className="relative group flex-1 min-w-[150px]">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                </div>
                <Input
                  placeholder={showArchived ? "Search archived..." : "Search messages..."}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-10 bg-secondary/50 border-transparent hover:bg-secondary/80 focus:bg-background focus:border-primary/20 rounded-full transition-all"
                />
              </div>
              <Button
                variant={showUnreadOnly ? "default" : "outline"}
                size="icon"
                className={`rounded-full shrink-0 ${showUnreadOnly ? 'bg-primary text-primary-foreground' : 'bg-background hover:bg-secondary'}`}
                onClick={() => setShowUnreadOnly(!showUnreadOnly)}
                title="Filter Unread"
              >
                <Filter className={`w-4 h-4 ${showUnreadOnly ? 'fill-current' : ''}`} />
              </Button>
              <Button
                variant={showArchived ? "default" : "outline"}
                size="icon"
                className={`rounded-full shrink-0 ${showArchived ? 'bg-orange-500 text-white hover:bg-orange-600' : 'bg-background hover:bg-secondary text-muted-foreground'}`}
                onClick={() => setShowArchived(!showArchived)}
                title={showArchived ? "View Inbox" : "View Archived"}
              >
                <ArchiveIcon className={`w-4 h-4 ${showArchived ? 'fill-current' : ''}`} />
              </Button>
            </div>
          )}
        </div>
      </div>

      <div className="p-3 sm:p-4 max-w-3xl mx-auto">
        {activeTab === 'direct' ? (
          loading ? (
            <div className="pt-8">
              <CartoonLoader />
            </div>
          ) : (
            <>
              {/* Active Users Bar */}
              <ActiveUsersList currentUserId={user?.id || ""} />

              {/* Messages List */}
              {filteredConversations.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-12"
                >
                  <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                    <MessageCircle className="w-10 h-10 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">
                    {showUnreadOnly ? "No unread messages" : "No messages yet"}
                  </h3>
                  <p className="text-muted-foreground mb-6 max-w-xs mx-auto">
                    {showUnreadOnly ? "You're all caught up!" : "Start a conversation to see it here."}
                  </p>
                  {!showUnreadOnly && (
                    <Button onClick={() => navigate("/search")} className="rounded-full px-8 shadow-lg">
                      Find People
                    </Button>
                  )}
                </motion.div>
              ) : (
                <div className="space-y-1 pb-4">
                  <AnimatePresence initial={false}>
                    {filteredConversations.map((conv) => (
                      <ConversationItem
                        key={conv.id}
                        conv={conv}
                        onClick={(id) => navigate(`/chat/${id}`)}
                        onPin={handlePin}
                        onArchive={handleArchive}
                      />
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </>
          )
        ) : (
          <GroupsList currentUserId={user?.id || ""} />
        )}
      </div>



      <BottomNav />
    </div>
  );
};

export default React.memo(Messages);
