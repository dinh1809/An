/**
 * Master Topbar Component
 * Universal topbar for all desktop screens (64px height)
 * Follows design_rule.md - Light mode, consistent spacing
 */

import { Search, Bell } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface MasterTopbarProps {
    readonly title: string;
    readonly showSearch?: boolean;
    readonly notificationCount?: number;
    readonly rightContent?: React.ReactNode;
}

export function MasterTopbar({
    title,
    showSearch = true,
    notificationCount = 0,
    rightContent
}: MasterTopbarProps) {
    return (
        <header className="w-full h-16 bg-white border-b border-[#E5E7EB] flex items-center justify-between px-8 mb-6 rounded-xl shadow-sm">
            {/* Left: Page Title */}
            <div>
                <h1 className="text-xl font-bold text-[#1F2937]">{title}</h1>
            </div>

            {/* Right: Search + Notifications + Custom Content */}
            <div className="flex items-center gap-4">
                {showSearch && (
                    <div className="relative">
                        <Search
                            size={18}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-[#4B5563]"
                        />
                        <Input
                            type="search"
                            placeholder="Tìm kiếm..."
                            className="w-[300px] pl-10 bg-[#F3F4F6] border-[#E5E7EB] focus:border-[#00695C] focus:ring-[#00695C]"
                        />
                    </div>
                )}

                {/* Notification Bell */}
                <button className="relative p-2 hover:bg-[#F9FAFB] rounded-lg transition-colors">
                    <Bell size={20} className="text-[#4B5563]" />
                    {notificationCount > 0 && (
                        <span className="absolute top-1 right-1 h-4 w-4 bg-[#D32F2F] text-white text-xs flex items-center justify-center rounded-full">
                            {notificationCount > 9 ? '9+' : notificationCount}
                        </span>
                    )}
                </button>

                {/* Custom Right Content */}
                {rightContent}
            </div>
        </header>
    );
}
