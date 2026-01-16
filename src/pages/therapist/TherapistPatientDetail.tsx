import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { TherapistLayout } from "@/components/layout/TherapistLayout";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts";
import { 
  ArrowLeft,
  Smile, 
  Meh, 
  Frown,
  Calendar,
  Video,
  TrendingUp
} from "lucide-react";
import { format, subDays } from "date-fns";

interface Profile {
  user_id: string;
  full_name: string | null;
}

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
}

const COLORS = {
  happy: "hsl(var(--primary))",
  neutral: "hsl(var(--muted-foreground))",
  sad: "hsl(var(--destructive))",
};

const moodOptions = [
  { value: "happy", icon: Smile, label: "Happy", color: "text-primary" },
  { value: "neutral", icon: Meh, label: "Neutral", color: "text-muted-foreground" },
  { value: "sad", icon: Frown, label: "Sad", color: "text-destructive" },
];

export default function TherapistPatientDetail() {
  const { parentId } = useParams<{ parentId: string }>();
  const { user, loading: authLoading } = useAuth();
  const { role, loading: roleLoading } = useUserRole();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [logs, setLogs] = useState<BehaviorLog[]>([]);
  const [videos, setVideos] = useState<VideoUpload[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
      return;
    }

    if (!roleLoading && role !== "therapist") {
      navigate("/parent/home");
      return;
    }

    if (user && role === "therapist" && parentId) {
      fetchData();
    }
  }, [user, authLoading, role, roleLoading, parentId, navigate]);

  const fetchData = async () => {
    if (!user || !parentId) return;

    // Verify connection exists
    const { data: connection } = await supabase
      .from("connections")
      .select("*")
      .eq("therapist_id", user.id)
      .eq("parent_id", parentId)
      .eq("status", "accepted")
      .maybeSingle();

    if (!connection) {
      navigate("/therapist/dashboard");
      return;
    }

    const thirtyDaysAgo = subDays(new Date(), 30).toISOString();

    const [profileRes, logsRes, videosRes] = await Promise.all([
      supabase
        .from("profiles")
        .select("user_id, full_name")
        .eq("user_id", parentId)
        .maybeSingle(),
      supabase
        .from("behavior_logs")
        .select("*")
        .eq("user_id", parentId)
        .gte("logged_at", thirtyDaysAgo)
        .order("logged_at", { ascending: false }),
      supabase
        .from("video_uploads")
        .select("*")
        .eq("user_id", parentId)
        .order("created_at", { ascending: false })
        .limit(10),
    ]);

    if (profileRes.data) setProfile(profileRes.data);
    if (logsRes.data) setLogs(logsRes.data);
    if (videosRes.data) setVideos(videosRes.data);
    setLoading(false);
  };

  if (authLoading || roleLoading || loading) {
    return (
      <TherapistLayout>
        <div className="space-y-6">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-64 w-full rounded-2xl" />
        </div>
      </TherapistLayout>
    );
  }

  // Calculate analytics
  const moodCounts = logs.reduce(
    (acc, log) => {
      acc[log.mood] = (acc[log.mood] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  const pieData = Object.entries(moodCounts).map(([name, value]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    value,
    color: COLORS[name as keyof typeof COLORS] || "#888",
  }));

  const weeklyData = Array.from({ length: 7 }, (_, i) => {
    const date = subDays(new Date(), 6 - i);
    const dayLogs = logs.filter(
      (log) =>
        format(new Date(log.logged_at), "yyyy-MM-dd") ===
        format(date, "yyyy-MM-dd")
    );
    
    return {
      day: format(date, "EEE"),
      happy: dayLogs.filter((l) => l.mood === "happy").length,
      neutral: dayLogs.filter((l) => l.mood === "neutral").length,
      sad: dayLogs.filter((l) => l.mood === "sad").length,
    };
  });

  return (
    <TherapistLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gradient">
              {profile?.full_name || "Patient"}
            </h1>
            <p className="text-muted-foreground">Patient Details & Analytics</p>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-3 gap-3">
          <Card className="glass-card">
            <CardContent className="pt-4 text-center">
              <Smile className="h-8 w-8 mx-auto text-primary mb-2" />
              <p className="text-2xl font-bold">{moodCounts.happy || 0}</p>
              <p className="text-xs text-muted-foreground">Happy</p>
            </CardContent>
          </Card>
          <Card className="glass-card">
            <CardContent className="pt-4 text-center">
              <Meh className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
              <p className="text-2xl font-bold">{moodCounts.neutral || 0}</p>
              <p className="text-xs text-muted-foreground">Neutral</p>
            </CardContent>
          </Card>
          <Card className="glass-card">
            <CardContent className="pt-4 text-center">
              <Frown className="h-8 w-8 mx-auto text-destructive mb-2" />
              <p className="text-2xl font-bold">{moodCounts.sad || 0}</p>
              <p className="text-xs text-muted-foreground">Challenging</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="analytics" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="logs">Mood Logs</TabsTrigger>
            <TabsTrigger value="videos">Videos</TabsTrigger>
          </TabsList>

          <TabsContent value="analytics" className="space-y-4">
            {logs.length > 0 ? (
              <>
                <Card className="glass-card">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-primary" />
                      Weekly Trend
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={weeklyData}>
                          <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                          <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                          <YAxis tick={{ fontSize: 12 }} />
                          <Tooltip />
                          <Bar dataKey="happy" stackId="a" fill={COLORS.happy} name="Happy" />
                          <Bar dataKey="neutral" stackId="a" fill={COLORS.neutral} name="Neutral" />
                          <Bar dataKey="sad" stackId="a" fill={COLORS.sad} name="Sad" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                <Card className="glass-card">
                  <CardHeader>
                    <CardTitle>Mood Distribution (30 days)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={pieData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={100}
                            paddingAngle={5}
                            dataKey="value"
                            label={({ name, percent }) =>
                              `${name} ${(percent * 100).toFixed(0)}%`
                            }
                          >
                            {pieData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </>
            ) : (
              <Card className="glass-card">
                <CardContent className="py-12 text-center">
                  <TrendingUp className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                  <p className="text-muted-foreground">No data available yet.</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="logs">
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
                    No mood logs recorded yet.
                  </p>
                ) : (
                  <div className="space-y-3 max-h-96 overflow-y-auto">
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
                              {format(new Date(log.logged_at), "EEEE, MMM d 'at' h:mm a")}
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
          </TabsContent>

          <TabsContent value="videos">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Video className="h-5 w-5 text-primary" />
                  Uploaded Videos
                </CardTitle>
              </CardHeader>
              <CardContent>
                {videos.length === 0 ? (
                  <p className="text-center text-muted-foreground py-4">
                    No videos uploaded yet.
                  </p>
                ) : (
                  <div className="space-y-3">
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
                        <Badge variant="secondary">View</Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </TherapistLayout>
  );
}
