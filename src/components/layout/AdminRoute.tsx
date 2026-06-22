import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useSession } from "@/features/auth/hooks/useSession";
import { useProfile } from "@/features/auth/hooks/useProfile";

interface AdminRouteProps {
  children: ReactNode;
}

export function AdminRoute({ children }: AdminRouteProps) {
  const { session, isLoading: sessionLoading } = useSession();
  const { data: profile, isLoading: profileLoading } = useProfile();

  if (sessionLoading || profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/auth" replace />;
  }

  if (!profile?.is_admin) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}
