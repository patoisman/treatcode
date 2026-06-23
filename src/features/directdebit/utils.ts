import type { GCMandate } from "./types";

// A mandate that is set up or still activating — the user already has Direct Debit
// in place and should NOT be offered the setup flow (which would start a second,
// separately-charged setup). Mirrors setup-payment's resume guard (AGENTS §11).
const LIVE_MANDATE_STATUSES = new Set(["active", "pending_submission", "submitted"]);

/** True when the mandate represents a usable (or activating) Direct Debit. */
export function isMandateLive(mandate: GCMandate | null | undefined): boolean {
  return !!mandate && LIVE_MANDATE_STATUSES.has(mandate.status);
}
