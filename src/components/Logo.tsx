import { Heart } from "lucide-react";
import { motion } from "framer-motion";

export const Logo = ({ className = "" }: { className?: string }) => {
  return (
    <div className={`relative inline-flex items-center justify-center ${className}`}>
      <motion.div 
        className="absolute w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-lg"
        animate={{ rotate: 360 }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
      >
        <Heart className="w-12 h-12 fill-secondary text-secondary" />
      </motion.div>
      
      {/* Decorative dots */}
      <motion.div 
        className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full"
        animate={{ y: [-5, 5, -5] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div 
        className="absolute -bottom-2 -left-2 w-3 h-3 bg-cyan-400 rounded-full"
        animate={{ y: [5, -5, 5] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
};
