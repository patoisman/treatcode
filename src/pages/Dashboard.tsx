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

// Balance, ledger, and quick actions implemented in Phase 3
export default function Dashboard() {
  const navigate = useNavigate();

  return (
    <AppLayout>
      <main className="container mx-auto px-4 pt-24 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2 shadow-sm border-0">
            <CardHeader>
              <div className="flex items-center gap-3">
                <Wallet className="h-5 w-5 text-primary" />
                <div>
                  <CardTitle className="text-lg">Treatcode Balance</CardTitle>
                  <CardDescription>Available to spend on vouchers</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold text-primary">—</p>
            </CardContent>
          </Card>

          <Card className="shadow-sm border-0">
            <CardHeader>
              <CardTitle className="text-lg">Quick Actions</CardTitle>
              <CardDescription>Manage your account</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full justify-start" variant="outline"
                onClick={() => navigate("/dashboard/direct-debit")}>
                <Wallet className="mr-2 h-4 w-4" />Setup Direct Debit
              </Button>
              <Button className="w-full justify-start" variant="outline"
                onClick={() => navigate("/dashboard/deposits")}>
                <History className="mr-2 h-4 w-4" />Deposit History
              </Button>
              <Button className="w-full justify-start" variant="outline"
                onClick={() => navigate("/dashboard/redemptions")}>
                <Gift className="mr-2 h-4 w-4" />Redeem Vouchers
              </Button>
            </CardContent>
          </Card>

          <Card className="lg:col-span-3 shadow-sm border-0">
            <CardHeader>
              <CardTitle className="text-lg">Recent Transactions</CardTitle>
              <CardDescription>Your latest account activity</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-center text-muted-foreground py-8 text-sm">
                No transactions yet.
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </AppLayout>
  );
}
