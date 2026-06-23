import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useSession } from "@/features/auth/hooks/useSession";
import { useProfile } from "@/features/auth/hooks/useProfile";
import { PledgeStep } from "@/features/onboarding/components/PledgeStep";
import { SetupFlow } from "@/features/directdebit/components/SetupFlow";

function Wordmark() {
  return (
    <span
      className="font-bold text-3xl bg-clip-text text-transparent"
      style={{
        background: "var(--gradient-brand)",
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
      }}
    >
      Treatcode
    </span>
  );
}

export default function Onboarding() {
  const navigate = useNavigate();
  const { session, isLoading: sessionLoading } = useSession();
  const { data: profile, isLoading: profileLoading } = useProfile();

  useEffect(() => {
    if (sessionLoading) return;
    if (!session) {
      navigate("/auth", { replace: true });
      return;
    }
    if (profile?.onboarding_status === "setup_complete") {
      navigate("/dashboard", { replace: true });
    }
  }, [session, sessionLoading, profile, navigate]);

  if (sessionLoading || (session && profileLoading)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  if (!session || !profile) return null;

  const step = profile.onboarding_status;

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <Wordmark />
          <h1 className="text-xl font-semibold text-foreground">
            {step === "new" ? "Set your monthly deposit" : "Connect your bank"}
          </h1>
          <p className="text-sm text-muted-foreground">
            {step === "new"
              ? "Choose how much to deposit each month. You can change this anytime."
              : "Authorise your Direct Debit to activate your wallet."}
          </p>
        </div>

        <div className="rounded-xl bg-card border border-border p-6 shadow-sm">
          {step === "new" && <PledgeStep />}
          {step === "pledge_set" && <SetupFlow />}
        </div>

        {step === "pledge_set" && (
          <p className="text-center text-xs text-muted-foreground">
            Your pledge amount has been saved. Complete the bank setup to activate your account.
          </p>
        )}
      </div>
    </div>
  );
}
