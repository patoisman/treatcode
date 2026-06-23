import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { authKeys } from "@/features/auth/queryKeys";
import { useSession } from "@/features/auth/hooks/useSession";

export function useUpdatePledge() {
  const queryClient = useQueryClient();
  const { session } = useSession();

  return useMutation({
    mutationFn: async (amountPence: number) => {
      const { data, error } = await supabase.functions.invoke("update-pledge", {
        body: { amount_pence: amountPence },
      });
      if (error) throw error;
      return data as { success: boolean; amendment_count: number };
    },
    onSuccess: () => {
      if (session?.user.id) {
        queryClient.invalidateQueries({ queryKey: authKeys.profile(session.user.id) });
      }
    },
  });
}
