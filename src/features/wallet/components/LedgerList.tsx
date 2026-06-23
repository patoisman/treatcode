import { Loader2 } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useLedgerEntries } from "../hooks/useLedgerEntries";
import { LedgerRow } from "./LedgerRow";

export function LedgerList() {
  const { data: entries, isLoading, isError } = useLedgerEntries();

  return (
    <Card className="lg:col-span-3 shadow-sm border-0">
      <CardHeader>
        <CardTitle className="text-lg">Recent Activity</CardTitle>
        <CardDescription>Your latest deposits and redemptions</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : isError ? (
          <p className="py-8 text-center text-sm text-destructive">
            Couldn't load your activity. Please refresh and try again.
          </p>
        ) : !entries || entries.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            No activity yet. Your deposits and redemptions will appear here.
          </p>
        ) : (
          <ul className="divide-y divide-border">
            {entries.map((entry) => (
              <LedgerRow key={entry.id} entry={entry} />
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
