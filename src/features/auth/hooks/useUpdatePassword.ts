import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

export function useUpdatePassword() {
  return useMutation({
    mutationFn: async (newPassword: string) => {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      // Security: a reset often means the old password is compromised. Revoke
      // any OTHER active sessions (keeping this one) so a stale/attacker session
      // can't outlive the reset. Best-effort — never fail the reset on this.
      await supabase.auth.signOut({ scope: "others" }).catch(() => {});
    },
  });
}
