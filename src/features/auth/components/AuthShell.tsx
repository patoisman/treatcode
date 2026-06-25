import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { BrandMark } from "@/components/common/BrandMark";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface AuthShellProps {
  title?: string;
  description?: string;
  children: ReactNode;
}

/**
 * Shared chrome for the auth screens (sign in, sign up, password reset):
 * gradient background, a clickable wordmark that escapes back to the landing
 * page, and a card. Pass `title`/`description` to render the card header;
 * omit them when the child renders its own heading (e.g. a success notice).
 */
export function AuthShell({ title, description, children }: AuthShellProps) {
  return (
    <div className="min-h-screen bg-linear-to-br from-background to-secondary flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Link
          to="/"
          aria-label="Treatcode home"
          className="flex flex-col items-center mb-8 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <div className="flex items-center justify-center mb-4">
            <BrandMark className="h-12 w-12 mr-3" />
            <span className="text-4xl font-bold text-primary">Treatcode</span>
          </div>
          <p className="text-muted-foreground">Your guilt-free spending stash</p>
        </Link>

        <Card className="shadow-2xl border-0">
          {title && (
            <CardHeader className="space-y-1 text-center">
              <CardTitle className="text-2xl">{title}</CardTitle>
              {description && <CardDescription>{description}</CardDescription>}
            </CardHeader>
          )}
          <CardContent className={title ? undefined : "pt-6"}>{children}</CardContent>
        </Card>
      </div>
    </div>
  );
}
