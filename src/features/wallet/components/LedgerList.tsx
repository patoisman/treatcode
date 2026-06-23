import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
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
          <ul className="divide-y divide-border">
            {Array.from({ length: 4 }).map((_, i) => (
              <li key={i} className="flex items-center justify-between py-3">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-20" />
                </div>
                <Skeleton className="h-4 w-16" />
              </li>
            ))}
          </ul>
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
