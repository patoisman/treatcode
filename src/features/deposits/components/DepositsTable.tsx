import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { useDeposits } from "../hooks/useDeposits";
import { DepositRow } from "./DepositRow";

export function DepositsTable() {
  const { data: payments, isLoading, isError } = useDeposits();

  if (isLoading) {
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
            {Array.from({ length: 4 }).map((_, i) => (
              <TableRow key={i}>
                <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                <TableCell className="text-right">
                  <Skeleton className="ml-auto h-5 w-20" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
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
