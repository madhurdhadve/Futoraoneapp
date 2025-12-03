import { useState, useMemo, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FeedSearchProps<T extends { id: string; content: string; profiles: { username: string; full_name: string } }> {
    posts: T[];
    onFilteredPostsChange: (filteredPosts: T[] | null) => void;
}

export function FeedSearch<T extends { id: string; content: string; profiles: { username: string; full_name: string } }>({ posts, onFilteredPostsChange }: FeedSearchProps<T>) {
    const [searchQuery, setSearchQuery] = useState('');

    const filteredPosts = useMemo(() => {
        if (!searchQuery.trim()) {
            return null;
        }

        const query = searchQuery.toLowerCase();
        return posts.filter((post) => {
            const contentMatch = post.content.toLowerCase().includes(query);
            const usernameMatch = post.profiles.username.toLowerCase().includes(query);
            const nameMatch = post.profiles.full_name.toLowerCase().includes(query);
            return contentMatch || usernameMatch || nameMatch;
        });
    }, [posts, searchQuery]);

    useEffect(() => {
        onFilteredPostsChange(filteredPosts);
    }, [filteredPosts, onFilteredPostsChange]);

    const handleClear = () => {
        setSearchQuery('');
    };

    return (
        <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
                type="text"
                placeholder="Search posts, users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-10"
            />
            {searchQuery && (
                <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7"
                    onClick={handleClear}
                >
                    <X className="w-4 h-4" />
                </Button>
            )}
            {searchQuery && filteredPosts && (
                <p className="text-xs text-muted-foreground mt-2">
                    Found {filteredPosts.length} {filteredPosts.length === 1 ? 'post' : 'posts'}
                </p>
            )}
        </div>
    );
}