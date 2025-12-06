import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  Mic, 
  MicOff, 
  Users, 
  Radio,
  Clock,
  Lock,
  Unlock,
  Plus,
  X,
  Volume2,
  VolumeX,
  Hand,
  MessageCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';

interface AudioRoom {
  id: string;
  title: string;
  host: {
    name: string;
    avatar: string;
    isVerified: boolean;
  };
  participants: number;
  speakers: number;
  topic: string;
  isLive: boolean;
  isPrivate: boolean;
  startedAt: Date;
}

const demoRooms: AudioRoom[] = [
  {
    id: '1',
    title: 'Building AI-Powered Apps in 2024',
    host: { name: 'Sarah Chen', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah', isVerified: true },
    participants: 127,
    speakers: 4,
    topic: 'AI/ML',
    isLive: true,
    isPrivate: false,
    startedAt: new Date(Date.now() - 45 * 60000)
  },
  {
    id: '2',
    title: 'React vs Vue: The Eternal Debate',
    host: { name: 'Mike Johnson', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mike', isVerified: false },
    participants: 89,
    speakers: 3,
    topic: 'Frontend',
    isLive: true,
    isPrivate: false,
    startedAt: new Date(Date.now() - 20 * 60000)
  },
  {
    id: '3',
    title: 'Startup Funding Q&A',
    host: { name: 'Alex Rivera', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex', isVerified: true },
    participants: 234,
    speakers: 5,
    topic: 'Startups',
    isLive: true,
    isPrivate: true,
    startedAt: new Date(Date.now() - 60 * 60000)
  }
];

const AudioRooms = () => {
  const navigate = useNavigate();
  const [rooms] = useState<AudioRoom[]>(demoRooms);
  const [activeRoom, setActiveRoom] = useState<AudioRoom | null>(null);
  const [isMuted, setIsMuted] = useState(true);
  const [isHandRaised, setIsHandRaised] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const formatDuration = (startedAt: Date) => {
    const mins = Math.floor((Date.now() - startedAt.getTime()) / 60000);
    if (mins < 60) return `${mins}m`;
    return `${Math.floor(mins / 60)}h ${mins % 60}m`;
  };

  const joinRoom = (room: AudioRoom) => {
    if (room.isPrivate) {
      toast({
        title: "Private Room",
        description: "This room requires an invitation to join.",
        variant: "destructive"
      });
      return;
    }
    setActiveRoom(room);
    toast({
      title: "Joined Room",
      description: `You've joined "${room.title}"`
    });
  };

  const leaveRoom = () => {
    setActiveRoom(null);
    setIsMuted(true);
    setIsHandRaised(false);
    toast({
      title: "Left Room",
      description: "You've left the audio room"
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-900/20 via-background to-red-900/20">
      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-orange-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-red-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 py-8 pb-32">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/ai-tools')}
              className="rounded-full"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-2">
                <Radio className="w-8 h-8 text-orange-500" />
                Audio Rooms
              </h1>
              <p className="text-muted-foreground">Live tech discussions & podcasts</p>
            </div>
          </div>
          <Button
            onClick={() => setShowCreateModal(true)}
            className="bg-gradient-to-r from-orange-600 to-red-600"
          >
            <Plus className="w-4 h-4 mr-2" />
            Start Room
          </Button>
        </div>

        {/* Live Rooms */}
        <div className="space-y-4">
          <h2 className="font-semibold flex items-center gap-2">
            <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            Live Now
          </h2>
          
          {rooms.map((room, i) => (
            <motion.div
              key={room.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Card 
                className="p-4 cursor-pointer hover:border-orange-500/50 transition-all"
                onClick={() => joinRoom(room)}
              >
                <div className="flex items-start gap-4">
                  <Avatar className="w-12 h-12 border-2 border-orange-500">
                    <AvatarImage src={room.host.avatar} />
                    <AvatarFallback>{room.host.name[0]}</AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold">{room.title}</h3>
                      {room.isPrivate && <Lock className="w-4 h-4 text-muted-foreground" />}
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      Hosted by {room.host.name} {room.host.isVerified && '✓'}
                    </p>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {room.participants}
                      </span>
                      <span className="flex items-center gap-1">
                        <Mic className="w-3 h-3" />
                        {room.speakers} speakers
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatDuration(room.startedAt)}
                      </span>
                    </div>
                  </div>
                  
                  <Badge className="bg-orange-500/20 text-orange-500 border-orange-500/30">
                    {room.topic}
                  </Badge>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Active Room Overlay */}
        <AnimatePresence>
          {activeRoom && (
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              className="fixed inset-x-0 bottom-0 z-50 bg-card border-t border-border rounded-t-3xl shadow-2xl"
            >
              <div className="p-4 pb-8">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-semibold">{activeRoom.title}</h3>
                    <p className="text-sm text-muted-foreground flex items-center gap-2">
                      <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                      LIVE • {activeRoom.participants} listening
                    </p>
                  </div>
                  <Button variant="ghost" size="icon" onClick={leaveRoom}>
                    <X className="w-5 h-5" />
                  </Button>
                </div>

                {/* Speakers */}
                <div className="flex gap-4 mb-4 overflow-x-auto pb-2">
                  <div className="text-center shrink-0">
                    <Avatar className="w-16 h-16 border-2 border-orange-500 mx-auto mb-1">
                      <AvatarImage src={activeRoom.host.avatar} />
                    </Avatar>
                    <p className="text-xs font-medium">{activeRoom.host.name}</p>
                    <Badge variant="secondary" className="text-[10px]">Host</Badge>
                  </div>
                  {[1, 2, 3].map(i => (
                    <div key={i} className="text-center shrink-0">
                      <Avatar className="w-16 h-16 border-2 border-muted mx-auto mb-1">
                        <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=Speaker${i}`} />
                      </Avatar>
                      <p className="text-xs font-medium">Speaker {i}</p>
                    </div>
                  ))}
                </div>

                {/* Controls */}
                <div className="flex items-center justify-center gap-4">
                  <Button
                    variant={isHandRaised ? "default" : "outline"}
                    size="lg"
                    onClick={() => {
                      setIsHandRaised(!isHandRaised);
                      toast({
                        title: isHandRaised ? "Hand lowered" : "Hand raised",
                        description: isHandRaised ? "You lowered your hand" : "The host will see your request to speak"
                      });
                    }}
                    className="rounded-full"
                  >
                    <Hand className="w-5 h-5" />
                  </Button>
                  
                  <Button
                    variant={isMuted ? "outline" : "destructive"}
                    size="lg"
                    onClick={() => setIsMuted(!isMuted)}
                    className="rounded-full w-16 h-16"
                  >
                    {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
                  </Button>
                  
                  <Button
                    variant="destructive"
                    size="lg"
                    onClick={leaveRoom}
                    className="rounded-full"
                  >
                    Leave
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Create Room Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4"
            onClick={() => setShowCreateModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-card border border-border rounded-2xl w-full max-w-md p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-xl font-bold mb-4">Create Audio Room</h2>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">Room Title</label>
                  <Input placeholder="What will you be discussing?" />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Topic</label>
                  <Input placeholder="e.g., AI, Web Dev, Startups" />
                </div>
                <div className="flex gap-2">
                  <Button className="flex-1" variant="outline">
                    <Unlock className="w-4 h-4 mr-2" />
                    Public
                  </Button>
                  <Button className="flex-1" variant="outline">
                    <Lock className="w-4 h-4 mr-2" />
                    Private
                  </Button>
                </div>
                <Button 
                  className="w-full bg-gradient-to-r from-orange-600 to-red-600"
                  onClick={() => {
                    setShowCreateModal(false);
                    toast({
                      title: "Room Created! 🎙️",
                      description: "Your audio room is now live. Invite others to join!"
                    });
                  }}
                >
                  <Radio className="w-4 h-4 mr-2" />
                  Go Live
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AudioRooms;
