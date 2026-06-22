import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DUMMY_DEPOSITS } from "@/data/dummy";
import type { Deposit } from "@/types";

const STATUS_CONFIG: Record<
  Deposit["status"],
  { label: string; className: string }
> = {
  paid_out: {
    label: "Paid Out",
    className: "bg-green-100 text-green-700 border-green-200",
  },
  confirmed: {
    label: "Confirmed",
    className: "bg-blue-100 text-blue-700 border-blue-200",
  },
  pending: {
    label: "Pending",
    className: "bg-amber-100 text-amber-700 border-amber-200",
  },
  failed: {
    label: "Failed",
    className: "bg-red-100 text-red-700 border-red-200",
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

export function DepositsHistory() {
  const { data: deposits = [], isLoading } = useQuery({
    queryKey: ["deposits"],
    queryFn: async (): Promise<Deposit[]> => DUMMY_DEPOSITS,
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (deposits.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p className="font-medium">No deposits yet</p>
        <p className="text-sm mt-1">
          Your deposit history will appear here once your Direct Debit is set up.
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
            <TableHead>Amount</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Notes</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {deposits.map((deposit) => {
            const statusCfg = STATUS_CONFIG[deposit.status];
            return (
              <TableRow key={deposit.id}>
                <TableCell className="text-sm text-muted-foreground">
                  {format(new Date(deposit.created_at), "d MMM yyyy")}
                </TableCell>
                <TableCell className="font-medium">
                  {formatCurrency(deposit.amount)}
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className={statusCfg.className}>
                    {statusCfg.label}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {deposit.failure_reason ?? "—"}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
