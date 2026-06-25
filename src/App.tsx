import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { lazy, Suspense, useEffect } from "react";
import { Toaster } from "@/components/ui/sonner";
import { ErrorBoundary } from "@/components/common/ErrorBoundary";
import { FullPageSpinner } from "@/components/common/FullPageSpinner";
import { ProtectedRoute } from "@/components/layout/ProtectedRoute";
import { AdminRoute } from "@/components/layout/AdminRoute";
import { SessionLockProvider } from "@/features/session-lock/SessionLockProvider";
import { supabase } from "@/lib/supabase";
import { isRecovering } from "@/features/auth/lib/recoveryLatch";

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
  const navigate = useNavigate();

  // Redirect to the reset-password page whenever a PASSWORD_RECOVERY session is
  // established, regardless of which page the user lands on. This handles the
  // case where the Supabase redirect URL sends the user to the site root instead
  // of /reset-password (e.g. due to an allowlist mismatch).
  useEffect(() => {
    // Covers the case where the event already fired before this effect ran.
    if (isRecovering()) navigate("/reset-password", { replace: true });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        navigate("/reset-password", { replace: true });
      }
    });
    return () => subscription.unsubscribe();
  }, [navigate]);

  return (
    <ErrorBoundary>
      <SessionLockProvider>
        <Routes>
          {/* Public — load silently, no Suspense fallback */}
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
          <Route
            path="/wallet/setup"
            element={<Navigate to="/onboarding" replace />}
          />
          {/* GoCardless redirect_uri — user completed the GC flow */}
          <Route
            path="/wallet/setup/callback"
            element={<WalletSetupCallback />}
          />

          {/* Protected — requires session + setup_complete */}
          <Route
            path="/dashboard"
            element={
              <Suspense fallback={<FullPageSpinner />}>
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              </Suspense>
            }
          />
          <Route
            path="/dashboard/deposits"
            element={
              <Suspense fallback={<FullPageSpinner />}>
                <ProtectedRoute>
                  <Deposits />
                </ProtectedRoute>
              </Suspense>
            }
          />
          <Route
            path="/dashboard/redemptions"
            element={
              <Suspense fallback={<FullPageSpinner />}>
                <ProtectedRoute>
                  <Redemptions />
                </ProtectedRoute>
              </Suspense>
            }
          />
          <Route
            path="/dashboard/direct-debit"
            element={
              <Suspense fallback={<FullPageSpinner />}>
                <ProtectedRoute>
                  <DirectDebit />
                </ProtectedRoute>
              </Suspense>
            }
          />

          {/* Protected — admin only */}
          <Route
            path="/admin"
            element={
              <Suspense fallback={<FullPageSpinner />}>
                <AdminRoute>
                  <Admin />
                </AdminRoute>
              </Suspense>
            }
          />

          {/* Catch-all */}
          <Route path="*" element={<NotFound />} />
        </Routes>
        <Toaster richColors />
      </SessionLockProvider>
    </ErrorBoundary>
  );
}
