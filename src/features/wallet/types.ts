import type { Database } from "@/types/database.types";

export type BalanceCache = Database["public"]["Tables"]["user_balance_cache"]["Row"];
export type LedgerEntry = Database["public"]["Tables"]["ledger_entries"]["Row"];

// entry_type is stored as a plain string in the DB; this is the closed set of
// values the ledger actually emits (AGENTS §11). Used to map to display labels.
export type LedgerEntryType =
  | "deposit_ibp"
  | "deposit_bacs"
  | "redemption_debit"
  | "redemption_refund"
  | "chargeback_reversal";
