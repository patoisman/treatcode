import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AppLayout } from "@/components/layout/AppLayout";
import { BrandCatalog } from "@/features/vouchers/components/BrandCatalog";
import { RedemptionHistory } from "@/features/vouchers/components/RedemptionHistory";

export default function Redemptions() {
  const navigate = useNavigate();

  return (
    <AppLayout variant="solid">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12">
        <div className="mb-8">
          <Button variant="ghost" onClick={() => navigate("/dashboard")}
            className="pl-0 hover:bg-transparent text-primary hover:text-primary/80">
            <ArrowLeft className="mr-2 h-4 w-4" />Back to Dashboard
          </Button>
          <h1 className="text-3xl font-bold mt-4">Redeem Vouchers</h1>
          <p className="text-muted-foreground mt-1">
            Browse brands and redeem your balance for gift vouchers
          </p>
        </div>

        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">Brands</h2>
          <BrandCatalog />
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">Your redemptions</h2>
          <RedemptionHistory />
        </section>
      </main>
    </AppLayout>
  );
}
