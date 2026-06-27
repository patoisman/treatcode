import type { Database } from "@/types/database.types";

export type BalanceCache = Database["public"]["Tables"]["user_balance_cache"]["Row"];
export type LedgerEntry = Database["public"]["Tables"]["ledger_entries"]["Row"];

// A ledger entry enriched with the GoCardless payment scheme behind it (when the
// entry was sourced from a gc_payment). Lets the UI distinguish an instant first
// deposit (faster_payments) from one that fell back to BACS — they share the same
// `deposit_ibp` entry_type but should read differently.
export type LedgerEntryWithScheme = LedgerEntry & { scheme: string | null };

// entry_type is stored as a plain string in the DB; this is the closed set of
// values the ledger actually emits (AGENTS §11). Used to map to display labels.
export type LedgerEntryType =
  | "deposit_ibp"
  | "deposit_bacs"
  | "redemption_debit"
  | "redemption_refund"
  | "chargeback_reversal";
