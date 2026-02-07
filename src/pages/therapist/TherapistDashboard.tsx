import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer 
} from "recharts";

interface Connection {
  id: string;
  parent_id: string;
  status: string;
  created_at: string;
}

interface ParentProfile {
  user_id: string;
  full_name: string | null;
}

interface ConnectedParent {
  connection: Connection;
  profile: ParentProfile | null;
  recentLogsCount: number;
  needsAttention?: boolean;
}

// Mock chart data
const chartData = [
  { day: "Mon", logs: 12 },
  { day: "Tue", logs: 19 },
  { day: "Wed", logs: 15 },
  { day: "Thu", logs: 25 },
  { day: "Fri", logs: 22 },
  { day: "Sat", logs: 30 },
  { day: "Sun", logs: 28 },
];

export default function TherapistDashboard() {
  const { user, loading: authLoading } = useAuth();
  const { role, loading: roleLoading } = useUserRole();
  const navigate = useNavigate();
  const [connectedParents, setConnectedParents] = useState<ConnectedParent[]>([]);
  const [pendingRequests, setPendingRequests] = useState<Connection[]>([]);
  const [totalLogsThisWeek, setTotalLogsThisWeek] = useState(0);
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
    if (user && role === "therapist") {
      fetchData();
    }
  }, [user, authLoading, role, roleLoading, navigate]);

  const fetchData = async () => {
    if (!user) return;

    const { data: connections } = await supabase
      .from("connections")
      .select("*")
      .eq("therapist_id", user.id)
      .order("created_at", { ascending: false });

    if (connections) {
      const accepted = connections.filter((c) => c.status === "accepted");
      const pending = connections.filter((c) => c.status === "pending");
      setPendingRequests(pending);

      const parentsData = await Promise.all(
        accepted.map(async (conn) => {
          const [profileRes, logsRes] = await Promise.all([
            supabase.from("profiles").select("user_id, full_name").eq("user_id", conn.parent_id).maybeSingle(),
            supabase.from("behavior_logs").select("id, logged_at", { count: "exact" }).eq("user_id", conn.parent_id)
              .gte("logged_at", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()),
          ]);
          const needsAttention = logsRes.count === 0;
          return {
            connection: conn,
            profile: profileRes.data,
            recentLogsCount: logsRes.count || 0,
            needsAttention,
          };
        })
      );

      setConnectedParents(parentsData);
      setTotalLogsThisWeek(parentsData.reduce((sum, p) => sum + p.recentLogsCount, 0));
    }
    setLoading(false);
  };

  const handleAcceptConnection = async (connectionId: string) => {
    await supabase.from("connections").update({ status: "accepted" }).eq("id", connectionId);
    fetchData();
  };

  const getInitials = (name: string | null) => {
    if (!name) return "P";
    const parts = name.split(" ");
    return parts.length >= 2 ? parts[0][0] + parts[parts.length - 1][0] : name.substring(0, 2).toUpperCase();
  };

  if (authLoading || roleLoading || loading) {
    return (
      <div className="space-y-8">
        <Skeleton className="h-10 w-80" />
        <div className="grid gap-6 md:grid-cols-3">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-32 rounded-3xl" />)}
        </div>
        <Skeleton className="h-80 rounded-3xl" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Welcome Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-display font-bold tracking-tight">Welcome, Specialist! 👋</h2>
          <p className="text-muted-foreground mt-1">Here's your patient activity overview for this week.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="rounded-xl gap-2 shadow-sm">
            <span className="material-icons-round text-base">filter_list</span>
            Filter
          </Button>
          <Button className="rounded-xl gap-2 shadow-lg shadow-primary/20">
            <span className="material-icons-round text-base">add</span>
            Add Patient
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="stat-card group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full -mr-10 -mt-10 blur-2xl group-hover:bg-primary/20 transition-all" />
          <CardContent className="pt-6 relative">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-primary/10 rounded-2xl text-primary">
                <span className="material-icons-round text-2xl">group</span>
              </div>
              <Badge className="gap-1 text-xs font-semibold bg-success/10 text-success border-0">
                +12% <span className="material-icons-round text-[14px]">trending_up</span>
              </Badge>
            </div>
            <div>
              <h3 className="text-4xl font-bold mb-1">{connectedParents.length}</h3>
              <p className="text-sm text-muted-foreground font-medium">Active Patients</p>
            </div>
          </CardContent>
        </Card>

        <Card className="stat-card group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-warning/10 rounded-full -mr-10 -mt-10 blur-2xl group-hover:bg-warning/20 transition-all" />
          <CardContent className="pt-6 relative">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-warning/10 rounded-2xl text-warning">
                <span className="material-icons-round text-2xl">pending_actions</span>
              </div>
              <Badge variant="outline" className="text-xs font-semibold text-warning border-warning/30 bg-warning/10">
                Action Required
              </Badge>
            </div>
            <div>
              <h3 className="text-4xl font-bold mb-1">{pendingRequests.length}</h3>
              <p className="text-sm text-muted-foreground font-medium">Pending Requests</p>
            </div>
          </CardContent>
        </Card>

        <Card className="stat-card group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-secondary/10 rounded-full -mr-10 -mt-10 blur-2xl group-hover:bg-secondary/20 transition-all" />
          <CardContent className="pt-6 relative">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-secondary/10 rounded-2xl text-secondary">
                <span className="material-icons-round text-2xl">insights</span>
              </div>
              <Badge variant="outline" className="text-xs font-semibold text-muted-foreground">
                This Week
              </Badge>
            </div>
            <div>
              <h3 className="text-4xl font-bold mb-1">{totalLogsThisWeek}</h3>
              <p className="text-sm text-muted-foreground font-medium">New Logs</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts & Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Progress Chart */}
          <Card className="glass-card border border-border/50">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-bold">Therapy Progress</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="colorLogs" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="day" axisLine={false} tickLine={false} className="text-xs" />
                    <YAxis hide />
                    <Tooltip 
                      contentStyle={{ 
                        background: 'hsl(var(--card))', 
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '12px',
                      }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="logs" 
                      stroke="hsl(var(--primary))" 
                      strokeWidth={3}
                      fillOpacity={1} 
                      fill="url(#colorLogs)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Schedule / Right Column */}
        <div className="space-y-8">
          <Card className="glass-card border border-border/50">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-bold">Today's Schedule</CardTitle>
                <Button variant="ghost" size="icon" className="text-primary rounded-lg hover:bg-primary/10">
                  <span className="material-icons-round">calendar_today</span>
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 relative before:absolute before:left-[19px] before:top-2 before:bottom-4 before:w-[2px] before:bg-border">
              <div className="relative pl-8">
                <div className="absolute left-3 top-2 w-4 h-4 rounded-full border-4 border-card bg-primary z-10" />
                <div className="p-3 bg-primary/5 rounded-2xl border border-primary/10">
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-xs font-bold text-primary bg-card px-2 py-0.5 rounded shadow-sm">09:00 AM</span>
                  </div>
                  <h4 className="text-sm font-bold">Assessment - Dinh Pham</h4>
                </div>
              </div>
              <div className="relative pl-8">
                <div className="absolute left-3 top-2 w-4 h-4 rounded-full border-4 border-card bg-muted z-10" />
                <div className="p-3 bg-muted/50 rounded-2xl border border-border">
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-xs font-bold text-muted-foreground bg-card px-2 py-0.5 rounded shadow-sm">02:30 PM</span>
                  </div>
                  <h4 className="text-sm font-bold">Family Meeting - Tran Bao</h4>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Patients List */}
      {connectedParents.length > 0 && (
        <Card className="glass-card border border-border/50">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-bold">Your Patients</CardTitle>
              <Button variant="ghost" size="sm" className="text-primary gap-1" onClick={() => navigate("/therapist/patients")}>
                View all <span className="material-icons-round text-sm">arrow_forward</span>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {connectedParents.slice(0, 3).map(({ connection, profile, recentLogsCount, needsAttention }) => (
              <div
                key={connection.id}
                className="flex items-center justify-between p-4 rounded-2xl bg-muted/30 hover:bg-muted/50 transition-all cursor-pointer group border border-transparent hover:border-primary/20"
                onClick={() => navigate(`/therapist/patient/${connection.parent_id}`)}
              >
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg">
                      {getInitials(profile?.full_name)}
                    </div>
                    <div className={`absolute bottom-0 right-0 w-3.5 h-3.5 border-2 border-card rounded-full ${needsAttention ? "bg-warning animate-pulse" : "bg-success"}`} />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold group-hover:text-primary transition-colors">{profile?.full_name || "Parent"}</h4>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                      <span className="material-icons-outlined text-base">history</span>
                      <span>{recentLogsCount} logs this week</span>
                    </div>
                  </div>
                </div>
                <Button variant="ghost" size="icon" className="w-10 h-10 rounded-full border border-border hover:border-primary hover:text-primary transition-colors">
                  <span className="material-icons-outlined">arrow_forward</span>
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}