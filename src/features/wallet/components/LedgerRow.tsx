import { ArrowDownLeft, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatPence, formatShortDate } from "@/lib/format";
import type { LedgerEntryWithScheme } from "../types";

const ENTRY_LABELS: Record<string, string> = {
  // deposit_ibp is resolved by entryLabel() below (depends on the payment scheme).
  deposit_bacs: "Monthly deposit",
  redemption_debit: "Voucher redemption",
  redemption_refund: "Voucher refund",
  chargeback_reversal: "Chargeback reversal",
};

// The first deposit shares one entry_type (deposit_ibp) whether it was collected
// instantly (faster_payments) or fell back to BACS. A ledger entry only exists once
// the payment is CONFIRMED — i.e. the money has already landed — so timing copy isn't
// needed here; we just name the method honestly rather than always claiming "Instant".
function entryLabel(entry: LedgerEntryWithScheme): string {
  if (entry.entry_type === "deposit_ibp") {
    return entry.scheme === "faster_payments" ? "Instant deposit" : "First deposit";
  }
  return ENTRY_LABELS[entry.entry_type] ?? "Transaction";
}

interface LedgerRowProps {
  entry: LedgerEntryWithScheme;
}

export function LedgerRow({ entry }: LedgerRowProps) {
  const isCredit = entry.is_credit;
  const label = entryLabel(entry);
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
