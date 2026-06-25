import { Link } from "react-router-dom";
import { Loader2, MailCheck } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useResendConfirmation } from "../hooks/useResendConfirmation";

interface CheckEmailNoticeProps {
  email: string;
}

export function CheckEmailNotice({ email }: CheckEmailNoticeProps) {
  const resend = useResendConfirmation();

  const handleResend = async () => {
    try {
      await resend.mutateAsync(email);
      toast.success("Confirmation email sent", {
        description: "Check your inbox again in a few minutes.",
      });
    } catch (err) {
      toast.error("Couldn't resend email", {
        description: err instanceof Error ? err.message : "Please try again shortly.",
      });
    }
  };

  return (
    <div className="text-center space-y-4 py-4">
      <div className="mx-auto w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center">
        <MailCheck className="h-8 w-8 text-accent" />
      </div>
      <h2 className="text-xl font-semibold">Confirm your email</h2>
      <p className="text-muted-foreground text-sm leading-relaxed">
        We've sent a confirmation link to{" "}
        <span className="font-medium text-foreground">{email}</span>. Click it to
        activate your account, then you'll be able to sign in.
      </p>
      <p className="text-xs text-muted-foreground">
        Didn't get it? Check your spam folder, or resend below.
      </p>

      <Button
        variant="outline"
        className="w-full"
        onClick={handleResend}
        disabled={resend.isPending}
      >
        {resend.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Resend confirmation email
      </Button>

      <div className="pt-2">
        <Link to="/signin" className="text-sm text-primary hover:underline">
          Back to sign in
        </Link>
      </div>
    </div>
  );
}
