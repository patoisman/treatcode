import type { ReactNode } from "react";
import { Header } from "./Header";

interface AppLayoutProps {
  children: ReactNode;
  variant?: "gradient" | "solid";
}

export function AppLayout({ children, variant = "gradient" }: AppLayoutProps) {
  const bgClass =
    variant === "gradient"
      ? "bg-linear-to-br from-background to-secondary"
      : "bg-slate-50 dark:bg-background";
  return (
    <div className={`min-h-screen ${bgClass}`}>
      <Header />
      {children}
    </div>
  );
}

