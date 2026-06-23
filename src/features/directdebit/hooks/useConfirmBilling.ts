import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { authKeys } from "@/features/auth/queryKeys";
import type { ConfirmBillingResult } from "../types";

export function useConfirmBilling() {
  const queryClient = useQueryClient();

  const confirmBilling = async (billingRequestId?: string): Promise<ConfirmBillingResult> => {
    const { data, error } = await supabase.functions.invoke("confirm-billing-request", {
      body: billingRequestId ? { billing_request_id: billingRequestId } : {},
    });
    if (error) throw error;

    const result = data as ConfirmBillingResult;

    // Onboarding completion is performed server-side by the edge function
    // (authoritative — profiles has no UPDATE RLS). Here we only drop the cached
    // profile so the dashboard reads the fresh setup_complete status. Invalidate
    // by prefix so this never depends on the auth session having finished loading
    // on the post-redirect page (the old session-gated complete_onboarding RPC
    // silently no-op'd in that race and stranded users at pledge_set).
    if (result.status === "fulfilled") {
      await queryClient.invalidateQueries({ queryKey: authKeys.all });
    }

    return result;
  };

  return { confirmBilling };
}
