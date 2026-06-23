import { useState } from "react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useFulfillRedemption } from "../hooks/useFulfillRedemption";
import type { AdminRedemptionItem } from "../types";

interface FulfillDialogProps {
  redemption: AdminRedemptionItem;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function FulfillDialog({ redemption, open, onOpenChange }: FulfillDialogProps) {
  const { mutate, isPending } = useFulfillRedemption();
  const [voucherCode, setVoucherCode] = useState("");
  const [voucherPin, setVoucherPin] = useState("");
  const [instructions, setInstructions] = useState("");
  const [adminNotes, setAdminNotes] = useState("");

  const brandName = redemption.brand?.name ?? "voucher";

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!voucherCode.trim()) return;
    mutate(
      {
        requestId: redemption.id,
        voucherCode: voucherCode.trim(),
        voucherPin: voucherPin.trim() || undefined,
        instructions: instructions.trim() || undefined,
        adminNotes: adminNotes.trim() || undefined,
      },
      {
        onSuccess: () => {
          toast.success(`Voucher delivered — ${brandName} ${formatPence(redemption.amount_pence)}.`);
          onOpenChange(false);
        },
        onError: (err) =>
          toast.error(err instanceof Error ? err.message : "Couldn't fulfil this request."),
      },
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Fulfil redemption</DialogTitle>
          <DialogDescription>
            {`Enter the ${brandName} voucher details for ${redemption.user?.email ?? "this user"}`}
            {` (${formatPence(redemption.amount_pence)}). The user is emailed their code on submit.`}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="voucher-code">Voucher code</Label>
            <Input
              id="voucher-code"
              value={voucherCode}
              onChange={(e) => setVoucherCode(e.target.value)}
              placeholder="e.g. ABCD-1234-EFGH"
              required
              disabled={isPending}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="voucher-pin">PIN (optional)</Label>
            <Input
              id="voucher-pin"
              value={voucherPin}
              onChange={(e) => setVoucherPin(e.target.value)}
              disabled={isPending}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="voucher-instructions">Instructions (optional)</Label>
            <Textarea
              id="voucher-instructions"
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              placeholder="How the customer redeems this voucher"
              rows={2}
              disabled={isPending}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="admin-notes">Admin notes (optional, internal)</Label>
            <Textarea
              id="admin-notes"
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              rows={2}
              disabled={isPending}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending || !voucherCode.trim()}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Fulfil &amp; notify
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
