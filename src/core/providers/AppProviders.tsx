/**
 * Application Providers
 * Centralized provider setup for the entire app
 */

import { QueryClientProvider } from "@tanstack/react-query";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";
import Cookies from "js-cookie";
import type { ReactNode } from "react";
import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { Toaster } from "react-hot-toast";
import { BrowserRouter as Router } from "react-router-dom";
import { AuthProvider, useAuth } from "../../features/auth";
import { ProfileService } from "../../features/profile/api/profileService";
import { getQueryClient } from "../../lib/react-query";
import CookieConsent from "../../shared/components/CookieConsent";
import { ErrorBoundary } from "../../shared/components/feedback";
import { ScrollToTop } from "@/shared/components/ScrollToTop";

interface AppProvidersProps {
  children: ReactNode;
}

interface PlanContextProps {
  planId: string;
  planName: string;
  aiGenQuizCount: number;
  allowed: number;
  renewal: string;
  loading: boolean;
  refresh: () => Promise<void>;
}

const PlanContext = createContext<PlanContextProps | undefined>(undefined);

export const usePlan = () => {
  const ctx = useContext(PlanContext);
  if (!ctx) throw new Error("usePlan must be used within PlanProvider");
  return ctx;
};

export const PlanProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [info, setInfo] = useState<null | {
    planId: string;
    planName: string;
    aiGenQuizCount: number;
    allowed: number;
    renewal: string;
  }>(null);

  const fetchPlan = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const p = await ProfileService.getProfile(user.id);
      // @ts-ignore for supabase result shape
      const planId: string = p?.plan_id || "free";
      // @ts-ignore
      const aiGenQuizCount: number = p?.ai_gen_quiz_count || 0;
      // @ts-ignore
      const renewal: string =
        typeof p?.plan_renewal_date === "string"
          ? p.plan_renewal_date
          : (p?.plan_renewal_date as Date | undefined)?.toISOString?.() ?? "";
      let allowed = 1,
        planName = "Free";
      if (planId === "pro") {
        allowed = 20;
        planName = "Pro";
      }
      setInfo({ planId, planName, aiGenQuizCount, allowed, renewal });
    } catch (e) {
      console.error("Failed to fetch plan info", e);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchPlan();
  }, [user]);

  return (
    <PlanContext.Provider
      value={{
        planId: info?.planId || "free",
        planName: info?.planName || "Free",
        aiGenQuizCount: info?.aiGenQuizCount || 0,
        allowed: info?.allowed || 1,
        renewal: info?.renewal || "",
        loading,
        refresh: fetchPlan,
      }}
    >
      {children}
    </PlanContext.Provider>
  );
};

export function AppProviders({ children }: AppProvidersProps) {
  const queryClient = getQueryClient();
  const hasConsent = Cookies.get("cookie-consent") === "accepted";

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <PlanProvider>
            <Router
              future={{
                v7_startTransition: true,
                v7_relativeSplatPath: true,
              }}
            >
              <ScrollToTop />
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
          </PlanProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default AppProviders;
