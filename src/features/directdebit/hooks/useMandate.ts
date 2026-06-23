import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useSession } from "@/features/auth/hooks/useSession";
import { directDebitKeys } from "../queryKeys";
import type { GCMandate } from "../types";

// A user can accumulate multiple mandate rows over time (a cancelled mandate stays
// on file when they re-set-up). The most recent row is always the relevant one —
// the page decides whether it's "live" via isMandateLive (../utils).
export function useMandate() {
  const { session } = useSession();
  const userId = session?.user.id;

  return useQuery({
    queryKey: directDebitKeys.mandate(userId ?? ""),
    queryFn: async (): Promise<GCMandate | null> => {
      const { data, error } = await supabase
        .from("gc_mandates")
        .select("*")
        .eq("user_id", userId!)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!userId,
  });
}
