import { useState } from "react";
import { Link } from "react-router-dom";
import { Loader2, Gift, Mail, ArrowLeft, CheckCircle } from "lucide-react";
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

export default function ForgotPassword() {
  const { sendPasswordResetEmail } = useAuth();
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEmailSent, setIsEmailSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await sendPasswordResetEmail(email);
      setIsEmailSent(true);
    } catch {
      toast.error("Failed to send reset email", {
        description: "Please check your email address and try again.",
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
          {isEmailSent ? (
            /* ── Confirmation state ── */
            <CardContent className="pt-6">
              <div className="text-center space-y-4 py-4">
                <div className="mx-auto w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center">
                  <CheckCircle className="h-8 w-8 text-accent" />
                </div>
                <h2 className="text-xl font-semibold">Check your email</h2>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  We've sent a password reset link to{" "}
                  <span className="font-medium text-foreground">{email}</span>.
                  It may take a few minutes to arrive.
                </p>
                <Button
                  variant="outline"
                  className="w-full mt-4"
                  onClick={() => setIsEmailSent(false)}
                >
                  Send again
                </Button>
              </div>
            </CardContent>
          ) : (
            /* ── Email form state ── */
            <>
              <CardHeader className="space-y-1 text-center">
                <CardTitle className="text-2xl">Reset your password</CardTitle>
                <CardDescription>
                  Enter your email and we'll send you a reset link.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <div className="relative">
                      <Input
                        id="email"
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10"
                        required
                      />
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    </div>
                  </div>

                  <Button type="submit" className="w-full" disabled={isSubmitting}>
                    {isSubmitting && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Send Reset Link
                  </Button>
                </form>

                <div className="mt-6 text-center">
                  <Link
                    to="/auth"
                    className="inline-flex items-center text-sm text-primary hover:underline"
                  >
                    <ArrowLeft className="mr-1 h-3 w-3" />
                    Back to sign in
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
