import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Briefcase, TrendingUp, DollarSign } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export interface FounderListing {
    id: string;
    user_id: string;
    role_needed: string;
    idea_description: string;
    equity_range: string;
    stage: string;
    industry: string;
    location: string;
    created_at: string;
    profiles?: {
        full_name: string;
        avatar_url: string | null;
        username: string;
    };
}

interface FounderListingCardProps {
    listing: FounderListing;
}

export const FounderListingCard = ({ listing }: FounderListingCardProps) => {
    return (
        <Card className="hover:shadow-lg transition-shadow border-2 border-transparent hover:border-primary/10">
            <CardHeader className="pb-3">
                <div className="flex justify-between items-start gap-4">
                    <div>
                        <Badge variant="outline" className="mb-2 bg-primary/5 hover:bg-primary/10 text-primary border-primary/20">
                            {listing.industry}
                        </Badge>
                        <h3 className="text-xl font-bold bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text">
                            Looking for: {listing.role_needed}
                        </h3>
                    </div>
                    <Avatar className="h-10 w-10 border-2 border-background shadow-sm">
                        <AvatarImage src={listing.profiles?.avatar_url || undefined} />
                        <AvatarFallback>{listing.profiles?.full_name?.[0] || 'U'}</AvatarFallback>
                    </Avatar>
                </div>
            </CardHeader>

            <CardContent className="pb-3 space-y-4">
                <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
                    {listing.idea_description}
                </p>

                <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <TrendingUp className="w-4 h-4 text-green-500" />
                        <span className="font-medium text-foreground/80">{listing.stage}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <DollarSign className="w-4 h-4 text-yellow-500" />
                        <span className="font-medium text-foreground/80">{listing.equity_range}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground col-span-2">
                        <MapPin className="w-4 h-4 text-blue-500" />
                        <span className="font-medium text-foreground/80">{listing.location}</span>
                    </div>
                </div>
            </CardContent>

            <CardFooter className="pt-2">
                <Button className="w-full gap-2 bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 shadow-md">
                    <Briefcase className="w-4 h-4" />
                    Connect with Founder
                </Button>
            </CardFooter>
        </Card>
    );
};
