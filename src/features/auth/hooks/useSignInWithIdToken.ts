import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

interface IdTokenInput {
  /** Google OIDC ID token (the `credential` from the GIS response). */
  token: string;
  /** Raw nonce whose SHA-256 hash was sent to Google. */
  nonce: string;
}

export function useSignInWithIdToken() {
  return useMutation({
    mutationFn: async ({ token, nonce }: IdTokenInput) => {
      const { error } = await supabase.auth.signInWithIdToken({
        provider: "google",
        token,
        nonce,
      });
      if (error) throw error;
    },
  });
}
