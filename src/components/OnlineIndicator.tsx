import { useUserPresence } from "@/hooks/useUserPresence";

interface OnlineIndicatorProps {
  userId: string;
  className?: string;
}

export const OnlineIndicator = ({ userId, className = "" }: OnlineIndicatorProps) => {
  const { isOnline } = useUserPresence(userId);

  if (!isOnline) return null;

  return (
    <div
      className={`absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-background rounded-full ${className}`}
    />
  );
};
