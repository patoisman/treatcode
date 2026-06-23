import type { Database } from "@/types/database.types";

export type GCPayment = Database["public"]["Tables"]["gc_payments"]["Row"];

// status is stored as a plain string in the DB; this is the closed set of values
// GoCardless emits for a payment (AGENTS §14, Phase 5). Used for display mapping.
export type GCPaymentStatus =
  | "pending_submission"
  | "submitted"
  | "confirmed"
  | "paid_out"
  | "failed"
  | "charged_back"
  | "cancelled";
