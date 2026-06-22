import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Loader2,
  ShieldAlert,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AppLayout } from "@/components/layout/AppLayout";
import { useAuth } from "@/hooks/useAuth";
import { DUMMY_ALL_REDEMPTIONS } from "@/data/dummy";
import type { Redemption } from "@/types";

type StatusFilter = "pending" | "fulfilled" | "cancelled" | "all";

const STATUS_CONFIG: Record<
  Redemption["status"],
  { label: string; className: string }
> = {
  pending: {
    label: "Pending",
    className: "bg-amber-100 text-amber-800 border-amber-200",
  },
  fulfilled: {
    label: "Fulfilled",
    className: "bg-green-100 text-green-800 border-green-200",
  },
  cancelled: {
    label: "Cancelled",
    className: "bg-gray-100 text-gray-700 border-gray-200",
  },
};

function formatCurrency(pence: number) {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
  }).format(pence / 100);
}

export default function Admin() {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [activeFilter, setActiveFilter] = useState<StatusFilter>("pending");

  // Fulfill dialog state
  const [fulfillTarget, setFulfillTarget] = useState<Redemption | null>(null);
  const [voucherCode, setVoucherCode] = useState("");
  const [voucherInstructions, setVoucherInstructions] = useState("");
  const [adminNotes, setAdminNotes] = useState("");
  const [isFulfilling, setIsFulfilling] = useState(false);

  // Cancel dialog state
  const [cancelTarget, setCancelTarget] = useState<Redemption | null>(null);
  const [cancellationReason, setCancellationReason] = useState("");
  const [isCancelling, setIsCancelling] = useState(false);

  // Non-admin guard
  useEffect(() => {
    if (!isLoading && user && !user.is_admin) {
      navigate("/dashboard", { replace: true });
    }
  }, [user, isLoading, navigate]);

  const { data: redemptions = [], isLoading: isDataLoading } = useQuery({
    queryKey: ["admin", "redemptions"],
    queryFn: async (): Promise<Redemption[]> => {
      await new Promise((r) => setTimeout(r, 400));
      return DUMMY_ALL_REDEMPTIONS;
    },
    enabled: !!user?.is_admin,
  });

  const counts = {
    all: redemptions.length,
    pending: redemptions.filter((r) => r.status === "pending").length,
    fulfilled: redemptions.filter((r) => r.status === "fulfilled").length,
    cancelled: redemptions.filter((r) => r.status === "cancelled").length,
  };

  const filtered =
    activeFilter === "all"
      ? redemptions
      : redemptions.filter((r) => r.status === activeFilter);

  // -- Fulfill handler --
  const closeFulfillDialog = () => {
    setFulfillTarget(null);
    setVoucherCode("");
    setVoucherInstructions("");
    setAdminNotes("");
  };

  const handleFulfill = async () => {
    if (!fulfillTarget || !voucherCode.trim()) return;
    setIsFulfilling(true);
    await new Promise((r) => setTimeout(r, 1200));

    // Update React Query cache directly (mock); real app: mutate + invalidate
    queryClient.setQueryData(
      ["admin", "redemptions"],
      (old: Redemption[] | undefined) =>
        old?.map((r) =>
          r.id === fulfillTarget.id
            ? {
                ...r,
                status: "fulfilled" as const,
                voucher_code: voucherCode.trim(),
                voucher_instructions: voucherInstructions.trim() || null,
                admin_notes: adminNotes.trim() || null,
                fulfilled_at: new Date().toISOString(),
              }
            : r,
        ) ?? [],
    );

    toast.success("Voucher fulfilled", {
      description: `${fulfillTarget.brand_name} voucher sent to ${fulfillTarget.user_email ?? "user"}.`,
    });

    setIsFulfilling(false);
    closeFulfillDialog();
  };

  // -- Cancel handler --
  const closeCancelDialog = () => {
    setCancelTarget(null);
    setCancellationReason("");
  };

  const handleCancel = async () => {
    if (!cancelTarget) return;
    setIsCancelling(true);
    await new Promise((r) => setTimeout(r, 800));

    queryClient.setQueryData(
      ["admin", "redemptions"],
      (old: Redemption[] | undefined) =>
        old?.map((r) =>
          r.id === cancelTarget.id
            ? {
                ...r,
                status: "cancelled" as const,
                cancellation_reason: cancellationReason.trim() || null,
                cancelled_at: new Date().toISOString(),
              }
            : r,
        ) ?? [],
    );

    toast.success("Redemption cancelled", {
      description: `${formatCurrency(cancelTarget.amount)} will be returned to the user's balance.`,
    });

    setIsCancelling(false);
    closeCancelDialog();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user?.is_admin) return null;

  return (
    <AppLayout variant="solid">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12">
        {/* Page header */}
        <div className="mb-8 flex items-center gap-3">
          <ShieldAlert className="h-8 w-8 text-primary shrink-0" />
          <div>
            <h1 className="text-3xl font-bold">Admin Panel</h1>
            <p className="text-muted-foreground mt-0.5">
              Manage voucher redemption requests
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {(["all", "pending", "fulfilled", "cancelled"] as const).map(
            (key) => (
              <Card key={key} className="shadow-xs border border-border/50">
                <CardContent className="pt-4 pb-4">
                  <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">
                    {key.charAt(0).toUpperCase() + key.slice(1)}
                  </p>
                  <p className="text-2xl font-bold">{counts[key]}</p>
                </CardContent>
              </Card>
            ),
          )}
        </div>

        {/* Table card */}
        <Card className="shadow-xs border border-border/50">
          <CardHeader className="pb-2">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <CardTitle>Redemption Requests</CardTitle>
              <Tabs
                value={activeFilter}
                onValueChange={(v) => setActiveFilter(v as StatusFilter)}
              >
                <TabsList>
                  <TabsTrigger value="pending">
                    Pending ({counts.pending})
                  </TabsTrigger>
                  <TabsTrigger value="fulfilled">
                    Fulfilled ({counts.fulfilled})
                  </TabsTrigger>
                  <TabsTrigger value="cancelled">
                    Cancelled ({counts.cancelled})
                  </TabsTrigger>
                  <TabsTrigger value="all">All ({counts.all})</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </CardHeader>
          <CardContent>
            {isDataLoading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground">
                No {activeFilter !== "all" ? activeFilter + " " : ""}
                redemptions found.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Requested</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Brand</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((r) => {
                    const cfg = STATUS_CONFIG[r.status];
                    return (
                      <TableRow key={r.id}>
                        <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                          {format(new Date(r.created_at), "dd MMM yyyy")}
                        </TableCell>
                        <TableCell className="text-sm">
                          {r.user_email ?? "—"}
                        </TableCell>
                        <TableCell className="font-medium">
                          {r.brand_name}
                        </TableCell>
                        <TableCell className="font-semibold text-primary">
                          {formatCurrency(r.amount)}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={cfg.className}>
                            {cfg.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          {r.status === "pending" ? (
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                size="sm"
                                onClick={() => setFulfillTarget(r)}
                              >
                                <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" />
                                Fulfill
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-destructive border-destructive/40 hover:bg-destructive/10 hover:text-destructive"
                                onClick={() => setCancelTarget(r)}
                              >
                                <XCircle className="h-3.5 w-3.5 mr-1.5" />
                                Cancel
                              </Button>
                            </div>
                          ) : r.status === "fulfilled" ? (
                            <p className="text-xs text-muted-foreground">
                              {r.fulfilled_at
                                ? format(new Date(r.fulfilled_at), "dd MMM yyyy")
                                : "—"}
                            </p>
                          ) : (
                            <p className="text-xs text-muted-foreground">
                              {r.cancelled_at
                                ? format(
                                    new Date(r.cancelled_at),
                                    "dd MMM yyyy",
                                  )
                                : "—"}
                            </p>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </main>

      {/* Fulfill Dialog */}
      <Dialog
        open={!!fulfillTarget}
        onOpenChange={(open) => {
          if (!open) closeFulfillDialog();
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Fulfill Redemption</DialogTitle>
            {fulfillTarget && (
              <DialogDescription>
                {fulfillTarget.brand_name} — {formatCurrency(fulfillTarget.amount)}{" "}
                for {fulfillTarget.user_email ?? "user"}
              </DialogDescription>
            )}
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="voucher-code">
                Voucher Code{" "}
                <span className="text-destructive" aria-hidden="true">
                  *
                </span>
              </Label>
              <Input
                id="voucher-code"
                placeholder="e.g. ASOS-X72K-MN94"
                value={voucherCode}
                onChange={(e) => setVoucherCode(e.target.value)}
                className="font-mono tracking-wider"
                autoComplete="off"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="voucher-instructions">
                Redemption Instructions{" "}
                <span className="text-muted-foreground font-normal text-xs">
                  — optional, sent to user
                </span>
              </Label>
              <Textarea
                id="voucher-instructions"
                placeholder="e.g. Enter the code at checkout on asos.com"
                value={voucherInstructions}
                onChange={(e) => setVoucherInstructions(e.target.value)}
                rows={3}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="admin-notes">
                Admin Notes{" "}
                <span className="text-muted-foreground font-normal text-xs">
                  — optional, internal only
                </span>
              </Label>
              <Textarea
                id="admin-notes"
                placeholder="Internal notes about this fulfilment"
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                rows={2}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={closeFulfillDialog}
              disabled={isFulfilling}
            >
              Cancel
            </Button>
            <Button
              onClick={handleFulfill}
              disabled={!voucherCode.trim() || isFulfilling}
            >
              {isFulfilling ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Fulfilling…
                </>
              ) : (
                "Fulfil & Notify User"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cancel AlertDialog */}
      <AlertDialog
        open={!!cancelTarget}
        onOpenChange={(open) => {
          if (!open) closeCancelDialog();
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Redemption Request</AlertDialogTitle>
            <AlertDialogDescription>
              {cancelTarget && (
                <>
                  Cancel the {cancelTarget.brand_name} voucher request for{" "}
                  {cancelTarget.user_email ?? "this user"}? The full{" "}
                  {formatCurrency(cancelTarget.amount)} will be returned to
                  their balance.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="space-y-1.5 px-6 pb-2">
            <Label htmlFor="cancel-reason">
              Cancellation reason{" "}
              <span className="text-muted-foreground font-normal text-xs">
                — optional
              </span>
            </Label>
            <Input
              id="cancel-reason"
              placeholder="e.g. Voucher temporarily unavailable"
              value={cancellationReason}
              onChange={(e) => setCancellationReason(e.target.value)}
            />
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel disabled={isCancelling}>Keep</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleCancel();
              }}
              className="bg-destructive text-white hover:bg-destructive/90"
              disabled={isCancelling}
            >
              {isCancelling ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Cancelling…
                </>
              ) : (
                "Yes, Cancel Request"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppLayout>
  );
}
