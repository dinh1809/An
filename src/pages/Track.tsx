import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Camera, Plus, Smile, Meh, Frown, Angry, Video, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { AppLayout } from "@/components/layout/AppLayout";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

type Mood = "happy" | "neutral" | "sad" | "angry";

interface VideoUpload {
  id: string;
  title: string;
  file_url: string;
  created_at: string;
}

const moodConfig: { mood: Mood; icon: typeof Smile; label: string; color: string }[] = [
  { mood: "happy", icon: Smile, label: "Happy", color: "bg-mood-happy" },
  { mood: "neutral", icon: Meh, label: "Neutral", color: "bg-mood-neutral" },
  { mood: "sad", icon: Frown, label: "Sad", color: "bg-mood-sad" },
  { mood: "angry", icon: Angry, label: "Angry", color: "bg-mood-angry" },
];

export default function Track() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedMood, setSelectedMood] = useState<Mood | null>(null);
  const [note, setNote] = useState("");
  const [noteDialogOpen, setNoteDialogOpen] = useState(false);
  const [videos, setVideos] = useState<VideoUpload[]>([]);
  const [uploading, setUploading] = useState(false);
  const [videoTitle, setVideoTitle] = useState("");

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user) {
      fetchVideos();
    }
  }, [user]);

  const fetchVideos = async () => {
    if (!user) return;
    
    const { data } = await supabase
      .from("video_uploads")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(10);

    if (data) {
      setVideos(data);
    }
  };

  const handleMoodSelect = async (mood: Mood) => {
    if (!user) return;
    setSelectedMood(mood);

    const { error } = await supabase.from("behavior_logs").insert({
      user_id: user.id,
      mood,
      note: note || null,
    });

    if (error) {
      toast({
        variant: "destructive",
        title: "Failed to log mood",
        description: error.message,
      });
    } else {
      toast({
        title: "Mood logged!",
        description: `You logged feeling ${mood} today.`,
      });
      setNote("");
    }
  };

  const handleAddNote = () => {
    setNoteDialogOpen(false);
    toast({
      title: "Note saved",
      description: "Your note will be included with the next mood log.",
    });
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    if (!file.type.startsWith("video/")) {
      toast({
        variant: "destructive",
        title: "Invalid file",
        description: "Please select a video file.",
      });
      return;
    }

    setUploading(true);

    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("videos")
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from("videos")
        .getPublicUrl(fileName);

      const { error: dbError } = await supabase.from("video_uploads").insert({
        user_id: user.id,
        title: videoTitle || file.name,
        file_path: fileName,
        file_url: urlData.publicUrl,
      });

      if (dbError) throw dbError;

      toast({
        title: "Video uploaded!",
        description: "Your practice video has been saved.",
      });

      setVideoTitle("");
      fetchVideos();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Upload failed",
        description: error.message,
      });
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleDeleteVideo = async (id: string, filePath: string) => {
    const { error: storageError } = await supabase.storage
      .from("videos")
      .remove([filePath]);

    if (storageError) {
      toast({
        variant: "destructive",
        title: "Failed to delete video",
        description: storageError.message,
      });
      return;
    }

    const { error: dbError } = await supabase
      .from("video_uploads")
      .delete()
      .eq("id", id);

    if (!dbError) {
      toast({
        title: "Video deleted",
        description: "The video has been removed.",
      });
      fetchVideos();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-primary">Loading...</div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <AppLayout>
      <h1 className="text-2xl font-bold mb-6">Daily Tracking</h1>

      {/* Daily Behavior Log */}
      <Card className="mb-6 border-0 shadow-soft animate-slide-up">
        <CardHeader>
          <CardTitle className="text-lg">How are you feeling today?</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-3 mb-4">
            {moodConfig.map(({ mood, icon: Icon, label, color }) => (
              <button
                key={mood}
                onClick={() => handleMoodSelect(mood)}
                className={`flex flex-col items-center p-4 rounded-xl transition-all ${
                  selectedMood === mood
                    ? `${color} text-white scale-105 shadow-lg`
                    : "bg-muted hover:bg-muted/80"
                }`}
              >
                <Icon className="h-8 w-8 mb-1" />
                <span className="text-xs font-medium">{label}</span>
              </button>
            ))}
          </div>

          <div className="flex gap-2">
            <Dialog open={noteDialogOpen} onOpenChange={setNoteDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="flex-1">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Note
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add a Note</DialogTitle>
                </DialogHeader>
                <Textarea
                  placeholder="What happened today? Any observations..."
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  rows={4}
                />
                <Button onClick={handleAddNote}>Save Note</Button>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>

      {/* Video Upload */}
      <Card className="mb-6 border-0 shadow-soft animate-slide-up" style={{ animationDelay: "0.1s" }}>
        <CardContent className="p-4">
          <Input
            placeholder="Video title (optional)"
            value={videoTitle}
            onChange={(e) => setVideoTitle(e.target.value)}
            className="mb-3"
          />
          <input
            type="file"
            ref={fileInputRef}
            accept="video/*"
            onChange={handleFileSelect}
            className="hidden"
          />
          <Button
            className="w-full"
            size="lg"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
          >
            <Camera className="h-5 w-5 mr-2" />
            {uploading ? "Uploading..." : "Upload Practice Video"}
          </Button>
        </CardContent>
      </Card>

      {/* Recent Uploads */}
      <section>
        <h3 className="text-lg font-semibold mb-4">Recent Uploads</h3>
        {videos.length === 0 ? (
          <Card className="border-0 shadow-soft">
            <CardContent className="p-8 text-center text-muted-foreground">
              <Video className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No videos uploaded yet</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {videos.map((video, index) => (
              <Card
                key={video.id}
                className="border-0 shadow-soft animate-slide-up"
                style={{ animationDelay: `${0.1 * index}s` }}
              >
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="w-20 h-14 rounded-lg bg-muted flex items-center justify-center">
                    <Video className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{video.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(video.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-muted-foreground hover:text-destructive"
                    onClick={() => handleDeleteVideo(video.id, video.file_url.split("/").pop() || "")}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>
    </AppLayout>
  );
}
