import type { Database } from "@/types/database.types";

export type GCBillingRequest = Database["public"]["Tables"]["gc_billing_requests"]["Row"];
export type GCMandate = Database["public"]["Tables"]["gc_mandates"]["Row"];
export type GCSubscription = Database["public"]["Tables"]["gc_subscriptions"]["Row"];

export interface ConfirmBillingResult {
  status: "fulfilled" | "fulfilling" | "cancelled" | "failed";
  mandate_id?: string | null;
  ibp_payment_id?: string | null;
}
