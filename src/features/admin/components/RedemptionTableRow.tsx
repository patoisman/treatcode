import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TableCell, TableRow } from "@/components/ui/table";
import { formatPence, formatShortDate } from "@/lib/format";
import { FulfillDialog } from "./FulfillDialog";
import { CancelDialog } from "./CancelDialog";
import { adminStatusMeta, isActionable } from "../utils";
import type { AdminRedemptionItem } from "../types";

interface RedemptionTableRowProps {
  redemption: AdminRedemptionItem;
}

export function RedemptionTableRow({ redemption }: RedemptionTableRowProps) {
  const [fulfillOpen, setFulfillOpen] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);

  const meta = adminStatusMeta(redemption.status);
  const actionable = isActionable(redemption.status);
  const voucherCode = redemption.fulfillment?.voucher_code;

  return (
    <>
      <TableRow>
        <TableCell>
          <div className="min-w-0">
            <p className="truncate font-medium">{redemption.user?.full_name ?? "Unknown user"}</p>
            <p className="truncate text-xs text-muted-foreground">
              {redemption.user?.email ?? "—"}
            </p>
          </div>
        </TableCell>
        <TableCell>{redemption.brand?.name ?? "—"}</TableCell>
        <TableCell className="font-medium tabular-nums">
          {formatPence(redemption.amount_pence)}
        </TableCell>
        <TableCell className="whitespace-nowrap text-muted-foreground">
          {formatShortDate(redemption.requested_at)}
        </TableCell>
        <TableCell>
          <Badge variant="outline" className={meta.className}>
            {meta.label}
          </Badge>
          {voucherCode && (
            <p className="mt-1 max-w-[12rem] truncate font-mono text-xs text-muted-foreground">
              {voucherCode}
            </p>
          )}
        </TableCell>
        <TableCell className="text-right">
          {actionable ? (
            <div className="flex justify-end gap-2">
              <Button size="sm" onClick={() => setFulfillOpen(true)}>
                Fulfil
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setCancelOpen(true)}
                className="text-destructive hover:text-destructive"
              >
                Cancel
              </Button>
            </div>
          ) : (
            <span className="text-xs text-muted-foreground">—</span>
          )}
        </TableCell>
      </TableRow>

      {/* Dialogs only mount when actionable, so they never target a terminal request. */}
      {actionable && (
        <>
          <FulfillDialog
            redemption={redemption}
            open={fulfillOpen}
            onOpenChange={setFulfillOpen}
          />
          <CancelDialog
            redemption={redemption}
            open={cancelOpen}
            onOpenChange={setCancelOpen}
          />
        </>
      )}
    </>
  );
}
