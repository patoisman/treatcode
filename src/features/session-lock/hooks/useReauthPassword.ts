import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

interface ReauthInput {
  /** The current session's email — re-auth can't switch accounts. */
  email: string;
  password: string;
}

/**
 * Verifies the user's password to unlock the screen. Re-signing in with the
 * session's own email refreshes the session and can only ever succeed for the
 * same user, so it doubles as a safe re-authentication.
 */
export function useReauthPassword() {
  return useMutation({
    mutationFn: async ({ email, password }: ReauthInput) => {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
    },
  });
}
