import type { Brand } from "./types";

export interface RedemptionStatusMeta {
  label: string;
  className: string;
}

// Status → human label + token-based badge styling (AGENTS §7: status colours use
// semantic tokens with opacity, never raw Tailwind colours). `requested` and
// `fulfilling` both surface to the user as a single "Pending" state.
const STATUS_META: Record<string, RedemptionStatusMeta> = {
  requested: { label: "Pending", className: "bg-primary/10 text-primary border-primary/30" },
  fulfilling: { label: "Pending", className: "bg-primary/10 text-primary border-primary/30" },
  fulfilled: { label: "Fulfilled", className: "bg-accent/10 text-accent border-accent/30" },
  failed: { label: "Failed", className: "bg-destructive/10 text-destructive border-destructive/30" },
  expired: { label: "Expired", className: "bg-muted text-muted-foreground border-border" },
};

export function redemptionStatusMeta(status: string): RedemptionStatusMeta {
  return (
    STATUS_META[status] ?? { label: status, className: "bg-muted text-muted-foreground border-border" }
  );
}

const STEP_PENCE = 1000; // £10 increments when a brand has no fixed denomination list
const MAX_SYNTHESISED = 8;

/**
 * Denomination options (in pence) a user can pick for a brand. Prefer the brand's
 * explicit `allowed_denominations`; otherwise synthesise £10 steps within the
 * brand's [min, max] window, always including the exact minimum.
 */
export function brandDenominations(brand: Brand): number[] {
  if (brand.allowed_denominations && brand.allowed_denominations.length > 0) {
    return [...brand.allowed_denominations].sort((a, b) => a - b);
  }

  const out: number[] = [];
  const start = Math.ceil(brand.min_redemption_pence / STEP_PENCE) * STEP_PENCE;
  for (
    let amount = start;
    amount <= brand.max_redemption_pence && out.length < MAX_SYNTHESISED;
    amount += STEP_PENCE
  ) {
    out.push(amount);
  }
  if (!out.includes(brand.min_redemption_pence)) out.unshift(brand.min_redemption_pence);
  return out;
}

/** Two-character fallback shown when a brand has no logo_url (all seeds currently do). */
export function brandInitials(name: string): string {
  const parts = name
    .replace(/[^a-zA-Z0-9 ]/g, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

// request_redemption raises named exceptions; map them to user-facing copy.
const RPC_ERRORS: Record<string, string> = {
  insufficient_balance: "You don't have enough balance for this voucher.",
  amount_outside_brand_limits: "That amount is outside this brand's allowed range.",
  amount_not_in_allowed_denominations: "Please choose one of the listed amounts.",
  brand_not_found: "This brand is no longer available.",
  not_authenticated: "Your session has expired. Please sign in again.",
};

export function redemptionErrorMessage(error: unknown): string {
  const raw = error instanceof Error ? error.message : "";
  for (const [key, message] of Object.entries(RPC_ERRORS)) {
    if (raw.includes(key)) return message;
  }
  return "Couldn't complete your redemption. Please try again.";
}
