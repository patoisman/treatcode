import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { RedemptionTableRow } from "./RedemptionTableRow";
import type { AdminRedemptionItem } from "../types";

interface RedemptionTableProps {
  redemptions: AdminRedemptionItem[];
}

export function RedemptionTable({ redemptions }: RedemptionTableProps) {
  return (
    <div className="overflow-x-auto rounded-lg border border-border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>User</TableHead>
            <TableHead>Brand</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Requested</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {redemptions.map((redemption) => (
            <RedemptionTableRow key={redemption.id} redemption={redemption} />
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
