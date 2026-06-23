import { Loader2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useDeposits } from "../hooks/useDeposits";
import { DepositRow } from "./DepositRow";

export function DepositsTable() {
  const { data: payments, isLoading, isError } = useDeposits();

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (isError) {
    return (
      <p className="py-16 text-center text-sm text-destructive">
        Couldn't load your deposits. Please refresh and try again.
      </p>
    );
  }

  if (!payments || payments.length === 0) {
    return (
      <p className="py-16 text-center text-sm text-muted-foreground">
        No deposits yet. Payments collected towards your wallet will appear here.
      </p>
    );
  }

  return (
    <div className="rounded-lg border border-border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead className="text-right">Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {payments.map((payment) => (
            <DepositRow key={payment.id} payment={payment} />
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
