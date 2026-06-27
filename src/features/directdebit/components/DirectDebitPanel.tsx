import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { WalletSetupPrompt } from "@/components/common/WalletSetupPrompt";
import { useProfile } from "@/features/auth/hooks/useProfile";
import { useMandate } from "../hooks/useMandate";
import { isMandateLive } from "../utils";
import { MandateStatus } from "./MandateStatus";
import { SubscriptionDetail } from "./SubscriptionDetail";
import { CancelMandateDialog } from "./CancelMandateDialog";
import { SetupFlow } from "./SetupFlow";

export function DirectDebitPanel() {
  const { data: profile } = useProfile();
  const { data: mandate, isLoading, isError } = useMandate();

  // Users who haven't finished onboarding (e.g. an admin who skipped) can't run
  // bank setup directly — setup-payment needs a pledge amount. Send them through
  // /onboarding, which resumes at the right step.
  if (profile && profile.onboarding_status !== "setup_complete") {
    return <WalletSetupPrompt />;
  }

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="rounded-lg border border-border bg-card p-6 space-y-4">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-32" />
          </div>
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <p className="py-16 text-center text-sm text-destructive">
        Couldn't load your Direct Debit details. Please refresh and try again.
      </p>
    );
  }

  // No usable mandate (never set up, or cancelled/failed/expired) — offer setup.
  if (!isMandateLive(mandate)) {
    return (
      <Card className="max-w-xl shadow-sm border-0">
        <CardHeader>
          <CardTitle className="text-lg">Set up Direct Debit</CardTitle>
          <CardDescription>
            You don't have an active Direct Debit. Set one up to start your monthly deposits.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SetupFlow />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <MandateStatus mandate={mandate!} />
        <SubscriptionDetail />
      </div>
      {mandate!.status === "active" && (
        <div className="flex items-center justify-between gap-4 rounded-lg border border-border bg-card p-6">
          <div>
            <p className="text-sm font-medium">Cancel Direct Debit</p>
            <p className="text-sm text-muted-foreground">
              Stop future collections. Your balance stays intact.
            </p>
          </div>
          <CancelMandateDialog />
        </div>
      )}
    </div>
  );
}
