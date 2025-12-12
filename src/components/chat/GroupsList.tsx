import { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate, useParams } from "react-router-dom";
import { Users } from "lucide-react";

interface Group {
    id: string;
    name: string;
    description: string;
    avatar_url: string | null;
    is_public: boolean;
    member_count?: number;
}

interface GroupsListProps {
    currentUserId: string;
}

export function GroupsList({ currentUserId }: GroupsListProps) {
    const [groups, setGroups] = useState<Group[]>([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const { id: activeId } = useParams();

    useEffect(() => {
        fetchGroups();

        // Subscribe to changes in groups or memberships
        const groupSubscription = supabase
            .channel('public:groups')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'groups' }, fetchGroups)
            .subscribe();

        return () => {
            supabase.removeChannel(groupSubscription);
        };
    }, [currentUserId]);

    const fetchGroups = async () => {
        try {
            // 1. Fetch groups the user is a member of
            const { data: memberData, error: memberError } = await supabase
                .from('group_members')
                .select('group_id')
                .eq('user_id', currentUserId);

            if (memberError) throw memberError;

            const memberGroupIds = memberData.map(d => d.group_id);

            // 2. Fetch public groups OR groups user is member of
            // Note: RLS policy allows seeing own groups and public groups, so a simple select should work if we rely on RLS.
            // But we want to separate "Joined" vs "Discover" maybe? 
            // For now, let's just list all accessible groups (Public + Private Joined)

            const { data: groupsData, error: groupsError } = await supabase
                .from('groups')
                .select('*')
                .order('created_at', { ascending: false });

            if (groupsError) throw groupsError;

            setGroups(groupsData || []);
        } catch (error) {
            console.error("Error fetching groups:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleGroupClick = (groupId: string) => {
        navigate(`/messages/group/${groupId}`);
    };

    if (loading) {
        return <div className="p-4 text-center text-muted-foreground">Loading communities...</div>;
    }

    if (groups.length === 0) {
        return (
            <div className="p-8 text-center text-muted-foreground">
                <Users className="w-12 h-12 mx-auto mb-2 opacity-20" />
                <p>No communities found.</p>
                <p className="text-sm">Create one to get started!</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col">
            {groups.map((group) => (
                <div
                    key={group.id}
                    className={`p-4 flex items-center gap-3 hover:bg-muted/50 cursor-pointer transition-colors border-b last:border-0 ${activeId === group.id ? "bg-muted" : ""
                        }`}
                    onClick={() => handleGroupClick(group.id)}
                >
                    <Avatar className="h-10 w-10 border">
                        <AvatarImage src={group.avatar_url || ""} />
                        <AvatarFallback className="bg-primary/10 text-primary">
                            <Users className="h-5 w-5" />
                        </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 overflow-hidden">
                        <div className="flex justify-between items-baseline">
                            <h3 className="font-semibold truncate text-sm">{group.name}</h3>
                            {group.is_public && <span className="text-[10px] bg-secondary px-1.5 py-0.5 rounded text-muted-foreground">Public</span>}
                        </div>
                        <p className="text-xs text-muted-foreground truncate">
                            {group.description || "No description"}
                        </p>
                    </div>
                </div>
            ))}
        </div>
    );
}
