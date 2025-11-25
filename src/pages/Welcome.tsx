import { Button } from "@/components/ui/button";
import { Logo } from "@/components/Logo";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const Welcome = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen gradient-primary flex items-center justify-center p-6">
      <motion.div 
        className="max-w-md w-full text-center space-y-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ 
            type: "spring",
            stiffness: 260,
            damping: 20,
            delay: 0.2 
          }}
        >
          <Logo className="w-32 h-32 mx-auto mb-8" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="space-y-4"
        >
          <h1 className="text-5xl font-bold text-white mb-4">
            FutoraOne
          </h1>
          <p className="text-white/90 text-lg font-medium">
            Where tech enthusiasts share ideas, projects, and innovations
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="space-y-4 pt-4"
        >
          <Button 
            onClick={() => navigate("/auth")}
            className="w-full bg-white text-primary hover:bg-white/90 font-semibold text-lg h-14 rounded-full shadow-xl"
          >
            Get Started
          </Button>

          <p className="text-white/60 text-xs pt-4">
            By continuing, you agree to our{" "}
            <button onClick={() => navigate("/terms")} className="underline hover:text-white">
              Terms of Service
            </button>
            {" "}and{" "}
            <button onClick={() => navigate("/privacy")} className="underline hover:text-white">
              Privacy Policy
            </button>
          </p>
          
          <button 
            onClick={() => navigate("/about")} 
            className="text-white/70 text-sm hover:text-white underline"
          >
            About FutoraOne Tech Community
          </button>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Welcome;
