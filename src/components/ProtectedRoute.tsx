import { ReactNode } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";
import { Skeleton } from "@/components/ui/skeleton";

type AppRole = "parent" | "therapist";

interface ProtectedRouteProps {
  allowedRole: AppRole;
  children?: ReactNode;
}

export function ProtectedRoute({ allowedRole, children }: ProtectedRouteProps) {
  const { user, loading: authLoading } = useAuth();
  const { role, loading: roleLoading } = useUserRole();

  // Show loading state while checking auth
  if (authLoading || roleLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="space-y-4 w-full max-w-md p-8">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    );
  }

  // Not authenticated - redirect to login
  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // No role yet - redirect to role selection
  if (!role) {
    return <Navigate to="/select-role" replace />;
  }

  // Wrong role - redirect to correct dashboard
  if (role !== allowedRole) {
    if (role === "therapist") {
      return <Navigate to="/therapist/dashboard" replace />;
    } else {
      return <Navigate to="/parent/dashboard" replace />;
    }
  }

  // Authorized - render children or outlet
  return children ? <>{children}</> : <Outlet />;
}
