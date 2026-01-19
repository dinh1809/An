import { Home, Activity, BarChart3, User, Shuffle, Briefcase } from "lucide-react";
import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";

const navItems = [
  { to: "/parent/home", icon: Home, label: "Home" },
  { to: "/parent/track", icon: Activity, label: "Track" },
  { to: "/opportunities", icon: Briefcase, label: "Jobs" },
  { to: "/select-mode", icon: Shuffle, label: "Mode" },
  { to: "/parent/analyze", icon: BarChart3, label: "Analyze" },
  { to: "/parent/profile", icon: User, label: "Profile" },
];

export function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-card border-t border-border safe-area-bottom">
      <div className="flex items-center justify-around h-16">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              cn(
                "flex flex-col items-center justify-center gap-1 w-full h-full transition-colors",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground",
                item.to === "/select-mode" && "text-violet-500 hover:text-violet-600"
              )
            }
          >
            {({ isActive }) => (
              <>
                <item.icon className={cn(
                  "h-5 w-5",
                  isActive && "stroke-[2.5px]",
                  item.to === "/select-mode" && "text-violet-500"
                )} />
                <span className={cn(
                  "text-xs font-medium",
                  item.to === "/select-mode" && "text-violet-500"
                )}>{item.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}