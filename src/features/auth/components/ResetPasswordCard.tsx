import { useState } from "react";
import { Link } from "react-router-dom";
import { Loader2, Lock, CheckCircle, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useUpdatePassword } from "@/features/auth/hooks/useUpdatePassword";
import { useRecoveryGate } from "@/features/auth/hooks/useRecoveryGate";

export function ResetPasswordCard() {
  const updatePassword = useUpdatePassword();
  const { state: pageState, markDone } = useRecoveryGate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) {
      toast.error("Password too short", { description: "Must be at least 8 characters." });
      return;
    }
    if (password !== confirmPassword) {
      toast.error("Passwords don't match", { description: "Please make sure both passwords are the same." });
      return;
    }
    try {
      await updatePassword.mutateAsync(password);
      markDone();
    } catch (err) {
      toast.error("Password reset failed", {
        description: err instanceof Error ? err.message : "Your reset link may have expired.",
      });
    }
  };

  return (
    <Card className="shadow-2xl border-0">
      {pageState === "checking" && (
        <CardContent className="pt-6">
          <div className="flex flex-col items-center gap-4 py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-muted-foreground text-sm">Verifying reset link…</p>
          </div>
        </CardContent>
      )}

      {pageState === "invalid" && (
        <CardContent className="pt-6">
          <div className="text-center space-y-4 py-4">
            <div className="mx-auto w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center">
              <AlertCircle className="h-8 w-8 text-destructive" />
            </div>
            <h2 className="text-xl font-semibold">Link invalid or expired</h2>
            <p className="text-muted-foreground text-sm leading-relaxed">
              This reset link has expired or already been used. Request a new one below.
            </p>
            <Button asChild className="w-full mt-4">
              <Link to="/forgot-password">Request new reset link</Link>
            </Button>
          </div>
        </CardContent>
      )}

      {pageState === "done" && (
        <CardContent className="pt-6">
          <div className="text-center space-y-4 py-4">
            <div className="mx-auto w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center">
              <CheckCircle className="h-8 w-8 text-accent" />
            </div>
            <h2 className="text-xl font-semibold">Password updated</h2>
            <p className="text-muted-foreground text-sm">Your password has been changed successfully.</p>
            <Button asChild className="w-full mt-4">
              <Link to="/dashboard">Go to dashboard</Link>
            </Button>
          </div>
        </CardContent>
      )}

      {pageState === "ready" && (
        <>
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-2xl">Set new password</CardTitle>
            <CardDescription>Choose a strong password for your account.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">New password</Label>
                <div className="relative">
                  <Input id="password" type="password" placeholder="At least 8 characters"
                    value={password} onChange={(e) => setPassword(e.target.value)}
                    className="pl-10" required minLength={8} disabled={updatePassword.isPending} />
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm new password</Label>
                <div className="relative">
                  <Input id="confirmPassword" type="password" placeholder="Repeat your new password"
                    value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pl-10" required disabled={updatePassword.isPending} />
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={updatePassword.isPending}>
                {updatePassword.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Update Password
              </Button>
            </form>
            <div className="mt-6 text-center">
              <Link to="/forgot-password" className="text-sm text-primary hover:underline">
                Request a new reset link
              </Link>
            </div>
          </CardContent>
        </>
      )}
    </Card>
  );
}
