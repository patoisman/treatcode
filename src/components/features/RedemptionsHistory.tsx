import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { Copy, Check } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DUMMY_REDEMPTIONS } from "@/data/dummy";
import type { Redemption } from "@/types";

const STATUS_CONFIG: Record<
  Redemption["status"],
  { label: string; className: string }
> = {
  pending: {
    label: "Pending",
    className: "bg-amber-100 text-amber-700 border-amber-200",
  },
  fulfilled: {
    label: "Fulfilled",
    className: "bg-green-100 text-green-700 border-green-200",
  },
  cancelled: {
    label: "Cancelled",
    className: "bg-gray-100 text-gray-600 border-gray-200",
  },
};

function formatCurrency(pence: number) {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
  }).format(pence / 100);
}

function CopyButton({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    toast.success("Copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      className="h-6 w-6 shrink-0"
      onClick={handleCopy}
    >
      {copied ? (
        <Check className="h-3 w-3 text-accent" />
      ) : (
        <Copy className="h-3 w-3" />
      )}
      <span className="sr-only">Copy voucher code</span>
    </Button>
  );
}

export function RedemptionsHistory() {
  const { data: redemptions = [], isLoading } = useQuery({
    queryKey: ["redemptions"],
    queryFn: async (): Promise<Redemption[]> => DUMMY_REDEMPTIONS,
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (redemptions.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p className="font-medium">No redemptions yet</p>
        <p className="text-sm mt-1">
          Your voucher redemption history will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Brand</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Voucher Code</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {redemptions.map((redemption) => {
            const statusCfg = STATUS_CONFIG[redemption.status];
            return (
              <TableRow key={redemption.id}>
                <TableCell className="text-sm text-muted-foreground">
                  {format(new Date(redemption.created_at), "d MMM yyyy")}
                </TableCell>
                <TableCell className="font-medium">
                  {redemption.brand_name}
                </TableCell>
                <TableCell>{formatCurrency(redemption.amount)}</TableCell>
                <TableCell>
                  <Badge variant="outline" className={statusCfg.className}>
                    {statusCfg.label}
                  </Badge>
                </TableCell>
                <TableCell>
                  {redemption.voucher_code ? (
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs tracking-widest text-muted-foreground">
                        {redemption.voucher_code}
                      </span>
                      <CopyButton code={redemption.voucher_code} />
                    </div>
                  ) : (
                    <span className="text-sm text-muted-foreground">—</span>
                  )}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
