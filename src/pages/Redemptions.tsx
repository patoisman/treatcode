import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AppLayout } from "@/components/layout/AppLayout";

// Brand catalog and redemption flow implemented in Phase 6
export default function Redemptions() {
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
        <h1 className="text-3xl font-bold mb-2">Redeem Vouchers</h1>
        <p className="text-muted-foreground mb-8">Browse brands and redeem your balance for gift vouchers</p>
        <p className="text-center text-muted-foreground py-12 text-sm">No brands available yet.</p>
      </main>
    </AppLayout>
  );
}
