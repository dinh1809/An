import { NavLink, useNavigate } from "react-router-dom";
import { LayoutDashboard, Users, Calendar, BarChart3, User, LogOut } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const navItems = [
  { icon: LayoutDashboard, label: "Home", path: "/therapist/dashboard" },
  { icon: Users, label: "Patients", path: "/therapist/patients" },
  { icon: Calendar, label: "Schedule", path: "/therapist/schedule" },
  { icon: BarChart3, label: "Analytics", path: "/therapist/analytics" },
  { icon: User, label: "Profile", path: "/therapist/profile" },
];

export function TherapistBottomNav() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: "Đăng xuất thành công",
      });
      navigate("/auth");
    } catch (error) {
      console.error("Logout error:", error);
      navigate("/auth");
    }
  };

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50">
      <div className="flex justify-around items-center h-16 px-1">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center gap-1 px-2 py-2 rounded-xl transition-all ${isActive
                ? "text-accent"
                : "text-muted-foreground"
              }`
            }
          >
            <item.icon className="h-5 w-5" />
            <span className="text-[10px] font-medium">{item.label}</span>
          </NavLink>
        ))}
        <button
          onClick={handleLogout}
          className="flex flex-col items-center justify-center gap-1 px-2 py-2 text-muted-foreground hover:text-red-500 transition-all"
        >
          <LogOut className="h-5 w-5" />
          <span className="text-[10px] font-medium">Đăng xuất</span>
        </button>
      </div>
    </nav>
  );
}
