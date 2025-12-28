import React, { Component, ErrorInfo, ReactNode } from "react";
import * as Sentry from "@sentry/react";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCcw } from "lucide-react";

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
    errorType: 'chunk' | 'render' | 'network' | 'unknown';
    retryCount: number;
    cachedMessage?: {
        title: string;
        description: string;
        subtitle: string;
    };
}

export class GlobalErrorBoundary extends Component<Props, State> {
    private maxRetries = 2;

    public state: State = {
        hasError: false,
        error: null,
        errorType: 'unknown',
        retryCount: 0,
        cachedMessage: undefined,
    };

    public static getDerivedStateFromError(error: Error): Partial<State> {
        // Detect error type for better handling
        let errorType: State['errorType'] = 'unknown';

        if (error.name === 'ChunkLoadError' || error.message.includes('Loading chunk') || error.message.includes('Failed to fetch dynamically imported module')) {
            errorType = 'chunk';
        } else if (error.message.includes('NetworkError') || error.message.includes('Failed to fetch')) {
            errorType = 'network';
        } else {
            errorType = 'render';
        }

        return { hasError: true, error, errorType };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error("Uncaught error:", error, errorInfo);
        Sentry.captureException(error);
        console.error("Error stack:", error.stack);
        console.error("Component stack:", errorInfo.componentStack);

        // Auto-retry for chunk loading errors (common during deployments)
        if (this.state.errorType === 'chunk' && this.state.retryCount < this.maxRetries) {
            console.log(`ChunkLoadError detected, auto-retrying (${this.state.retryCount + 1}/${this.maxRetries})...`);

            // Use functional state update to increment retry count
            this.setState(prev => ({
                ...prev,
                retryCount: prev.retryCount + 1,
                cachedMessage: undefined // Clear cache for new message
            }));

            setTimeout(() => {
                // Clear any cached modules
                if ('caches' in window) {
                    caches.keys().then(names => {
                        names.forEach(name => caches.delete(name));
                    }).catch(() => { }); // Silently handle cache errors
                }
                window.location.reload();
            }, 1000);
        }
    }

    private handleReset = () => {
        // Clear potentially corrupted state/cache
        try {
            // Clear localStorage except auth-related items
            const keysToPreserve = ['supabase.auth.token', 'vite-ui-theme'];
            const storage: { [key: string]: string } = {};

            keysToPreserve.forEach(key => {
                const value = localStorage.getItem(key);
                if (value) storage[key] = value;
            });

            localStorage.clear();

            Object.entries(storage).forEach(([key, value]) => {
                localStorage.setItem(key, value);
            });

            // Clear session storage
            sessionStorage.clear();

            // Clear service worker caches if available
            if ('caches' in window) {
                caches.keys().then(names => {
                    names.forEach(name => caches.delete(name));
                });
            }

            // Redirect to home
            window.location.assign("/feed");
        } catch (e) {
            console.error("Error during reset:", e);
            window.location.reload();
        }
    };

    private getErrorMessage() {
        const { errorType, retryCount, cachedMessage } = this.state;

        // Return cached message if errorType and retryCount haven't changed
        if (cachedMessage) {
            return cachedMessage;
        }

        let message;

        if (retryCount > 0) {
            message = {
                title: "Phir se koshish kar rahe hain...",
                description: "Ruko zara, sab theek ho jayega! 🔄",
                subtitle: `Koshish ${retryCount}/${this.maxRetries}`,
            };
        } else {
            switch (errorType) {
                case 'chunk':
                    message = {
                        title: "Kuch galat ho gaya!",
                        description: "App update ho gayi hogi, bas refresh karna padega 🔄",
                        subtitle: "Ek click mein sab theek!",
                    };
                    break;
                case 'network':
                    message = {
                        title: "Internet ka jhamela!",
                        description: "Connection check karo aur refresh maaro 📶",
                        subtitle: "Network theek karke phir se try karo!",
                    };
                    break;
                case 'render':
                    message = {
                        title: "कुछ गलत हो गया!",
                        description: "Badi mushkil se bani hoon, time lagega na 😄",
                        subtitle: "Ek refresh aur ho jaaye!",
                    };
                    break;
                default:
                    message = {
                        title: "Arre, kuch gadbad hai!",
                        description: "Tension mat lo, refresh se sab theek ho jayega 🚀",
                        subtitle: "Bas ek baar refresh kar do!",
                    };
            }
        }

        // Cache the message for future renders
        this.state.cachedMessage = message;
        return message;
    }

    public render() {
        if (this.state.hasError) {
            const message = this.getErrorMessage();

            return (
                <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-background text-foreground text-center animate-in fade-in duration-500">
                    <div className="max-w-md w-full space-y-6">
                        <div className="flex justify-center">
                            <div className="p-4 bg-destructive/10 rounded-full animate-pulse">
                                <AlertTriangle className="w-12 h-12 text-destructive" />
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h1 className="text-2xl font-bold tracking-tight text-foreground">
                                {message.title}
                            </h1>
                            <div className="space-y-2">
                                <p className="text-muted-foreground leading-relaxed text-lg">
                                    {message.description}
                                </p>
                                <p className="text-muted-foreground font-medium">
                                    {message.subtitle}
                                </p>
                            </div>
                        </div>

                        {process.env.NODE_ENV === 'development' && (
                            <div className="p-4 bg-muted/50 rounded-lg border border-border text-left overflow-auto max-h-[200px]">
                                <p className="text-xs font-mono text-muted-foreground break-all">
                                    {this.state.error?.toString()}
                                </p>
                                <p className="text-xs font-mono text-muted-foreground/70 mt-2">
                                    Type: {this.state.errorType}
                                </p>
                            </div>
                        )}

                        <div className="flex flex-col gap-3">
                            <Button
                                onClick={this.handleReset}
                                className="w-full gradient-primary text-white font-semibold py-6 text-lg shadow-lg hover:shadow-xl transition-all"
                            >
                                <RefreshCcw className="mr-2 h-5 w-5" />
                                Refresh karo
                            </Button>
                            <p className="text-xs text-muted-foreground">
                                Agar problem bani rahe to browser cache clear kar do
                            </p>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
