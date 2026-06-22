import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AppLayout } from "@/components/layout/AppLayout";
import { DirectDebitSetup } from "@/components/features/DirectDebitSetup";
import { DirectDebitStatus } from "@/components/features/DirectDebitStatus";
import { useAuth } from "@/hooks/useAuth";

export default function DirectDebit() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const hasMandante =
    user?.mandate_status === "active" || user?.mandate_status === "pending";

  // Local toggle: if setup succeeds in mock mode, flip to status view
  const [showStatus, setShowStatus] = useState(hasMandante);

  return (
    <AppLayout variant="solid">
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
          <h1 className="text-3xl font-bold mt-4">Direct Debit Management</h1>
          <p className="text-muted-foreground mt-1">
            Set up and manage your Direct Debit payments
          </p>
        </div>

        <div className="space-y-6">
          <div className="bg-card p-6 rounded-xl shadow-xs border border-border">
            <h2 className="text-xl font-semibold mb-6">Payment Setup</h2>
            {showStatus ? (
              <DirectDebitStatus onCancelled={() => setShowStatus(false)} />
            ) : (
              <DirectDebitSetup onSuccess={() => setShowStatus(true)} />
            )}
          </div>
        </div>
      </main>
    </AppLayout>
  );
}

