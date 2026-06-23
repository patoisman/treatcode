import { ShieldCheck } from "lucide-react";
import { formatShortDate } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { GCMandate } from "../types";

// Status → human label + token-based badge styling (AGENTS §7: status colours use
// semantic tokens with opacity, never raw Tailwind colours).
const STATUS_META: Record<string, { label: string; className: string }> = {
  active: { label: "Active", className: "bg-accent/10 text-accent border-accent/30" },
  pending_submission: {
    label: "Pending activation",
    className: "bg-primary/10 text-primary border-primary/30",
  },
  submitted: { label: "Activating", className: "bg-primary/10 text-primary border-primary/30" },
  failed: { label: "Failed", className: "bg-destructive/10 text-destructive border-destructive/30" },
  cancelled: {
    label: "Cancelled",
    className: "bg-destructive/10 text-destructive border-destructive/30",
  },
  expired: { label: "Expired", className: "bg-muted text-muted-foreground border-border" },
  consumed: { label: "Consumed", className: "bg-muted text-muted-foreground border-border" },
  blocked: { label: "Blocked", className: "bg-destructive/10 text-destructive border-destructive/30" },
};

interface MandateStatusProps {
  mandate: GCMandate;
}

export function MandateStatus({ mandate }: MandateStatusProps) {
  const meta = STATUS_META[mandate.status] ?? {
    label: mandate.status,
    className: "bg-muted text-muted-foreground border-border",
  };

  return (
    <Card className="shadow-sm border-0">
      <CardHeader>
        <div className="flex items-center gap-3">
          <ShieldCheck className="h-5 w-5 text-primary" />
          <div>
            <CardTitle className="text-lg">Direct Debit Mandate</CardTitle>
            <CardDescription>Your BACS Direct Debit authorisation</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Status</span>
          <Badge variant="outline" className={meta.className}>
            {meta.label}
          </Badge>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Scheme</span>
          <span className="text-sm font-medium uppercase">{mandate.scheme}</span>
        </div>
        {mandate.next_possible_charge_date && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Next possible charge</span>
            <span className="text-sm font-medium">
              {formatShortDate(mandate.next_possible_charge_date)}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
