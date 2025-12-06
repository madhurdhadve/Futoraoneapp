import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Trophy, 
  Flame, 
  Star, 
  Target, 
  Zap, 
  Award,
  ChevronRight,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';

interface Challenge {
  id: string;
  title: string;
  description: string;
  xp: number;
  progress: number;
  total: number;
  icon: React.ElementType;
  color: string;
  deadline?: string;
}

interface SkillBadge {
  id: string;
  name: string;
  icon: string;
  level: number;
  maxLevel: number;
  color: string;
}

const dailyChallenges: Challenge[] = [
  {
    id: '1',
    title: 'First Post of the Day',
    description: 'Create your first post today',
    xp: 50,
    progress: 0,
    total: 1,
    icon: Target,
    color: 'text-blue-500'
  },
  {
    id: '2',
    title: 'Engagement Master',
    description: 'Like and comment on 5 posts',
    xp: 75,
    progress: 2,
    total: 5,
    icon: Flame,
    color: 'text-orange-500'
  },
  {
    id: '3',
    title: 'Knowledge Sharer',
    description: 'Share a code snippet or tutorial',
    xp: 100,
    progress: 0,
    total: 1,
    icon: Zap,
    color: 'text-yellow-500'
  }
];

const skillBadges: SkillBadge[] = [
  { id: '1', name: 'React Pro', icon: '⚛️', level: 3, maxLevel: 5, color: 'bg-cyan-500' },
  { id: '2', name: 'Python Master', icon: '🐍', level: 2, maxLevel: 5, color: 'bg-green-500' },
  { id: '3', name: 'AI Explorer', icon: '🤖', level: 1, maxLevel: 5, color: 'bg-purple-500' },
  { id: '4', name: 'Cloud Architect', icon: '☁️', level: 4, maxLevel: 5, color: 'bg-blue-500' },
];

interface GamificationWidgetProps {
  userXP?: number;
  userLevel?: number;
  streak?: number;
}

const GamificationWidget = ({ 
  userXP = 1250, 
  userLevel = 5, 
  streak = 7 
}: GamificationWidgetProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const xpToNextLevel = 500;
  const currentLevelProgress = (userXP % xpToNextLevel) / xpToNextLevel * 100;

  return (
    <>
      {/* Compact Widget */}
      <motion.button
        onClick={() => setIsExpanded(true)}
        className="flex items-center gap-3 bg-gradient-to-r from-primary/10 to-purple-500/10 border border-primary/20 rounded-2xl p-3 hover:border-primary/40 transition-all w-full"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <div className="relative">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center text-white font-bold">
            {userLevel}
          </div>
          <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center">
            <Flame className="w-3 h-3 text-white" />
          </div>
        </div>
        
        <div className="flex-1 text-left">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-sm">Level {userLevel}</span>
            <Badge variant="secondary" className="text-xs">
              <Flame className="w-3 h-3 mr-1 text-orange-500" />
              {streak} day streak
            </Badge>
          </div>
          <div className="mt-1">
            <Progress value={currentLevelProgress} className="h-1.5" />
            <p className="text-xs text-muted-foreground mt-0.5">
              {userXP % xpToNextLevel}/{xpToNextLevel} XP to Level {userLevel + 1}
            </p>
          </div>
        </div>
        
        <ChevronRight className="w-5 h-5 text-muted-foreground" />
      </motion.button>

      {/* Expanded Modal */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4"
            onClick={() => setIsExpanded(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-card border border-border rounded-2xl w-full max-w-md max-h-[80vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-primary to-purple-600 p-6 text-white relative">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsExpanded(false)}
                  className="absolute top-4 right-4 text-white hover:bg-white/20"
                >
                  <X className="w-5 h-5" />
                </Button>
                
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center text-3xl font-bold">
                    {userLevel}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">Level {userLevel}</h2>
                    <p className="opacity-80">{userXP.toLocaleString()} Total XP</p>
                    <div className="flex items-center gap-1 mt-1">
                      <Flame className="w-4 h-4 text-orange-300" />
                      <span className="text-sm">{streak} day streak!</span>
                    </div>
                  </div>
                </div>
                
                <div className="mt-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span>Progress to Level {userLevel + 1}</span>
                    <span>{Math.round(currentLevelProgress)}%</span>
                  </div>
                  <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-white rounded-full transition-all"
                      style={{ width: `${currentLevelProgress}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="p-4 space-y-6 overflow-y-auto max-h-[50vh]">
                {/* Daily Challenges */}
                <div>
                  <h3 className="font-semibold flex items-center gap-2 mb-3">
                    <Trophy className="w-5 h-5 text-yellow-500" />
                    Daily Challenges
                  </h3>
                  <div className="space-y-3">
                    {dailyChallenges.map((challenge) => (
                      <div 
                        key={challenge.id}
                        className="bg-secondary/50 rounded-xl p-3"
                      >
                        <div className="flex items-start gap-3">
                          <div className={`w-10 h-10 rounded-lg bg-secondary flex items-center justify-center ${challenge.color}`}>
                            <challenge.icon className="w-5 h-5" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <span className="font-medium text-sm">{challenge.title}</span>
                              <Badge variant="outline" className="text-xs">
                                +{challenge.xp} XP
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {challenge.description}
                            </p>
                            <div className="mt-2">
                              <Progress 
                                value={(challenge.progress / challenge.total) * 100} 
                                className="h-1.5"
                              />
                              <p className="text-xs text-muted-foreground mt-1">
                                {challenge.progress}/{challenge.total} completed
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Skill Badges */}
                <div>
                  <h3 className="font-semibold flex items-center gap-2 mb-3">
                    <Award className="w-5 h-5 text-primary" />
                    Your Skill Badges
                  </h3>
                  <div className="grid grid-cols-2 gap-2">
                    {skillBadges.map((badge) => (
                      <div 
                        key={badge.id}
                        className="bg-secondary/50 rounded-xl p-3 text-center"
                      >
                        <div className="text-3xl mb-1">{badge.icon}</div>
                        <p className="font-medium text-sm">{badge.name}</p>
                        <div className="flex items-center justify-center gap-1 mt-1">
                          {Array.from({ length: badge.maxLevel }).map((_, i) => (
                            <Star
                              key={i}
                              className={`w-3 h-3 ${
                                i < badge.level 
                                  ? 'text-yellow-500 fill-yellow-500' 
                                  : 'text-muted-foreground/30'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default GamificationWidget;
