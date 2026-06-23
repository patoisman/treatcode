import { Loader2 } from "lucide-react";
import { useRedemptions } from "../hooks/useRedemptions";
import { RedemptionRow } from "./RedemptionRow";

export function RedemptionHistory() {
  const { data: redemptions, isLoading, isError } = useRedemptions();

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
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
