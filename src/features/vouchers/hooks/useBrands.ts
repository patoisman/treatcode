import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { voucherKeys } from "../queryKeys";
import type { Brand } from "../types";

// Active brands only. RLS also enforces `is_active = true` for non-admins, but we
// filter explicitly so the query is correct regardless of who runs it.
export function useBrands() {
  return useQuery({
    queryKey: voucherKeys.brands(),
    queryFn: async (): Promise<Brand[]> => {
      const { data, error } = await supabase
        .from("brands")
        .select("*")
        .eq("is_active", true)
        .order("name", { ascending: true });
      if (error) throw error;
      return data;
    },
  });
}
