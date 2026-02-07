import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ParentLayout } from "@/components/layout/ParentLayout";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  CheckCircle2, 
  Clock, 
  MessageCircle, 
  Play,
  ArrowRight,
  Smile
} from "lucide-react";
import { ConnectTherapist } from "@/components/ConnectTherapist";

interface Exercise {
  id: string;
  title: string;
  description: string | null;
  doctor_name: string;
  is_completed: boolean;
  video_url: string | null;
  assigned_at: string;
}

interface TherapistMessage {
  id: string;
  message: string;
  therapist_name: string;
  is_urgent: boolean;
  read_at: string | null;
  created_at: string;
}

export default function ParentHome() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [messages, setMessages] = useState<TherapistMessage[]>([]);
  const [loading, setLoading] = useState(true);

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

    const [exercisesRes, messagesRes] = await Promise.all([
      supabase
        .from("exercises")
        .select("*")
        .eq("user_id", user.id)
        .order("assigned_at", { ascending: false })
        .limit(5),
      supabase
        .from("therapist_messages")
        .select("*")
        .eq("user_id", user.id)
        .is("read_at", null)
        .order("created_at", { ascending: false })
        .limit(3),
    ]);

    if (exercisesRes.data) setExercises(exercisesRes.data);
    if (messagesRes.data) setMessages(messagesRes.data);
    setLoading(false);
  };

  const markExerciseComplete = async (exerciseId: string) => {
    await supabase
      .from("exercises")
      .update({ is_completed: true })
      .eq("id", exerciseId);
    
    setExercises((prev) =>
      prev.map((ex) =>
        ex.id === exerciseId ? { ...ex, is_completed: true } : ex
      )
    );
  };

  if (authLoading || loading) {
    return (
      <ParentLayout>
        <div className="space-y-6">
          <Skeleton className="h-8 w-48" />
          <div className="grid gap-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-32 w-full rounded-2xl" />
            ))}
          </div>
        </div>
      </ParentLayout>
    );
  }

  const completedCount = exercises.filter((e) => e.is_completed).length;
  const pendingCount = exercises.length - completedCount;

  return (
    <ParentLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gradient">Welcome back!</h1>
            <p className="text-muted-foreground">Here's your daily progress</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="gap-1">
              <CheckCircle2 className="h-3 w-3" />
              {completedCount} done
            </Badge>
            <Badge variant="outline" className="gap-1">
              <Clock className="h-3 w-3" />
              {pendingCount} pending
            </Badge>
          </div>
        </div>

        {/* Connect Therapist */}
        <ConnectTherapist />

        {/* Unread Messages */}
        {messages.length > 0 && (
          <Card className="glass-card border-l-4 border-l-accent">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <MessageCircle className="h-5 w-5 text-accent" />
                Messages from your therapist
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className="p-3 rounded-xl bg-muted/50 space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-sm">{msg.therapist_name}</span>
                    {msg.is_urgent && (
                      <Badge variant="destructive" className="text-xs">Urgent</Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{msg.message}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Today's Exercises */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Today's Exercises</h2>
            <Button variant="ghost" size="sm" onClick={() => navigate("/parent/track")}>
              View all <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </div>

          {exercises.length === 0 ? (
            <Card className="glass-card">
              <CardContent className="py-8 text-center">
                <Smile className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                <p className="text-muted-foreground">No exercises assigned yet.</p>
                <p className="text-sm text-muted-foreground">Your therapist will add exercises soon!</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-3">
              {exercises.map((exercise) => (
                <Card
                  key={exercise.id}
                  className={`glass-card transition-all ${
                    exercise.is_completed ? "opacity-60" : ""
                  }`}
                >
                  <CardContent className="py-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-medium truncate">{exercise.title}</h3>
                          {exercise.is_completed && (
                            <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0" />
                          )}
                        </div>
                        {exercise.description && (
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {exercise.description}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground mt-1">
                          By {exercise.doctor_name}
                        </p>
                      </div>
                      <div className="flex gap-2 flex-shrink-0">
                        {exercise.video_url && (
                          <Button size="icon" variant="outline" className="h-9 w-9">
                            <Play className="h-4 w-4" />
                          </Button>
                        )}
                        {!exercise.is_completed && (
                          <Button
                            size="sm"
                            onClick={() => markExerciseComplete(exercise.id)}
                          >
                            Done
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </ParentLayout>
  );
}
