/**
 * Dashboard Tabs Component
 * Tab navigation for dashboard sections
 */

import type { DashboardTab } from "../types";

interface DashboardTabsProps {
  activeTab: DashboardTab;
  onTabChange: (tab: DashboardTab) => void;
  primaryBg?: string;
}

export function DashboardTabs({ activeTab, onTabChange, primaryBg = "bg-primary" }: DashboardTabsProps) {
  const tabs: Array<{ id: DashboardTab; label: string }> = [
    { id: "overview", label: "Overview" },
    { id: "meal-plan", label: "Meal Plan" },
    { id: "exercise", label: "Exercise Plan" },
  ];

  return (
    <div className="bg-card rounded-md shadow-md my-4">
      <div className="flex">
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
    </div>
  );
}
