import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import {
  Loader2,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
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
import { DUMMY_DEPOSITS } from "@/data/dummy";
import type { Deposit } from "@/types";

function formatCurrency(pence: number) {
  return `£${(pence / 100).toFixed(2)}`;
}

function formatDate(dateString: string | null) {
  if (!dateString) return "—";
  return format(new Date(dateString), "dd MMM yyyy");
}

function getStatusBadge(status: Deposit["status"]) {
  switch (status) {
    case "paid_out":
      return (
        <Badge className="bg-green-500">
          <CheckCircle className="h-3 w-3 mr-1" />
          Completed
        </Badge>
      );
    case "confirmed":
      return (
        <Badge className="bg-blue-500">
          <TrendingUp className="h-3 w-3 mr-1" />
          Confirmed
        </Badge>
      );
    case "pending":
      return (
        <Badge className="bg-yellow-500">
          <Clock className="h-3 w-3 mr-1" />
          Pending
        </Badge>
      );
    case "failed":
      return (
        <Badge variant="destructive">
          <XCircle className="h-3 w-3 mr-1" />
          Failed
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

export function DepositsHistory() {
  const { data: deposits = [], isLoading } = useQuery({
    queryKey: ["deposits"],
    queryFn: async (): Promise<Deposit[]> => DUMMY_DEPOSITS,
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

  if (deposits.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Deposit History</CardTitle>
          <CardDescription>
            Your Direct Debit deposits will appear here
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No deposits yet</p>
            <p className="text-sm mt-1">
              Your first deposit will be collected shortly after setup
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Deposit History</CardTitle>
        <CardDescription>
          {deposits.length} {deposits.length === 1 ? "deposit" : "deposits"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
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
              {deposits.map((deposit) => (
                <TableRow key={deposit.id}>
                  <TableCell className="font-medium whitespace-nowrap">
                    {formatDate(deposit.created_at)}
                  </TableCell>
                  <TableCell className="font-semibold">
                    {formatCurrency(deposit.amount)}
                  </TableCell>
                  <TableCell>{getStatusBadge(deposit.status)}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {deposit.failure_reason ?? "—"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Show failure reason alert if any deposits failed */}
        {deposits.some((d) => d.status === "failed" && d.failure_reason) && (
          <div className="mt-4 p-3 rounded-lg bg-red-50 border border-red-200">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-red-900">
                  Recent Failure
                </p>
                <p className="text-xs text-red-700 mt-1">
                  {deposits.find((d) => d.status === "failed")?.failure_reason}
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
