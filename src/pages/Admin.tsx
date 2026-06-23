import { ShieldAlert } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { AdminRedemptionsPanel } from "@/features/admin/components/AdminRedemptionsPanel";

export default function Admin() {
  return (
    <AppLayout variant="solid">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12">
        <div className="mb-8 flex items-center gap-3">
          <ShieldAlert className="h-8 w-8 text-primary shrink-0" />
          <div>
            <h1 className="text-3xl font-bold">Admin Panel</h1>
            <p className="text-muted-foreground mt-0.5">Manage voucher redemption requests</p>
          </div>
        </div>
        <AdminRedemptionsPanel />
      </main>
    </AppLayout>
  );
}
