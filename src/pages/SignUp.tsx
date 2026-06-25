import { useState } from "react";
import { Navigate } from "react-router-dom";
import { useSession } from "@/features/auth/hooks/useSession";
import { AuthShell } from "@/features/auth/components/AuthShell";
import { RegisterForm } from "@/features/auth/components/RegisterForm";
import { CheckEmailNotice } from "@/features/auth/components/CheckEmailNotice";

export default function SignUp() {
  const { session, isLoading } = useSession();
  const [signedUpEmail, setSignedUpEmail] = useState<string | null>(null);

  if (!isLoading && session) {
    return <Navigate to="/dashboard" replace />;
  }

  if (signedUpEmail) {
    return (
      <AuthShell>
        <CheckEmailNotice email={signedUpEmail} />
      </AuthShell>
    );
  }

  return (
    <AuthShell title="Create account" description="Enter your details to get started">
      <RegisterForm onSignedUp={setSignedUpEmail} />
    </AuthShell>
  );
}
