import { Home, Activity, BarChart3, User, MapPin } from "lucide-react";
import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";

const navItems = [
  { to: "/parent/dashboard", icon: Home, label: "Trang chủ" },
  { to: "/parent/map", icon: MapPin, label: "Chuyên gia" },
  { to: "/parent/analyze", icon: BarChart3, label: "Phân tích" },
  { to: "/parent/profile", icon: User, label: "Cá nhân" },
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
                  ? "text-[#00695C] dark:text-[#13ecda]"
                  : "text-gray-500 dark:text-gray-400 hover:text-[#00695C] dark:hover:text-[#13ecda]"
              )
            }
          >
            {({ isActive }) => (
              <>
                <item.icon className={cn(
                  "h-5 w-5",
                  isActive && "stroke-[2.5px]"
                )} />
                <span className="text-xs font-medium">{item.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}