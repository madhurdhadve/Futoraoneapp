import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Video, VideoOff, Mic, MicOff, PhoneOff } from "lucide-react";

interface VideoCallButtonProps {
  userId: string;
  currentUserId: string | undefined;
}

export const VideoCallButton = ({ userId, currentUserId }: VideoCallButtonProps) => {
  const { toast } = useToast();
  const [callActive, setCallActive] = useState(false);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [audioEnabled, setAudioEnabled] = useState(true);

  const startCall = async () => {
    if (!currentUserId) return;

    const { data, error } = await supabase
      .from("video_calls")
      .insert({
        caller_id: currentUserId,
        callee_id: userId,
        status: "pending",
      })
      .select()
      .single();

    if (error) {
      toast({
        title: "Error",
        description: "Could not start call",
        variant: "destructive",
      });
      return;
    }

    // In a real app, you'd integrate with WebRTC here
    setCallActive(true);
    toast({
      title: "Call started",
      description: "Connecting to user...",
    });

    // Simulate call connection (in production, use WebRTC)
    setTimeout(() => {
      supabase
        .from("video_calls")
        .update({ status: "accepted" })
        .eq("id", data.id);
    }, 2000);
  };

  const endCall = async () => {
    setCallActive(false);
    toast({
      title: "Call ended",
    });
  };

  if (!currentUserId || currentUserId === userId) return null;

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={startCall}
        className="border-primary text-primary hover:bg-primary hover:text-white"
      >
        <Video className="w-4 h-4 mr-2" />
        Video Call
      </Button>

      <Dialog open={callActive} onOpenChange={setCallActive}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Video Call</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {/* Video Preview Area */}
            <div className="aspect-video bg-black rounded-lg flex items-center justify-center">
              <p className="text-white">Video call in progress...</p>
              <p className="text-xs text-white/60 mt-2">
                (WebRTC integration required for actual video)
              </p>
            </div>

            {/* Call Controls */}
            <div className="flex items-center justify-center gap-4">
              <Button
                variant={audioEnabled ? "default" : "destructive"}
                size="icon"
                onClick={() => setAudioEnabled(!audioEnabled)}
              >
                {audioEnabled ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
              </Button>

              <Button
                variant={videoEnabled ? "default" : "destructive"}
                size="icon"
                onClick={() => setVideoEnabled(!videoEnabled)}
              >
                {videoEnabled ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
              </Button>

              <Button variant="destructive" size="icon" onClick={endCall}>
                <PhoneOff className="w-5 h-5" />
              </Button>
            </div>

            <p className="text-xs text-center text-muted-foreground">
              To enable real video calls, integrate with a WebRTC service like Twilio, Agora, or
              Daily.co
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
