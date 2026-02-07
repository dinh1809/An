
import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole, AppRole } from "@/hooks/useUserRole";

interface ProtectedRouteProps {
    children: React.ReactNode;
    allowedRole: AppRole;
}

/**
 * A stricter guard component that ensures:
 * 1. User is authenticated (session exists)
 * 2. Role is correctly identified and matches allowedRole
 */
export const ProtectedRoute = ({ children, allowedRole }: ProtectedRouteProps) => {
    const { session } = useAuth();
    const { role, loading } = useUserRole();
    const location = useLocation();

    // 1. Show loading spinner while determining auth/role state
    if (loading) {
        return (
            <div className="flex h-screen w-full items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            </div>
        );
    }

    // 2. Redirect to auth if not logged in
    if (!session) {
        return <Navigate to="/auth" state={{ from: location }} replace />;
    }

    // 3. Handle incorrect role access
    if (role !== allowedRole) {
        console.warn(`[ProtectedRoute] Access denied. Current role: ${role}, Allowed role: ${allowedRole}`);

        // Redirect to the correct dashboard based on existing role
        if (role === "therapist") {
            return <Navigate to="/therapist/dashboard" replace />;
        } else if (role === "parent") {
            return <Navigate to="/parent/hub" replace />;
        } else {
            // If role is truly unknown/null after retry, we might want a role-selection or error page
            // For now, redirect to auth to re-trigger the flow
            return <Navigate to="/auth" replace />;
        }
    }

    // 4. Authorized - render children
    return <>{children}</>;
};
