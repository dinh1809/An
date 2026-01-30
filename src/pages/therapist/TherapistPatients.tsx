import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

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

const avatarColors = [
  "bg-primary/20 text-primary",
  "bg-secondary/20 text-secondary",
  "bg-warning/20 text-warning",
  "bg-success/20 text-success",
  "bg-destructive/20 text-destructive",
];

export default function TherapistPatients() {
  const { user, loading: authLoading } = useAuth();
  const { role, loading: roleLoading } = useUserRole();
  const navigate = useNavigate();
  const [connectedParents, setConnectedParents] = useState<ConnectedParent[]>([]);
  const [pendingRequests, setPendingRequests] = useState<Connection[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

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
            supabase.from("behavior_logs").select("id", { count: "exact" }).eq("user_id", conn.parent_id)
              .gte("logged_at", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()),
          ]);
          return {
            connection: conn,
            profile: profileRes.data,
            recentLogsCount: logsRes.count || 0,
            needsAttention: logsRes.count === 0,
          };
        })
      );
      setConnectedParents(parentsData);
    }
    setLoading(false);
  };

  const handleAcceptConnection = async (connectionId: string) => {
    await supabase.from("connections").update({ status: "accepted" }).eq("id", connectionId);
    fetchData();
  };

  const filteredParents = connectedParents.filter((p) =>
    (p.profile?.full_name || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeThisWeek = connectedParents.filter(p => p.recentLogsCount > 0).length;

  const getInitials = (name: string | null) => {
    if (!name) return "P";
    const parts = name.split(" ");
    return parts.length >= 2 ? parts[0][0] + parts[parts.length - 1][0] : name.substring(0, 2).toUpperCase();
  };

  const getAvatarColor = (index: number) => avatarColors[index % avatarColors.length];

  if (authLoading || roleLoading || loading) {
    return (
      <div className="max-w-6xl mx-auto space-y-6">
        <Skeleton className="h-12 w-64" />
        <div className="grid gap-4 md:grid-cols-3">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-24 rounded-2xl" />)}
        </div>
        <Skeleton className="h-12 w-full rounded-xl" />
        <Skeleton className="h-64 rounded-3xl" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <span className="text-sm font-semibold text-primary uppercase tracking-wider mb-1 block">Therapist Workspace</span>
          <h2 className="text-4xl font-bold mb-2">All Patients</h2>
          <p className="text-muted-foreground text-lg">View and manage connected families.</p>
        </div>
        <div className="flex gap-4 w-full md:w-auto">
          <div className="relative group flex-1 md:w-80">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors">
              <span className="material-icons-outlined">search</span>
            </span>
            <Input 
              className="w-full pl-12 pr-4 py-3.5 h-auto bg-card border border-border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm shadow-sm transition-all" 
              placeholder="Search patients..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button className="px-6 py-3.5 h-auto rounded-xl font-medium shadow-lg shadow-primary/30 transition-all gap-2">
            <span className="material-icons-round text-lg">add</span>
            <span className="hidden sm:inline">Add</span>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="stat-card">
          <CardContent className="pt-5 flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <span className="material-icons-round text-2xl text-primary">groups</span>
            </div>
            <div>
              <p className="text-3xl font-bold">{connectedParents.length}</p>
              <p className="text-sm text-muted-foreground">Total Patients</p>
            </div>
          </CardContent>
        </Card>
        <Card className="stat-card">
          <CardContent className="pt-5 flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-success/10 flex items-center justify-center">
              <span className="material-icons-round text-2xl text-success">check_circle</span>
            </div>
            <div>
              <p className="text-3xl font-bold">{activeThisWeek}</p>
              <p className="text-sm text-muted-foreground">Active This Week</p>
            </div>
          </CardContent>
        </Card>
        <Card className="stat-card">
          <CardContent className="pt-5 flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-warning/10 flex items-center justify-center">
              <span className="material-icons-round text-2xl text-warning">pending_actions</span>
            </div>
            <div>
              <p className="text-3xl font-bold">{pendingRequests.length}</p>
              <p className="text-sm text-muted-foreground">Pending Requests</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Patients List Card */}
      <Card className="glass-card border border-border/50 shadow-soft overflow-hidden">
        <CardHeader className="border-b border-border pb-4">
          <CardTitle className="flex items-center gap-2 text-xl">
            <span className="material-icons-outlined text-primary">diversity_1</span>
            Connected Patients ({filteredParents.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          {filteredParents.length === 0 ? (
            <div className="text-center py-12">
              <span className="material-icons-round text-5xl text-muted-foreground mb-3">group_off</span>
              <p className="text-muted-foreground">{searchQuery ? "No patients found." : "No connected patients yet."}</p>
            </div>
          ) : (
            filteredParents.map(({ connection, profile, recentLogsCount, needsAttention }, index) => (
              <div 
                key={connection.id}
                className={`group flex items-center justify-between p-4 md:p-5 rounded-2xl transition-all cursor-pointer border ${
                  needsAttention 
                    ? "bg-warning/5 border-warning/20 hover:border-warning/40 hover:bg-warning/10" 
                    : "bg-muted/30 border-transparent hover:border-primary/20 hover:bg-muted/50"
                }`}
                onClick={() => navigate(`/therapist/patient/${connection.parent_id}`)}
              >
                <div className="flex items-center gap-4 md:gap-6">
                  <div className="relative">
                    <div className={`w-14 h-14 rounded-full ${getAvatarColor(index)} flex items-center justify-center font-bold text-lg`}>
                      {getInitials(profile?.full_name)}
                    </div>
                    <div className={`absolute bottom-0 right-0 w-3.5 h-3.5 border-2 border-card rounded-full ${needsAttention ? "bg-warning animate-pulse" : "bg-success"}`} />
                  </div>
                  <div>
                    <h4 className={`text-lg font-bold transition-colors ${needsAttention ? "group-hover:text-warning" : "group-hover:text-primary"}`}>
                      {profile?.full_name || "Parent"}
                    </h4>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                      {needsAttention ? (
                        <span className="text-warning font-medium">Action Required</span>
                      ) : (
                        <>
                          <span className="material-icons-outlined text-base">history</span>
                          <span>{recentLogsCount} logs this week</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                {needsAttention ? (
                  <Button 
                    size="icon" 
                    className="w-10 h-10 rounded-full shadow-md hover:shadow-lg transition-all"
                    onClick={(e) => { e.stopPropagation(); }}
                    title="Accept"
                  >
                    <span className="material-icons-round text-lg">check</span>
                  </Button>
                ) : (
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="w-10 h-10 rounded-full border border-border hover:border-primary hover:text-primary transition-colors shadow-sm"
                  >
                    <span className="material-icons-outlined">arrow_forward</span>
                  </Button>
                )}
              </div>
            ))
          )}

          {/* Pending Requests */}
          {pendingRequests.length > 0 && (
            <>
              <div className="pt-4 border-t border-border">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">Pending Requests</h3>
                {pendingRequests.map((request, index) => (
                  <div 
                    key={request.id}
                    className="group flex items-center justify-between p-4 md:p-5 rounded-2xl bg-warning/5 border border-warning/20 hover:border-warning/40 transition-all"
                  >
                    <div className="flex items-center gap-4 md:gap-6">
                      <div className="relative">
                        <div className="w-14 h-14 rounded-full bg-warning/20 text-warning flex items-center justify-center font-bold text-lg">
                          <span className="material-icons-round">person_add</span>
                        </div>
                        <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-warning border-2 border-card rounded-full animate-pulse" />
                      </div>
                      <div>
                        <h4 className="text-lg font-bold">New Connection Request</h4>
                        <p className="text-sm text-muted-foreground">ID: {request.parent_id.slice(0, 8)}...</p>
                      </div>
                    </div>
                    <Button 
                      size="icon" 
                      className="w-10 h-10 rounded-full shadow-md hover:shadow-lg transition-all"
                      onClick={() => handleAcceptConnection(request.id)}
                      title="Accept"
                    >
                      <span className="material-icons-round text-lg">check</span>
                    </Button>
                  </div>
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}