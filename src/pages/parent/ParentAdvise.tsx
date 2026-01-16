import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ParentLayout } from "@/components/layout/ParentLayout";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { MessageCircle, AlertCircle, CheckCircle2, Clock } from "lucide-react";
import { format } from "date-fns";

interface TherapistMessage {
  id: string;
  message: string;
  therapist_name: string;
  is_urgent: boolean;
  read_at: string | null;
  created_at: string;
}

export default function ParentAdvise() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<TherapistMessage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
      return;
    }

    if (user) {
      fetchMessages();
    }
  }, [user, authLoading, navigate]);

  const fetchMessages = async () => {
    if (!user) return;

    const { data } = await supabase
      .from("therapist_messages")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (data) setMessages(data);
    setLoading(false);
  };

  const markAsRead = async (messageId: string) => {
    await supabase
      .from("therapist_messages")
      .update({ read_at: new Date().toISOString() })
      .eq("id", messageId);

    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === messageId ? { ...msg, read_at: new Date().toISOString() } : msg
      )
    );
  };

  if (authLoading || loading) {
    return (
      <ParentLayout>
        <div className="space-y-6">
          <Skeleton className="h-8 w-48" />
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-32 w-full rounded-2xl" />
            ))}
          </div>
        </div>
      </ParentLayout>
    );
  }

  const unreadCount = messages.filter((m) => !m.read_at).length;

  return (
    <ParentLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gradient">Therapist Advice</h1>
            <p className="text-muted-foreground">Messages from your care team</p>
          </div>
          {unreadCount > 0 && (
            <Badge variant="secondary" className="gap-1">
              <Clock className="h-3 w-3" />
              {unreadCount} unread
            </Badge>
          )}
        </div>

        {messages.length === 0 ? (
          <Card className="glass-card">
            <CardContent className="py-12 text-center">
              <MessageCircle className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
              <p className="text-muted-foreground">No messages yet.</p>
              <p className="text-sm text-muted-foreground">
                Your therapist will send advice and updates here.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {messages.map((message) => (
              <Card
                key={message.id}
                className={`glass-card transition-all ${
                  !message.read_at ? "border-l-4 border-l-primary" : "opacity-75"
                }`}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-base">
                        {message.therapist_name}
                      </CardTitle>
                      {message.is_urgent && (
                        <Badge variant="destructive" className="text-xs gap-1">
                          <AlertCircle className="h-3 w-3" />
                          Urgent
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {message.read_at ? (
                        <CheckCircle2 className="h-4 w-4 text-primary" />
                      ) : (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => markAsRead(message.id)}
                        >
                          Mark read
                        </Button>
                      )}
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {format(new Date(message.created_at), "MMM d, yyyy 'at' h:mm a")}
                  </p>
                </CardHeader>
                <CardContent>
                  <p className="text-sm leading-relaxed">{message.message}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </ParentLayout>
  );
}
