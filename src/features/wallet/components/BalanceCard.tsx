import { useState } from "react";
import { Eye, EyeOff, Loader2, Wallet } from "lucide-react";
import { formatPence } from "@/lib/format";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useBalance } from "../hooks/useBalance";

export function BalanceCard() {
  const { data: balance, isLoading, isError } = useBalance();
  const [hidden, setHidden] = useState(false);

  const balancePence = balance?.balance_pence ?? 0;

  return (
    <Card className="lg:col-span-2 shadow-sm border-0">
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <Wallet className="h-5 w-5 text-primary" />
            <div>
              <CardTitle className="text-lg">Treatcode Balance</CardTitle>
              <CardDescription>Available to spend on vouchers</CardDescription>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            aria-label={hidden ? "Show balance" : "Hide balance"}
            onClick={() => setHidden((v) => !v)}
          >
            {hidden ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        ) : isError ? (
          <p className="text-sm text-destructive">
            Couldn't load your balance. Please refresh and try again.
          </p>
        ) : (
          <p className="text-4xl font-bold text-primary tabular-nums">
            {hidden ? "••••••" : formatPence(balancePence)}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
