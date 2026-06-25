import { Navigate } from "react-router-dom";
import { useSession } from "@/features/auth/hooks/useSession";
import { AuthShell } from "@/features/auth/components/AuthShell";
import { LoginForm } from "@/features/auth/components/LoginForm";

export default function SignIn() {
  const { session, isLoading } = useSession();

  if (!isLoading && session) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <AuthShell title="Welcome back" description="Sign in to access your account">
      <LoginForm />
    </AuthShell>
  );
}
