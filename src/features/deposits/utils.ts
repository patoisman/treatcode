import type { GCPayment } from "./types";

export interface PaymentStatusMeta {
  label: string;
  className: string;
}

// Status → human label + token-based badge styling (AGENTS §7: status colours use
// semantic tokens with opacity, never raw Tailwind colours).
const STATUS_META: Record<string, PaymentStatusMeta> = {
  pending_submission: {
    label: "Pending",
    className: "bg-primary/10 text-primary border-primary/30",
  },
  submitted: { label: "Processing", className: "bg-primary/10 text-primary border-primary/30" },
  confirmed: { label: "Confirmed", className: "bg-accent/10 text-accent border-accent/30" },
  paid_out: { label: "Paid out", className: "bg-accent/10 text-accent border-accent/30" },
  failed: { label: "Failed", className: "bg-destructive/10 text-destructive border-destructive/30" },
  charged_back: {
    label: "Charged back",
    className: "bg-destructive/10 text-destructive border-destructive/30",
  },
  cancelled: { label: "Cancelled", className: "bg-muted text-muted-foreground border-border" },
};

const FALLBACK_META: PaymentStatusMeta = {
  label: "Unknown",
  className: "bg-muted text-muted-foreground border-border",
};

export function paymentStatusMeta(status: string): PaymentStatusMeta {
  return STATUS_META[status] ?? { ...FALLBACK_META, label: status };
}

const FAILED_STATUSES = new Set<string>(["failed", "charged_back"]);

/**
 * Human-readable failure reason for failed / charged-back payments. The webhook
 * stores the latest GoCardless event in `raw`, whose `details.description` carries
 * the failure explanation (see gocardless-webhook). Returns null when not failed
 * or when no description is present.
 */
export function paymentFailureReason(payment: GCPayment): string | null {
  if (!FAILED_STATUSES.has(payment.status)) return null;
  const raw = payment.raw;
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const details = (raw as Record<string, unknown>).details;
  if (!details || typeof details !== "object" || Array.isArray(details)) return null;
  const description = (details as Record<string, unknown>).description;
  return typeof description === "string" && description.length > 0 ? description : null;
}
