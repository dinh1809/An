
import { Outlet } from "react-router-dom";
import { TopNavbar } from "./TopNavbar";
import {
  LayoutDashboard,
  Users,
  Video,
  Library,
  Calendar,
  FileText,
  MessageSquare,
  Settings
} from "lucide-react";

const therapistNavItems = [
  { to: '/therapist/dashboard', icon: LayoutDashboard, label: 'Tổng quan' },
  { to: '/therapist/patients', icon: Users, label: 'Bệnh nhân' },
  { to: '/therapist/review', icon: Video, label: 'Video Review' },
  { to: '/therapist/library', icon: Library, label: 'Thư viện' },
  { to: '/therapist/sessions', icon: Calendar, label: 'Lịch & Notes' },
  { to: '/therapist/reports', icon: FileText, label: 'Báo cáo' },
  { to: '/therapist/messages', icon: MessageSquare, label: 'Tin nhắn' },
  { to: '/therapist/settings', icon: Settings, label: 'Cấu hình' },
];

export function TherapistLayout() {
  return (
    <div className="min-h-screen bg-[#F5F7FA]">
      {/* Top Navigation - Passing custom items */}
      <TopNavbar
        // @ts-ignore - We'll need to update TopNavbar props interface if strict typing is enforced, but for now passing custom items
        customItems={therapistNavItems}
      />

      <main className="max-w-[1600px] mx-auto p-6 md:p-8 animate-in fade-in duration-500">
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Khu vực Chuyên gia</h1>
            <p className="text-slate-500 text-sm font-medium">Quản lý lâm sàng & Can thiệp sớm</p>
          </div>
          <div className="text-sm text-slate-400 font-mono">v2.0.0</div>
        </div>
        <Outlet />
      </main>
    </div>
  );
}
