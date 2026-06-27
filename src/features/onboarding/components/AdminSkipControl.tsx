import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Gift, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useProfile } from "@/features/auth/hooks/useProfile";
import { setAdminLanding, type AdminLanding } from "@/features/admin/lib/adminLanding";

/**
 * Admin-only "skip onboarding" affordance shown on the Onboarding page. Admins
 * don't need a funded wallet to operate the app, so they can leave setup at any
 * step. The choice (admin section vs customer dashboard) is remembered as their
 * default landing for next sign-in. Renders nothing for non-admins.
 */
export function AdminSkipControl() {
  const navigate = useNavigate();
  const { data: profile } = useProfile();
  const [open, setOpen] = useState(false);

  if (!profile?.is_admin) return null;

  const choose = (landing: AdminLanding) => {
    setAdminLanding(profile.id, landing);
    navigate(landing === "admin" ? "/admin" : "/dashboard", { replace: true });
  };

  return (
    <div className="text-center">
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
      >
        Skip for now
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>You're an admin</DialogTitle>
            <DialogDescription>
              You don't need a personal wallet to administer Treatcode. Where would you
              like to go? You can set up a wallet anytime from your dashboard.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="sm:justify-start">
            <Button onClick={() => choose("admin")}>
              <ShieldCheck className="mr-2 h-4 w-4" />
              Go to Admin
            </Button>
            <Button variant="outline" onClick={() => choose("dashboard")}>
              <Gift className="mr-2 h-4 w-4" />
              Browse Dashboard
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
