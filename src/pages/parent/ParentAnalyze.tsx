import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ParentLayout } from "@/components/layout/ParentLayout";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { TrendingUp, Smile, Meh, Frown, Brain, Activity } from "lucide-react";
import { format, subDays } from "date-fns";
import { motion } from "framer-motion";
import { NeuroRadarChart } from "@/components/analyze/NeuroRadarChart";
import { TopStrengthCard } from "@/components/analyze/TopStrengthCard";
import { GameCompletionStatus } from "@/components/analyze/GameCompletionStatus";
import { 
  GameSession,
  calculateNeuroProfile, 
  getRadarChartData, 
  getTopStrength,
  getGameCompletionStatus,
  hasCompletedGames
} from "@/utils/neuroProfile";

interface BehaviorLog {
  id: string;
  mood: string;
  logged_at: string;
}

const COLORS = {
  happy: "hsl(var(--primary))",
  neutral: "hsl(var(--muted-foreground))",
  sad: "hsl(var(--destructive))",
};

export default function ParentAnalyze() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [logs, setLogs] = useState<BehaviorLog[]>([]);
  const [gameSessions, setGameSessions] = useState<GameSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("neuro");

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

    const thirtyDaysAgo = subDays(new Date(), 30).toISOString();
    
    // Fetch behavior logs and game sessions in parallel
    const [logsResult, sessionsResult] = await Promise.all([
      supabase
        .from("behavior_logs")
        .select("*")
        .eq("user_id", user.id)
        .gte("logged_at", thirtyDaysAgo)
        .order("logged_at", { ascending: true }),
      supabase
        .from("game_sessions")
        .select("*")
        .eq("user_id", user.id)
        .not("completed_at", "is", null)
        .order("completed_at", { ascending: false })
    ]);

    if (logsResult.data) setLogs(logsResult.data);
    if (sessionsResult.data) setGameSessions(sessionsResult.data as GameSession[]);
    setLoading(false);
  };

  if (authLoading || loading) {
    return (
      <ParentLayout>
        <div className="space-y-6">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-80 w-full rounded-2xl" />
          <Skeleton className="h-48 w-full rounded-2xl" />
        </div>
      </ParentLayout>
    );
  }

  // Calculate mood distribution
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

  // Calculate weekly trends
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

  const totalLogs = logs.length;
  const happyPercentage = totalLogs > 0 
    ? Math.round((moodCounts.happy || 0) / totalLogs * 100) 
    : 0;

  // Calculate neuro profile
  const neuroProfile = calculateNeuroProfile(gameSessions);
  const radarData = getRadarChartData(neuroProfile);
  const topStrength = getTopStrength(neuroProfile);
  const completionStatus = getGameCompletionStatus(gameSessions);
  const hasGames = hasCompletedGames(gameSessions);

  return (
    <ParentLayout>
      <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-2xl font-bold text-gradient">Phân tích Tiến trình</h1>
          <p className="text-muted-foreground">Khám phá điểm mạnh và xu hướng</p>
        </motion.div>

        {/* Tab Navigation */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 h-12">
            <TabsTrigger value="neuro" className="flex items-center gap-2">
              <Brain className="h-4 w-4" />
              Neuro-Radar
            </TabsTrigger>
            <TabsTrigger value="mood" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Tâm trạng
            </TabsTrigger>
          </TabsList>

          {/* Neuro-Radar Tab */}
          <TabsContent value="neuro" className="mt-6 space-y-6">
            {hasGames ? (
              <>
                {/* Radar Chart */}
                <NeuroRadarChart data={radarData} />

                {/* Top Strength Card */}
                <TopStrengthCard strength={topStrength} />

                {/* Game Completion Status */}
                <GameCompletionStatus {...completionStatus} />

                {/* Intelligence Breakdown */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <Card className="glass-card">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg">Chi tiết điểm số</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {radarData.map((item, idx) => (
                        <div key={item.subject} className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span className="font-medium">{item.subjectVi}</span>
                            <span className="text-muted-foreground">{item.score}/100</span>
                          </div>
                          <div className="h-2 bg-muted rounded-full overflow-hidden">
                            <motion.div
                              className="h-full bg-primary rounded-full"
                              initial={{ width: 0 }}
                              animate={{ width: `${item.score}%` }}
                              transition={{ delay: 0.5 + idx * 0.1, duration: 0.5 }}
                            />
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </motion.div>
              </>
            ) : (
              <Card className="glass-card">
                <CardContent className="py-12 text-center">
                  <Brain className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                  <p className="font-medium mb-2">Chưa có dữ liệu đánh giá</p>
                  <p className="text-sm text-muted-foreground mb-4">
                    Hoàn thành các bài đánh giá để xem hồ sơ Neuro-Radar của bạn
                  </p>
                  <GameCompletionStatus {...completionStatus} />
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Mood Analytics Tab */}
          <TabsContent value="mood" className="mt-6 space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-3 gap-3">
              <Card className="glass-card">
                <CardContent className="pt-4 text-center">
                  <Smile className="h-8 w-8 mx-auto text-primary mb-2" />
                  <p className="text-2xl font-bold">{moodCounts.happy || 0}</p>
                  <p className="text-xs text-muted-foreground">Happy days</p>
                </CardContent>
              </Card>
              <Card className="glass-card">
                <CardContent className="pt-4 text-center">
                  <Meh className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                  <p className="text-2xl font-bold">{moodCounts.neutral || 0}</p>
                  <p className="text-xs text-muted-foreground">Neutral days</p>
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

            {/* Mood Distribution */}
            {totalLogs > 0 ? (
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
                    <CardTitle>Mood Distribution</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64 flex items-center justify-center">
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
                    <p className="text-center text-sm text-muted-foreground mt-4">
                      {happyPercentage}% positive mood rate this month
                    </p>
                  </CardContent>
                </Card>
              </>
            ) : (
              <Card className="glass-card">
                <CardContent className="py-12 text-center">
                  <TrendingUp className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                  <p className="text-muted-foreground">No data to analyze yet.</p>
                  <p className="text-sm text-muted-foreground">
                    Start logging moods to see insights!
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </ParentLayout>
  );
}
