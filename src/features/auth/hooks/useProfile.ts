import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { authKeys } from "../queryKeys";
import { useSession } from "./useSession";
import type { Profile } from "../types";

export function useProfile() {
  const { session } = useSession();
  const userId = session?.user.id;

  return useQuery({
    queryKey: authKeys.profile(userId ?? ""),
    queryFn: async (): Promise<Profile> => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId!)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!userId,
  });
}
