import { Badge } from "@/components/ui/badge";
import { formatPence, formatShortDate } from "@/lib/format";
import { BrandLogo } from "./BrandLogo";
import { VoucherDetails } from "./VoucherDetails";
import { redemptionStatusMeta } from "../utils";
import type { RedemptionListItem } from "../types";

interface RedemptionRowProps {
  redemption: RedemptionListItem;
}

export function RedemptionRow({ redemption }: RedemptionRowProps) {
  const meta = redemptionStatusMeta(redemption.status);
  const brandName = redemption.brand?.name ?? "Voucher";
  const showFailure =
    (redemption.status === "failed" || redemption.status === "expired") &&
    !!redemption.failure_reason;

  return (
    <li className="rounded-lg border border-border bg-card p-4">
      <div className="flex items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <BrandLogo
            name={brandName}
            logoUrl={redemption.brand?.logo_url ?? null}
            className="h-10 w-10"
          />
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">{brandName}</p>
            <p className="text-xs text-muted-foreground">
              {formatShortDate(redemption.requested_at)}
            </p>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1">
          <span className="text-sm font-semibold tabular-nums">
            {formatPence(redemption.amount_pence)}
          </span>
          <Badge variant="outline" className={meta.className}>
            {meta.label}
          </Badge>
        </div>
      </div>

      {redemption.status === "fulfilled" && redemption.fulfillment && (
        <VoucherDetails voucher={redemption.fulfillment} />
      )}
      {showFailure && (
        <p className="mt-3 text-xs text-destructive">{redemption.failure_reason}</p>
      )}
    </li>
  );
}
