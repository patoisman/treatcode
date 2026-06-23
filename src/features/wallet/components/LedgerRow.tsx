import { ArrowDownLeft, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatPence, formatShortDate } from "@/lib/format";
import type { LedgerEntry } from "../types";

const ENTRY_LABELS: Record<string, string> = {
  deposit_ibp: "Instant deposit",
  deposit_bacs: "Monthly deposit",
  redemption_debit: "Voucher redemption",
  redemption_refund: "Voucher refund",
  chargeback_reversal: "Chargeback reversal",
};

interface LedgerRowProps {
  entry: LedgerEntry;
}

export function LedgerRow({ entry }: LedgerRowProps) {
  const isCredit = entry.is_credit;
  const label = ENTRY_LABELS[entry.entry_type] ?? "Transaction";
  const Icon = isCredit ? ArrowDownLeft : ArrowUpRight;

  return (
    <li className="flex items-center justify-between gap-4 py-3">
      <div className="flex min-w-0 items-center gap-3">
        <span
          className={cn(
            "flex h-9 w-9 shrink-0 items-center justify-center rounded-full",
            isCredit ? "bg-accent/10 text-accent" : "bg-muted text-muted-foreground",
          )}
        >
          <Icon className="h-4 w-4" />
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-foreground">{label}</p>
          <p className="text-xs text-muted-foreground">{formatShortDate(entry.created_at)}</p>
        </div>
      </div>
      <span
        className={cn(
          "shrink-0 text-sm font-semibold tabular-nums",
          isCredit ? "text-accent" : "text-foreground",
        )}
      >
        {isCredit ? "+" : "−"}
        {formatPence(entry.amount_pence)}
      </span>
    </li>
  );
}
