import { useNavigate } from "react-router-dom";
import { Wallet, History, Gift } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AppLayout } from "@/components/layout/AppLayout";
import { WalletSetupPrompt } from "@/components/common/WalletSetupPrompt";
import { BalanceCard } from "@/features/wallet/components/BalanceCard";
import { LedgerList } from "@/features/wallet/components/LedgerList";

export default function Dashboard() {
  const navigate = useNavigate();

  return (
    <AppLayout>
      <main className="container mx-auto px-4 pt-24 pb-12">
        <WalletSetupPrompt className="mb-6" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <BalanceCard />

          <Card className="shadow-sm border-0">
            <CardHeader>
              <CardTitle className="text-lg">Quick Actions</CardTitle>
              <CardDescription>Manage your account</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                className="w-full justify-start"
                variant="outline"
                onClick={() => navigate("/dashboard/direct-debit")}
              >
                <Wallet className="mr-2 h-4 w-4" />
                Manage Direct Debit
              </Button>
              <Button
                className="w-full justify-start"
                variant="outline"
                onClick={() => navigate("/dashboard/deposits")}
              >
                <History className="mr-2 h-4 w-4" />
                Deposit History
              </Button>
              <Button
                className="w-full justify-start"
                variant="outline"
                onClick={() => navigate("/dashboard/redemptions")}
              >
                <Gift className="mr-2 h-4 w-4" />
                Redeem Vouchers
              </Button>
            </CardContent>
          </Card>

          <LedgerList />
        </div>
      </main>
    </AppLayout>
  );
}
