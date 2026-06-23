import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { notifyRedemptionEvent } from "@/lib/notifications";
import { adminKeys } from "../queryKeys";

export interface CancelRedemptionInput {
  requestId: string;
  reason: string;
}

// Cancels an open redemption via the admin-only `admin_fail_redemption` RPC,
// which enforces is_admin() then transitions the request to `failed`. That
// transition posts a `redemption_refund` ledger entry (AGENTS §11 /
// transition_redemption), so the user's balance is returned automatically — we
// don't touch the balance from the client. Only `requested`/`fulfilling`
// requests can be cancelled (the RPC raises invalid_transition otherwise).
export function useCancelRedemption() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ requestId, reason }: CancelRedemptionInput) => {
      const { error } = await supabase.rpc("admin_fail_redemption", {
        p_request_id: requestId,
        p_failure_reason: reason,
      });
      if (error) throw error;
    },
    onSuccess: (_data, { requestId }) => {
      // Best-effort: tell the user their request failed and was refunded. The
      // refund is already applied via the ledger — don't block on the email.
      void notifyRedemptionEvent("request_failed", requestId);
      queryClient.invalidateQueries({ queryKey: adminKeys.redemptions() });
    },
  });
}
