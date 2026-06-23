import { useMemo, useState } from "react";
import { Loader2 } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAllRedemptions } from "../hooks/useAllRedemptions";
import { matchesFilter } from "../utils";
import { RedemptionTable } from "./RedemptionTable";
import type { AdminRedemptionFilter, AdminRedemptionItem } from "../types";

const FILTERS: { value: AdminRedemptionFilter; label: string }[] = [
  { value: "pending", label: "Pending" },
  { value: "fulfilled", label: "Fulfilled" },
  { value: "cancelled", label: "Cancelled" },
  { value: "all", label: "All" },
];

function countFor(redemptions: AdminRedemptionItem[], filter: AdminRedemptionFilter): number {
  return redemptions.filter((r) => matchesFilter(r.status, filter)).length;
}

export function AdminRedemptionsPanel() {
  const { data: redemptions, isLoading, isError } = useAllRedemptions();
  const [filter, setFilter] = useState<AdminRedemptionFilter>("pending");

  const visible = useMemo(
    () => (redemptions ?? []).filter((r) => matchesFilter(r.status, filter)),
    [redemptions, filter],
  );

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (isError || !redemptions) {
    return (
      <p className="py-16 text-center text-sm text-destructive">
        Couldn't load redemption requests. Please refresh and try again.
      </p>
    );
  }

  return (
    <div className="space-y-6">
      <Tabs value={filter} onValueChange={(v) => setFilter(v as AdminRedemptionFilter)}>
        <TabsList>
          {FILTERS.map(({ value, label }) => (
            <TabsTrigger key={value} value={value}>
              {label}
              <span className="ml-1.5 text-xs text-muted-foreground">
                {countFor(redemptions, value)}
              </span>
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {visible.length === 0 ? (
        <p className="py-16 text-center text-sm text-muted-foreground">
          No {filter === "all" ? "" : filter} redemption requests.
        </p>
      ) : (
        <RedemptionTable redemptions={visible} />
      )}
    </div>
  );
}
