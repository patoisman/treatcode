import { Skeleton } from "@/components/ui/skeleton";
import { useBalance } from "@/features/wallet/hooks/useBalance";
import { useBrands } from "../hooks/useBrands";
import { BrandCard } from "./BrandCard";

export function BrandCatalog() {
  const { data: brands, isLoading, isError } = useBrands();
  // Balance is wallet-owned; the redemption flow reads it to show affordability and
  // the post-redemption balance. The request_redemption RPC re-checks it server-side.
  const { data: balance } = useBalance();
  const balancePence = balance?.balance_pence ?? 0;

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="rounded-lg border border-border bg-card p-6 space-y-4">
            <div className="flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-full" />
              <Skeleton className="h-5 w-24" />
            </div>
            <Skeleton className="h-3 w-full" />
            <div className="flex gap-2">
              <Skeleton className="h-9 w-16" />
              <Skeleton className="h-9 w-16" />
              <Skeleton className="h-9 w-16" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <p className="py-16 text-center text-sm text-destructive">
        Couldn't load brands. Please refresh and try again.
      </p>
    );
  }

  if (!brands || brands.length === 0) {
    return (
      <p className="py-16 text-center text-sm text-muted-foreground">No brands available yet.</p>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {brands.map((brand) => (
        <BrandCard key={brand.id} brand={brand} balancePence={balancePence} />
      ))}
    </div>
  );
}
