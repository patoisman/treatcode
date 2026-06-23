import { supabase } from "@/lib/supabase";

// Events handled by the `redemption-notifications` edge function:
// - new_request    → emails ADMIN_EMAIL that a voucher request is waiting
// - request_failed → emails the request owner that it failed and was refunded
export type RedemptionNotificationEvent = "new_request" | "request_failed";

/**
 * Best-effort POST to the `redemption-notifications` edge function (verify_jwt on;
 * the caller's session token is attached automatically). Fire-and-forget by design:
 * the underlying redemption write has already committed, so an email failure must
 * never surface as a failed redemption or cancellation. Errors are logged, not
 * thrown — callers should `void` this and not await it in their critical path.
 */
export async function notifyRedemptionEvent(
  event: RedemptionNotificationEvent,
  requestId: string,
): Promise<void> {
  try {
    const { error } = await supabase.functions.invoke("redemption-notifications", {
      body: { event, requestId },
    });
    if (error) console.error("redemption-notifications invoke failed:", error);
  } catch (err) {
    console.error("redemption-notifications invoke threw:", err);
  }
}
