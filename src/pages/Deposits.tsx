import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AppLayout } from "@/components/layout/AppLayout";

// Deposit history implemented in Phase 5
export default function Deposits() {
  const navigate = useNavigate();

  return (
    <AppLayout>
      <main className="container mx-auto px-4 pt-24 pb-12">
        <div className="mb-6">
          <Button variant="ghost" onClick={() => navigate("/dashboard")}
            className="pl-0 hover:bg-transparent text-primary hover:text-primary/80">
            <ArrowLeft className="mr-2 h-4 w-4" />Back to Dashboard
          </Button>
        </div>
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold mb-6">Deposit History</h2>
          <p className="text-center text-muted-foreground py-12 text-sm">No deposits yet.</p>
        </div>
      </main>
    </AppLayout>
  );
}
