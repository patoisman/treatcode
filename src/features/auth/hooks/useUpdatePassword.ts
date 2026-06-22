import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

export function useUpdatePassword() {
  return useMutation({
    mutationFn: async (newPassword: string) => {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
    },
  });
}
