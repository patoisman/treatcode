import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useSession } from "@/features/auth/hooks/useSession";
import { voucherKeys } from "../queryKeys";
import type { RedemptionListItem } from "../types";

// Most-recent-first redemptions for the current user, with the brand (to-one) and
// fulfillment (one-to-one) embedded. RLS already restricts rows to the owner; the
// user_id filter keeps the query explicit and the cache key user-scoped.
export function useRedemptions() {
  const { session } = useSession();
  const userId = session?.user.id;

  return useQuery({
    queryKey: voucherKeys.redemptions(userId ?? ""),
    queryFn: async (): Promise<RedemptionListItem[]> => {
      const { data, error } = await supabase
        .from("redemption_requests")
        .select(
          `*,
           brand:brands(name, slug, logo_url),
           fulfillment:redemption_fulfillments(voucher_code, voucher_pin, instructions, created_at)`,
        )
        .eq("user_id", userId!)
        .order("requested_at", { ascending: false });
      if (error) throw error;
      return data as RedemptionListItem[];
    },
    enabled: !!userId,
  });
}
