import { useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { formatPence } from "@/lib/format";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useCancelRedemption } from "../hooks/useCancelRedemption";
import type { AdminRedemptionItem } from "../types";

interface CancelDialogProps {
  redemption: AdminRedemptionItem;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const DEFAULT_REASON = "Cancelled by admin";

export function CancelDialog({ redemption, open, onOpenChange }: CancelDialogProps) {
  const { mutate, isPending } = useCancelRedemption();
  const [reason, setReason] = useState("");

  function handleConfirm() {
    mutate(
      { requestId: redemption.id, reason: reason.trim() || DEFAULT_REASON },
      {
        onSuccess: () => {
          toast.success(
            `Request cancelled — ${formatPence(redemption.amount_pence)} refunded to the user.`,
          );
          onOpenChange(false);
        },
        onError: (err) =>
          toast.error(err instanceof Error ? err.message : "Couldn't cancel this request."),
      },
    );
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Cancel this redemption?</AlertDialogTitle>
          <AlertDialogDescription>
            {`This refunds ${formatPence(redemption.amount_pence)} to ${redemption.user?.email ?? "the user"} `}
            and marks the request cancelled. This can't be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-2">
          <Label htmlFor="cancel-reason">Reason (optional)</Label>
          <Textarea
            id="cancel-reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder={DEFAULT_REASON}
            rows={2}
            disabled={isPending}
          />
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Keep request</AlertDialogCancel>
          <Button variant="destructive" onClick={handleConfirm} disabled={isPending}>
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Cancel &amp; refund
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
