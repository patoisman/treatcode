import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AppLayout } from "@/components/layout/AppLayout";
import { RedemptionsHistory } from "@/components/features/RedemptionsHistory";
import { BRANDS } from "@/data/brands";
import { DUMMY_ACCOUNT } from "@/data/dummy";
import type { Account, Brand } from "@/types";

function formatCurrency(pence: number) {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
  }).format(pence / 100);
}

export default function Redemptions() {
  const navigate = useNavigate();
  const [selectedBrand, setSelectedBrand] = useState<Brand | null>(null);
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: account } = useQuery({
    queryKey: ["account"],
    queryFn: async (): Promise<Account> => DUMMY_ACCOUNT,
  });

  const balance = account?.balance ?? 0;

  const handleSelectDenomination = (brand: Brand, amount: number) => {
    if (amount > balance) {
      toast.error("Insufficient balance", {
        description: `You need ${formatCurrency(amount)} but your balance is ${formatCurrency(balance)}.`,
      });
      return;
    }
    setSelectedBrand(brand);
    setSelectedAmount(amount);
    setIsConfirmOpen(true);
  };

  const handleRedeem = async () => {
    if (!selectedBrand || selectedAmount === null) return;
    setIsSubmitting(true);

    await new Promise((r) => setTimeout(r, 1200));

    toast.success("Voucher requested!", {
      description: `Your ${selectedBrand.name} voucher has been submitted. We'll email you when it's ready.`,
    });

    setIsSubmitting(false);
    setIsConfirmOpen(false);
    setSelectedBrand(null);
    setSelectedAmount(null);
  };

  return (
    <AppLayout variant="solid">
      <main className="container mx-auto px-4 pt-24 pb-12">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate("/dashboard")}
            className="pl-0 hover:bg-transparent text-primary hover:text-primary/80"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
          <h1 className="text-3xl font-bold mt-4">Redeem Vouchers</h1>
        </div>

        <div className="space-y-8">
          {/* Balance */}
          <Card className="shadow-xs border border-border/50">
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">Available balance</p>
              <p className="text-4xl font-bold text-primary mt-1">
                {formatCurrency(balance)}
              </p>
            </CardContent>
          </Card>

          {/* Brand catalog */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Choose a Voucher</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {BRANDS.map((brand) => (
                <Card
                  key={brand.slug}
                  className="shadow-xs border border-border/50 hover:border-primary/30 transition-colors"
                >
                  <CardHeader className="pb-2 pt-4 px-4">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{brand.logo}</span>
                      <div>
                        <CardTitle className="text-sm font-semibold">
                          {brand.name}
                        </CardTitle>
                        <p className="text-xs text-muted-foreground">
                          {brand.category}
                        </p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="px-4 pb-4">
                    <div className="flex flex-wrap gap-1.5">
                      {brand.denominations.map((amount) => {
                        const canAfford = balance >= amount;
                        return (
                          <Button
                            key={amount}
                            size="sm"
                            variant={canAfford ? "outline" : "ghost"}
                            disabled={!canAfford}
                            className={
                              canAfford
                                ? "h-7 px-2 text-xs border-primary/40 text-primary hover:bg-primary hover:text-white"
                                : "h-7 px-2 text-xs opacity-40 cursor-not-allowed"
                            }
                            onClick={() =>
                              handleSelectDenomination(brand, amount)
                            }
                          >
                            {formatCurrency(amount)}
                          </Button>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Redemption history */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Redemption History</h2>
            <RedemptionsHistory />
          </div>
        </div>
      </main>

      {/* Confirm dialog */}
      <Dialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Voucher Request</DialogTitle>
            <DialogDescription>
              Review the details before submitting your request.
            </DialogDescription>
          </DialogHeader>

          {selectedBrand && selectedAmount !== null && (
            <div className="space-y-4 py-2">
              <div className="flex items-center gap-3 p-4 bg-secondary/50 rounded-lg">
                <span className="text-3xl">{selectedBrand.logo}</span>
                <div>
                  <p className="font-semibold">{selectedBrand.name}</p>
                  <p className="text-2xl font-bold text-primary">
                    {formatCurrency(selectedAmount)}
                  </p>
                </div>
              </div>

              <div className="text-sm text-muted-foreground space-y-1">
                <div className="flex justify-between">
                  <span>Current balance</span>
                  <span className="font-medium text-foreground">
                    {formatCurrency(balance)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>After redemption</span>
                  <span className="font-medium text-foreground">
                    {formatCurrency(balance - selectedAmount)}
                  </span>
                </div>
              </div>

              <p className="text-xs text-muted-foreground">
                We'll source your voucher code and email you when it's ready —
                usually within 1 business day.
              </p>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsConfirmOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button onClick={handleRedeem} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Requesting…
                </>
              ) : (
                "Confirm Request"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
