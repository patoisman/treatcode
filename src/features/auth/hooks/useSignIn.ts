import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

interface SignInInput {
  email: string;
  password: string;
}

export function useSignIn() {
  return useMutation({
    mutationFn: async ({ email, password }: SignInInput) => {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
    },
  });
}
