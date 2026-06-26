import type { GCMandate, GCSubscription } from "./types";

// A mandate that is set up or still activating — the user already has Direct Debit
// in place and should NOT be offered the setup flow (which would start a second,
// separately-charged setup). Mirrors setup-payment's resume guard (AGENTS §11).
const LIVE_MANDATE_STATUSES = new Set(["active", "pending_submission", "submitted"]);

/** True when the mandate represents a usable (or activating) Direct Debit. */
export function isMandateLive(mandate: GCMandate | null | undefined): boolean {
  return !!mandate && LIVE_MANDATE_STATUSES.has(mandate.status);
}

/**
 * The next date Treatcode will collect this subscription, derived from the
 * subscription's OWN stored schedule (`start_date` + `day_of_month`) rather than
 * the mandate's `next_possible_charge_date`. That mandate field is a live value
 * GoCardless recomputes every day (the earliest chargeable working day from
 * "today"), so a stored mirror of it goes stale within a day — see AGENTS §12.
 * The subscription schedule is a fixed contract and never drifts.
 *
 * Returns an ISO `YYYY-MM-DD` string, or null if there's nothing scheduled.
 * - Before the first collection (today ≤ start_date): the start_date.
 * - After it: the next occurrence of day_of_month on or after today (day_of_month
 *   is clamped to 28 at creation, so it exists in every month).
 */
export function nextCollectionDate(
  sub: Pick<GCSubscription, "start_date" | "day_of_month">,
  today: Date = new Date(),
): string | null {
  const todayIso = today.toISOString().slice(0, 10);

  // Until the first collection lands, that IS the next collection.
  if (sub.start_date && sub.start_date >= todayIso) return sub.start_date;

  if (sub.day_of_month == null) return sub.start_date ?? null;

  const month = today.getUTCMonth();
  const onOrAfterThisMonth = today.getUTCDate() <= sub.day_of_month;
  const next = new Date(
    Date.UTC(today.getUTCFullYear(), onOrAfterThisMonth ? month : month + 1, sub.day_of_month),
  );
  return next.toISOString().slice(0, 10);
}
