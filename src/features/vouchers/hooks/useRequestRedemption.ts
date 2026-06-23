import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { notifyRedemptionEvent } from "@/lib/notifications";
import { useSession } from "@/features/auth/hooks/useSession";
import { walletKeys } from "@/features/wallet/queryKeys";
import { voucherKeys } from "../queryKeys";

interface RequestRedemptionInput {
  brandId: string;
  amountPence: number;
}

// request_redemption is a security-definer RPC. It is the ONLY write path —
// redemption_requests has no INSERT RLS policy (AGENTS §11). The function validates
// the brand, amount, denomination and balance, then writes the request and the
// debit ledger entry atomically (which the after_ledger_insert trigger applies to
// user_balance_cache). On success we invalidate the redemption list plus the wallet
// balance/ledger so the dashboard reflects the deducted balance immediately.
export function useRequestRedemption() {
  const queryClient = useQueryClient();
  const { session } = useSession();
  const userId = session?.user.id ?? "";

  return useMutation({
    mutationFn: async ({ brandId, amountPence }: RequestRedemptionInput): Promise<string> => {
      const { data, error } = await supabase.rpc("request_redemption", {
        p_brand_id: brandId,
        p_amount_pence: amountPence,
      });
      if (error) throw error;
      return data;
    },
    onSuccess: (requestId) => {
      // Best-effort: notify the admin a request is waiting. Must not block or
      // fail the redemption (already committed) — fire-and-forget.
      void notifyRedemptionEvent("new_request", requestId);
      queryClient.invalidateQueries({ queryKey: voucherKeys.redemptions(userId) });
      queryClient.invalidateQueries({ queryKey: walletKeys.balance(userId) });
      queryClient.invalidateQueries({ queryKey: walletKeys.ledger(userId) });
    },
  });
}
