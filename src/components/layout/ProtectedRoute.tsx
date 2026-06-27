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

  // Admins are operators, not customers — they don't need a funded wallet to use
  // the app. Never trap them in onboarding; let them through to the customer
  // pages, which show "finish setting up your wallet" empty states (see
  // WalletSetupPrompt) until they choose to set up a personal wallet.
  if (
    profile &&
    !profile.is_admin &&
    profile.onboarding_status !== "setup_complete"
  ) {
    return <Navigate to="/onboarding" replace />;
  }

  return <>{children}</>;
}
