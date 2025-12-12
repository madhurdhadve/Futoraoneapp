import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { GroupChatWindow } from "@/components/chat/GroupChatWindow";
import { BottomNav } from "@/components/BottomNav";
import { Loader2 } from "lucide-react";

export default function GroupChat() {
    const { groupId } = useParams();
    const [userId, setUserId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (!session) {
                navigate("/auth");
            } else {
                setUserId(session.user.id);
            }
            setLoading(false);
        });
    }, [navigate]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!userId || !groupId) return null;

    return (
        <div className="min-h-screen bg-background">
            <GroupChatWindow groupId={groupId} currentUserId={userId} />
        </div>
    );
}
