import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

export function useResendConfirmation() {
  return useMutation({
    mutationFn: async (email: string) => {
      const { error } = await supabase.auth.resend({
        type: "signup",
        email,
        options: { emailRedirectTo: `${window.location.origin}/signin` },
      });
      if (error) throw error;
    },
  });
}
