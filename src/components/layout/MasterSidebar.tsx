/**
 * Master Sidebar Component
 * Universal sidebar for all desktop screens (260px fixed width)
 * Follows design_rule.md - Light mode only, Deep Teal accents
 */

import { NavLink } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
    LayoutDashboard,
    Users,
    Calendar,
    BookOpen,
    BarChart3,
    Settings,
    LogOut,
    LucideIcon
} from 'lucide-react';
import logo from '@/assets/logo.jfif';

interface NavItem {
    to: string;
    icon: LucideIcon;
    label: string;
}

interface MasterSidebarProps {
    readonly variant: 'therapist' | 'parent';
    readonly userName?: string;
    readonly userRole?: string;
    readonly onLogout?: () => void;
}

const therapistNavItems: NavItem[] = [
    { to: '/therapist/dashboard', icon: LayoutDashboard, label: 'Nhiệm vụ' },
    { to: '/therapist/patients', icon: Users, label: 'Bệnh nhân' },
    { to: '/therapist/schedule', icon: Calendar, label: 'Lịch' },
    { to: '/therapist/library', icon: BookOpen, label: 'Thư viện' },
    { to: '/therapist/analytics', icon: BarChart3, label: 'Báo cáo' },
];

const parentNavItems: NavItem[] = [
    { to: '/parent/hub', icon: LayoutDashboard, label: 'Trang chủ' },
    { to: '/parent/exercises', icon: BookOpen, label: 'Bài tập' },
    { to: '/parent/forum', icon: Users, label: 'Cộng đồng' },
    { to: '/parent/archive', icon: Calendar, label: 'Kho lưu trữ' },
    { to: '/parent/messages', icon: Users, label: 'Tin nhắn' },
];

export function MasterSidebar({
    variant,
    userName = 'User',
    userRole = variant === 'therapist' ? 'Therapist' : 'Parent',
    onLogout
}: MasterSidebarProps) {
    const navItems = variant === 'therapist' ? therapistNavItems : parentNavItems;
    const brandName = variant === 'therapist' ? 'An. Clinical' : 'An. Family';

    return (
        <aside className="fixed left-0 top-0 h-screen w-[260px] bg-white border-r border-[#E5E7EB] flex flex-col">
            {/* Logo Section */}
            <div className="p-6 border-b border-[#E5E7EB]">
                <div className="flex items-center gap-3">
                    <img
                        src={logo}
                        alt="An Logo"
                        className="h-10 w-10 rounded-lg object-cover"
                    />
                    <div>
                        <h1 className="text-xl font-bold text-[#00695C]">{brandName}</h1>
                        <p className="text-xs text-[#4B5563]">Healthcare Platform</p>
                    </div>
                </div>
            </div>

            {/* Navigation Menu */}
            <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                {navItems.map((item) => (
                    <NavLink
                        key={item.to}
                        to={item.to}
                        className={({ isActive }) =>
                            cn(
                                'flex items-center gap-3 px-4 py-3 rounded-lg transition-colors',
                                'text-[#4B5563] hover:bg-[#F9FAFB]',
                                isActive && 'bg-[#E0F2F1] text-[#00695C] font-medium'
                            )
                        }
                    >
                        {({ isActive }) => (
                            <>
                                <item.icon
                                    size={20}
                                    className={isActive ? 'text-[#00695C]' : 'text-[#4B5563]'}
                                />
                                <span className="text-sm">{item.label}</span>
                            </>
                        )}
                    </NavLink>
                ))}
            </nav>

            {/* User Profile Section */}
            <div className="p-4 border-t border-[#E5E7EB] space-y-2">
                <NavLink
                    to="/settings"
                    className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-[#F9FAFB] transition-colors"
                >
                    <Settings size={20} className="text-[#4B5563]" />
                    <span className="text-sm text-[#4B5563]">Cài đặt</span>
                </NavLink>

                <div className="px-4 py-2">
                    <p className="text-sm font-medium text-[#1F2937]">{userName}</p>
                    <p className="text-xs text-[#4B5563]">{userRole}</p>
                </div>

                {onLogout && (
                    <button
                        onClick={onLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-[#FEF2F2] hover:text-[#D32F2F] transition-colors text-[#4B5563]"
                    >
                        <LogOut size={20} />
                        <span className="text-sm">Đăng xuất</span>
                    </button>
                )}
            </div>
        </aside>
    );
}
