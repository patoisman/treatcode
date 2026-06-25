import { useState } from "react";
import { Link } from "react-router-dom";
import { Loader2, Lock, Mail, User } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSignUp } from "../hooks/useSignUp";
import { GoogleSignInButton } from "./GoogleSignInButton";

interface RegisterFormProps {
  /** Called when sign up succeeds but the email still needs confirming. */
  onSignedUp: (email: string) => void;
}

export function RegisterForm({ onSignedUp }: RegisterFormProps) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const signUp = useSignUp();
  const isPending = signUp.isPending;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      toast.error("Full name required", { description: "Please enter your full name." });
      return;
    }
    try {
      const result = await signUp.mutateAsync({ email, password, fullName: fullName.trim() });
      // With email confirmation on, no session is returned — surface the
      // "check your email" notice. If a session exists (confirmation off),
      // the SignUp page redirects to the dashboard automatically.
      if (!result.session) {
        onSignedUp(email);
      }
    } catch (err) {
      toast.error("Sign up failed", {
        description: err instanceof Error ? err.message : "An unexpected error occurred.",
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="reg-name">Full Name</Label>
        <div className="relative">
          <Input id="reg-name" type="text" placeholder="Enter your full name"
            value={fullName} onChange={(e) => setFullName(e.target.value)}
            className="pl-10" required disabled={isPending} />
          <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="reg-email">Email</Label>
        <div className="relative">
          <Input id="reg-email" type="email" placeholder="Enter your email"
            value={email} onChange={(e) => setEmail(e.target.value)}
            className="pl-10" required disabled={isPending} />
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="reg-password">Password</Label>
        <div className="relative">
          <Input id="reg-password" type="password" placeholder="At least 8 characters"
            value={password} onChange={(e) => setPassword(e.target.value)}
            className="pl-10" required minLength={8} disabled={isPending} />
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        </div>
      </div>

      <Button type="submit" className="w-full" disabled={isPending}>
        {signUp.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Create Account
      </Button>

      <div className="relative my-2">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
        </div>
      </div>

      <GoogleSignInButton mode="signup" />

      <div className="text-center pt-2 text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link to="/signin" className="text-primary hover:underline">
          Sign in
        </Link>
      </div>
    </form>
  );
}
