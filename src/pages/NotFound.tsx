import { Link } from "react-router-dom";
import { Gift, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-linear-to-br from-background to-secondary flex items-center justify-center p-4">
      <div className="text-center space-y-6 max-w-md">
        <div className="flex items-center justify-center mb-2">
          <Gift className="h-12 w-12 text-primary" />
        </div>

        <div className="space-y-2">
          <h1 className="text-8xl font-bold text-primary">404</h1>
          <h2 className="text-2xl font-semibold text-foreground">
            Page not found
          </h2>
          <p className="text-muted-foreground">
            This page doesn't exist — but your Treatcodes do.
          </p>
        </div>

        <Button asChild>
          <Link to="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to home
          </Link>
        </Button>
      </div>
    </div>
  );
}
