import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { adminKeys } from "../queryKeys";
import type { AdminRedemptionItem } from "../types";

// All redemption requests across every user, most-recent-first, with the owning
// user, brand (both to-one) and fulfillment (one-to-one) embedded. RLS grants
// admins SELECT on every row (AGENTS §11: redemption_requests_select uses
// `is_admin()`), so no elevated RPC is needed for the read. user_id and
// claimed_by both FK to profiles, so the user embed is disambiguated by the
// constraint name. This only renders inside AdminRoute, so the caller is an admin.
export function useAllRedemptions() {
  return useQuery({
    queryKey: adminKeys.redemptions(),
    queryFn: async (): Promise<AdminRedemptionItem[]> => {
      const { data, error } = await supabase
        .from("redemption_requests")
        .select(
          `*,
           user:profiles!redemption_requests_user_id_fkey(email, full_name),
           brand:brands(name, slug, logo_url),
           fulfillment:redemption_fulfillments(voucher_code, voucher_pin, instructions, admin_notes, created_at)`,
        )
        .order("requested_at", { ascending: false });
      if (error) throw error;
      return data as AdminRedemptionItem[];
    },
  });
}
