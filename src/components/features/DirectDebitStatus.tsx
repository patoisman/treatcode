import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { CheckCircle2, XCircle, Loader2, Calendar, Coins } from "lucide-react";
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

function formatCurrency(pence: number) {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
  }).format(pence / 100);
}

function getOrdinalSuffix(day: number): string {
  if (day > 3 && day < 21) return "th";
  switch (day % 10) {
    case 1:
      return "st";
    case 2:
      return "nd";
    case 3:
      return "rd";
    default:
      return "th";
  }
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

  const handleCancel = async () => {
    setIsCancelling(true);
    await new Promise((r) => setTimeout(r, 1000));
    setIsCancelling(false);
    toast.success("Direct Debit cancelled", {
      description: "Your Direct Debit mandate has been cancelled.",
    });
    onCancelled?.();
  };

  const getStatusBadge = () => {
    if (settings.mandate_status === "active") {
      return (
        <Badge className="bg-green-500">
          <CheckCircle2 className="h-3 w-3 mr-1" />
          Active
        </Badge>
      );
    }
    if (settings.mandate_status === "pending") {
      return (
        <Badge className="bg-yellow-500">
          <Loader2 className="h-3 w-3 mr-1 animate-spin" />
          Pending
        </Badge>
      );
    }
    if (settings.mandate_status === "cancelled") {
      return (
        <Badge variant="destructive">
          <XCircle className="h-3 w-3 mr-1" />
          Cancelled
        </Badge>
      );
    }
    return <Badge variant="outline">Unknown</Badge>;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Coins className="h-5 w-5" />
            Direct Debit
          </CardTitle>
          {getStatusBadge()}
        </div>
        <CardDescription>Your monthly Treatcode deposits</CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Current Settings */}
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Monthly Amount</p>
            <p className="text-2xl font-bold">
              {formatCurrency(settings.monthly_amount)}
            </p>
          </div>

          <div className="space-y-1">
            <p className="text-sm text-muted-foreground flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              Collection Day
            </p>
            <p className="text-2xl font-bold">
              {settings.collection_day}
              {getOrdinalSuffix(settings.collection_day)}
            </p>
            <p className="text-xs text-muted-foreground">of each month</p>
          </div>
        </div>

        {/* Status Info */}
        {settings.mandate_status === "pending" && (
          <div className="p-4 rounded-lg bg-yellow-50 border border-yellow-200">
            <p className="text-sm font-medium text-yellow-900">
              Setup In Progress
            </p>
            <p className="text-xs text-yellow-700 mt-1">
              Please complete the GoCardless setup process to activate your
              Direct Debit
            </p>
          </div>
        )}

        {settings.mandate_status === "active" && (
          <div className="p-4 rounded-lg bg-green-50 border border-green-200">
            <p className="text-sm font-medium text-green-900">
              ✓ Direct Debit Active
            </p>
            <p className="text-xs text-green-700 mt-1">
              Your next deposit of {formatCurrency(settings.monthly_amount)} will
              be collected on the {settings.collection_day}
              {getOrdinalSuffix(settings.collection_day)}
            </p>
          </div>
        )}

        {/* Action Buttons */}
        {settings.mandate_status !== "cancelled" && (
          <div className="flex gap-2">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="outline"
                  className="flex-1"
                  disabled={isCancelling}
                >
                  Cancel Direct Debit
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Cancel Direct Debit?</AlertDialogTitle>
                  <AlertDialogDescription className="space-y-2">
                    <p>This will stop all future monthly deposits.</p>
                    <p className="font-medium">
                      Your current Treatcode balance will remain available.
                    </p>
                    <p>You can set up Direct Debit again at any time.</p>
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Keep Active</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleCancel}
                    className="bg-red-600 hover:bg-red-700"
                    disabled={isCancelling}
                  >
                    {isCancelling ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Cancelling...
                      </>
                    ) : (
                      "Yes, Cancel"
                    )}
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
