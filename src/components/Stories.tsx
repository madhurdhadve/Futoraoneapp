import { useState, useEffect, useMemo, useCallback } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Plus } from "lucide-react";
import { StoryViewer, Story } from "./StoryViewer";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import imageCompression from 'browser-image-compression';

// Demo stories for when there are no real users
const DEMO_STORIES = [
    {
        id: 'demo-1',
        user_id: 'test-user-1',
        username: 'Testing 1',
        avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Testing1',
        media_url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&h=600&fit=crop', // Tech/coding
        media_type: 'image'
    },
    {
        id: 'demo-2',
        user_id: 'test-user-2',
        username: 'Testing 2',
        avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Testing2',
        media_url: 'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=400&h=600&fit=crop', // Laptop/tech
        media_type: 'image'
    },
    {
        id: 'demo-3',
        user_id: 'test-user-3',
        username: 'Testing 3',
        avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Testing3',
        media_url: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=400&h=600&fit=crop', // Code on screen
        media_type: 'image'
    },
    {
        id: 'demo-4',
        user_id: 'test-user-4',
        username: 'Testing 4',
        avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Testing4',
        media_url: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400&h=600&fit=crop', // Programming
        media_type: 'image'
    },
    {
        id: 'demo-5',
        user_id: 'test-user-5',
        username: 'Testing 5',
        avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Testing5',
        media_url: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=400&h=600&fit=crop', // Developer workspace
        media_type: 'image'
    },
    {
        id: 'demo-6',
        user_id: 'test-user-6',
        username: 'Testing 6',
        avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Testing6',
        media_url: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=400&h=600&fit=crop', // Laptop code
        media_type: 'image'
    },
    {
        id: 'demo-7',
        user_id: 'test-user-7',
        username: 'Testing 7',
        avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Testing7',
        media_url: 'https://images.unsplash.com/photo-1484417894907-623942c8ee29?w=400&h=600&fit=crop', // MacBook code
        media_type: 'image'
    },
    {
        id: 'demo-8',
        user_id: 'test-user-8',
        username: 'Testing 8',
        avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Testing8',
        media_url: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=400&h=600&fit=crop', // Tech abstract
        media_type: 'image'
    },
    {
        id: 'demo-9',
        user_id: 'test-user-9',
        username: 'Testing 9',
        avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Testing9',
        media_url: 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=400&h=600&fit=crop', // Coding setup
        media_type: 'image'
    },
    {
        id: 'demo-10',
        user_id: 'test-user-10',
        username: 'Testing 10',
        avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Testing10',
        media_url: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=400&h=600&fit=crop', // Code closeup
        media_type: 'image'
    }
];

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

    // Get demo stories formatted as Story objects
    const { demoStoriesGrouped, demoUsers } = useMemo(() => {
        const demoStoriesGrouped: Record<string, Story[]> = {};
        const demoUsers: any[] = [];

        DEMO_STORIES.forEach(story => {
            if (!demoStoriesGrouped[story.user_id]) {
                demoStoriesGrouped[story.user_id] = [];
                demoUsers.push({
                    id: story.user_id,
                    username: story.username,
                    avatar_url: story.avatar_url
                });
            }

            demoStoriesGrouped[story.user_id].push({
                id: story.id,
                url: story.media_url,
                type: story.media_type as 'image' | 'video',
                createdAt: new Date().toISOString(),
                user: {
                    id: story.user_id,
                    username: story.username,
                    avatar_url: story.avatar_url
                }
            });
        });

        return { demoStoriesGrouped, demoUsers };
    }, []);

    // Merge real and demo stories
    const allStories = useMemo(() => ({ ...demoStoriesGrouped, ...storiesByUser }), [demoStoriesGrouped, storiesByUser]);
    const allUsers = useMemo(() => [...demoUsers, ...usersWithStories], [demoUsers, usersWithStories]);

    const handleUserClick = useCallback((userId: string) => {
        if (allStories[userId]) {
            setSelectedUser(userId);
        }
    }, [allStories]);

    const handleNextUser = useCallback(() => {
        const userIds = Object.keys(allStories);
        const currentIndex = userIds.indexOf(selectedUser!);
        if (currentIndex < userIds.length - 1) {
            setSelectedUser(userIds[currentIndex + 1]);
        } else {
            setSelectedUser(null);
        }
    }, [allStories, selectedUser]);

    const handlePrevUser = useCallback(() => {
        const userIds = Object.keys(allStories);
        const currentIndex = userIds.indexOf(selectedUser!);
        if (currentIndex > 0) {
            setSelectedUser(userIds[currentIndex - 1]);
        } else {
            setSelectedUser(null);
        }
    }, [allStories, selectedUser]);

    // Function to handle file upload for new story
    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file || !currentUser) return;

        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `${Math.random()}.${fileExt}`;
            const filePath = `stories/${currentUser.id}/${fileName}`;

            let uploadFile = file;

            // Compress if image
            if (file.type.startsWith('image')) {
                const options = {
                    maxSizeMB: 1,
                    maxWidthOrHeight: 1920,
                    useWebWorker: true,
                };
                try {
                    uploadFile = await imageCompression(file, options);
                } catch (error) {
                    console.error("Story image compression failed:", error);
                }
            }

            const { error: uploadError } = await supabase.storage
                .from('stories') // Make sure this bucket exists!
                .upload(filePath, uploadFile);

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
                {allUsers.map((user) => (
                    <div
                        key={user.id}
                        className="flex flex-col items-center gap-1 min-w-[72px] cursor-pointer group"
                        onClick={() => handleUserClick(user.id)}
                    >
                        <div className={`relative p-[2px] rounded-full bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-500 ring-2 ring-black/30 dark:ring-transparent`}>
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

            {selectedUser && allStories[selectedUser] && (
                <StoryViewer
                    stories={allStories[selectedUser]}
                    onClose={() => setSelectedUser(null)}
                    onNextUser={handleNextUser}
                    onPrevUser={handlePrevUser}
                />
            )}
        </>
    );
};
