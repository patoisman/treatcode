import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AppLayout } from "@/components/layout/AppLayout";
import { DirectDebitPanel } from "@/features/directdebit/components/DirectDebitPanel";

export default function DirectDebit() {
  const navigate = useNavigate();

  return (
    <AppLayout variant="solid">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12">
        <div className="mb-8">
          <Button variant="ghost" onClick={() => navigate("/dashboard")}
            className="pl-0 hover:bg-transparent text-primary hover:text-primary/80">
            <ArrowLeft className="mr-2 h-4 w-4" />Back to Dashboard
          </Button>
          <h1 className="text-3xl font-bold mt-4">Direct Debit Management</h1>
          <p className="text-muted-foreground mt-1">Set up and manage your Direct Debit payments</p>
        </div>
        <DirectDebitPanel />
      </main>
    </AppLayout>
  );
}
