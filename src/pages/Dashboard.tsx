import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  Eye,
  EyeOff,
  CreditCard,
  Gift,
  Wallet,
  History,
  Calendar,
  ArrowDownLeft,
  ArrowUpRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AppLayout } from "@/components/layout/AppLayout";
import { useAuth } from "@/hooks/useAuth";
import { DUMMY_ACCOUNT, DUMMY_TRANSACTIONS } from "@/data/dummy";
import type { Account, Transaction } from "@/types";

function formatCurrency(pence: number) {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
  }).format(pence / 100);
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("en-GB", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showBalance, setShowBalance] = useState(true);

  const { data: account, isLoading } = useQuery({
    queryKey: ["account"],
    queryFn: async (): Promise<Account> => DUMMY_ACCOUNT,
  });

  const { data: transactions = [] } = useQuery({
    queryKey: ["transactions"],
    queryFn: async (): Promise<Transaction[]> =>
      DUMMY_TRANSACTIONS.slice(0, 10),
  });

  return (
    <AppLayout>
      <main className="container mx-auto px-4 pt-24 pb-12">
        {isLoading ? (
          <div className="flex items-center justify-center min-h-[50vh]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Balance card */}
            <Card className="lg:col-span-2 shadow-sm border-0">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">Treatcode Balance</CardTitle>
                    <CardDescription>
                      Available to spend on vouchers
                    </CardDescription>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowBalance(!showBalance)}
                    aria-label={showBalance ? "Hide balance" : "Show balance"}
                  >
                    {showBalance ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl md:text-4xl font-bold text-primary mb-4">
                  {showBalance
                    ? formatCurrency(account?.balance ?? 0)
                    : "••••••"}
                </div>
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>
                    Account opened:{" "}
                    {account?.created_at
                      ? formatDate(account.created_at)
                      : "—"}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
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
                  {user?.mandate_status === "active"
                    ? "Manage Direct Debit"
                    : "Setup Direct Debit"}
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

            {/* Recent transactions */}
            <Card className="lg:col-span-3 shadow-sm border-0">
              <CardHeader>
                <CardTitle className="text-lg">Recent Transactions</CardTitle>
                <CardDescription>Your latest account activity</CardDescription>
              </CardHeader>
              <CardContent>
                {transactions.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <CreditCard className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p className="font-medium">No transactions yet</p>
                    <p className="text-sm">
                      Your transaction history will appear here.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {transactions.map((tx) => (
                      <div
                        key={tx.id}
                        className="flex items-center justify-between p-4 rounded-lg bg-muted/30"
                      >
                        <div className="flex items-center space-x-3 min-w-0">
                          <div
                            className={`p-2 rounded-full shrink-0 ${
                              tx.type === "credit"
                                ? "bg-accent/20 text-accent"
                                : "bg-destructive/20 text-destructive"
                            }`}
                          >
                            {tx.type === "credit" ? (
                              <ArrowDownLeft className="h-4 w-4" />
                            ) : (
                              <ArrowUpRight className="h-4 w-4" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium truncate">
                              {tx.description || "Transaction"}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {formatDate(tx.created_at)}
                            </p>
                          </div>
                        </div>
                        <div
                          className={`font-semibold shrink-0 ml-4 ${
                            tx.type === "credit"
                              ? "text-accent"
                              : "text-destructive"
                          }`}
                        >
                          {tx.type === "credit" ? "+" : "−"}
                          {formatCurrency(Math.abs(tx.amount))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </AppLayout>
  );
}
