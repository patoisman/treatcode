import { Routes, Route, Navigate } from "react-router-dom";
import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/sonner";
import { ErrorBoundary } from "@/components/common/ErrorBoundary";
import { FullPageSpinner } from "@/components/common/FullPageSpinner";
import { ProtectedRoute } from "@/components/layout/ProtectedRoute";
import { AdminRoute } from "@/components/layout/AdminRoute";
import { SessionLockProvider } from "@/features/session-lock/SessionLockProvider";

const Index = lazy(() => import("@/pages/Index"));
const SignIn = lazy(() => import("@/pages/SignIn"));
const SignUp = lazy(() => import("@/pages/SignUp"));
const ForgotPassword = lazy(() => import("@/pages/ForgotPassword"));
const ResetPassword = lazy(() => import("@/pages/ResetPassword"));
const Privacy = lazy(() => import("@/pages/Privacy"));
const Terms = lazy(() => import("@/pages/Terms"));
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
      <SessionLockProvider>
        <Suspense fallback={<FullPageSpinner />}>
          <Routes>
          {/* Public */}
          <Route path="/" element={<Index />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />
          {/* Legacy combined route — keep links/bookmarks working */}
          <Route path="/auth" element={<Navigate to="/signin" replace />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />

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
      </SessionLockProvider>
    </ErrorBoundary>
  );
}
