import type { Database } from "@/types/database.types";

export type RedemptionRequest = Database["public"]["Tables"]["redemption_requests"]["Row"];
export type RedemptionFulfillment =
  Database["public"]["Tables"]["redemption_fulfillments"]["Row"];
export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type Brand = Database["public"]["Tables"]["brands"]["Row"];

// The owning user's fields surfaced in the admin table.
export type AdminRedemptionUser = Pick<Profile, "email" | "full_name">;

// The brand fields needed to render an admin redemption row.
export type AdminRedemptionBrand = Pick<Brand, "name" | "slug" | "logo_url">;

// The fulfilment fields surfaced once a request has been fulfilled.
export type AdminRedemptionVoucher = Pick<
  RedemptionFulfillment,
  "voucher_code" | "voucher_pin" | "instructions" | "admin_notes" | "created_at"
>;

// Shape returned by useAllRedemptions: a request joined with its owning user
// (to-one), brand (to-one) and fulfillment (one-to-one; null until fulfilled).
export type AdminRedemptionItem = RedemptionRequest & {
  user: AdminRedemptionUser | null;
  brand: AdminRedemptionBrand | null;
  fulfillment: AdminRedemptionVoucher | null;
};

// The filter tabs over the admin table. "pending" = requested + fulfilling;
// "cancelled" = failed + expired.
export type AdminRedemptionFilter = "pending" | "fulfilled" | "cancelled" | "all";
