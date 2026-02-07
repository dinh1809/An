import { NavLink as RouterNavLink, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import logo from "@/assets/logo.jfif";

const navItems = [
  { icon: "dashboard", label: "Dashboard", path: "/therapist/dashboard" },
  { icon: "people", label: "Patients", path: "/therapist/patients" },
  { icon: "bar_chart", label: "Analytics", path: "/therapist/analytics" },
  { icon: "video_library", label: "Video Review", path: "/therapist/video-review" },
  { icon: "calendar_month", label: "Schedule", path: "/therapist/schedule", badge: 2 },
  { icon: "person", label: "Profile", path: "/therapist/profile" },
];

export function TherapistSidebar() {
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth");
  };

  return (
    <aside className="hidden md:flex fixed left-0 top-0 h-full w-64 flex-col bg-card border-r border-border z-50 transition-colors duration-300">
      {/* Logo */}
      <div className="p-6 flex items-center gap-3">
        <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center text-primary font-bold text-xl shadow-lg shadow-primary/10">
          <span className="material-icons-round text-lg">spa</span>
        </div>
        <div>
          <h1 className="text-sm font-bold leading-tight">An. Portal</h1>
          <p className="text-xs text-muted-foreground">Specialist Workspace</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 mt-4 space-y-2 overflow-y-auto">
        {navItems.map((item) => (
          <RouterNavLink
            key={item.path}
            to={item.path}
            className={`relative flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${isActive(item.path)
                ? "sidebar-item-active"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
          >
            <span className="material-icons-round text-[20px]">{item.icon}</span>
            <span className="text-sm font-medium flex-1">{item.label}</span>
            {item.badge && (
              <span className="ml-auto bg-destructive/10 text-destructive text-[10px] font-bold px-2 py-0.5 rounded-full">
                {item.badge}
              </span>
            )}
          </RouterNavLink>
        ))}
      </nav>

      {/* Sign Out */}
      <div className="p-4 border-t border-border">
        <Button
          variant="ghost"
          className="w-full justify-center gap-2 px-4 py-2.5 rounded-xl border border-border text-sm font-medium hover:bg-destructive/5 hover:text-destructive hover:border-destructive/20 transition-colors text-muted-foreground"
          onClick={handleSignOut}
        >
          <span className="material-icons-round text-sm">logout</span>
          Sign Out
        </Button>
      </div>
    </aside>
  );
}

// Top header component for the therapist layout
export function TherapistHeader() {
  return (
    <header className="hidden md:flex items-center justify-between mb-8">
      <div>
        <p className="text-sm text-muted-foreground font-medium">Therapist Workspace</p>
      </div>
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" className="rounded-xl h-10 w-10 hover:bg-muted">
          <span className="material-icons-round text-muted-foreground">light_mode</span>
        </Button>
        <Button variant="ghost" size="icon" className="rounded-xl h-10 w-10 relative hover:bg-muted">
          <span className="material-icons-round text-muted-foreground">notifications</span>
        </Button>
        <div className="flex items-center gap-3 bg-muted/50 rounded-xl px-3 py-2 ml-2">
          <div className="h-9 w-9 rounded-full bg-primary/20 flex items-center justify-center">
            <span className="text-sm font-bold text-primary">DP</span>
          </div>
          <div className="text-right">
            <p className="text-sm font-semibold">Dinh Pham</p>
            <p className="text-xs text-muted-foreground">Specialist</p>
          </div>
        </div>
      </div>
    </header>
  );
}