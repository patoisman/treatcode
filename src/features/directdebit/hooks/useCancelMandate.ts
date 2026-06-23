import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { directDebitKeys } from "../queryKeys";

interface CancelMandateResult {
  success: boolean;
  status: string;
}

// Cancels the user's active mandate via the `manage-subscription` edge function
// (action: "cancel"). The function cancels the mandate at GoCardless — which
// cascades to the subscription — and optimistically writes both rows to
// `cancelled` so the UI reflects the change without waiting for the webhook.
export function useCancelMandate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (): Promise<CancelMandateResult> => {
      const { data, error } = await supabase.functions.invoke("manage-subscription", {
        body: { action: "cancel" },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      return data as CancelMandateResult;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: directDebitKeys.all });
    },
  });
}
