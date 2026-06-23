import { Loader2 } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useMandate } from "../hooks/useMandate";
import { isMandateLive } from "../utils";
import { MandateStatus } from "./MandateStatus";
import { SubscriptionDetail } from "./SubscriptionDetail";
import { CancelMandateDialog } from "./CancelMandateDialog";
import { SetupFlow } from "./SetupFlow";

export function DirectDebitPanel() {
  const { data: mandate, isLoading, isError } = useMandate();

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
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
