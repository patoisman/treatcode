import { Routes, Route, Navigate } from "react-router-dom";
import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/sonner";
import { ErrorBoundary } from "@/components/common/ErrorBoundary";
import { FullPageSpinner } from "@/components/common/FullPageSpinner";
import { ProtectedRoute } from "@/components/layout/ProtectedRoute";
import { AdminRoute } from "@/components/layout/AdminRoute";

const Index = lazy(() => import("@/pages/Index"));
const Auth = lazy(() => import("@/pages/Auth"));
const ForgotPassword = lazy(() => import("@/pages/ForgotPassword"));
const ResetPassword = lazy(() => import("@/pages/ResetPassword"));
const Onboarding = lazy(() => import("@/pages/Onboarding"));
const WalletSetupCallback = lazy(() => import("@/pages/WalletSetupCallback"));
const Dashboard = lazy(() => import("@/pages/Dashboard"));
const Deposits = lazy(() => import("@/pages/Deposits"));
const Redemptions = lazy(() => import("@/pages/Redemptions"));
const DirectDebit = lazy(() => import("@/pages/DirectDebit"));
const Admin = lazy(() => import("@/pages/Admin"));
const NotFound = lazy(() => import("@/pages/NotFound"));

export default function App() {
  return (
    <ErrorBoundary>
      <Suspense fallback={<FullPageSpinner />}>
        <Routes>
          {/* Public */}
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          {/* Onboarding — accessible to authenticated users at any onboarding step */}
          <Route path="/onboarding" element={<Onboarding />} />
          {/* GoCardless exit_uri — user cancelled the GC flow */}
          <Route path="/wallet/setup" element={<Navigate to="/onboarding" replace />} />
          {/* GoCardless redirect_uri — user completed the GC flow */}
          <Route path="/wallet/setup/callback" element={<WalletSetupCallback />} />

          {/* Protected — requires session + setup_complete */}
          <Route
            path="/dashboard"
            element={<ProtectedRoute><Dashboard /></ProtectedRoute>}
          />
          <Route
            path="/dashboard/deposits"
            element={<ProtectedRoute><Deposits /></ProtectedRoute>}
          />
          <Route
            path="/dashboard/redemptions"
            element={<ProtectedRoute><Redemptions /></ProtectedRoute>}
          />
          <Route
            path="/dashboard/direct-debit"
            element={<ProtectedRoute><DirectDebit /></ProtectedRoute>}
          />

          {/* Protected — admin only */}
          <Route
            path="/admin"
            element={<AdminRoute><Admin /></AdminRoute>}
          />

          {/* Catch-all */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
      <Toaster richColors />
    </ErrorBoundary>
  );
}
