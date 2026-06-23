import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useSession } from "@/features/auth/hooks/useSession";
import { directDebitKeys } from "../queryKeys";
import type { GCSubscription } from "../types";

// The recurring monthly subscription tied to the user's mandate. Created
// server-side on `mandates.active` (AGENTS §12), so it can legitimately be absent
// while a fresh mandate is still activating — maybeSingle() returns null.
export function useSubscription() {
  const { session } = useSession();
  const userId = session?.user.id;

  return useQuery({
    queryKey: directDebitKeys.subscription(userId ?? ""),
    queryFn: async (): Promise<GCSubscription | null> => {
      const { data, error } = await supabase
        .from("gc_subscriptions")
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
