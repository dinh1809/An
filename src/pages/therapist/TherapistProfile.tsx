import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { TherapistLocationPicker } from "@/components/therapist/TherapistLocationPicker";
import { TherapistConnectionCard } from "@/components/therapist/TherapistConnectionCard";
import { TherapistLayout } from "@/components/layout/TherapistLayout";
import { InviteCodeCard } from "@/components/therapist/InviteCodeCard";

interface Profile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  therapist_code: string | null;
  phone: string | null;
}

export default function TherapistProfile() {
  const { user, loading: authLoading, signOut } = useAuth();
  const { role, loading: roleLoading } = useUserRole();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [fullName, setFullName] = useState("");
  const [title, setTitle] = useState("Autism Support Specialist");
  const [phone, setPhone] = useState("");
  const [therapistCode, setTherapistCode] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
      return;
    }
    if (!roleLoading && role !== "therapist") {
      navigate("/parent/hub");
      return;
    }
    if (user) {
      fetchProfile();
    }
  }, [user, authLoading, role, roleLoading, navigate]);

  const fetchProfile = async () => {
    if (!user) return;

    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    if (data) {
      setProfile(data);
      setFullName(data.full_name || "");
      setPhone(data.phone || "");
      setTherapistCode(data.therapist_code);
    }
    setLoading(false);
  };

  const handleSave = async () => {
    if (!user) return;

    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: fullName,
        phone: phone || null,
        therapist_code: therapistCode
      })
      .eq("user_id", user.id);

    if (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update profile.",
      });
    } else {
      toast({
        title: "Profile updated",
        description: "Your changes have been saved.",
      });
    }
    setSaving(false);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth");
  };

  const initials = fullName
    ? fullName.split(" ").map((n) => n[0]).join("").toUpperCase()
    : user?.email?.[0].toUpperCase() || "S";

  if (authLoading || roleLoading || loading) {
    return (
      <div className="max-w-5xl mx-auto space-y-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-80 rounded-3xl" />
      </div>
    );
  }

  return (
    <TherapistLayout>
      <div className="max-w-5xl mx-auto relative">
        {/* Background gradient */}
        <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-r from-primary/5 via-transparent to-primary/5 opacity-60 pointer-events-none rounded-3xl" />

        <div className="relative z-10 py-10 px-6 space-y-8">
          {/* Header */}
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">Therapist Workspace</p>
            <h2 className="text-3xl font-bold tracking-tight">My Profile Settings</h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Avatar Card */}
            <div className="space-y-6">
              <Card className="glass-card border border-border/50 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-b from-primary/10 to-transparent" />
                <CardContent className="pt-8 pb-6 flex flex-col items-center text-center relative">
                  <div className="relative mt-4 mb-4">
                    <div className="w-32 h-32 rounded-full bg-primary/10 flex items-center justify-center text-3xl font-bold text-primary border-4 border-card shadow-lg">
                      {initials}
                    </div>
                    <button className="absolute bottom-1 right-1 bg-card p-2 rounded-full shadow-md text-muted-foreground hover:text-primary transition-colors border border-border">
                      <span className="material-icons-round text-lg leading-none">photo_camera</span>
                    </button>
                  </div>
                  <h3 className="text-xl font-bold">{fullName || "Specialist"}</h3>
                  <div className="mt-2 inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold uppercase tracking-wider border border-primary/20">
                    <span className="material-icons-round text-sm mr-1">medical_services</span> Specialist
                  </div>
                </CardContent>
              </Card>

              {/* Profile Strength Card */}
              <Card className="gradient-teal rounded-2xl shadow-lg text-white overflow-hidden">
                <CardContent className="pt-6 pb-6 relative">
                  <h4 className="font-semibold text-lg mb-4">Profile Strength</h4>
                  <div className="flex items-center gap-4 mb-2">
                    <div className="flex-1 h-2 bg-white/20 rounded-full overflow-hidden">
                      <div className="h-full bg-white w-3/4 rounded-full" />
                    </div>
                    <span className="font-bold">75%</span>
                  </div>
                  <p className="text-sm text-white/80">Complete your bio to reach 100% visibility.</p>
                </CardContent>
              </Card>

              {/* Connection Card - Moved here for better visibility */}
              <TherapistConnectionCard
                therapistCode={therapistCode}
                therapistName={fullName}
              />
            </div>

            {/* Right Column - Form */}
            <div className="lg:col-span-2 space-y-8">
              {/* Quick Invite Code Generator / Display */}
              <InviteCodeCard
                onCodeGenerated={(newCode) => setTherapistCode(newCode)}
              />

              <Card className="glass-card border border-border/50">
                <CardContent className="p-8 space-y-8">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold">Personal Information</h3>
                  </div>

                  <form className="space-y-6">
                    <div>
                      <Label className="text-sm font-semibold text-muted-foreground mb-2 flex items-center gap-2">
                        <span className="material-icons-round text-muted-foreground text-lg">badge</span> Full Name
                      </Label>
                      <Input
                        className="px-4 py-3 h-auto bg-card border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all shadow-sm"
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Your full name"
                      />
                    </div>
                    <div>
                      <Label className="text-sm font-semibold text-muted-foreground mb-2 flex items-center gap-2">
                        <span className="material-icons-round text-muted-foreground text-lg">school</span> Title
                      </Label>
                      <Input
                        className="px-4 py-3 h-auto bg-card border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all shadow-sm"
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label className="text-sm font-semibold text-muted-foreground mb-2 flex items-center gap-2">
                        <span className="material-icons-round text-muted-foreground text-lg">phone</span> Phone Number
                      </Label>
                      <Input
                        className="px-4 py-3 h-auto bg-card border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all shadow-sm"
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="Your phone number (optional)"
                      />
                      <p className="text-xs text-muted-foreground mt-1">Parents can search for you by phone number</p>
                    </div>
                    <div>
                      <Label className="text-sm font-semibold text-muted-foreground mb-2 flex items-center gap-2">
                        <span className="material-icons-round text-muted-foreground text-lg">email</span> Email
                      </Label>
                      <Input
                        className="px-4 py-3 h-auto bg-muted border border-border rounded-xl"
                        type="email"
                        value={user?.email || ""}
                        disabled
                      />
                    </div>

                    <div className="flex gap-4 pt-4">
                      <Button
                        type="button"
                        onClick={handleSave}
                        disabled={saving}
                        className="flex-1 h-12 rounded-xl gap-2 shadow-lg shadow-primary/30"
                      >
                        {saving ? (
                          <span className="material-icons-round animate-spin text-lg">refresh</span>
                        ) : (
                          <span className="material-icons-round text-lg">save</span>
                        )}
                        {saving ? "Saving..." : "Save Changes"}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleSignOut}
                        className="h-12 rounded-xl gap-2 text-destructive hover:text-destructive hover:bg-destructive/5 border-destructive/20"
                      >
                        <span className="material-icons-round text-lg">logout</span>
                        Sign Out
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>

              {/* Location Picker */}
              <TherapistLocationPicker />
            </div>
          </div>
        </div>
      </div>
    </TherapistLayout>
  );
}