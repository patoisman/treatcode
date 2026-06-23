import { Badge } from "@/components/ui/badge";
import { TableCell, TableRow } from "@/components/ui/table";
import { formatPence, formatShortDate } from "@/lib/format";
import type { GCPayment } from "../types";
import { paymentFailureReason, paymentStatusMeta } from "../utils";

interface DepositRowProps {
  payment: GCPayment;
}

export function DepositRow({ payment }: DepositRowProps) {
  const meta = paymentStatusMeta(payment.status);
  const failureReason = paymentFailureReason(payment);
  // charge_date is when the money is/was collected; fall back to the record date.
  const date = payment.charge_date ?? payment.created_at;

  return (
    <TableRow>
      <TableCell className="text-muted-foreground">{formatShortDate(date)}</TableCell>
      <TableCell className="font-medium tabular-nums">{formatPence(payment.amount_pence)}</TableCell>
      <TableCell className="text-right">
        <div className="flex flex-col items-end gap-1">
          <Badge variant="outline" className={meta.className}>
            {meta.label}
          </Badge>
          {failureReason && (
            <span className="max-w-[16rem] whitespace-normal text-right text-xs text-destructive">
              {failureReason}
            </span>
          )}
        </div>
      </TableCell>
    </TableRow>
  );
}
