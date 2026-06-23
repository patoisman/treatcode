import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { formatPence } from "@/lib/format";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useRequestRedemption } from "../hooks/useRequestRedemption";
import { redemptionErrorMessage } from "../utils";
import type { Brand } from "../types";

interface ConfirmDialogProps {
  brand: Brand;
  amountPence: number | null;
  balancePence: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ConfirmDialog({
  brand,
  amountPence,
  balancePence,
  open,
  onOpenChange,
}: ConfirmDialogProps) {
  const { mutate, isPending } = useRequestRedemption();
  const insufficient = amountPence !== null && amountPence > balancePence;

  function handleConfirm() {
    if (amountPence === null) return;
    mutate(
      { brandId: brand.id, amountPence },
      {
        onSuccess: () => {
          toast.success(
            `Voucher requested — ${formatPence(amountPence)} ${brand.name}. We'll email your code shortly.`,
          );
          onOpenChange(false);
        },
        onError: (err) => toast.error(redemptionErrorMessage(err)),
      },
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirm your voucher</DialogTitle>
          <DialogDescription>
            {amountPence !== null
              ? `Redeem ${formatPence(amountPence)} from your balance for a ${brand.name} gift voucher.`
              : null}
          </DialogDescription>
        </DialogHeader>

        <dl className="space-y-2 rounded-lg border border-border bg-secondary/50 p-4 text-sm">
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Voucher</dt>
            <dd className="font-medium">{brand.name}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Amount</dt>
            <dd className="font-medium tabular-nums">
              {amountPence !== null ? formatPence(amountPence) : "—"}
            </dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Balance after</dt>
            <dd className="font-medium tabular-nums">
              {amountPence !== null
                ? formatPence(Math.max(0, balancePence - amountPence))
                : "—"}
            </dd>
          </div>
        </dl>

        {insufficient && (
          <p className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
            You don't have enough balance for this voucher. Your balance is{" "}
            {formatPence(balancePence)}.
          </p>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={isPending || insufficient || amountPence === null}>
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Confirm redemption
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
