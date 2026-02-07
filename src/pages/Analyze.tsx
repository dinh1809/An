import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AppLayout } from "@/components/layout/AppLayout";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

type Period = "7" | "30";

interface BehaviorLog {
  id: string;
  mood: string;
  logged_at: string;
}

const moodToScore: Record<string, number> = {
  happy: 4,
  neutral: 3,
  sad: 2,
  angry: 1,
};

export default function Analyze() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [period, setPeriod] = useState<Period>("7");
  const [behaviorData, setBehaviorData] = useState<{ day: string; score: number }[]>([]);
  const [activityData, setActivityData] = useState<{ day: string; count: number }[]>([]);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user) {
      fetchBehaviorData();
    }
  }, [user, period]);

  const fetchBehaviorData = async () => {
    if (!user) return;

    const daysAgo = parseInt(period);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysAgo);

    const { data: logs } = await supabase
      .from("behavior_logs")
      .select("id, mood, logged_at")
      .eq("user_id", user.id)
      .gte("logged_at", startDate.toISOString())
      .order("logged_at", { ascending: true });

    if (logs) {
      // Process data for charts
      const dayMap = new Map<string, { scores: number[]; count: number }>();

      logs.forEach((log: BehaviorLog) => {
        const day = new Date(log.logged_at).toLocaleDateString("en-US", {
          weekday: "short",
        });
        const existing = dayMap.get(day) || { scores: [], count: 0 };
        existing.scores.push(moodToScore[log.mood] || 3);
        existing.count += 1;
        dayMap.set(day, existing);
      });

      // Generate days array
      const days = [];
      for (let i = daysAgo - 1; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        days.push(
          date.toLocaleDateString("en-US", { weekday: "short" })
        );
      }

      const behaviorChartData = days.slice(-7).map((day) => {
        const data = dayMap.get(day);
        const avgScore = data
          ? data.scores.reduce((a, b) => a + b, 0) / data.scores.length
          : 0;
        return { day, score: Math.round(avgScore * 10) / 10 };
      });

      const activityChartData = days.slice(-7).map((day) => {
        const data = dayMap.get(day);
        return { day, count: data?.count || 0 };
      });

      setBehaviorData(behaviorChartData);
      setActivityData(activityChartData);
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
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Progress Analysis</h1>
        <Tabs value={period} onValueChange={(v) => setPeriod(v as Period)}>
          <TabsList>
            <TabsTrigger value="7">7 Days</TabsTrigger>
            <TabsTrigger value="30">30 Days</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Behavior Trends */}
      <Card className="mb-6 border-0 shadow-soft animate-slide-up">
        <CardHeader>
          <CardTitle className="text-lg">Behavior Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={behaviorData}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey="day" className="text-xs" />
                <YAxis domain={[0, 4]} ticks={[1, 2, 3, 4]} className="text-xs" />
                <Tooltip
                  contentStyle={{
                    borderRadius: "12px",
                    border: "none",
                    boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
                  }}
                  formatter={(value: number) => {
                    const labels = ["", "Angry", "Sad", "Neutral", "Happy"];
                    return [labels[Math.round(value)] || value, "Mood"];
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="score"
                  stroke="hsl(211 70% 59%)"
                  strokeWidth={3}
                  dot={{ fill: "hsl(211 70% 59%)", strokeWidth: 2 }}
                  activeDot={{ r: 6, stroke: "hsl(211 70% 59%)", strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Practice Consistency */}
      <Card className="mb-6 border-0 shadow-soft animate-slide-up" style={{ animationDelay: "0.1s" }}>
        <CardHeader>
          <CardTitle className="text-lg">Practice Consistency</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={activityData}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey="day" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip
                  contentStyle={{
                    borderRadius: "12px",
                    border: "none",
                    boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
                  }}
                  formatter={(value: number) => [value, "Activities"]}
                />
                <Bar
                  dataKey="count"
                  fill="hsl(88 70% 48%)"
                  radius={[8, 8, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Insight Box */}
      <Card className="border-0 shadow-soft bg-accent animate-slide-up" style={{ animationDelay: "0.2s" }}>
        <CardContent className="p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
            <TrendingUp className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="font-semibold text-foreground">Weekly Insight</p>
            <p className="text-sm text-muted-foreground">
              Focus improved by 20% this week. Keep up the great work!
            </p>
          </div>
        </CardContent>
      </Card>
    </AppLayout>
  );
}
