import { supabase } from "@/lib/supabase";

/**
 * Password recovery is signalled by a single, transient `PASSWORD_RECOVERY`
 * event that Supabase emits (via `setTimeout`, after a network token check)
 * right after the auth client finishes initialising from the URL hash.
 *
 * The `/reset-password` route is lazy-loaded, so by the time its component
 * subscribes the event has very often already fired — and Supabase only ever
 * replays `INITIAL_SESSION` to late subscribers, never `PASSWORD_RECOVERY`.
 * Without a durable latch a perfectly valid reset link renders as "invalid".
 *
 * This module subscribes ONCE, eagerly at import time. It MUST be imported
 * before the client's init promise resolves — `main.tsx` imports it for its
 * side effect — so the listener is registered first and the event is never
 * missed, regardless of how late the reset-password chunk mounts.
 */
let recovering = false;
const listeners = new Set<() => void>();

supabase.auth.onAuthStateChange((event) => {
  if (event === "PASSWORD_RECOVERY") {
    recovering = true;
    listeners.forEach((listener) => listener());
  }
});

/** True once a `PASSWORD_RECOVERY` event has been observed this page load. */
export function isRecovering(): boolean {
  return recovering;
}

/**
 * Marks the recovery as consumed (call after the password has been changed) so
 * the app no longer treats this load as a pending recovery — otherwise a return
 * to `/reset-password` would re-show the form instead of the success screen.
 */
export function clearRecovery(): void {
  recovering = false;
}

/** Subscribe to the moment recovery is detected. Returns an unsubscribe fn. */
export function onRecovery(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/**
 * Reads an auth error left in the URL by an expired or already-used recovery
 * link. Supabase redirects those with `#error=...&error_code=otp_expired&...`
 * and does NOT clear the hash on the error path, so it is still readable on
 * mount. Lets the UI show the real reason immediately instead of guessing.
 */
export function readRecoveryUrlError(): { code: string; description: string } | null {
  if (typeof window === "undefined") return null;
  const raw = window.location.hash.replace(/^#/, "") || window.location.search.replace(/^\?/, "");
  if (!raw) return null;
  const params = new URLSearchParams(raw);
  const code = params.get("error_code") ?? params.get("error");
  if (!code) return null;
  return { code, description: params.get("error_description")?.replace(/\+/g, " ") ?? "" };
}
