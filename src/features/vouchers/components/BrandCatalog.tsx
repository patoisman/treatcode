import { Loader2 } from "lucide-react";
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
      <div className="flex justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
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
