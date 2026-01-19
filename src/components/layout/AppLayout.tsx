import { ReactNode, useEffect } from "react";
import { BottomNav } from "./BottomNav";
import { DesktopSidebar } from "./DesktopSidebar";
import RAPIDOverlay from "@/components/safety/RAPIDOverlay";
import { toast } from "sonner";

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  // Digital Job Coach: Work Session Timer
  useEffect(() => {
    const SESSION_LIMIT = 45 * 60 * 1000; // 45 minutes

    const timer = setTimeout(() => {
      toast.warning("Time for a Soft Break", {
        description: "You've been working for 45 minutes. Take a sip of water or stretch.",
        duration: 10000,
        action: {
          label: "I'm good",
          onClick: () => console.log("Break dismissed"),
        },
      });
    }, SESSION_LIMIT);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen flex w-full bg-slate-50">
      {/* Safety Layer */}
      <RAPIDOverlay />

      {/* Desktop Sidebar */}
      <DesktopSidebar />

      {/* Main Content */}
      <main className="flex-1 pb-20 md:pb-0 md:ml-64">
        <div className="max-w-4xl mx-auto p-4 md:p-6">
          {children}
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <BottomNav />
    </div>
  );
}
