import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useSession } from "@/features/auth/hooks/useSession";
import { depositKeys } from "../queryKeys";
import type { GCPayment } from "../types";

export function useDeposits() {
  const { session } = useSession();
  const userId = session?.user.id;

  return useQuery({
    queryKey: depositKeys.list(userId ?? ""),
    queryFn: async (): Promise<GCPayment[]> => {
      // charge_date is the collection date (primary sort); some rows have none
      // yet, so fall back to created_at to keep ordering stable and recent-first.
      const { data, error } = await supabase
        .from("gc_payments")
        .select("*")
        .eq("user_id", userId!)
        .order("charge_date", { ascending: false, nullsFirst: false })
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!userId,
  });
}
