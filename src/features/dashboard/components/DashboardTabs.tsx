/**
 * Dashboard Tabs Component
 * Tab navigation for dashboard sections
 */

import { usePlan } from "@/core/providers/AppProviders";
import { UpgradeModal } from "@/shared/components/feedback/UpgradeModal";
import type { DashboardTab } from "@/shared/types/dashboard";
import { BarChart3, Dumbbell, Home, Utensils, type LucideIcon } from "lucide-react";
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
  userId,
}: DashboardTabsProps) {
  const tabs: Array<{ id: DashboardTab; label: string; icon: LucideIcon }> = [
    { id: "overview", label: "Overview", icon: Home },
    { id: "meal-plan", label: "Meal Plan", icon: Utensils },
    { id: "exercise", label: "Exercise Plan", icon: Dumbbell },
    { id: "stats", label: "Stats", icon: BarChart3 },
  ];

  const { planName, aiGenQuizCount, allowed, planId, renewal } = usePlan();
  const [showUpgrade, setShowUpgrade] = useState(false);

  return (
    <div className="bg-card rounded-md shadow-md my-4">
      <div className="flex flex-col sm:flex-row gap-2 items-center justify-between">
      <div aria-label="Tabs">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`
                  group inline-flex items-center gap-2 py-4 px-3 border-b-2 font-medium text-sm cursor-pointer transition-colors
                  ${
                    isActive
                      ? `border-primary text-primary`
                      : `border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300`
                  }
                `}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-primary' : 'text-gray-400 group-hover:text-gray-500'}`} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Plan usage bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between">
          <span
            className={
              "inline-flex items-center px-2 py-1 rounded bg-muted text-xs text-muted-foreground font-semibold w-fit border border-muted-foreground/30 gap-2 " +
              (planId === "free" ? "badge-yellow" : "badge-purple")
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
