import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useSession } from "@/features/auth/hooks/useSession";
import { useProfile } from "@/features/auth/hooks/useProfile";

interface ProtectedRouteProps {
  children: ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { session, isLoading: sessionLoading } = useSession();
  const { data: profile, isLoading: profileLoading } = useProfile();

  if (sessionLoading || (session && profileLoading)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/auth" replace />;
  }

  if (profile && profile.onboarding_status !== "setup_complete") {
    return <Navigate to="/onboarding" replace />;
  }

  return <>{children}</>;
}
