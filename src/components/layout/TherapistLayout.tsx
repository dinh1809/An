import { ReactNode } from "react";
import { Outlet } from "react-router-dom";
import { TopNavbar } from "./TopNavbar";
import {
  LayoutDashboard,
  Users,
  Video,
  FileText,
  Settings
} from "lucide-react";

const therapistNavItems = [
  { to: '/therapist/dashboard', icon: LayoutDashboard, label: 'Tổng quan' },
  { to: '/therapist/patients', icon: Users, label: 'Bệnh nhân' },
  { to: '/therapist/review', icon: Video, label: 'Video Review' },
  { to: '/therapist/reports', icon: FileText, label: 'Báo cáo' },
  { to: '/therapist/settings', icon: Settings, label: 'Cấu hình' },
];

interface TherapistLayoutProps {
  children?: ReactNode;
}

export function TherapistLayout({ children }: TherapistLayoutProps) {
  return (
    <div className="min-h-screen bg-[#F5F7FA]">
      {/* Top Navigation - Passing custom items */}
      <TopNavbar
        // @ts-ignore - Custom items for therapist role
        customItems={therapistNavItems}
      />

      <main className="max-w-[1600px] mx-auto p-6 md:p-8 animate-in fade-in duration-500 pt-20">
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Khu vực Chuyên gia</h1>
            <p className="text-slate-500 text-sm font-medium">Quản lý lâm sàng & Can thiệp sớm</p>
          </div>
          <div className="text-sm text-slate-400 font-mono bg-white px-3 py-1 rounded-full border border-slate-100 shadow-sm">
            v2.1.1 (Logout Fixed)
          </div>
        </div>
        <div className="pb-16 md:pb-0">
          {children || <Outlet />}
        </div>
      </main>
    </div>
  );
}


