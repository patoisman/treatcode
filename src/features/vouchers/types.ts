import type { Database } from "@/types/database.types";

export type Brand = Database["public"]["Tables"]["brands"]["Row"];
export type RedemptionRequest = Database["public"]["Tables"]["redemption_requests"]["Row"];
export type RedemptionFulfillment =
  Database["public"]["Tables"]["redemption_fulfillments"]["Row"];

// status is stored as a plain string in the DB; this is the closed set of values
// the redemption lifecycle emits (AGENTS §14, Phase 6). Used for display mapping.
export type RedemptionStatus =
  | "requested"
  | "fulfilling"
  | "fulfilled"
  | "failed"
  | "expired";

// The brand fields needed to render a redemption row.
export type RedemptionBrand = Pick<Brand, "name" | "slug" | "logo_url">;

// The fulfillment fields surfaced to the user once their voucher is fulfilled.
export type RedemptionVoucher = Pick<
  RedemptionFulfillment,
  "voucher_code" | "voucher_pin" | "instructions" | "created_at"
>;

// Shape returned by useRedemptions: a request joined with its brand (to-one) and
// its fulfillment (one-to-one; present only once fulfilled, otherwise null).
export type RedemptionListItem = RedemptionRequest & {
  brand: RedemptionBrand | null;
  fulfillment: RedemptionVoucher | null;
};
