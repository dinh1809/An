/**
 * Parent Layout Component
 * Uses Top Navbar for full-width content display
 * Mobile: Bottom nav for easy thumb access
 * Desktop: Top navbar for maximum content space
 */

import { ReactNode } from "react";
import { Outlet } from "react-router-dom";
import { BottomNav } from "./BottomNav";
import { TopNavbar } from "./TopNavbar";

interface ParentLayoutProps {
  children?: ReactNode;
}

export function ParentLayout({ children }: ParentLayoutProps) {
  return (
    <div className="min-h-screen w-full bg-[#F8FAFB] dark:bg-[#0d1b1a]">
      {/* Top Navigation Bar - Desktop */}
      <div className="hidden md:block">
        <TopNavbar />
      </div>

      {/* Main Content - Full Width */}
      <main className="pt-0 md:pt-16 pb-20 md:pb-8">
        <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {children || <Outlet />}
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <BottomNav />
    </div>
  );
}
