import { useState } from "react";
import { Navigate } from "react-router-dom";
import { Gift } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useSession } from "@/features/auth/hooks/useSession";
import { LoginForm } from "@/features/auth/components/LoginForm";
import { RegisterForm } from "@/features/auth/components/RegisterForm";

export default function Auth() {
  const { session, isLoading } = useSession();
  const [isLogin, setIsLogin] = useState(true);

  if (!isLoading && session) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-background to-secondary flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Gift className="h-12 w-12 text-primary mr-3" />
            <h1 className="text-4xl font-bold text-primary">Treatcode</h1>
          </div>
          <p className="text-muted-foreground">Your guilt-free spending stash</p>
        </div>

        <Card className="shadow-2xl border-0">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-2xl">
              {isLogin ? "Welcome back" : "Create account"}
            </CardTitle>
            <CardDescription>
              {isLogin
                ? "Sign in to access your account"
                : "Enter your details to get started"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLogin ? (
              <LoginForm onSwitchToRegister={() => setIsLogin(false)} />
            ) : (
              <RegisterForm onSwitchToLogin={() => setIsLogin(true)} />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
