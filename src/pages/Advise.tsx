import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AlertTriangle, BookOpen, Video, ChevronRight, MessageCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AppLayout } from "@/components/layout/AppLayout";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

interface TherapistMessage {
  id: string;
  therapist_name: string;
  message: string;
  is_urgent: boolean;
  created_at: string;
}

const resources = [
  {
    id: 1,
    title: "Understanding Sensory Processing",
    type: "article",
    icon: BookOpen,
  },
  {
    id: 2,
    title: "Calming Techniques for Meltdowns",
    type: "video",
    icon: Video,
  },
  {
    id: 3,
    title: "Building Daily Routines",
    type: "article",
    icon: BookOpen,
  },
  {
    id: 4,
    title: "Social Skills Activities",
    type: "video",
    icon: Video,
  },
];

export default function Advise() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [urgentAlerts, setUrgentAlerts] = useState<TherapistMessage[]>([]);
  const [latestMessage, setLatestMessage] = useState<TherapistMessage | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user) {
      fetchMessages();
    }
  }, [user]);

  const fetchMessages = async () => {
    if (!user) return;

    // Fetch urgent alerts
    const { data: urgentData } = await supabase
      .from("therapist_messages")
      .select("*")
      .eq("user_id", user.id)
      .eq("is_urgent", true)
      .is("read_at", null)
      .order("created_at", { ascending: false });

    if (urgentData) {
      setUrgentAlerts(urgentData);
    }

    // Fetch latest message
    const { data: messageData } = await supabase
      .from("therapist_messages")
      .select("*")
      .eq("user_id", user.id)
      .eq("is_urgent", false)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (messageData) {
      setLatestMessage(messageData);
    }
  };

  const markAsRead = async (id: string) => {
    await supabase
      .from("therapist_messages")
      .update({ read_at: new Date().toISOString() })
      .eq("id", id);

    fetchMessages();
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
      <h1 className="text-2xl font-bold mb-6">Expert Advice</h1>

      {/* Red Flag Alerts */}
      {urgentAlerts.length > 0 && (
        <section className="mb-6">
          {urgentAlerts.map((alert, index) => (
            <Card
              key={alert.id}
              className="mb-3 border-0 bg-destructive/10 animate-slide-up"
              style={{ animationDelay: `${0.05 * index}s` }}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-destructive/20 flex items-center justify-center flex-shrink-0">
                    <AlertTriangle className="h-5 w-5 text-destructive" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-destructive">Red Flag Alert</h3>
                    <p className="text-sm text-foreground mt-1">{alert.message}</p>
                    <p className="text-xs text-muted-foreground mt-2">
                      From Dr. {alert.therapist_name}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="mt-3 text-muted-foreground"
                  onClick={() => markAsRead(alert.id)}
                >
                  Dismiss
                </Button>
              </CardContent>
            </Card>
          ))}
        </section>
      )}

      {/* Resource Hub */}
      <section className="mb-6">
        <h2 className="text-lg font-semibold mb-4">Resource Hub</h2>
        <div className="space-y-3">
          {resources.map((resource, index) => (
            <Card
              key={resource.id}
              className="border-0 shadow-soft cursor-pointer hover:shadow-soft-lg transition-shadow animate-slide-up"
              style={{ animationDelay: `${0.05 * index}s` }}
            >
              <CardContent className="p-4 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-accent flex items-center justify-center flex-shrink-0">
                  <resource.icon className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">{resource.title}</p>
                  <p className="text-sm text-muted-foreground capitalize">
                    {resource.type}
                  </p>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Therapist Message */}
      <section>
        <h2 className="text-lg font-semibold mb-4">Therapist Message</h2>
        <Card className="border-0 shadow-soft animate-slide-up" style={{ animationDelay: "0.2s" }}>
          <CardContent className="p-4">
            {latestMessage ? (
              <>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center">
                    <MessageCircle className="h-5 w-5 text-primary-foreground" />
                  </div>
                  <div>
                    <p className="font-semibold">Dr. {latestMessage.therapist_name}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(latestMessage.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <p className="text-muted-foreground">{latestMessage.message}</p>
              </>
            ) : (
              <div className="text-center py-6 text-muted-foreground">
                <MessageCircle className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No messages from your therapist yet</p>
              </div>
            )}
          </CardContent>
        </Card>
      </section>
    </AppLayout>
  );
}
