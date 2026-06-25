import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { FullPageSpinner } from "@/components/common/FullPageSpinner";
import { useSession } from "@/features/auth/hooks/useSession";
import { useProfile } from "@/features/auth/hooks/useProfile";

interface ProtectedRouteProps {
  children: ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { session, isLoading: sessionLoading } = useSession();
  const { data: profile, isLoading: profileLoading } = useProfile();

  if (sessionLoading || (session && profileLoading)) {
    return <FullPageSpinner />;
  }

  if (!session) {
    return <Navigate to="/signin" replace />;
  }

  if (profile && profile.onboarding_status !== "setup_complete") {
    return <Navigate to="/onboarding" replace />;
  }

  return <>{children}</>;
}
