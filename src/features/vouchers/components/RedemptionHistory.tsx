import { Skeleton } from "@/components/ui/skeleton";
import { useRedemptions } from "../hooks/useRedemptions";
import { RedemptionRow } from "./RedemptionRow";

export function RedemptionHistory() {
  const { data: redemptions, isLoading, isError } = useRedemptions();

  if (isLoading) {
    return (
      <ul className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <li
            key={i}
            className="flex items-center justify-between rounded-lg border border-border bg-card p-4"
          >
            <div className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-20" />
            </div>
            <Skeleton className="h-6 w-20 rounded-full" />
          </li>
        ))}
      </ul>
    );
  }

  if (isError) {
    return (
      <p className="py-12 text-center text-sm text-destructive">
        Couldn't load your redemptions. Please refresh and try again.
      </p>
    );
  }

  if (!redemptions || redemptions.length === 0) {
    return (
      <p className="py-12 text-center text-sm text-muted-foreground">
        No redemptions yet. Redeem your balance for a voucher above.
      </p>
    );
  }

  return (
    <ul className="space-y-3">
      {redemptions.map((redemption) => (
        <RedemptionRow key={redemption.id} redemption={redemption} />
      ))}
    </ul>
  );
}
