import { FunctionsHttpError } from "@supabase/supabase-js";
import type { AdminRedemptionFilter } from "./types";

export interface AdminStatusMeta {
  label: string;
  className: string;
}

// Status → admin-facing label + token-based badge styling (AGENTS §7: status
// colours use semantic tokens with opacity, never raw Tailwind colours). Admins
// see the raw lifecycle (requested vs fulfilling are distinct here, unlike the
// user-facing "Pending"); a `failed` request is one an admin cancelled.
const STATUS_META: Record<string, AdminStatusMeta> = {
  requested: { label: "Requested", className: "bg-primary/10 text-primary border-primary/30" },
  fulfilling: { label: "Fulfilling", className: "bg-primary/10 text-primary border-primary/30" },
  fulfilled: { label: "Fulfilled", className: "bg-accent/10 text-accent border-accent/30" },
  failed: { label: "Cancelled", className: "bg-destructive/10 text-destructive border-destructive/30" },
  expired: { label: "Expired", className: "bg-muted text-muted-foreground border-border" },
};

export function adminStatusMeta(status: string): AdminStatusMeta {
  return (
    STATUS_META[status] ?? { label: status, className: "bg-muted text-muted-foreground border-border" }
  );
}

// A request is actionable (can be fulfilled or cancelled) only while it is still
// open. Mirrors transition_redemption's allowed source states (AGENTS §11).
export function isActionable(status: string): boolean {
  return status === "requested" || status === "fulfilling";
}

// Which lifecycle states each filter tab surfaces.
export function matchesFilter(status: string, filter: AdminRedemptionFilter): boolean {
  switch (filter) {
    case "pending":
      return status === "requested" || status === "fulfilling";
    case "fulfilled":
      return status === "fulfilled";
    case "cancelled":
      return status === "failed" || status === "expired";
    case "all":
      return true;
  }
}

// admin-fulfilment returns its error in a JSON body on a non-2xx response, which
// supabase.functions.invoke surfaces as a FunctionsHttpError. Pull the server's
// message out so the admin sees the real reason, not a generic status string.
export async function functionErrorMessage(error: unknown): Promise<string> {
  if (error instanceof FunctionsHttpError) {
    try {
      const body = await error.context.json();
      if (body?.error) return String(body.error);
    } catch {
      // fall through to the generic message
    }
  }
  return error instanceof Error ? error.message : "Something went wrong. Please try again.";
}
