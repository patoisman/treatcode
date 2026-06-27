import { Navigate } from "react-router-dom";
import { FullPageSpinner } from "@/components/common/FullPageSpinner";
import { useSession } from "@/features/auth/hooks/useSession";
import { useProfile } from "@/features/auth/hooks/useProfile";
import { AuthShell } from "@/features/auth/components/AuthShell";
import { LoginForm } from "@/features/auth/components/LoginForm";
import { adminLandingPath } from "@/features/admin/lib/adminLanding";

export default function SignIn() {
  const { session, isLoading } = useSession();
  const { data: profile, isLoading: profileLoading } = useProfile();

  if (!isLoading && session) {
    // Wait for the profile before deciding where to send them — an admin's
    // default landing depends on is_admin + their remembered choice.
    if (profileLoading) return <FullPageSpinner />;

    // Admins are operators first: send them to their last-chosen area
    // (admin section by default). Everyone else goes to the dashboard.
    const target = profile?.is_admin ? adminLandingPath(profile.id) : "/dashboard";
    return <Navigate to={target} replace />;
  }

  return (
    <AuthShell title="Welcome back" description="Sign in to access your account">
      <LoginForm />
    </AuthShell>
  );
}
