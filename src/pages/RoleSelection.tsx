import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useUserRole, AppRole } from "@/hooks/useUserRole";
import { Users, Stethoscope } from "lucide-react";
import logo from "@/assets/logo.jfif";

export default function RoleSelection() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { updateRole } = useUserRole();
  const [loading, setLoading] = useState(false);

  const handleSelectRole = async (role: AppRole) => {
    setLoading(true);
    const { error } = await updateRole(role);

    if (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to set role. Please try again.",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    toast({
      title: "Welcome!",
      description: `You're now registered as a ${role}.`,
    });

    navigate(role === "therapist" ? "/therapist/dashboard" : "/select-mode");
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background via-background to-primary/5">
      <div className="w-full max-w-md space-y-6">
        {/* Logo */}
        <div className="text-center">
          <img
            src={logo}
            alt="An. Logo"
            className="h-16 w-16 rounded-2xl mx-auto mb-4"
          />
          <h1 className="text-3xl font-bold text-gradient">Welcome to An.</h1>
          <p className="text-muted-foreground mt-2">
            Please select your role to continue
          </p>
        </div>

        {/* Role Cards */}
        <div className="grid gap-4">
          <Card
            className="glass-card cursor-pointer hover:ring-2 hover:ring-primary transition-all"
            onClick={() => !loading && handleSelectRole("parent")}
          >
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">I'm a Parent</h3>
                  <p className="text-sm text-muted-foreground">
                    Track your child's progress and connect with therapists
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card
            className="glass-card cursor-pointer hover:ring-2 hover:ring-primary transition-all"
            onClick={() => !loading && handleSelectRole("therapist")}
          >
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-accent/50 flex items-center justify-center">
                  <Stethoscope className="h-6 w-6 text-accent-foreground" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">I'm a Therapist</h3>
                  <p className="text-sm text-muted-foreground">
                    Monitor assigned children and view their analytics
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {loading && (
          <p className="text-center text-muted-foreground animate-pulse">
            Setting up your account...
          </p>
        )}
      </div>
    </div>
  );
}
