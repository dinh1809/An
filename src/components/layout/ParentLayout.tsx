import { ReactNode } from "react";
import { Outlet } from "react-router-dom";
import { BottomNav } from "./BottomNav";
import { DesktopSidebar } from "./DesktopSidebar";

interface ParentLayoutProps {
  children?: ReactNode;
}

export function ParentLayout({ children }: ParentLayoutProps) {
  return (
    <div className="min-h-screen flex w-full bg-background">
      {/* Desktop Sidebar - Parent specific */}
      <DesktopSidebar />
      
      {/* Main Content */}
      <main className="flex-1 pb-20 md:pb-0 md:ml-64">
        <div className="max-w-4xl mx-auto p-4 md:p-6">
          {children || <Outlet />}
        </div>
      </main>
      
      {/* Mobile Bottom Navigation - Parent specific */}
      <BottomNav />
    </div>
  );
}
