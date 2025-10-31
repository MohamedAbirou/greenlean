/**
 * Dashboard Tabs Component
 * Tab navigation for dashboard sections
 */

import { usePlan } from "@/core/providers/AppProviders";
import { UpgradeModal } from "@/shared/components/feedback/UpgradeModal";
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
                ? "badge-yellow"
                : "badge-purple")
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
              className="rounded bg-primary px-3.5 py-1 my-2 sm:my-0 sm:mx-2 text-white font-semibold shadow hover:bg-primary/90 text-xs transition mt-2 sm:mt-0"
              onClick={() => setShowUpgrade(true)}
            >
              Upgrade
            </button>
          )}
        </div>
      </div>
      <UpgradeModal
        showUpgradeModal={showUpgrade}
        setShowUpgradeModal={setShowUpgrade}
        userId={userId}
      />
    </div>
  );
}
