import { useState } from "react";
import { Loader2, Lock } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useReauthPassword } from "../hooks/useReauthPassword";

interface PasswordReauthFormProps {
  email: string;
  onUnlock: () => void;
}

export function PasswordReauthForm({ email, onUnlock }: PasswordReauthFormProps) {
  const [password, setPassword] = useState("");
  const reauth = useReauthPassword();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await reauth.mutateAsync({ email, password });
      onUnlock();
    } catch (err) {
      toast.error("Couldn't unlock", {
        description:
          err instanceof Error ? err.message : "Incorrect password. Try again.",
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="space-y-2">
        <Label htmlFor="reauth-password">Password</Label>
        <div className="relative">
          <Input
            id="reauth-password"
            type="password"
            autoFocus
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="pl-10"
            required
            disabled={reauth.isPending}
          />
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        </div>
      </div>
      <Button type="submit" className="w-full" disabled={reauth.isPending}>
        {reauth.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Unlock
      </Button>
    </form>
  );
}
