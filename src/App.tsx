import { Routes, Route } from "react-router-dom";
import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/sonner";
import { ProtectedRoute } from "@/components/layout/ProtectedRoute";

const Index = lazy(() => import("@/pages/Index"));
const Auth = lazy(() => import("@/pages/Auth"));
const ForgotPassword = lazy(() => import("@/pages/ForgotPassword"));
const ResetPassword = lazy(() => import("@/pages/ResetPassword"));
const Dashboard = lazy(() => import("@/pages/Dashboard"));
const Deposits = lazy(() => import("@/pages/Deposits"));
const Redemptions = lazy(() => import("@/pages/Redemptions"));
const DirectDebit = lazy(() => import("@/pages/DirectDebit"));
const Admin = lazy(() => import("@/pages/Admin"));
const NotFound = lazy(() => import("@/pages/NotFound"));

export default function App() {
  return (
    <>
      <Suspense fallback={null}>
        <Routes>
          {/* Public */}
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          {/* Protected — dashboard */}
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

          {/* Protected — admin */}
          <Route
            path="/admin"
            element={<ProtectedRoute><Admin /></ProtectedRoute>}
          />

          {/* Catch-all */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
      <Toaster richColors />
    </>
  );
}
