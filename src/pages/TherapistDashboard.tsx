import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Users, Activity, Video, Check, X, Clock, TrendingUp } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { format } from "date-fns";

interface Connection {
  id: string;
  parent_id: string;
  status: string;
  created_at: string;
  parent_name?: string;
}

interface BehaviorLog {
  id: string;
  mood: string;
  note: string | null;
  logged_at: string;
  user_id: string;
}

export default function TherapistDashboard() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [connections, setConnections] = useState<Connection[]>([]);
  const [selectedParent, setSelectedParent] = useState<string | null>(null);
  const [behaviorLogs, setBehaviorLogs] = useState<BehaviorLog[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      fetchConnections();
    }
  }, [user]);

  useEffect(() => {
    if (selectedParent) {
      fetchParentData(selectedParent);
    }
  }, [selectedParent]);

  const fetchConnections = async () => {
    const { data, error } = await supabase
      .from("connections")
      .select("*")
      .eq("therapist_id", user?.id);

    if (error) {
      console.error("Error fetching connections:", error);
      return;
    }

    // Fetch parent names
    const connectionsWithNames = await Promise.all(
      (data || []).map(async (conn) => {
        const { data: profile } = await supabase
          .from("profiles")
          .select("full_name")
          .eq("user_id", conn.parent_id)
          .maybeSingle();
        return {
          ...conn,
          parent_name: profile?.full_name || "Unknown Parent",
        };
      })
    );

    setConnections(connectionsWithNames);
    setLoading(false);
  };

  const fetchParentData = async (parentId: string) => {
    // Fetch behavior logs
    const { data: logs, error } = await supabase
      .from("behavior_logs")
      .select("*")
      .eq("user_id", parentId)
      .order("logged_at", { ascending: false })
      .limit(30);

    if (error) {
      console.error("Error fetching logs:", error);
      return;
    }

    setBehaviorLogs(logs || []);

    // Process for chart
    const moodToScore: Record<string, number> = {
      happy: 5,
      calm: 4,
      neutral: 3,
      anxious: 2,
      upset: 1,
    };

    const chartProcessed = (logs || [])
      .reverse()
      .map((log) => ({
        date: format(new Date(log.logged_at), "MMM d"),
        score: moodToScore[log.mood] || 3,
        mood: log.mood,
      }));

    setChartData(chartProcessed);
  };

  const handleConnectionAction = async (connectionId: string, action: "accepted" | "rejected") => {
    const { error } = await supabase
      .from("connections")
      .update({ status: action, updated_at: new Date().toISOString() })
      .eq("id", connectionId);

    if (error) {
      console.error("Error updating connection:", error);
      return;
    }

    fetchConnections();
  };

  const pendingConnections = connections.filter((c) => c.status === "pending");
  const acceptedConnections = connections.filter((c) => c.status === "accepted");

  if (authLoading || loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-pulse text-muted-foreground">Loading...</div>
        </div>
      </AppLayout>
    );
  }

  const getMoodEmoji = (mood: string) => {
    const emojis: Record<string, string> = {
      happy: "😊",
      calm: "😌",
      neutral: "😐",
      anxious: "😰",
      upset: "😢",
    };
    return emojis[mood] || "😐";
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold">Therapist Dashboard</h1>
          <p className="text-muted-foreground">Manage your patients and view their progress</p>
        </div>

        {/* Pending Requests */}
        {pendingConnections.length > 0 && (
          <Card className="glass-card border-amber-500/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Clock className="h-5 w-5 text-amber-500" />
                Pending Connection Requests
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {pendingConnections.map((conn) => (
                <div
                  key={conn.id}
                  className="flex items-center justify-between p-3 bg-background/50 rounded-lg"
                >
                  <div>
                    <p className="font-medium">{conn.parent_name}</p>
                    <p className="text-xs text-muted-foreground">
                      Requested {format(new Date(conn.created_at), "MMM d, yyyy")}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-destructive"
                      onClick={() => handleConnectionAction(conn.id, "rejected")}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleConnectionAction(conn.id, "accepted")}
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Your Therapist ID */}
        <Card className="glass-card">
          <CardContent className="pt-4">
            <p className="text-sm text-muted-foreground mb-1">Your Therapist ID (share with parents)</p>
            <code className="text-xs bg-muted px-2 py-1 rounded break-all">{user?.id}</code>
          </CardContent>
        </Card>

        {/* Connected Parents */}
        <Tabs defaultValue="patients" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="patients">
              <Users className="h-4 w-4 mr-2" />
              Patients ({acceptedConnections.length})
            </TabsTrigger>
            <TabsTrigger value="analytics" disabled={!selectedParent}>
              <TrendingUp className="h-4 w-4 mr-2" />
              Analytics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="patients" className="space-y-4">
            {acceptedConnections.length === 0 ? (
              <Card className="glass-card">
                <CardContent className="pt-6 text-center">
                  <Users className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                  <p className="text-muted-foreground">No connected patients yet.</p>
                  <p className="text-sm text-muted-foreground">
                    Share your Therapist ID with parents to connect.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {acceptedConnections.map((conn) => (
                  <Card
                    key={conn.id}
                    className={`glass-card cursor-pointer transition-all ${
                      selectedParent === conn.parent_id ? "ring-2 ring-primary" : ""
                    }`}
                    onClick={() => setSelectedParent(conn.parent_id)}
                  >
                    <CardContent className="pt-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{conn.parent_name}</p>
                          <p className="text-xs text-muted-foreground">
                            Connected since {format(new Date(conn.created_at), "MMM d, yyyy")}
                          </p>
                        </div>
                        <Badge variant="outline" className="text-primary border-primary">
                          Active
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Selected Parent Data */}
            {selectedParent && behaviorLogs.length > 0 && (
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Activity className="h-5 w-5 text-primary" />
                    Recent Behavior Logs
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {behaviorLogs.slice(0, 5).map((log) => (
                    <div
                      key={log.id}
                      className="flex items-center gap-3 p-3 bg-background/50 rounded-lg"
                    >
                      <span className="text-2xl">{getMoodEmoji(log.mood)}</span>
                      <div className="flex-1">
                        <p className="font-medium capitalize">{log.mood}</p>
                        {log.note && (
                          <p className="text-sm text-muted-foreground">{log.note}</p>
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(log.logged_at), "MMM d, h:mm a")}
                      </span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="analytics">
            {chartData.length > 0 && (
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="text-lg">Mood Trends</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartData}>
                        <XAxis
                          dataKey="date"
                          stroke="hsl(var(--muted-foreground))"
                          fontSize={12}
                        />
                        <YAxis
                          stroke="hsl(var(--muted-foreground))"
                          fontSize={12}
                          domain={[1, 5]}
                          ticks={[1, 2, 3, 4, 5]}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "hsl(var(--card))",
                            border: "1px solid hsl(var(--border))",
                            borderRadius: "8px",
                          }}
                        />
                        <Line
                          type="monotone"
                          dataKey="score"
                          stroke="hsl(var(--primary))"
                          strokeWidth={2}
                          dot={{ fill: "hsl(var(--primary))" }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
