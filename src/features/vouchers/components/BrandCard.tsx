import { useState } from "react";
import { cn } from "@/lib/utils";
import { formatPence } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { BrandLogo } from "./BrandLogo";
import { ConfirmDialog } from "./ConfirmDialog";
import { brandDenominations } from "../utils";
import type { Brand } from "../types";

interface BrandCardProps {
  brand: Brand;
  balancePence: number;
}

export function BrandCard({ brand, balancePence }: BrandCardProps) {
  const [selected, setSelected] = useState<number | null>(null);
  const denominations = brandDenominations(brand);

  return (
    <Card className="flex flex-col border border-border shadow-sm">
      <CardHeader className="flex flex-row items-center gap-3 space-y-0">
        <BrandLogo name={brand.name} logoUrl={brand.logo_url} />
        <div className="min-w-0">
          <h3 className="truncate text-base font-semibold">{brand.name}</h3>
          {brand.description && (
            <p className="line-clamp-2 text-xs text-muted-foreground">{brand.description}</p>
          )}
        </div>
      </CardHeader>
      <CardContent className="mt-auto">
        <p className="mb-2 text-xs text-muted-foreground">Choose an amount</p>
        <div className="flex flex-wrap gap-2">
          {denominations.map((amount) => (
            <Button
              key={amount}
              variant="outline"
              size="sm"
              className={cn("tabular-nums", amount > balancePence && "opacity-50")}
              onClick={() => setSelected(amount)}
            >
              {formatPence(amount)}
            </Button>
          ))}
        </div>
      </CardContent>

      <ConfirmDialog
        brand={brand}
        amountPence={selected}
        balancePence={balancePence}
        open={selected !== null}
        onOpenChange={(open) => {
          if (!open) setSelected(null);
        }}
      />
    </Card>
  );
}
