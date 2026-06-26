import { CalendarClock } from "lucide-react";
import { formatPence, formatShortDate } from "@/lib/format";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useSubscription } from "../hooks/useSubscription";
import { nextCollectionDate } from "../utils";

// Subscriptions that are no longer collecting shouldn't be shown as live detail.
const SHOWN_STATUSES = new Set(["active", "paused"]);

export function SubscriptionDetail() {
  const { data: sub } = useSubscription();

  if (!sub || !SHOWN_STATUSES.has(sub.status)) return null;

  const isPaused = sub.status === "paused";
  // Paused subscriptions have no scheduled collection — only show a date when active.
  const nextCharge = isPaused ? null : nextCollectionDate(sub);

  return (
    <Card className="shadow-sm border-0">
      <CardHeader>
        <div className="flex items-center gap-3">
          <CalendarClock className="h-5 w-5 text-primary" />
          <div>
            <CardTitle className="text-lg">Monthly Deposit</CardTitle>
            <CardDescription>
              {isPaused ? "Paused — no collections will be taken" : "Your recurring contribution"}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Amount</span>
          <span className="text-sm font-semibold tabular-nums">
            {formatPence(sub.amount_pence)}
          </span>
        </div>
        {nextCharge && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Next deposit</span>
            <span className="text-sm font-medium">{formatShortDate(nextCharge)}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
