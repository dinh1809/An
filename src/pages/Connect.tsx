import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { UserCheck, X, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import logo from "@/assets/logo.jfif";

interface TherapistProfile {
  user_id: string;
  full_name: string | null;
  avatar_url: string | null;
  clinic_name: string | null;
  clinic_address: string | null;
}

export default function Connect() {
  const [searchParams] = useSearchParams();
  const code = searchParams.get("code");
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { role, loading: roleLoading } = useUserRole();
  const { toast } = useToast();

  const [therapist, setTherapist] = useState<TherapistProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [alreadyConnected, setAlreadyConnected] = useState(false);

  useEffect(() => {
    // If no code, redirect to home
    if (!code) {
      navigate("/");
      return;
    }

    // If not logged in, store code and redirect to auth
    if (!authLoading && !user) {
      localStorage.setItem("pending_connection_code", code);
      toast({
        title: "Please sign in first",
        description: "Login or create an account to connect with a therapist.",
      });
      navigate("/auth");
      return;
    }

    // If user is a therapist, show error
    if (!roleLoading && role === "therapist") {
      setError("Only parents can connect with therapists.");
      setLoading(false);
      return;
    }

    // Fetch therapist data
    if (user && !roleLoading) {
      fetchTherapist();
    }
  }, [code, user, authLoading, role, roleLoading, navigate]);

  const fetchTherapist = async () => {
    if (!code) return;

    try {
      // 1. First validate the invite code via RPC (or check invitations table directly if allowed)
      // Since we have strict policies, we should ideally use a function, but let's try reading the invitation
      // If we can't read it (RLS), then the code is invalid or we are not allowed.
      // BUT: The plan says "Parents can ONLY find an invite by exact code match".

      const { data: inviteData, error: inviteError } = await (supabase as any)
        .from('invitations')
        .select(`
            *,
            therapist:profiles!therapist_id (
                user_id,
                full_name,
                avatar_url,
                clinic_name,
                clinic_address
            )
         `)
        .eq('code', code)
        .eq('status', 'active')
        .gt('expires_at', new Date().toISOString())
        .maybeSingle();

      if (inviteError || !inviteData) {
        console.error("Invite fetch error:", inviteError);
        setError("Mã mời không hợp lệ hoặc đã hết hạn.");
        setLoading(false);
        return;
      }

      const therapistData = inviteData.therapist;

      // 2. Check if already connected
      const { data: existingConnection } = await supabase
        .from("connections")
        .select("id, status")
        .eq("parent_id", user!.id)
        .eq("therapist_id", therapistData.user_id)
        .maybeSingle();

      if (existingConnection) {
        if (existingConnection.status === "accepted") {
          setAlreadyConnected(true);
        } else if (existingConnection.status === "pending") {
          // It's fine, we can allow re-connecting or just show them.
          // For this flow, let's treat it as "Already Connected" but maybe show a different message?
          // Simplicity: Show already connected details.
          setAlreadyConnected(true);
        }
      }

      setTherapist(therapistData);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching therapist:", err);
      setError("Không thể tải thông tin chuyên gia. Vui lòng thử lại.");
      setLoading(false);
    }
  };

  const handleConnect = async () => {
    if (!user || !therapist || !code) return;

    setConnecting(true);
    try {
      // Use the secure RPC to connect via invite
      const { data, error } = await (supabase as any)
        .rpc('connect_via_invite', { code_input: code });

      if (error) throw error;

      const result = data as any;

      if (!result.success) {
        throw new Error(result.message);
      }

      toast({
        title: "Kết nối thành công!",
        description: `Bạn đã kết nối với chuyên gia ${therapist.full_name}.`,
      });

      // Redirect to parent dashboard
      navigate("/parent/home");
    } catch (err: any) {
      console.error("Error connecting:", err);
      toast({
        variant: "destructive",
        title: "Lỗi kết nối",
        description: err.message || "Đã có lỗi xảy ra. Vui lòng thử lại.",
      });
    }
    setConnecting(false);
  };

  const handleCancel = () => {
    navigate("/parent/home");
  };

  // Loading state
  if (authLoading || roleLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-6">
        <Card className="w-full max-w-md">
          <CardContent className="pt-8 pb-8">
            <div className="flex flex-col items-center gap-4">
              <Skeleton className="h-20 w-20 rounded-full" />
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-32" />
              <div className="flex gap-3 w-full mt-4">
                <Skeleton className="h-12 flex-1" />
                <Skeleton className="h-12 flex-1" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-6">
        <Card className="w-full max-w-md">
          <CardContent className="pt-8 pb-8">
            <div className="flex flex-col items-center text-center gap-4">
              <div className="h-16 w-16 rounded-full bg-destructive/10 flex items-center justify-center">
                <AlertCircle className="h-8 w-8 text-destructive" />
              </div>
              <h2 className="text-xl font-bold">Connection Error</h2>
              <p className="text-muted-foreground">{error}</p>
              <Button onClick={() => navigate("/parent/home")} className="mt-4">
                Go to Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Already connected state
  if (alreadyConnected && therapist) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-6">
        <Card className="w-full max-w-md">
          <CardContent className="pt-8 pb-8">
            <div className="flex flex-col items-center text-center gap-4">
              <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle2 className="h-8 w-8 text-green-600" />
              </div>
              <h2 className="text-xl font-bold">Already Connected!</h2>
              <p className="text-muted-foreground">
                You are already connected with {therapist.full_name || "this therapist"}.
              </p>
              <Button onClick={() => navigate("/parent/home")} className="mt-4">
                Go to Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Confirm connection dialog
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <img src={logo} alt="An." className="h-14 w-14 rounded-2xl object-cover shadow-lg" />
        </div>

        <Card className="glass-card border border-border/50 overflow-hidden">
          {/* Gradient Header */}
          <div className="h-24 bg-gradient-to-r from-primary/20 via-primary/10 to-secondary/20" />

          <CardContent className="relative pt-0 pb-8 px-6">
            {/* Avatar */}
            <div className="flex justify-center -mt-12 mb-4">
              <div className="h-24 w-24 rounded-full bg-primary/10 border-4 border-card shadow-lg flex items-center justify-center">
                {therapist?.avatar_url ? (
                  <img
                    src={therapist.avatar_url}
                    alt={therapist.full_name || "Therapist"}
                    className="h-full w-full rounded-full object-cover"
                  />
                ) : (
                  <span className="text-3xl font-bold text-primary">
                    {therapist?.full_name?.[0]?.toUpperCase() || "T"}
                  </span>
                )}
              </div>
            </div>

            {/* Therapist Info */}
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold">
                {therapist?.full_name || "Therapist"}
              </h2>
              {therapist?.clinic_name && (
                <p className="text-muted-foreground mt-1">
                  {therapist.clinic_name}
                </p>
              )}
              {therapist?.clinic_address && (
                <p className="text-sm text-muted-foreground mt-1">
                  📍 {therapist.clinic_address}
                </p>
              )}
            </div>

            {/* Confirmation Message */}
            <div className="bg-muted/50 rounded-xl p-4 mb-6 text-center">
              <p className="text-sm text-foreground">
                Do you want to connect with this therapist?
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                They will be notified and can accept your request.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={handleCancel}
                className="flex-1 h-12 rounded-xl gap-2"
                disabled={connecting}
              >
                <X className="h-4 w-4" />
                Cancel
              </Button>
              <Button
                onClick={handleConnect}
                className="flex-1 h-12 rounded-xl gap-2"
                disabled={connecting}
              >
                {connecting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  <>
                    <UserCheck className="h-4 w-4" />
                    Connect
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
