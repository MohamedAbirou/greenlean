/**
 * Application Providers
 * Centralized provider setup for the entire app
 */

import type { ReactNode } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter as Router } from "react-router-dom";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";
import { Toaster } from "react-hot-toast";
import Cookies from "js-cookie";
import { getQueryClient } from "../../lib/react-query";
import { AuthProvider } from "../../contexts/AuthContext";
import { PlatformProvider } from "../../contexts/PlatformContext";
import CookieConsent from "../../components/CookieConsent";
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
          <PlatformProvider>
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
          </PlatformProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default AppProviders;
