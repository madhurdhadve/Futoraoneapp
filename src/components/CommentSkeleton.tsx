import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";

export const CommentSkeleton = () => {
    return (
        <Card className="p-3">
            <div className="flex items-start gap-3">
                <Skeleton className="h-8 w-8 rounded-full" />
                <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-3 w-32" />
                    <Skeleton className="h-4 w-full" />
                </div>
            </div>
        </Card>
    );
};