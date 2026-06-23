import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

export interface SetupPaymentResult {
  authorisation_url?: string;
  // Setup already exists (live mandate or fulfilled billing request). The edge
  // function advanced onboarding server-side instead of starting a second,
  // separately-charged setup. The caller should refresh and go to the dashboard.
  already_complete?: boolean;
}

export function useSetupPayment() {
  return useMutation({
    mutationFn: async (): Promise<SetupPaymentResult> => {
      const { data, error } = await supabase.functions.invoke("setup-payment", {
        body: {},
      });
      if (error) throw error;
      return data as SetupPaymentResult;
    },
  });
}
