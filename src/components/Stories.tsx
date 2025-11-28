import { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Plus } from "lucide-react";
import { StoryViewer, Story } from "./StoryViewer";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const Stories = () => {
    const [selectedUser, setSelectedUser] = useState<string | null>(null);
    const [storiesByUser, setStoriesByUser] = useState<Record<string, Story[]>>({});
    const [usersWithStories, setUsersWithStories] = useState<any[]>([]);
    const [currentUser, setCurrentUser] = useState<any>(null);
    const { toast } = useToast();

    useEffect(() => {
        fetchStories();
        getCurrentUser();

        // Realtime subscription for new stories
        const channel = supabase
            .channel('public:stories')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'stories' }, () => {
                fetchStories();
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    const getCurrentUser = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
            setCurrentUser(profile);
        }
    };

    const fetchStories = async () => {
        try {
            const { data, error } = await supabase
                .from('stories')
                .select(`
                    id,
                    media_url,
                    media_type,
                    created_at,
                    user_id,
                    profiles (
                        id,
                        username,
                        avatar_url
                    )
                `)
                .gt('expires_at', new Date().toISOString())
                .order('created_at', { ascending: true });

            if (error) throw error;

            const groupedStories: Record<string, Story[]> = {};
            const usersMap = new Map();

            data?.forEach((item: any) => {
                const userId = item.user_id;
                if (!groupedStories[userId]) {
                    groupedStories[userId] = [];
                    usersMap.set(userId, item.profiles);
                }

                groupedStories[userId].push({
                    id: item.id,
                    url: item.media_url,
                    type: item.media_type,
                    createdAt: item.created_at,
                    user: {
                        id: item.profiles.id,
                        username: item.profiles.username,
                        avatar_url: item.profiles.avatar_url
                    }
                });
            });

            setStoriesByUser(groupedStories);
            setUsersWithStories(Array.from(usersMap.values()));

        } catch (error: any) {
            console.error("Error fetching stories:", error);
        }
    };

    const handleUserClick = (userId: string) => {
        if (storiesByUser[userId]) {
            setSelectedUser(userId);
        }
    };

    const handleNextUser = () => {
        const userIds = Object.keys(storiesByUser);
        const currentIndex = userIds.indexOf(selectedUser!);
        if (currentIndex < userIds.length - 1) {
            setSelectedUser(userIds[currentIndex + 1]);
        } else {
            setSelectedUser(null);
        }
    };

    const handlePrevUser = () => {
        const userIds = Object.keys(storiesByUser);
        const currentIndex = userIds.indexOf(selectedUser!);
        if (currentIndex > 0) {
            setSelectedUser(userIds[currentIndex - 1]);
        } else {
            setSelectedUser(null);
        }
    };

    // Function to handle file upload for new story
    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file || !currentUser) return;

        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `${Math.random()}.${fileExt}`;
            const filePath = `stories/${currentUser.id}/${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('stories') // Make sure this bucket exists!
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('stories')
                .getPublicUrl(filePath);

            const { error: dbError } = await supabase.from('stories').insert({
                user_id: currentUser.id,
                media_url: publicUrl,
                media_type: file.type.startsWith('video') ? 'video' : 'image'
            });

            if (dbError) throw dbError;

            toast({
                title: "Story added!",
                description: "Your story has been posted successfully.",
            });

            fetchStories();

        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message,
                variant: "destructive",
            });
        }
    };

    return (
        <>
            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                {/* My Story */}
                <div className="flex flex-col items-center gap-1 min-w-[72px] cursor-pointer relative">
                    <div className="relative">
                        <Avatar className="w-16 h-16 border-2 border-background p-0.5">
                            <AvatarImage src={currentUser?.avatar_url} />
                            <AvatarFallback>ME</AvatarFallback>
                        </Avatar>
                        <label htmlFor="story-upload" className="absolute bottom-0 right-0 bg-primary text-white rounded-full p-0.5 border-2 border-background cursor-pointer hover:bg-primary/90 transition-colors">
                            <Plus className="w-4 h-4" />
                            <input
                                type="file"
                                id="story-upload"
                                className="hidden"
                                accept="image/*,video/*"
                                onChange={handleFileUpload}
                            />
                        </label>
                    </div>
                    <span className="text-xs text-muted-foreground truncate w-full text-center">Your Story</span>
                </div>

                {/* Other Users */}
                {usersWithStories.map((user) => (
                    <div
                        key={user.id}
                        className="flex flex-col items-center gap-1 min-w-[72px] cursor-pointer group"
                        onClick={() => handleUserClick(user.id)}
                    >
                        <div className={`relative p-[2px] rounded-full bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-500`}>
                            <Avatar className="w-16 h-16 border-2 border-background">
                                <AvatarImage src={user.avatar_url} />
                                <AvatarFallback>{user.username?.[0]}</AvatarFallback>
                            </Avatar>
                        </div>
                        <span className="text-xs text-muted-foreground truncate w-full text-center group-hover:text-foreground transition-colors">
                            {user.username}
                        </span>
                    </div>
                ))}
            </div>

            {selectedUser && storiesByUser[selectedUser] && (
                <StoryViewer
                    stories={storiesByUser[selectedUser]}
                    onClose={() => setSelectedUser(null)}
                    onNextUser={handleNextUser}
                    onPrevUser={handlePrevUser}
                />
            )}
        </>
    );
};
