import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { CreditCard, Calendar, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { DUMMY_DIRECT_DEBIT } from "@/data/dummy";
import type { DirectDebitSettings } from "@/types";

const MANDATE_STATUS_CONFIG: Record<
  DirectDebitSettings["mandate_status"],
  { label: string; className: string }
> = {
  active: {
    label: "Active",
    className: "bg-green-100 text-green-700 border-green-200",
  },
  pending: {
    label: "Pending",
    className: "bg-amber-100 text-amber-700 border-amber-200",
  },
  cancelled: {
    label: "Cancelled",
    className: "bg-gray-100 text-gray-600 border-gray-200",
  },
};

function formatCurrency(pence: number) {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
  }).format(pence / 100);
}

interface DirectDebitStatusProps {
  onCancelled?: () => void;
}

export function DirectDebitStatus({ onCancelled }: DirectDebitStatusProps) {
  const [isCancelling, setIsCancelling] = useState(false);

  const { data: settings, isLoading } = useQuery({
    queryKey: ["directDebitSettings"],
    queryFn: async (): Promise<DirectDebitSettings> => DUMMY_DIRECT_DEBIT,
  });

  if (isLoading || !settings) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  const statusCfg = MANDATE_STATUS_CONFIG[settings.mandate_status];

  const handleCancel = async () => {
    setIsCancelling(true);
    await new Promise((r) => setTimeout(r, 1000));
    setIsCancelling(false);
    toast.success("Direct Debit cancelled", {
      description: "Your Direct Debit mandate has been cancelled.",
    });
    onCancelled?.();
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Direct Debit
            </CardTitle>
            <CardDescription className="mt-1">
              Active since{" "}
              {format(new Date(settings.created_at), "d MMMM yyyy")}
            </CardDescription>
          </div>
          <Badge variant="outline" className={statusCfg.className}>
            {statusCfg.label}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Details */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 rounded-lg bg-secondary/30 space-y-1">
            <p className="text-xs text-muted-foreground uppercase tracking-wider">
              Monthly amount
            </p>
            <p className="text-2xl font-bold text-primary">
              {formatCurrency(settings.monthly_amount)}
            </p>
          </div>
          <div className="p-4 rounded-lg bg-secondary/30 space-y-1">
            <p className="text-xs text-muted-foreground uppercase tracking-wider flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              Collection day
            </p>
            <p className="text-2xl font-bold">
              {settings.collection_day}
              <span className="text-sm font-normal text-muted-foreground ml-1">
                of each month
              </span>
            </p>
          </div>
        </div>

        {/* Cancel */}
        {settings.mandate_status !== "cancelled" && (
          <div className="pt-2">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" className="text-destructive border-destructive/30 hover:bg-destructive/5 hover:text-destructive">
                  Cancel Direct Debit
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Cancel Direct Debit?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will cancel your monthly {formatCurrency(settings.monthly_amount)}{" "}
                    Direct Debit. No further collections will be made. Your
                    existing Treatcode balance will not be affected.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Keep Direct Debit</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleCancel}
                    className="bg-destructive text-white hover:bg-destructive/90"
                    disabled={isCancelling}
                  >
                    {isCancelling && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Yes, cancel it
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
