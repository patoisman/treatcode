import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { AlertCircle, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { authKeys } from "@/features/auth/queryKeys";
import { useSetupPayment } from "../hooks/useSetupPayment";

export function SetupFlow() {
  const { mutate, isPending } = useSetupPayment();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  function handleSetup() {
    setErrorMsg(null);
    mutate(undefined, {
      onSuccess: async (res) => {
        // Setup already completed on a previous attempt — onboarding was advanced
        // server-side. Refresh the profile and go to the dashboard rather than
        // starting (and paying for) a duplicate setup.
        if (res.already_complete) {
          await queryClient.invalidateQueries({ queryKey: authKeys.all });
          navigate("/dashboard", { replace: true });
          return;
        }
        if (res.authorisation_url) {
          window.location.href = res.authorisation_url;
        }
      },
      onError: (err) => {
        setErrorMsg(
          err instanceof Error ? err.message : "Failed to start bank setup. Please try again."
        );
      },
    });
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        You'll be taken to a secure GoCardless page to authorise your Direct Debit and make your
        first deposit. This usually takes under two minutes.
      </p>

      {errorMsg && (
        <div className="flex items-start gap-2 rounded-md bg-destructive/10 border border-destructive/30 text-destructive p-3 text-sm">
          <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <Button onClick={handleSetup} disabled={isPending} className="w-full">
        {isPending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Redirecting to GoCardless…
          </>
        ) : (
          <>
            Set up Direct Debit
            <ArrowRight className="ml-2 h-4 w-4" />
          </>
        )}
      </Button>
    </div>
  );
}
