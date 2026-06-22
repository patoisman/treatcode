import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

export function useSignInWithGoogle() {
  return useMutation({
    mutationFn: async () => {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: `${window.location.origin}/auth` },
      });
      if (error) throw error;
    },
  });
}
