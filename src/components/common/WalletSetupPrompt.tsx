import { useNavigate } from "react-router-dom";
import { ArrowRight, Wallet } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useProfile } from "@/features/auth/hooks/useProfile";

interface WalletSetupPromptProps {
  className?: string;
}

/**
 * Empty-state banner for users without a fully set-up wallet — admins who skipped
 * onboarding, or anyone who reached a customer page before completing setup.
 * Renders nothing once onboarding is complete. The CTA routes to /onboarding,
 * which resumes at the correct step (pledge vs bank setup).
 */
export function WalletSetupPrompt({ className }: WalletSetupPromptProps) {
  const navigate = useNavigate();
  const { data: profile } = useProfile();

  if (!profile || profile.onboarding_status === "setup_complete") return null;

  const isNew = profile.onboarding_status === "new";
  const title = isNew ? "Set up your wallet to get started" : "Finish setting up your wallet";
  const description = isNew
    ? "Choose your monthly deposit and connect your bank to start saving towards gift vouchers."
    : "You've set your deposit amount — connect your bank to activate your wallet.";
  const cta = isNew ? "Set your deposit amount" : "Finish bank setup";

  return (
    <div
      className={cn(
        "rounded-xl border border-accent/30 bg-accent/10 p-6 shadow-sm",
        "flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between",
        className,
      )}
    >
      <div className="flex items-start gap-3">
        <span className="mt-0.5 rounded-full bg-accent/20 p-2 text-accent-foreground">
          <Wallet className="h-5 w-5" />
        </span>
        <div>
          <h2 className="text-lg font-semibold text-foreground">{title}</h2>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
      <Button className="shrink-0" onClick={() => navigate("/onboarding")}>
        {cta}
        <ArrowRight className="ml-2 h-4 w-4" />
      </Button>
    </div>
  );
}
