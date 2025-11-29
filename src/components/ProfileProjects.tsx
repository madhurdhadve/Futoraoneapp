import { memo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Project {
    id: string;
    title: string;
    description: string;
    tech_stack: string[];
    project_likes: { id: string }[];
}

interface ProfileProjectsProps {
    projects: Project[];
}

export const ProfileProjects = memo(({ projects }: ProfileProjectsProps) => {
    return (
        <>
            {projects.map((project, index) => (
                <Card key={index} className="bg-card border-border">
                    <CardContent className="p-4">
                        <h4 className="font-semibold text-foreground">{project.title}</h4>
                        <p className="text-sm text-muted-foreground mt-1">{project.description}</p>
                        <div className="flex items-center justify-between mt-2">
                            <div className="flex gap-2">
                                {project.tech_stack?.slice(0, 3).map((tech: string) => (
                                    <Badge key={tech} variant="outline" className="text-xs border-primary text-primary">
                                        {tech}
                                    </Badge>
                                ))}
                            </div>
                            <span className="text-sm text-muted-foreground">{project.project_likes?.length || 0} likes</span>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </>
    );
});

ProfileProjects.displayName = "ProfileProjects";
