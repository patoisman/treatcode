import type { ReactNode } from "react";
import { Header } from "./Header";

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-linear-to-br from-background to-secondary">
      <Header />
      {children}
    </div>
  );
}
