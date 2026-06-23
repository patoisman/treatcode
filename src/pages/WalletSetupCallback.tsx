import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { CheckCircle, AlertCircle, Loader2, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useConfirmBilling } from "@/features/directdebit/hooks/useConfirmBilling";

type PageState = "loading" | "success" | "finalizing" | "error";
// GoCardless routinely redirects the payer back ~15-20s before the billing request
// reaches `fulfilled`, so we poll comfortably past that window.
const MAX_POLL_ATTEMPTS = 12;
const POLL_INTERVAL_MS = 3000;

export default function WalletSetupCallback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { confirmBilling } = useConfirmBilling();
  const [pageState, setPageState] = useState<PageState>("loading");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const attemptsRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const billingRequestId = searchParams.get("billing_request_id") ?? undefined;

    const attempt = async () => {
      try {
        const result = await confirmBilling(billingRequestId);

        if (result.status === "fulfilled") {
          setPageState("success");
          timerRef.current = setTimeout(() => navigate("/dashboard", { replace: true }), 1500);
        } else if (result.status === "fulfilling") {
          attemptsRef.current += 1;
          if (attemptsRef.current < MAX_POLL_ATTEMPTS) {
            timerRef.current = setTimeout(attempt, POLL_INTERVAL_MS);
          } else {
            // Setup is genuinely still finalising at GoCardless. It WILL complete —
            // the webhook marks onboarding complete on fulfilment — so this is not an
            // error. Let the user proceed; ProtectedRoute admits them once complete.
            setPageState("finalizing");
          }
        } else {
          setErrorMsg("Your bank setup was cancelled or didn't complete. Please try again.");
          setPageState("error");
        }
      } catch (err) {
        setErrorMsg(err instanceof Error ? err.message : "Something went wrong. Please try again.");
        setPageState("error");
      }
    };

    attempt();

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  if (pageState === "loading") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="text-muted-foreground">Activating your account…</p>
      </div>
    );
  }

  if (pageState === "success") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-background">
        <CheckCircle className="h-12 w-12 text-accent" />
        <p className="text-xl font-semibold text-foreground">You're all set!</p>
        <p className="text-muted-foreground text-sm">Redirecting to your dashboard…</p>
      </div>
    );
  }

  if (pageState === "finalizing") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-background p-4 text-center">
        <Clock className="h-12 w-12 text-primary" />
        <p className="text-xl font-semibold text-foreground">Almost there</p>
        <p className="text-sm text-muted-foreground max-w-sm">
          Your bank is finalising your Direct Debit. This can take a moment — your wallet will be
          ready shortly.
        </p>
        <Button onClick={() => navigate("/dashboard", { replace: true })}>Go to dashboard</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-background p-4 text-center">
      <AlertCircle className="h-12 w-12 text-destructive" />
      <p className="text-xl font-semibold text-foreground">Something went wrong</p>
      <p className="text-sm text-muted-foreground max-w-sm">{errorMsg}</p>
      <div className="flex gap-3">
        <Button variant="outline" onClick={() => navigate("/onboarding", { replace: true })}>
          Return to setup
        </Button>
        <Button onClick={() => navigate("/dashboard", { replace: true })}>
          Go to dashboard
        </Button>
      </div>
    </div>
  );
}
