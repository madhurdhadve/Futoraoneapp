import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { BottomNav } from "@/components/BottomNav";
import { MessageCircle, Search, Users } from "lucide-react";
import { Input } from "@/components/ui/input";
import { formatDistanceToNow } from "date-fns";
import type { User } from "@supabase/supabase-js";
import { Badge } from "@/components/ui/badge";
import { CartoonLoader } from "@/components/CartoonLoader";
import { CreateGroupDialog } from "@/components/chat/CreateGroupDialog";
import { GroupsList } from "@/components/chat/GroupsList";

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

const Messages = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [conversations, setConversations] = useState<ConversationWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<'direct' | 'groups'>('direct');

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (user && activeTab === 'direct') {
      fetchConversations();
      subscribeToConversations();
    }
  }, [user, activeTab]);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate("/auth");
      return;
    }
    setUser(user);
  };

  const subscribeToConversations = () => {
    const channel = supabase
      .channel('conversations-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages'
        },
        () => {
          fetchConversations();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const fetchConversations = async () => {
    if (!user) return;
    setLoading(true);

    // Get all conversations the user is part of
    const { data: participations } = await supabase
      .from("conversation_participants")
      .select("conversation_id, last_read_at, conversations(id, updated_at)")
      .eq("user_id", user.id);

    if (!participations || participations.length === 0) {
      setLoading(false);
      setConversations([]);
      return;
    }

    const conversationIds = participations.map(p => p.conversation_id);

    // Get other participants for each conversation
    const { data: otherParticipants } = await supabase
      .from("conversation_participants")
      .select("conversation_id, user_id, profiles(id, username, full_name, avatar_url)")
      .in("conversation_id", conversationIds)
      .neq("user_id", user.id);

    // Get last message for each conversation
    const { data: lastMessages } = await supabase
      .from("messages")
      .select("conversation_id, content, created_at")
      .in("conversation_id", conversationIds)
      .order("created_at", { ascending: false });

    // Get unread message counts - optimized single query instead of N+1
    const { data: unreadMessages } = await supabase
      .from("messages")
      .select("conversation_id, sender_id, created_at")
      .in("conversation_id", conversationIds)
      .neq("sender_id", user.id);

    // Calculate unread counts per conversation in JavaScript
    const unreadCounts: Record<string, number> = {};
    participations.forEach(p => {
      const count = unreadMessages?.filter(msg =>
        msg.conversation_id === p.conversation_id &&
        msg.created_at > (p.last_read_at || "1970-01-01")
      ).length || 0;
      unreadCounts[p.conversation_id] = count;
    });

    // Build conversation details
    const conversationDetails: ConversationWithDetails[] = participations
      .map(p => {
        const conv = p.conversations as any;
        const otherParticipant = otherParticipants?.find(
          op => op.conversation_id === p.conversation_id
        );
        const lastMsg = lastMessages?.find(
          m => m.conversation_id === p.conversation_id
        );

        if (!otherParticipant?.profiles) return null;

        return {
          id: conv.id,
          updated_at: conv.updated_at,
          otherUser: otherParticipant.profiles as any,
          lastMessage: lastMsg || null,
          unreadCount: unreadCounts[p.conversation_id] || 0
        };
      })
      .filter(Boolean) as ConversationWithDetails[];

    // Sort by most recent
    conversationDetails.sort((a, b) =>
      new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
    );

    setConversations(conversationDetails);
    setLoading(false);
  };

  const handleSearchUsers = () => {
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="sticky top-0 z-10 bg-card border-b border-border p-3 sm:p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">Messages</h1>
          {activeTab === 'groups' && <CreateGroupDialog onGroupCreated={() => { }} />}
        </div>

        {/* Tabs */}
        <div className="flex p-1 bg-muted/50 rounded-lg">
          <button
            className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-md transition-all ${activeTab === 'direct'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:bg-background/50'
              }`}
            onClick={() => setActiveTab('direct')}
          >
            <MessageCircle className="w-4 h-4" />
            Direct
          </button>
          <button
            className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-md transition-all ${activeTab === 'groups'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:bg-background/50'
              }`}
            onClick={() => setActiveTab('groups')}
          >
            <Users className="w-4 h-4" />
            Communities
          </button>
        </div>

        {activeTab === 'direct' && (
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={18} />
            <Input
              placeholder="Search users to message..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearchUsers()}
              className="pl-10 bg-background border-border"
            />
          </div>
        )}
      </div>

      <div className="p-3 sm:p-4">
        {activeTab === 'direct' ? (
          loading ? (
            <CartoonLoader />
          ) : conversations.length === 0 ? (
            <Card className="bg-card border-border">
              <CardContent className="p-8 text-center">
                <MessageCircle className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground mb-4">No conversations yet</p>
                <Button onClick={() => navigate("/search")}>
                  Find people to message
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {conversations.map((conv) => (
                <Card
                  key={conv.id}
                  className="bg-card border-border hover:border-primary transition-all cursor-pointer"
                  onClick={() => navigate(`/chat/${conv.id}`)}
                >
                  <CardContent className="p-3 sm:p-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-12 w-12 shrink-0">
                        <AvatarImage src={conv.otherUser.avatar_url || undefined} />
                        <AvatarFallback className="bg-primary text-primary-foreground">
                          {conv.otherUser.username[0]?.toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className="font-semibold text-foreground truncate">
                            {conv.otherUser.full_name}
                          </p>
                          {conv.lastMessage && (
                            <span className="text-xs text-muted-foreground shrink-0">
                              {formatDistanceToNow(new Date(conv.lastMessage.created_at), {
                                addSuffix: true
                              })}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-sm text-muted-foreground truncate">
                            {conv.lastMessage?.content || "Start a conversation"}
                          </p>
                          {conv.unreadCount > 0 && (
                            <Badge className="bg-primary text-primary-foreground shrink-0">
                              {conv.unreadCount}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
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
