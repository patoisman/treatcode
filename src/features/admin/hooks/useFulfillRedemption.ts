import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { adminKeys } from "../queryKeys";
import { functionErrorMessage } from "../utils";

export interface FulfillRedemptionInput {
  requestId: string;
  voucherCode: string;
  voucherPin?: string;
  instructions?: string;
  adminNotes?: string;
}

// Fulfils a redemption via the `admin-fulfilment` edge function (AGENTS §11:
// verify_jwt is OFF but it requires the Authorization header — invoke attaches
// the session token automatically — and checks is_admin server-side). The
// function claims the request, writes the redemption_fulfillments row, transitions
// it to `fulfilled`, and emails the user. On success we invalidate the admin list
// so the table reflects the new status and voucher.
export function useFulfillRedemption() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: FulfillRedemptionInput) => {
      const { data, error } = await supabase.functions.invoke("admin-fulfilment", {
        body: {
          requestId: input.requestId,
          voucherCode: input.voucherCode,
          voucherPin: input.voucherPin,
          instructions: input.instructions,
          adminNotes: input.adminNotes,
        },
      });
      if (error) throw new Error(await functionErrorMessage(error));
      if (data?.error) throw new Error(data.error);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.redemptions() });
    },
  });
}
