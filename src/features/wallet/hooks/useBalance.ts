import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useSession } from "@/features/auth/hooks/useSession";
import { walletKeys } from "../queryKeys";
import type { BalanceCache } from "../types";

// Always read the cached balance — never SUM ledger_entries client-side (AGENTS §11).
// The cache row is created on the first ledger entry, so it can legitimately be
// absent for a brand-new user; maybeSingle() returns null rather than throwing.
export function useBalance() {
  const { session } = useSession();
  const userId = session?.user.id;

  return useQuery({
    queryKey: walletKeys.balance(userId ?? ""),
    queryFn: async (): Promise<BalanceCache | null> => {
      const { data, error } = await supabase
        .from("user_balance_cache")
        .select("*")
        .eq("user_id", userId!)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!userId,
  });
}
