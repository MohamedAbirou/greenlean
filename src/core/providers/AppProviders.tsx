/**
 * Application Providers
 * Centralized provider setup for the entire app
 */

import { QueryClientProvider } from "@tanstack/react-query";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";
import Cookies from "js-cookie";
import type { ReactNode } from "react";
import { Toaster } from "react-hot-toast";
import { BrowserRouter as Router } from "react-router-dom";
import CookieConsent from "../../shared/components/CookieConsent";
import { AuthProvider } from "../../features/auth";
import { getQueryClient } from "../../lib/react-query";
import { ErrorBoundary } from "../../shared/components/feedback";

interface AppProvidersProps {
  children: ReactNode;
}

export function AppProviders({ children }: AppProvidersProps) {
  const queryClient = getQueryClient();
  const hasConsent = Cookies.get("cookie-consent") === "accepted";

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <Router
            future={{
              v7_startTransition: true,
              v7_relativeSplatPath: true,
            }}
          >
            {children}

            {hasConsent && <Analytics />}
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: "var(--card)",
                  color: "var(--card-foreground)",
                  border: "1px solid var(--border)",
                },
                success: {
                  iconTheme: {
                    primary: "var(--green-500)",
                    secondary: "white",
                  },
                },
              }}
            />
            <SpeedInsights />
            <CookieConsent />
          </Router>
        </AuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default AppProviders;
