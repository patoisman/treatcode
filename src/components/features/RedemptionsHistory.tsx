import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { Copy, CheckCircle, XCircle, Clock, Ticket, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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

function formatCurrency(pence: number) {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
  }).format(pence / 100);
}

function formatDate(dateString: string | null) {
  if (!dateString) return "—";
  return format(new Date(dateString), "dd MMM yyyy");
}

function getStatusBadge(status: Redemption["status"]) {
  switch (status) {
    case "fulfilled":
      return (
        <Badge className="bg-green-500">
          <CheckCircle className="h-3 w-3 mr-1" />
          Ready to use
        </Badge>
      );
    case "pending":
      return (
        <Badge className="bg-yellow-500">
          <Clock className="h-3 w-3 mr-1" />
          Pending
        </Badge>
      );
    case "cancelled":
      return (
        <Badge variant="outline">
          <XCircle className="h-3 w-3 mr-1" />
          Cancelled
        </Badge>
      );
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
}

function CopyButton({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    toast.success("Copied!", { description: "Voucher code copied to clipboard." });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      className="h-7 w-7 p-0"
      onClick={handleCopy}
    >
      <Copy className={`h-3.5 w-3.5 ${copied ? "text-accent" : ""}`} />
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
      <Card>
        <CardContent className="pt-6 flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  if (redemptions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Your Redemptions</CardTitle>
          <CardDescription>
            Vouchers you have requested will appear here
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Ticket className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No redemptions yet</p>
            <p className="text-sm mt-1">
              Request a voucher above to get started
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Redemptions</CardTitle>
        <CardDescription>
          {redemptions.length}{" "}
          {redemptions.length === 1 ? "redemption" : "redemptions"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
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
              {redemptions.map((redemption) => (
                <TableRow key={redemption.id}>
                  <TableCell className="font-medium whitespace-nowrap">
                    {formatDate(redemption.created_at)}
                  </TableCell>
                  <TableCell className="font-semibold">
                    {redemption.brand_name}
                  </TableCell>
                  <TableCell className="font-semibold">
                    {formatCurrency(redemption.amount)}
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(redemption.status)}
                  </TableCell>
                  <TableCell>
                    {redemption.status === "fulfilled" &&
                    redemption.voucher_code ? (
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <code className="bg-purple-50 border border-purple-200 text-purple-800 font-mono font-bold px-3 py-1 rounded text-sm tracking-widest">
                            {redemption.voucher_code}
                          </code>
                          <CopyButton code={redemption.voucher_code} />
                        </div>
                        {redemption.voucher_instructions && (
                          <p className="text-xs text-muted-foreground">
                            {redemption.voucher_instructions}
                          </p>
                        )}
                      </div>
                    ) : redemption.status === "pending" ? (
                      <span className="text-sm text-muted-foreground">
                        We'll email you when ready
                      </span>
                    ) : (
                      <span className="text-sm text-muted-foreground">—</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
