import { memo } from "react";

interface ProfileStatsProps {
    projectsCount: number;
    followerCount: number;
    followingCount: number;
    onFollowersClick: () => void;
    onFollowingClick: () => void;
}

export const ProfileStats = memo(({
    projectsCount,
    followerCount,
    followingCount,
    onFollowersClick,
    onFollowingClick
}: ProfileStatsProps) => {
    return (
        <div className="flex gap-6 mt-4 pt-4 border-t border-border">
            <div>
                <p className="text-xl font-bold text-foreground">{projectsCount}</p>
                <p className="text-sm text-muted-foreground">Projects</p>
            </div>
            <div
                className="cursor-pointer hover:text-primary transition-colors"
                onClick={onFollowersClick}
            >
                <p className="text-xl font-bold text-foreground">{followerCount}</p>
                <p className="text-sm text-muted-foreground">Followers</p>
            </div>
            <div
                className="cursor-pointer hover:text-primary transition-colors"
                onClick={onFollowingClick}
            >
                <p className="text-xl font-bold text-foreground">{followingCount}</p>
                <p className="text-sm text-muted-foreground">Following</p>
            </div>
        </div>
    );
});

ProfileStats.displayName = "ProfileStats";
