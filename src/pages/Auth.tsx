import { useState, useEffect, useCallback, memo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/Logo";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, User, Mail, Lock, Loader2, Camera } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { getRandomAvatar } from "@/utils/avatars";




const Auth = () => {
  const [searchParams] = useSearchParams();
  const [isLogin, setIsLogin] = useState(searchParams.get("mode") === "login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [selectedAvatar, setSelectedAvatar] = useState<string | null>(() => getRandomAvatar().url);
  const [profilePhoto, setProfilePhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [showLoginErrorDialog, setShowLoginErrorDialog] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Persistent authentication check
  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user && window.location.pathname === "/auth") {
        navigate("/feed");
      }
    });

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user && window.location.pathname === "/auth") {
        navigate("/feed");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  // Update toggle state if URL param changes
  useEffect(() => {
    setIsLogin(searchParams.get("mode") === "login");
  }, [searchParams]);

  // Auto-select random avatar on component mount for signup
  useEffect(() => {
    if (!isLogin && !selectedAvatar) {
      setSelectedAvatar(getRandomAvatar().url);
    }
  }, [isLogin, selectedAvatar]);

  const handlePhotoChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfilePhoto(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const uploadProfilePhoto = useCallback(async (userId: string): Promise<string | null> => {
    if (!profilePhoto) return null;

    try {
      const fileExt = profilePhoto.name.split('.').pop();
      const fileName = `${userId}-${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, profilePhoto);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (error) {
      console.error('Error uploading photo:', error);
      return null;
    }
  }, [profilePhoto]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        toast({
          title: "Welcome back!",
          description: "You've successfully signed in.",
        });
        navigate("/feed");
      } else {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
              username: username,
            },
            emailRedirectTo: `${window.location.origin}/feed`,
          },
        });

        if (error) throw error;

        // Upload profile photo if provided
        let avatarUrl = selectedAvatar;
        if (data.user && profilePhoto) {
          avatarUrl = await uploadProfilePhoto(data.user.id);
        }

        // Set avatar to profile
        if (data.user && avatarUrl) {
          await supabase
            .from('profiles')
            .update({ avatar_url: avatarUrl })
            .eq('id', data.user.id);
        }

        toast({
          title: "Account created!",
          description: "Welcome to FutoraOne Tech Community!",
        });
        navigate("/feed");
      }
    } catch (error: any) {
      // Check for invalid login credentials
      if (isLogin && error.message && (error.message.includes("Invalid login credentials") || error.message.includes("Invalid credentials"))) {
        setShowLoginErrorDialog(true);
      } else {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  }, [isLogin, email, password, fullName, username, profilePhoto, selectedAvatar, navigate, toast, uploadProfilePhoto]);

  return (
    <div className="dark min-h-screen bg-background relative flex items-center justify-center p-4 overflow-hidden">
      {/* Dynamic Background */}
      <div className="absolute inset-0 bg-background z-0">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background opacity-80"></div>
        <div className="absolute -top-40 -left-40 w-[600px] h-[600px] bg-primary/20 rounded-full blur-[128px]"></div>
        <div className="absolute -bottom-40 -right-40 w-[600px] h-[600px] bg-purple-500/10 rounded-full blur-[128px]"></div>
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, type: "spring", bounce: 0.3 }}
        className="w-full max-w-lg relative z-10"
      >
        <div className="absolute -top-12 left-0">
          <Button
            variant="ghost"
            onClick={() => navigate("/")}
            className="text-muted-foreground hover:text-foreground hover:bg-white/5"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </div>

        <div className="bg-card/40 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="p-8 pb-6 text-center border-b border-white/5 bg-white/5">
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-2xl mb-4"
            >
              <Logo className="w-12 h-12" />
            </motion.div>
            <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70">
              {isLogin ? "Welcome Back" : "Join the Community"}
            </h2>
            <p className="text-muted-foreground mt-2">
              {isLogin ? "Enter your credentials to access your account" : "Start your journey with FutoraOne today"}
            </p>
          </div>

          <div className="p-8 pt-6">
            {/* Toggle Switch */}
            <div className="grid grid-cols-2 gap-1 p-1 bg-secondary/50 rounded-xl mb-8 relative">
              <motion.div
                layoutId="active-tab"
                className={cn("absolute inset-1 w-[calc(50%-4px)] bg-background rounded-lg shadow-sm")}
                style={{ left: !isLogin ? '4px' : 'calc(50%)' }}
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
              />
              <button
                onClick={() => { setIsLogin(false); navigate("?mode=signup", { replace: true }); }}
                className={cn("relative z-10 py-2.5 text-sm font-semibold transition-colors rounded-lg", !isLogin ? "text-foreground" : "text-muted-foreground hover:text-foreground/80")}
              >
                Create Account
              </button>
              <button
                onClick={() => { setIsLogin(true); navigate("?mode=login", { replace: true }); }}
                className={cn("relative z-10 py-2.5 text-sm font-semibold transition-colors rounded-lg", isLogin ? "text-foreground" : "text-muted-foreground hover:text-foreground/80")}
              >
                Sign In
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <AnimatePresence mode="wait">
                {!isLogin && (
                  <motion.div
                    key="signup-fields"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-5 overflow-hidden"
                  >
                    {/* Photo Upload */}
                    <div className="flex justify-center mb-6">
                      <div className="relative">
                        <label htmlFor="photo-upload" className="cursor-pointer group">
                          <div className="w-24 h-24 rounded-full border-4 border-background shadow-xl overflow-hidden bg-secondary flex items-center justify-center">
                            {photoPreview ? (
                              <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                            ) : (
                              <User className="w-10 h-10 text-muted-foreground" />
                            )}
                          </div>
                          <div className="absolute inset-0 flex items-center justify-center bg-black/40 text-white opacity-0 group-hover:opacity-100 transition-opacity rounded-full">
                            <Camera className="w-8 h-8" />
                          </div>
                        </label>
                        <input
                          id="photo-upload"
                          type="file"
                          accept="image/*"
                          onChange={handlePhotoChange}
                          className="hidden"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-5">
                      <div className="space-y-2">
                        <Label htmlFor="fullName" className="text-white">Full Name</Label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input id="fullName" placeholder="Name" value={fullName} onChange={(e) => setFullName(e.target.value)} className="pl-10 h-11 bg-secondary/30 border-white/10 focus:border-primary/50 text-white placeholder:text-muted-foreground" required />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="username" className="text-white">Username</Label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-mono">@</span>
                          <Input id="username" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} className="pl-8 h-11 bg-secondary/30 border-white/10 focus:border-primary/50 text-white placeholder:text-muted-foreground" required />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-white">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input id="email" type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="pl-10 h-11 bg-secondary/30 border-white/10 focus:border-primary/50 text-white placeholder:text-muted-foreground" required />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-white">Password</Label>
                  {isLogin && (
                    <a href="#" className="text-xs text-primary hover:underline">Forgot password?</a>
                  )}
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input id="password" type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className="pl-10 h-11 bg-secondary/30 border-white/10 focus:border-primary/50 text-white placeholder:text-muted-foreground" required minLength={6} />
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-12 rounded-xl text-md font-bold bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] mt-4"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : isLogin ? "Sign In" : "Create Account"}
              </Button>
            </form>
          </div>

          {/* Footer of Card */}
          <div className="p-6 bg-white/5 border-t border-white/5 text-center">
            <p className="text-sm text-muted-foreground">
              By continuing, you agree to our <span className="text-primary cursor-pointer hover:underline">Terms</span> and <span className="text-primary cursor-pointer hover:underline">Privacy Policy</span>.
            </p>
          </div>
        </div>
      </motion.div>

      <Dialog open={showLoginErrorDialog} onOpenChange={setShowLoginErrorDialog}>
        <DialogContent className="sm:max-w-md bg-card/95 backdrop-blur-xl border-white/10">
          <DialogHeader>
            <div className="mx-auto w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center mb-4">
              <Lock className="w-6 h-6 text-red-500" />
            </div>
            <DialogTitle className="text-center text-xl font-bold">Authentication Failed</DialogTitle>
            <DialogDescription className="text-center text-base mt-2">
              We couldn't find an account with those credentials. Would you like to create one instead?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="sm:justify-center mt-4 gap-2">
            <Button variant="ghost" onClick={() => setShowLoginErrorDialog(false)}>Try Again</Button>
            <Button
              className="bg-primary text-primary-foreground font-semibold"
              onClick={() => {
                setShowLoginErrorDialog(false);
                setIsLogin(false);
                navigate("?mode=signup");
              }}
            >
              Create Account
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default memo(Auth);
