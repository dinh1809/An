/**
 * Parent Portal Layout
 * Wrapper layout for all parent pages
 * Combines MasterSidebar (parent variant) + content area
 */

import { Outlet, useNavigate } from 'react-router-dom';
import { MasterSidebar } from './MasterSidebar';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export function ParentPortalLayout() {
    const navigate = useNavigate();
    const { user } = useAuth();

    const handleLogout = async () => {
        await supabase.auth.signOut();
        navigate('/auth');
    };

    return (
        <div className="min-h-screen bg-[#F9FAFB]">
            <MasterSidebar
                variant="parent"
                userName={user?.email?.split('@')[0] || 'Parent'}
                userRole="Phụ huynh"
                onLogout={handleLogout}
            />

            {/* Main Content Area - Offset by sidebar width */}
            <main className="ml-[260px] min-h-screen">
                <Outlet />
            </main>
        </div>
    );
}
