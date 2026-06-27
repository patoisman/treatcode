import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useSession } from "@/features/auth/hooks/useSession";
import { walletKeys } from "../queryKeys";
import type { LedgerEntryWithScheme } from "../types";

// Most recent activity only. A future "View all" page can lift this cap.
const RECENT_LIMIT = 20;

export function useLedgerEntries() {
  const { session } = useSession();
  const userId = session?.user.id;

  return useQuery({
    queryKey: walletKeys.ledger(userId ?? ""),
    queryFn: async (): Promise<LedgerEntryWithScheme[]> => {
      const { data, error } = await supabase
        .from("ledger_entries")
        .select("*")
        .eq("user_id", userId!)
        .order("created_at", { ascending: false })
        .limit(RECENT_LIMIT);
      if (error) throw error;

      // Attach the scheme of the underlying GoCardless payment so the UI can tell an
      // instant first deposit (faster_payments) apart from a BACS fallback — there's no
      // FK relationship to embed, so we resolve the handful of payment ids in one query.
      const paymentIds = [
        ...new Set(
          data
            .filter((e) => e.source_type === "gc_payment" && e.source_id)
            .map((e) => e.source_id as string),
        ),
      ];

      const schemeById = new Map<string, string | null>();
      if (paymentIds.length > 0) {
        const { data: payments, error: pErr } = await supabase
          .from("gc_payments")
          .select("id, scheme")
          .in("id", paymentIds);
        if (pErr) throw pErr;
        for (const p of payments ?? []) schemeById.set(p.id, p.scheme ?? null);
      }

      return data.map((e) => ({
        ...e,
        scheme:
          e.source_type === "gc_payment" && e.source_id
            ? schemeById.get(e.source_id) ?? null
            : null,
      }));
    },
    enabled: !!userId,
  });
}
