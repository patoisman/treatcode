import { useState } from "react";
import { Link } from "react-router-dom";
import { Loader2, Gift, Lock, CheckCircle } from "lucide-react";
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
import { useAuth } from "@/hooks/useAuth";

export default function ResetPassword() {
  const { resetPassword } = useAuth();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDone, setIsDone] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password.length < 8) {
      toast.error("Password too short", {
        description: "Your password must be at least 8 characters.",
      });
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords don't match", {
        description: "Please make sure both passwords are the same.",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      await resetPassword(password);
      setIsDone(true);
    } catch {
      toast.error("Failed to reset password", {
        description: "Your reset link may have expired. Please request a new one.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-background to-secondary flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Brand */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Gift className="h-12 w-12 text-primary mr-3" />
            <h1 className="text-4xl font-bold text-primary">Treatcode</h1>
          </div>
          <p className="text-muted-foreground">Your guilt-free spending stash</p>
        </div>

        <Card className="shadow-2xl border-0">
          {isDone ? (
            /* ── Success state ── */
            <CardContent className="pt-6">
              <div className="text-center space-y-4 py-4">
                <div className="mx-auto w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center">
                  <CheckCircle className="h-8 w-8 text-accent" />
                </div>
                <h2 className="text-xl font-semibold">Password updated</h2>
                <p className="text-muted-foreground text-sm">
                  Your password has been changed successfully.
                </p>
                <Button asChild className="w-full mt-4">
                  <Link to="/auth">Sign in with new password</Link>
                </Button>
              </div>
            </CardContent>
          ) : (
            /* ── Password form ── */
            <>
              <CardHeader className="space-y-1 text-center">
                <CardTitle className="text-2xl">Set new password</CardTitle>
                <CardDescription>
                  Choose a strong password for your account.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="password">New password</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type="password"
                        placeholder="At least 8 characters"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pl-10"
                        required
                        minLength={8}
                      />
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm new password</Label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        type="password"
                        placeholder="Repeat your new password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="pl-10"
                        required
                      />
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    </div>
                  </div>

                  <Button type="submit" className="w-full" disabled={isSubmitting}>
                    {isSubmitting && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Update Password
                  </Button>
                </form>

                <div className="mt-6 text-center">
                  <Link
                    to="/forgot-password"
                    className="text-sm text-primary hover:underline"
                  >
                    Request a new reset link
                  </Link>
                </div>
              </CardContent>
            </>
          )}
        </Card>
      </div>
    </div>
  );
}
