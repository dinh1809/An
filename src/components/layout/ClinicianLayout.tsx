/**
 * Clinician Layout
 * Wrapper layout for all therapist/clinician pages
 * Combines MasterSidebar + MasterTopbar with content area
 */

import { Outlet, useNavigate } from 'react-router-dom';
import { MasterSidebar } from './MasterSidebar';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export function ClinicianLayout() {
    const navigate = useNavigate();
    const { user } = useAuth();

    const handleLogout = async () => {
        await supabase.auth.signOut();
        navigate('/auth');
    };

    return (
        <div className="min-h-screen bg-[#F9FAFB]">
            <MasterSidebar
                variant="therapist"
                userName={user?.email?.split('@')[0] || 'Therapist'}
                userRole="Chuyên gia trị liệu"
                onLogout={handleLogout}
            />

            {/* Main Content Area - Offset by sidebar width */}
            <main className="ml-[260px] min-h-screen">
                <Outlet />
            </main>
        </div>
    );
}
