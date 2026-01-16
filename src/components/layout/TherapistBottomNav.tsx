import { NavLink } from "react-router-dom";
import { LayoutDashboard, Users, Calendar, BarChart3, User } from "lucide-react";

const navItems = [
  { icon: LayoutDashboard, label: "Home", path: "/therapist/dashboard" },
  { icon: Users, label: "Patients", path: "/therapist/patients" },
  { icon: Calendar, label: "Schedule", path: "/therapist/schedule" },
  { icon: BarChart3, label: "Analytics", path: "/therapist/analytics" },
  { icon: User, label: "Profile", path: "/therapist/profile" },
];

export function TherapistBottomNav() {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50">
      <div className="flex justify-around items-center h-16 px-2">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-xl transition-all ${
                isActive
                  ? "text-accent"
                  : "text-muted-foreground"
              }`
            }
          >
            <item.icon className="h-5 w-5" />
            <span className="text-xs font-medium">{item.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
