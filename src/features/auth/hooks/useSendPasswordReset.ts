import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

export function useSendPasswordReset() {
  return useMutation({
    mutationFn: async (email: string) => {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
    },
  });
}
