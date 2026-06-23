import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useSession } from "@/features/auth/hooks/useSession";
import { walletKeys } from "../queryKeys";
import type { LedgerEntry } from "../types";

// Most recent activity only. A future "View all" page can lift this cap.
const RECENT_LIMIT = 20;

export function useLedgerEntries() {
  const { session } = useSession();
  const userId = session?.user.id;

  return useQuery({
    queryKey: walletKeys.ledger(userId ?? ""),
    queryFn: async (): Promise<LedgerEntry[]> => {
      const { data, error } = await supabase
        .from("ledger_entries")
        .select("*")
        .eq("user_id", userId!)
        .order("created_at", { ascending: false })
        .limit(RECENT_LIMIT);
      if (error) throw error;
      return data;
    },
    enabled: !!userId,
  });
}
