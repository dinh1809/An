import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole, AppRole } from "@/hooks/useUserRole";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff, Loader2, Users, Stethoscope, CheckCircle } from "lucide-react";
import logo from "@/assets/logo.jfif";

export default function Auth() {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { user, signIn, signUp } = useAuth();
  const { role, loading: roleLoading } = useUserRole();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Login form state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Signup form state
  const [signupName, setSignupName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [selectedRole, setSelectedRole] = useState<AppRole | null>(null);

  useEffect(() => {
    if (user && !roleLoading && role) {
      // Check for pending connection code
      const pendingCode = localStorage.getItem("pending_connection_code");
      if (pendingCode) {
        localStorage.removeItem("pending_connection_code");
        navigate(`/connect?code=${pendingCode}`, { replace: true });
        return;
      }
      
      if (role === "therapist") {
        navigate("/therapist/dashboard", { replace: true });
      } else if (role === "parent") {
        navigate("/select-mode", { replace: true });
      }
    }
  }, [user, role, roleLoading, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const { error } = await signIn(loginEmail, loginPassword);

    if (error) {
      toast({
        variant: "destructive",
        title: "Login failed",
        description: error.message === "Invalid login credentials" 
          ? "Invalid email or password. Please try again."
          : error.message,
      });
      setIsLoading(false);
    } else {
      toast({
        title: "Welcome back!",
        description: "You have been logged in successfully.",
      });
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (!selectedRole) {
      toast({
        variant: "destructive",
        title: "Please select a role",
        description: "Choose whether you are a Parent or Specialist.",
      });
      setIsLoading(false);
      return;
    }

    if (signupPassword.length < 6) {
      toast({
        variant: "destructive",
        title: "Password too short",
        description: "Password must be at least 6 characters long.",
      });
      setIsLoading(false);
      return;
    }

    // Pass role in signup - trigger will handle role assignment
    const { error } = await signUp(signupEmail, signupPassword, signupName, selectedRole);

    if (error) {
      if (error.message.includes("already registered")) {
        toast({
          variant: "destructive",
          title: "Account exists",
          description: "This email is already registered. Please login instead.",
        });
      } else {
        toast({
          variant: "destructive",
          title: "Signup failed",
          description: error.message,
        });
      }
      setIsLoading(false);
      return;
    }

    toast({
      title: "Account created!",
      description: `Welcome to An. as a ${selectedRole}.`,
    });

    // Role is set by database trigger - navigate based on selected role
    if (selectedRole === "therapist") {
      navigate("/therapist/dashboard");
    } else {
      navigate("/parent/home");
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 auth-gradient relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.05%22%3E%3Cpath%20d%3D%22M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22%2F%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E')] opacity-50" />
        
        <div className="relative z-10 flex flex-col justify-center px-12 xl:px-20 text-primary-foreground">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-12">
            <img src={logo} alt="An. Logo" className="h-14 w-14 rounded-2xl object-cover shadow-lg" />
            <span className="text-3xl font-bold">An.</span>
          </div>
          
          {/* Headline */}
          <h1 className="text-4xl xl:text-5xl font-bold leading-tight mb-6">
            Start your<br />journey with us.
          </h1>
          
          <p className="text-lg xl:text-xl opacity-90 mb-10 max-w-md">
            Supporting families on the autism journey with professional care and community.
          </p>
          
          {/* Trust badge */}
          <div className="flex items-center gap-3 bg-primary-foreground/10 backdrop-blur-sm rounded-2xl px-5 py-4 w-fit">
            <div className="flex -space-x-3">
              <div className="h-10 w-10 rounded-full bg-primary-foreground/20 border-2 border-primary-foreground/30 flex items-center justify-center">
                <Users className="h-5 w-5" />
              </div>
              <div className="h-10 w-10 rounded-full bg-primary-foreground/20 border-2 border-primary-foreground/30 flex items-center justify-center">
                <CheckCircle className="h-5 w-5" />
              </div>
            </div>
            <span className="font-medium">Trusted by 2,000+ families</span>
          </div>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 bg-background">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <img src={logo} alt="An. Logo" className="h-12 w-12 rounded-xl object-cover shadow-soft" />
            <div>
              <h1 className="text-2xl font-bold text-gradient">An.</h1>
              <p className="text-sm text-muted-foreground">Specialist Portal</p>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-foreground">Welcome back</h2>
            <p className="text-muted-foreground mt-1">Please enter your details to sign in.</p>
          </div>

          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8 p-1 bg-muted rounded-xl h-12">
              <TabsTrigger value="login" className="rounded-lg text-sm font-medium data-[state=active]:bg-card data-[state=active]:shadow-sm">
                Login
              </TabsTrigger>
              <TabsTrigger value="signup" className="rounded-lg text-sm font-medium data-[state=active]:bg-card data-[state=active]:shadow-sm">
                Sign Up
              </TabsTrigger>
            </TabsList>

            <TabsContent value="login" className="mt-0">
              <form onSubmit={handleLogin} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="login-email" className="text-sm font-medium">Email Address</Label>
                  <Input
                    id="login-email"
                    type="email"
                    placeholder="your@email.com"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    required
                    className="h-12 rounded-xl bg-muted/50 border-border/50 focus:bg-card"
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="login-password" className="text-sm font-medium">Password</Label>
                    <button type="button" className="text-sm text-primary hover:underline">
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <Input
                      id="login-password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      required
                      className="h-12 rounded-xl bg-muted/50 border-border/50 focus:bg-card pr-12"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-full px-4 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      )}
                    </Button>
                  </div>
                </div>
                <Button type="submit" className="w-full h-12 rounded-xl text-base font-semibold" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Logging in...
                    </>
                  ) : (
                    "Login"
                  )}
                </Button>
              </form>

              <div className="mt-6 text-center">
                <span className="text-muted-foreground text-sm">
                  Don't have an account?{" "}
                  <button 
                    onClick={() => document.querySelector<HTMLButtonElement>('[data-state="inactive"][value="signup"]')?.click()}
                    className="text-primary font-medium hover:underline"
                  >
                    Create free account
                  </button>
                </span>
              </div>
            </TabsContent>

            <TabsContent value="signup" className="mt-0">
              <form onSubmit={handleSignup} className="space-y-5">
                {/* Role Selection */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium">I am a...</Label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setSelectedRole("parent")}
                      className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-3 ${
                        selectedRole === "parent"
                          ? "border-primary bg-primary/5 shadow-soft"
                          : "border-border bg-muted/30 hover:border-primary/50 hover:bg-muted/50"
                      }`}
                    >
                      <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${
                        selectedRole === "parent" ? "bg-primary text-primary-foreground" : "bg-muted"
                      }`}>
                        <Users className="h-6 w-6" />
                      </div>
                      <span className="font-semibold text-sm">Parent</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedRole("therapist")}
                      className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-3 ${
                        selectedRole === "therapist"
                          ? "border-secondary bg-secondary/5 shadow-soft"
                          : "border-border bg-muted/30 hover:border-secondary/50 hover:bg-muted/50"
                      }`}
                    >
                      <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${
                        selectedRole === "therapist" ? "bg-secondary text-secondary-foreground" : "bg-muted"
                      }`}>
                        <Stethoscope className="h-6 w-6" />
                      </div>
                      <span className="font-semibold text-sm">Specialist</span>
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signup-name" className="text-sm font-medium">Full Name</Label>
                  <Input
                    id="signup-name"
                    type="text"
                    placeholder="Your full name"
                    value={signupName}
                    onChange={(e) => setSignupName(e.target.value)}
                    required
                    className="h-12 rounded-xl bg-muted/50 border-border/50 focus:bg-card"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-email" className="text-sm font-medium">Email Address</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="your@email.com"
                    value={signupEmail}
                    onChange={(e) => setSignupEmail(e.target.value)}
                    required
                    className="h-12 rounded-xl bg-muted/50 border-border/50 focus:bg-card"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password" className="text-sm font-medium">Password</Label>
                  <div className="relative">
                    <Input
                      id="signup-password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={signupPassword}
                      onChange={(e) => setSignupPassword(e.target.value)}
                      required
                      minLength={6}
                      className="h-12 rounded-xl bg-muted/50 border-border/50 focus:bg-card pr-12"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-full px-4 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      )}
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Password must be at least 6 characters
                  </p>
                </div>
                <Button type="submit" className="w-full h-12 rounded-xl text-base font-semibold" disabled={isLoading || !selectedRole}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating account...
                    </>
                  ) : (
                    "Create Account"
                  )}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
