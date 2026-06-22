import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

interface SignUpInput {
  email: string;
  password: string;
  fullName: string;
}

export function useSignUp() {
  return useMutation({
    mutationFn: async ({ email, password, fullName }: SignUpInput) => {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName } },
      });
      if (error) throw error;
    },
  });
}
