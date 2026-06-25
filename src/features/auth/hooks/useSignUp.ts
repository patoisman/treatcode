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
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName },
          // Where the confirmation link sends the user once they verify. Lands
          // on /signin, which forwards an authenticated session to /dashboard.
          emailRedirectTo: `${window.location.origin}/signin`,
        },
      });
      if (error) throw error;
      return data;
    },
  });
}
