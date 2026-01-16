import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts";
import { format, subDays } from "date-fns";

interface BehaviorLog {
  id: string;
  user_id: string;
  mood: string;
  logged_at: string;
}

const COLORS = {
  positive: "hsl(var(--primary))",
  neutral: "hsl(var(--muted-foreground))",
  negative: "hsl(var(--destructive))",
};

export default function TherapistAnalytics() {
  const { user, loading: authLoading } = useAuth();
  const { role, loading: roleLoading } = useUserRole();
  const navigate = useNavigate();
  const [logs, setLogs] = useState<BehaviorLog[]>([]);
  const [patientCount, setPatientCount] = useState(0);
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
      .select("parent_id")
      .eq("therapist_id", user.id)
      .eq("status", "accepted");

    if (connections) {
      setPatientCount(connections.length);
      const parentIds = connections.map((c) => c.parent_id);

      if (parentIds.length > 0) {
        const thirtyDaysAgo = subDays(new Date(), 30).toISOString();
        
        const { data: behaviorLogs } = await supabase
          .from("behavior_logs")
          .select("*")
          .in("user_id", parentIds)
          .gte("logged_at", thirtyDaysAgo)
          .order("logged_at", { ascending: true });

        if (behaviorLogs) setLogs(behaviorLogs);
      }
    }
    setLoading(false);
  };

  if (authLoading || roleLoading || loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid gap-6 md:grid-cols-2">
          <Skeleton className="h-28 rounded-2xl" />
          <Skeleton className="h-28 rounded-2xl" />
        </div>
        <Skeleton className="h-72 rounded-3xl" />
      </div>
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

  const weeklyData = Array.from({ length: 7 }, (_, i) => {
    const date = subDays(new Date(), 6 - i);
    const dayLogs = logs.filter(
      (log) => format(new Date(log.logged_at), "yyyy-MM-dd") === format(date, "yyyy-MM-dd")
    );
    
    return {
      day: format(date, "EEE"),
      Positive: dayLogs.filter((l) => l.mood === "happy").length,
      Neutral: dayLogs.filter((l) => l.mood === "neutral").length,
      Negative: dayLogs.filter((l) => l.mood === "sad" || l.mood === "angry").length,
    };
  });

  const totalLogs = logs.length;
  const happyPercentage = totalLogs > 0 ? Math.round((moodCounts.happy || 0) / totalLogs * 100) : 0;

  const pieData = [
    { name: "Positive", value: moodCounts.happy || 0, color: "#10B981" },
    { name: "Neutral", value: moodCounts.neutral || 0, color: "#F59E0B" },
    { name: "Negative", value: (moodCounts.sad || 0) + (moodCounts.angry || 0), color: "#EF4444" },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Analytics Overview</h2>
          <p className="text-muted-foreground mt-1">Aggregate insights across all patients</p>
        </div>
        <Button className="gap-2 rounded-xl shadow-lg shadow-primary/30">
          <span className="material-icons-round text-sm">download</span>
          Export
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="stat-card relative overflow-hidden">
          <div className="absolute -right-6 -top-6 w-32 h-32 bg-secondary/20 rounded-full" />
          <CardContent className="pt-6 relative z-10">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Total Patients</p>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-4xl font-bold">{patientCount}</span>
                  <span className="text-sm font-medium text-success bg-success/10 px-2 py-0.5 rounded-full">+2</span>
                </div>
              </div>
              <div className="w-12 h-12 rounded-xl bg-secondary/20 text-secondary flex items-center justify-center">
                <span className="material-icons-round text-2xl">group</span>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="stat-card relative overflow-hidden">
          <div className="absolute -right-6 -top-6 w-32 h-32 bg-success/20 rounded-full" />
          <CardContent className="pt-6 relative z-10">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Positive Rate</p>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-4xl font-bold">{happyPercentage}%</span>
                  <span className="text-sm font-medium text-success bg-success/10 px-2 py-0.5 rounded-full">+5%</span>
                </div>
              </div>
              <div className="w-12 h-12 rounded-xl bg-success/20 text-success flex items-center justify-center">
                <span className="material-icons-round text-2xl">sentiment_satisfied_alt</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 glass-card border border-border/50">
          <CardHeader>
            <CardTitle className="text-lg font-bold">Weekly Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyData}>
                  <XAxis dataKey="day" axisLine={false} tickLine={false} />
                  <YAxis axisLine={false} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ 
                      background: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '12px',
                    }}
                  />
                  <Bar dataKey="Positive" stackId="a" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Neutral" stackId="a" fill="hsl(var(--muted-foreground))" radius={0} />
                  <Bar dataKey="Negative" stackId="a" fill="hsl(var(--destructive))" radius={0} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border border-border/50">
          <CardHeader>
            <CardTitle className="text-lg font-bold">Emotion Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center">
            <div className="h-48 w-48 relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <p className="text-3xl font-bold">{totalLogs}</p>
                  <p className="text-xs text-muted-foreground">Total Logs</p>
                </div>
              </div>
            </div>
            <div className="flex gap-4 mt-4">
              {pieData.map((entry) => (
                <div key={entry.name} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
                  <span className="text-xs text-muted-foreground">{entry.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}