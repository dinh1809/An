import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, Play, Smile, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AppLayout } from "@/components/layout/AppLayout";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";
import { supabase } from "@/integrations/supabase/client";
import { ConnectTherapist } from "@/components/ConnectTherapist";

interface Profile {
  full_name: string | null;
}

interface Exercise {
  id: string;
  title: string;
  description: string | null;
  doctor_name: string;
  video_url: string | null;
}

export default function Home() {
  const { user, loading } = useAuth();
  const { role, loading: roleLoading, isTherapist } = useUserRole();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [todayExercise, setTodayExercise] = useState<Exercise | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  // Redirect therapists to their dashboard
  useEffect(() => {
    if (!roleLoading && isTherapist) {
      navigate("/therapist");
    }
  }, [roleLoading, isTherapist, navigate]);

  // Redirect to role selection if no role set
  useEffect(() => {
    if (!loading && !roleLoading && user && !role) {
      navigate("/select-role");
    }
  }, [loading, roleLoading, user, role, navigate]);

  useEffect(() => {
    if (user) {
      // Fetch profile
      supabase
        .from("profiles")
        .select("full_name")
        .eq("user_id", user.id)
        .maybeSingle()
        .then(({ data }) => {
          setProfile(data);
        });

      // Fetch today's exercise
      supabase
        .from("exercises")
        .select("*")
        .eq("user_id", user.id)
        .eq("is_completed", false)
        .order("assigned_at", { ascending: false })
        .limit(1)
        .maybeSingle()
        .then(({ data }) => {
          setTodayExercise(data);
        });
    }
  }, [user]);

  if (loading || roleLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-primary">Loading...</div>
      </div>
    );
  }

  if (!user) return null;

  const firstName = profile?.full_name?.split(" ")[0] || "there";

  return (
    <AppLayout>
      {/* Header */}
      <header className="flex items-center justify-between mb-6">
        <div>
          <p className="text-muted-foreground text-sm">Good morning</p>
          <h1 className="text-2xl font-bold text-foreground">
            Welcome, {firstName}
          </h1>
        </div>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          <span className="absolute top-1 right-1 h-2 w-2 bg-destructive rounded-full" />
        </Button>
      </header>

      {/* Connect Therapist Card */}
      <div className="mb-6 animate-slide-up">
        <ConnectTherapist />
      </div>

      {/* Today's Exercise Card */}
      <Card className="mb-6 overflow-hidden border border-border shadow-sm animate-slide-up">
        <div className="bg-primary/5 p-4 border-b border-border">
          <p className="text-sm text-primary font-medium">Today's Exercise</p>
          <h2 className="text-lg font-semibold text-foreground">
            {todayExercise ? todayExercise.title : "No exercise assigned yet"}
          </h2>
          {todayExercise && (
            <p className="text-sm text-muted-foreground">From Dr. {todayExercise.doctor_name}</p>
          )}
        </div>
        <CardContent className="p-0">
          {/* Video Thumbnail Placeholder */}
          <div className="relative aspect-video bg-muted flex items-center justify-center">

            {!todayExercise ? (
              <div className="flex flex-col items-center gap-2">
                <div className="w-12 h-12 rounded-full bg-muted-foreground/20 flex items-center justify-center">
                  <Play className="h-6 w-6 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground text-sm">Waiting for new assignments</p>
              </div>
            ) : (
              <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center shadow-lg cursor-pointer hover:scale-105 transition-transform">
                <Play className="h-8 w-8 text-primary-foreground ml-1" />
              </div>
            )}
          </div>
          <div className="p-4">
            <Button className="w-full" size="lg" disabled={!todayExercise}>
              <Play className="h-4 w-4 mr-2" />
              Start Practice
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Quick Log Section */}
      <section>
        <h3 className="text-lg font-semibold mb-4 text-foreground">Quick Log</h3>
        <div className="grid grid-cols-2 gap-4">
          <Card
            className="border border-border shadow-sm cursor-pointer hover:border-primary/50 transition-all animate-slide-up"
            style={{ animationDelay: "0.1s" }}
            onClick={() => navigate("/track")}
          >
            <CardContent className="p-6 flex flex-col items-center text-center">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-3">
                <Smile className="h-7 w-7 text-primary" />
              </div>
              <h4 className="font-semibold text-foreground">Behavior</h4>
              <p className="text-sm text-muted-foreground">Log today's mood</p>
            </CardContent>
          </Card>

          <Card
            className="border border-border shadow-sm cursor-pointer hover:border-secondary/50 transition-all animate-slide-up"
            style={{ animationDelay: "0.15s" }}
            onClick={() => navigate("/track")}
          >
            <CardContent className="p-6 flex flex-col items-center text-center">
              <div className="w-14 h-14 rounded-2xl bg-secondary/10 flex items-center justify-center mb-3">
                <Upload className="h-7 w-7 text-secondary" />
              </div>
              <h4 className="font-semibold text-foreground">Upload Video</h4>
              <p className="text-sm text-muted-foreground">Practice recording</p>
            </CardContent>
          </Card>
        </div>
      </section>
    </AppLayout>
  );
}
