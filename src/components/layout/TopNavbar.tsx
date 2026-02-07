/**
 * Top Navbar Component
 * Modern horizontal navigation bar for Parent Portal
 * Follows design_rule.md - Deep Teal + Light mode
 */

import { NavLink, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
    LayoutDashboard,
    Activity,
    Video,
    BarChart3,
    User,
    Users,
    LogOut,
    Menu,
    X,
    Shuffle,
    Compass
} from 'lucide-react';
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import logo from '@/assets/logo.jfif';

interface NavItem {
    to: string;
    icon: React.ElementType;
    label: string;
}

const navItems: NavItem[] = [
    { to: '/parent/hub', icon: LayoutDashboard, label: 'Trang chủ' },
    { to: '/assessment', icon: Compass, label: 'Hướng nghiệp' },
    { to: '/parent/exercises', icon: Video, label: 'Giao bài tập' },
    { to: '/parent/analyze', icon: BarChart3, label: 'Phân tích' },
    { to: '/parent/forum', icon: Users, label: 'Cộng đồng' },
    { to: '/parent/profile', icon: User, label: 'Cá nhân' },
];

interface TopNavbarProps {
    customItems?: NavItem[];
    className?: string;
    activeClassName?: string;
}

export function TopNavbar({ customItems, className, activeClassName }: TopNavbarProps) {
    const navigate = useNavigate();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const items = customItems || navItems;

    const handleLogout = async () => {
        await supabase.auth.signOut();
        navigate('/auth');
    };

    const handleSwitchMode = () => {
        navigate('/select-mode');
    };

    return (
        <header className="fixed top-0 left-0 right-0 z-50 bg-white dark:bg-[#0d1b1a] border-b border-gray-100 dark:border-[#1a2e2c]">
            <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <div className="flex items-center gap-3">
                        <img
                            src={logo}
                            alt="An. Logo"
                            className="h-9 w-9 rounded-lg object-cover"
                        />
                        <div className="hidden sm:block">
                            <h1 className="text-lg font-bold text-[#00695C] dark:text-[#13ecda]">An.</h1>
                            <p className="text-[10px] text-gray-500 -mt-1">Family Portal</p>
                        </div>
                    </div>

                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex items-center gap-1">
                        {items.map((item) => (
                            <NavLink
                                key={item.to}
                                to={item.to}
                                className={({ isActive }) =>
                                    cn(
                                        'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all',
                                        isActive
                                            ? 'bg-[#E0F2F1] dark:bg-[#1a2e2c] text-[#00695C] dark:text-[#13ecda]'
                                            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-[#1a2e2c] hover:text-[#00695C] dark:hover:text-[#13ecda]'
                                    )
                                }
                            >
                                <item.icon size={18} />
                                <span>{item.label}</span>
                            </NavLink>
                        ))}
                    </nav>

                    {/* Right Actions */}
                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleLogout}
                            className="hidden sm:flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                        >
                            <LogOut size={16} />
                            <span className="hidden lg:inline">Đăng xuất</span>
                        </button>

                        {/* Mobile Menu Button */}
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="md:hidden p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#1a2e2c] rounded-lg"
                        >
                            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {mobileMenuOpen && (
                <div className="md:hidden bg-white dark:bg-[#0d1b1a] border-t border-gray-100 dark:border-[#1a2e2c] py-4 px-4">
                    <nav className="flex flex-col gap-1">
                        {items.map((item) => (
                            <NavLink
                                key={item.to}
                                to={item.to}
                                onClick={() => setMobileMenuOpen(false)}
                                className={({ isActive }) =>
                                    cn(
                                        'flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all',
                                        isActive
                                            ? 'bg-[#E0F2F1] dark:bg-[#1a2e2c] text-[#00695C] dark:text-[#13ecda]'
                                            : 'text-gray-600 dark:text-gray-400'
                                    )
                                }
                            >
                                <item.icon size={20} />
                                <span>{item.label}</span>
                            </NavLink>
                        ))}
                        <hr className="my-2 border-gray-100 dark:border-[#1a2e2c]" />
                        <button
                            onClick={handleSwitchMode}
                            className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-[#00695C] dark:text-[#13ecda]"
                        >
                            <Shuffle size={20} />
                            <span>Đổi chế độ</span>
                        </button>
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-red-500"
                        >
                            <LogOut size={20} />
                            <span>Đăng xuất</span>
                        </button>
                    </nav>
                </div>
            )}
        </header>
    );
}
