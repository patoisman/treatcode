import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import type { RedemptionVoucher } from "../types";

interface VoucherDetailsProps {
  voucher: RedemptionVoucher;
}

export function VoucherDetails({ voucher }: VoucherDetailsProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(voucher.voucher_code);
      setCopied(true);
      toast.success("Voucher code copied");
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Couldn't copy automatically. Please copy the code manually.");
    }
  }

  return (
    <div className="mt-3 space-y-2 rounded-md bg-secondary/50 p-3">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs text-muted-foreground">Voucher code</p>
          <p className="truncate text-sm font-semibold tracking-wide">{voucher.voucher_code}</p>
        </div>
        <Button variant="outline" size="sm" onClick={handleCopy} aria-label="Copy voucher code">
          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
        </Button>
      </div>
      {voucher.voucher_pin && (
        <p className="text-xs text-muted-foreground">
          PIN: <span className="font-semibold text-foreground">{voucher.voucher_pin}</span>
        </p>
      )}
      {voucher.instructions && (
        <p className="text-xs text-muted-foreground">{voucher.instructions}</p>
      )}
    </div>
  );
}
