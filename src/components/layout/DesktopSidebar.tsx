import { Home, Activity, BarChart3, User, LogOut, MapPin, Shuffle, Briefcase, LayoutDashboard, Wallet } from "lucide-react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import logo from "@/assets/logo.jfif";
import { ThemeToggle } from "@/components/ThemeToggle";

export function DesktopSidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  const isParentJourney = location.pathname.startsWith("/parent");
  const isWorkerJourney = location.pathname.startsWith("/assessment") || location.pathname.startsWith("/workspace");

  const parentNavItems = [
    { to: "/parent/dashboard", icon: LayoutDashboard, label: "Trang chủ" },
    { to: "/parent/track", icon: Activity, label: "Theo dõi" },
    { to: "/parent/map", icon: MapPin, label: "Tìm chuyên gia" },
    { to: "/parent/analyze", icon: BarChart3, label: "Phân tích" },
    { to: "/parent/profile", icon: User, label: "Cá nhân" },
  ];

  const workerNavItems = [
    { to: "/assessment", icon: LayoutDashboard, label: "Career Hub" },
    { to: "/workspace/task", icon: Briefcase, label: "My Workspace" },
    { to: "/workspace/earnings", icon: Wallet, label: "Earnings" },
    { to: "/parent/profile", icon: User, label: "Profile" },
  ];

  const currentNavItems = isParentJourney ? parentNavItems : isWorkerJourney ? workerNavItems : [];

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  const handleSwitchMode = () => {
    navigate("/select-mode");
  };

  return (
    <aside className="hidden md:flex fixed left-0 top-0 h-full w-64 flex-col bg-white border-r border-slate-200">
      {/* Logo */}
      <div className="p-6 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <img src={logo} alt="An. Logo" className="h-10 w-10 rounded-lg object-cover" />
          <div>
            <h1 className="text-xl font-bold text-[#00695C]">An.</h1>
            <p className="text-xs text-slate-500">Healthcare Platform</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {currentNavItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === "/parent/home" || item.to === "/assessment"}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200",
                isActive
                  ? "bg-[#E0F2F1] text-[#00695C] shadow-sm"
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
              )
            }
          >
            <item.icon className="h-5 w-5" />
            <span className="font-medium">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Switch Mode & Logout */}
      <div className="p-4 border-t border-border space-y-2">
        <Button
          variant="outline"
          className="w-full justify-start gap-3 text-primary border-primary/20 hover:bg-primary/5 hover:text-primary dark:text-primary-foreground dark:border-primary/40 dark:hover:bg-primary/20"
          onClick={handleSwitchMode}
        >
          <Shuffle className="h-5 w-5" />
          <span>Đổi chế độ</span>
        </Button>
        <ThemeToggle variant="outline" size="default" className="w-full justify-start" />
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 text-muted-foreground hover:text-destructive"
          onClick={handleLogout}
        >
          <LogOut className="h-5 w-5" />
          <span>Logout</span>
        </Button>
      </div>
    </aside>
  );
}
