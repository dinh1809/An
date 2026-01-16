import { ReactNode } from "react";
import { Outlet } from "react-router-dom";
import { TherapistSidebar } from "./TherapistSidebar";
import { TherapistBottomNav } from "./TherapistBottomNav";

interface TherapistLayoutProps {
  children?: ReactNode;
}

export function TherapistLayout({ children }: TherapistLayoutProps) {
  return (
    <div className="min-h-screen flex w-full bg-muted/30">
      {/* Therapist Sidebar - NO Parent components here */}
      <TherapistSidebar />
      
      {/* Main Content */}
      <main className="flex-1 pb-20 md:pb-0 md:ml-64">
        <div className="max-w-6xl mx-auto p-4 md:p-6">
          {/* Header for visual confirmation */}
          <div className="hidden md:block mb-4">
            <h1 className="text-sm font-medium text-muted-foreground">Therapist Workspace</h1>
          </div>
          {children || <Outlet />}
        </div>
      </main>
      
      {/* Mobile Bottom Navigation - Therapist specific */}
      <TherapistBottomNav />
    </div>
  );
}
