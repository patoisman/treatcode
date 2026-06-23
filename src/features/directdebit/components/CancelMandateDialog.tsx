import { useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useCancelMandate } from "../hooks/useCancelMandate";

export function CancelMandateDialog() {
  const [open, setOpen] = useState(false);
  const { mutate, isPending } = useCancelMandate();

  function handleConfirm() {
    mutate(undefined, {
      onSuccess: () => {
        toast.success("Direct Debit cancelled. No further collections will be taken.");
        setOpen(false);
      },
      onError: (err) => {
        toast.error(
          err instanceof Error ? err.message : "Couldn't cancel your Direct Debit. Please try again.",
        );
      },
    });
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="destructive">Cancel Direct Debit</Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Cancel your Direct Debit?</AlertDialogTitle>
          <AlertDialogDescription>
            This stops all future monthly collections. Your existing balance is unaffected, but
            you'll need to set up Direct Debit again to resume saving.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Keep it</AlertDialogCancel>
          <Button variant="destructive" onClick={handleConfirm} disabled={isPending}>
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Yes, cancel
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
