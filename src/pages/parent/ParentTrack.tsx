import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ParentLayout } from "@/components/layout/ParentLayout";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { 
  Smile, 
  Meh, 
  Frown, 
  Upload, 
  Video,
  Calendar,
  Plus
} from "lucide-react";
import { format } from "date-fns";

interface BehaviorLog {
  id: string;
  mood: string;
  note: string | null;
  logged_at: string;
}

interface VideoUpload {
  id: string;
  title: string;
  file_url: string;
  created_at: string;
  duration_seconds: number | null;
}

const moodOptions = [
  { value: "happy", icon: Smile, label: "Happy", color: "text-primary" },
  { value: "neutral", icon: Meh, label: "Neutral", color: "text-muted-foreground" },
  { value: "sad", icon: Frown, label: "Sad", color: "text-destructive" },
];

export default function ParentTrack() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [logs, setLogs] = useState<BehaviorLog[]>([]);
  const [videos, setVideos] = useState<VideoUpload[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
      return;
    }

    if (user) {
      fetchData();
    }
  }, [user, authLoading, navigate]);

  const fetchData = async () => {
    if (!user) return;

    const [logsRes, videosRes] = await Promise.all([
      supabase
        .from("behavior_logs")
        .select("*")
        .eq("user_id", user.id)
        .order("logged_at", { ascending: false })
        .limit(10),
      supabase
        .from("video_uploads")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(5),
    ]);

    if (logsRes.data) setLogs(logsRes.data);
    if (videosRes.data) setVideos(videosRes.data);
    setLoading(false);
  };

  const handleLogMood = async () => {
    if (!selectedMood || !user) return;

    setIsSubmitting(true);
    const { error } = await supabase.from("behavior_logs").insert({
      user_id: user.id,
      mood: selectedMood,
      note: note || null,
    });

    if (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to log mood. Please try again.",
      });
    } else {
      toast({
        title: "Mood logged!",
        description: "Your entry has been saved.",
      });
      setSelectedMood(null);
      setNote("");
      fetchData();
    }

    setIsSubmitting(false);
  };

  if (authLoading || loading) {
    return (
      <ParentLayout>
        <div className="space-y-6">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-48 w-full rounded-2xl" />
          <Skeleton className="h-64 w-full rounded-2xl" />
        </div>
      </ParentLayout>
    );
  }

  return (
    <ParentLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gradient">Track Progress</h1>
          <p className="text-muted-foreground">Log daily moods and upload videos</p>
        </div>

        {/* Mood Logger */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5 text-primary" />
              Log Today's Mood
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-center gap-4">
              {moodOptions.map((mood) => (
                <button
                  key={mood.value}
                  type="button"
                  onClick={() => setSelectedMood(mood.value)}
                  className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${
                    selectedMood === mood.value
                      ? "border-primary bg-primary/10 scale-105"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <mood.icon className={`h-10 w-10 ${mood.color}`} />
                  <span className="text-sm font-medium">{mood.label}</span>
                </button>
              ))}
            </div>

            <div className="space-y-2">
              <Label htmlFor="note">Notes (optional)</Label>
              <Textarea
                id="note"
                placeholder="Any observations about today..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={3}
              />
            </div>

            <Button
              onClick={handleLogMood}
              disabled={!selectedMood || isSubmitting}
              className="w-full"
            >
              {isSubmitting ? "Saving..." : "Save Entry"}
            </Button>
          </CardContent>
        </Card>

        {/* Recent Logs */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              Recent Mood Logs
            </CardTitle>
          </CardHeader>
          <CardContent>
            {logs.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">
                No mood logs yet. Start tracking today!
              </p>
            ) : (
              <div className="space-y-3">
                {logs.map((log) => {
                  const moodData = moodOptions.find((m) => m.value === log.mood);
                  const MoodIcon = moodData?.icon || Meh;
                  return (
                    <div
                      key={log.id}
                      className="flex items-start gap-3 p-3 rounded-xl bg-muted/50"
                    >
                      <MoodIcon className={`h-6 w-6 flex-shrink-0 ${moodData?.color}`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">
                          {format(new Date(log.logged_at), "EEEE, MMM d")}
                        </p>
                        {log.note && (
                          <p className="text-sm text-muted-foreground mt-1">
                            {log.note}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Video Uploads */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Video className="h-5 w-5 text-primary" />
              Video Uploads
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="border-2 border-dashed border-border rounded-xl p-8 text-center">
              <Upload className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
              <p className="text-muted-foreground">Video upload coming soon</p>
              <p className="text-xs text-muted-foreground mt-1">
                Upload therapy session recordings for review
              </p>
            </div>

            {videos.length > 0 && (
              <div className="mt-4 space-y-2">
                {videos.map((video) => (
                  <div
                    key={video.id}
                    className="flex items-center gap-3 p-3 rounded-xl bg-muted/50"
                  >
                    <Video className="h-5 w-5 text-primary" />
                    <div className="flex-1">
                      <p className="font-medium text-sm">{video.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(video.created_at), "MMM d, yyyy")}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </ParentLayout>
  );
}
