import { BadgeCheck } from "lucide-react";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";

interface VerifiedBadgeProps {
    isVerified?: boolean | null;
    size?: number;
    className?: string;
}

export const VerifiedBadge = ({ isVerified, size = 16, className = "" }: VerifiedBadgeProps) => {
    if (!isVerified) return null;

    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <BadgeCheck
                        className={`fill-blue-500 text-white inline-block ${className}`}
                        size={size}
                        aria-label="Verified account"
                    />
                </TooltipTrigger>
                <TooltipContent>
                    <p>Verified Account</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
};
