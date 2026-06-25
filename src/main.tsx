import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/query-client";
// Eagerly subscribe the password-recovery latch before the auth client finishes
// initialising, so the transient PASSWORD_RECOVERY event is never missed by the
// lazy-loaded /reset-password route.
import "@/features/auth/lib/recoveryLatch";
import "./index.css";
import App from "./App.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </BrowserRouter>
  </StrictMode>
);
