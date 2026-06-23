// Shared pure formatters. Amounts are stored in pence across the app; never
// format a raw pence integer by hand — route it through formatPence.

const GBP = new Intl.NumberFormat("en-GB", {
  style: "currency",
  currency: "GBP",
});

/** Format an integer amount in pence as a GBP currency string (e.g. 9000 → "£90.00"). */
export function formatPence(pence: number): string {
  return GBP.format(pence / 100);
}

const SHORT_DATE = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

/** Format an ISO timestamp as a short human date (e.g. "23 Jun 2026"). */
export function formatShortDate(iso: string): string {
  return SHORT_DATE.format(new Date(iso));
}

/** Format a day-of-month integer with its ordinal suffix (e.g. 1 → "1st", 23 → "23rd"). */
export function formatDayOfMonth(day: number): string {
  const rem100 = day % 100;
  if (rem100 >= 11 && rem100 <= 13) return `${day}th`;
  const suffix = { 1: "st", 2: "nd", 3: "rd" }[day % 10] ?? "th";
  return `${day}${suffix}`;
}
