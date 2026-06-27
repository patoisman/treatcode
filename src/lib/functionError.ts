import { FunctionsHttpError } from "@supabase/supabase-js";

/**
 * supabase.functions.invoke() rejects a non-2xx response with a FunctionsHttpError
 * whose `.message` is the generic, user-hostile string:
 *   "Edge Function returned a non-2xx status code"
 * Our edge functions return a JSON `{ error: string }` body with the real,
 * user-safe message — but it lives on the unread Response held at `error.context`.
 * This reads it out so the UI can show what actually went wrong.
 *
 * Network / relay failures (no server response) and anything unexpected fall back
 * to the caller-supplied message.
 */
export async function functionErrorMessage(
  error: unknown,
  fallback = "Something went wrong. Please try again.",
): Promise<string> {
  if (error instanceof FunctionsHttpError) {
    try {
      const body = await error.context.json();
      const msg = (body as { error?: unknown })?.error;
      if (typeof msg === "string" && msg.trim()) return msg;
    } catch {
      // body wasn't JSON, or was already consumed — use the fallback below.
    }
    return fallback;
  }
  // FunctionsFetchError / FunctionsRelayError (network or relay) have no useful
  // server message; everything else is unexpected. Keep the friendly fallback.
  return fallback;
}
