/**
 * Dashboard Tabs Component
 * Tab navigation for dashboard sections
 */

import { usePlan } from "@/core/providers/AppProviders";
import { ModalDialog } from "@/shared/components/ui/modal-dialog";
import { triggerStripeCheckout } from "@/shared/hooks/useStripe";
import type { DashboardTab } from "@/shared/types/dashboard";
import { useState } from "react";

interface DashboardTabsProps {
  activeTab: DashboardTab;
  onTabChange: (tab: DashboardTab) => void;
  primaryBg?: string;
  userId: string;
}

export function DashboardTabs({
  activeTab,
  onTabChange,
  primaryBg = "bg-primary",
  userId,
}: DashboardTabsProps) {
  const tabs: Array<{ id: DashboardTab; label: string }> = [
    { id: "overview", label: "Overview" },
    { id: "meal-plan", label: "Meal Plan" },
    { id: "exercise", label: "Exercise Plan" },
  ];

  const { planName, aiGenQuizCount, allowed, planId, renewal } = usePlan();
  const [showUpgrade, setShowUpgrade] = useState(false);

  return (
    <div className="bg-card rounded-md shadow-md my-4">
      <div className="flex flex-col sm:flex-row gap-2 items-center justify-between">
        <div>
          {tabs.map((tab, index) => (
            <button
              key={tab.id}
              className={`px-4 py-3 md:px-6 text-sm md:text-base font-medium ${
                index === 0 ? "rounded-l-md" : ""
              } ${
                activeTab === tab.id
                  ? `${primaryBg} text-white`
                  : "bg-card text-foreground hover:text-primary"
              }`}
              onClick={() => onTabChange(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Plan usage bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between">
          <span
            className={
              "inline-flex items-center px-2 py-1 rounded bg-muted text-xs text-muted-foreground font-semibold w-fit border border-muted-foreground/30 gap-2 " +
              (planId === "free"
                ? "bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/40 dark:text-yellow-200"
                : "badge-green")
            }
          >
            {planName} plan
            <span className="ml-1">
              {aiGenQuizCount}/{allowed} AI plans this period
            </span>
            <span className="ml-2 text-xs text-muted-foreground">(Resets: {renewal || "-"})</span>
          </span>
          {planId === "free" && (
            <button
              className="rounded bg-primary px-3.5 py-1 text-white font-semibold shadow hover:bg-primary/90 text-xs transition mt-2 sm:mt-0"
              onClick={() => setShowUpgrade(true)}
            >
              Upgrade
            </button>
          )}
        </div>
      </div>

      <ModalDialog
        open={showUpgrade}
        onOpenChange={setShowUpgrade}
        title="Upgrade for More AI Plans"
        description="Unlock up to 50 quizzes + plans/month. Cancel anytime."
        size="md"
      >
        <div className="space-y-4 text-center">
          <div className="p-4 bg-muted rounded-lg">
            <p className="font-semibold">
              Your current plan:{" "}
              <span className="inline-block px-2 rounded-full text-white bg-primary text-xs">
                {planName}
              </span>
            </p>
            <span className="text-foreground text-sm">
              {aiGenQuizCount}/{allowed} used this period.
            </span>
          </div>
          <button
            onClick={() => triggerStripeCheckout(userId)}
            className="mt-2 w-full rounded bg-primary hover:bg-primary/90 text-white px-4 py-2 font-semibold text-base transition"
          >
            Upgrade Now
          </button>
          <p className="text-xs mt-2 text-muted-foreground">Billing handled securely via Stripe.</p>
        </div>
      </ModalDialog>
    </div>
  );
}
