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
}

const ConversationItem = React.memo(({ conv, onClick }: { conv: ConversationWithDetails, onClick: (id: string) => void }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    whileHover={{ scale: 1.01 }}
    transition={{ duration: 0.2 }}
  >
    <Card
      className={`border-0 shadow-sm hover:shadow-md transition-all cursor-pointer bg-card/50 hover:bg-card mb-2 ${conv.unreadCount > 0 ? 'bg-primary/5 ring-1 ring-primary/10' : ''}`}
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
              <h3 className={`font-semibold text-base truncate ${conv.unreadCount > 0 ? 'text-foreground' : 'text-foreground/90'}`}>
                {conv.otherUser.full_name}
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
  </motion.div>
));

import { ActiveUsersList } from "@/components/chat/ActiveUsersList";
import { MessageSquarePlus, Filter, Archive } from "lucide-react";

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

  const filteredConversations = conversations.filter(conv => {
    const matchesSearch = conv.otherUser.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conv.otherUser.username.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesUnread = showUnreadOnly ? conv.unreadCount > 0 : true;
    return matchesSearch && matchesUnread;
  });

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
              onClick={() => setActiveTab('direct')}
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
            <div className="flex gap-2">
              <div className="relative group flex-1">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                </div>
                <Input
                  placeholder="Search..."
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
              >
                <Filter className={`w-4 h-4 ${showUnreadOnly ? 'fill-current' : ''}`} />
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
                <AnimatePresence>
                  <div className="space-y-1 pb-4">
                    {filteredConversations.map((conv) => (
                      <ConversationItem
                        key={conv.id}
                        conv={conv}
                        onClick={(id) => navigate(`/chat/${id}`)}
                      />
                    ))}
                  </div>
                </AnimatePresence>
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
