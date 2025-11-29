import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { BottomNav } from "@/components/BottomNav";
import { MessageCircle, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { formatDistanceToNow } from "date-fns";
import type { User } from "@supabase/supabase-js";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

// Demo chat users that appear for all users
const DEMO_CHAT_USERS = [
  {
    id: 'demo-chat-1',
    updated_at: new Date().toISOString(),
    otherUser: {
      id: 'test-user-1',
      username: 'Testing 1',
      full_name: 'Testing 1',
      avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Testing1'
    },
    lastMessage: {
      content: 'Hey! Welcome to FutoraOne! 👋',
      created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString()
    },
    unreadCount: 0
  },
  {
    id: 'demo-chat-2',
    updated_at: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
    otherUser: {
      id: 'test-user-2',
      username: 'Testing 2',
      full_name: 'Testing 2',
      avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Testing2'
    },
    lastMessage: {
      content: 'Check out my latest project! 🚀',
      created_at: new Date(Date.now() - 1000 * 60 * 60).toISOString()
    },
    unreadCount: 0
  },
  {
    id: 'demo-chat-3',
    updated_at: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    otherUser: {
      id: 'test-user-3',
      username: 'Testing 3',
      full_name: 'Testing 3',
      avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Testing3'
    },
    lastMessage: {
      content: 'Need help with React hooks?',
      created_at: new Date(Date.now() - 1000 * 60 * 120).toISOString()
    },
    unreadCount: 0
  },
  {
    id: 'demo-chat-4',
    updated_at: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
    otherUser: {
      id: 'test-user-4',
      username: 'Testing 4',
      full_name: 'Testing 4',
      avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Testing4'
    },
    lastMessage: {
      content: 'Let's collaborate on something!',
      created_at: new Date(Date.now() - 1000 * 60 * 180).toISOString()
    },
    unreadCount: 0
  },
  {
    id: 'demo-chat-5',
    updated_at: new Date(Date.now() - 1000 * 60 * 240).toISOString(),
    otherUser: {
      id: 'test-user-5',
      username: 'Testing 5',
      full_name: 'Testing 5',
      avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Testing5'
    },
    lastMessage: {
      content: 'Anyone up for a hackathon? 💻',
      created_at: new Date(Date.now() - 1000 * 60 * 240).toISOString()
    },
    unreadCount: 0
  }
];

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

useEffect(() => {
  if (user) {
    fetchConversations();
    subscribeToConversations();
  }
}, [user]);

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

  // Get unread message counts
  const unreadCounts: Record<string, number> = {};
  for (const participation of participations) {
    const { count } = await supabase
      .from("messages")
      .select("*", { count: "exact", head: true })
      .eq("conversation_id", participation.conversation_id)
      .neq("sender_id", user.id)
      .gt("created_at", participation.last_read_at || "1970-01-01");

    unreadCounts[participation.conversation_id] = count || 0;
  }

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

  // Merge demo users with real conversations
  const allConversations = [...DEMO_CHAT_USERS, ...conversationDetails];

  setConversations(allConversations);
  setLoading(false);
};

const handleConversationClick = (conv: ConversationWithDetails) => {
  // Check if it's a demo user
  if (conv.id.startsWith('demo-chat-')) {
    toast({
      title: "Demo User",
      description: "This is a demo conversation. Start chatting with real users by searching for them!",
    });
    return;
  }
  navigate(`/chat/${conv.id}`);
};

const handleSearchUsers = () => {
  if (searchQuery.trim()) {
    navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
  }
};

return (
  <div className="min-h-screen bg-background pb-24">
    <div className="sticky top-0 z-10 bg-card border-b border-border p-3 sm:p-4">
      <h1 className="text-xl sm:text-2xl font-bold text-foreground mb-4">Messages</h1>
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
    </div>

    <div className="p-3 sm:p-4">
      {loading ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground">Loading conversations...</p>
        </div>
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
              onClick={() => handleConversationClick(conv)}
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
      )}
    </div>

    <BottomNav />
  </div>
);
};

export default Messages;
