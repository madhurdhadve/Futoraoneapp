import React, { Component, ErrorInfo, ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Home, RefreshCcw } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Props {
    children: ReactNode;
    sectionName: string;
    fallbackRoute?: string;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

class SectionErrorBoundaryClass extends Component<Props & { navigate: (path: string) => void }, State> {
    public state: State = {
        hasError: false,
        error: null,
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error(`Error in ${this.props.sectionName}:`, error, errorInfo);

        // Log to analytics or error tracking service if needed
        // Analytics.trackError(this.props.sectionName, error);
    }

    private handleRefresh = () => {
        // Reset error state and try again
        this.setState({ hasError: false, error: null });
        window.location.reload();
    };

    private handleGoBack = () => {
        const route = this.props.fallbackRoute || "/feed";
        this.props.navigate(route);
        // Reset error state
        this.setState({ hasError: false, error: null });
    };

    public render() {
        if (this.state.hasError) {
            const isDev = process.env.NODE_ENV === 'development';

            return (
                <div className="min-h-[60vh] flex flex-col items-center justify-center p-4 text-center animate-in fade-in duration-500">
                    <div className="max-w-md w-full space-y-6">
                        <div className="flex justify-center">
                            <div className="p-4 bg-destructive/10 rounded-full">
                                <AlertTriangle className="w-10 h-10 text-destructive" />
                            </div>
                        </div>

                        <div className="space-y-3">
                            <h2 className="text-xl font-bold tracking-tight text-foreground">
                                {this.props.sectionName} में दिक्कत!
                            </h2>
                            <p className="text-muted-foreground leading-relaxed">
                                कुछ गड़बड़ हो गई, पर tension नहीं! 😊
                            </p>
                            <p className="text-sm text-muted-foreground font-medium">
                                Refresh करो या Home वापस जाओ
                            </p>
                        </div>

                        {isDev && (
                            <div className="p-3 bg-muted/50 rounded-lg border border-border text-left overflow-auto max-h-[150px]">
                                <p className="text-xs font-mono text-muted-foreground break-all">
                                    {this.state.error?.toString()}
                                </p>
                            </div>
                        )}

                        <div className="flex flex-col sm:flex-row gap-3">
                            <Button
                                onClick={this.handleRefresh}
                                className="flex-1 gradient-primary text-white font-semibold py-5 shadow-lg hover:shadow-xl transition-all"
                            >
                                <RefreshCcw className="mr-2 h-4 w-4" />
                                Refresh करो
                            </Button>
                            <Button
                                onClick={this.handleGoBack}
                                variant="outline"
                                className="flex-1 font-semibold py-5"
                            >
                                <Home className="mr-2 h-4 w-4" />
                                Home जाओ
                            </Button>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

// Wrapper component to use hooks
export const SectionErrorBoundary: React.FC<Omit<Props, 'navigate'>> = ({ children, sectionName, fallbackRoute }) => {
    const navigate = useNavigate();
    return (
        <SectionErrorBoundaryClass sectionName={sectionName} fallbackRoute={fallbackRoute} navigate={navigate}>
            {children}
        </SectionErrorBoundaryClass>
    );
};
