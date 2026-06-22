import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AppLayout } from "@/components/layout/AppLayout";
import { DepositsHistory } from "@/components/features/DepositsHistory";

export default function Deposits() {
  const navigate = useNavigate();

  return (
    <AppLayout>
      <main className="container mx-auto px-4 pt-24 pb-12">
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate("/dashboard")}
            className="pl-0 hover:bg-transparent text-primary hover:text-primary/80"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
          <h1 className="text-3xl font-bold mt-4">Deposit History</h1>
          <p className="text-muted-foreground mt-1">
            All your monthly Direct Debit collections.
          </p>
        </div>

        <Card className="shadow-sm border-0">
          <CardHeader>
            <CardTitle className="text-lg">Deposits</CardTitle>
          </CardHeader>
          <CardContent>
            <DepositsHistory />
          </CardContent>
        </Card>
      </main>
    </AppLayout>
  );
}
