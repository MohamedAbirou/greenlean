/**
 * Dashboard Page (Refactored)
 * Clean, modular dashboard implementation
 */

import type { DashboardTab } from "@/shared/types/dashboard";
import { useState } from "react";
import { useAuth } from "../features/auth";
import {
  BetaBanner,
  DashboardEmpty,
  DashboardLoading,
  DashboardTabs,
  useDashboardData,
} from "../features/dashboard";
import { DietPlanSection } from "../features/dashboard/components/sections/DietPlanSection";
import { OverviewSection } from "../features/dashboard/components/sections/OverviewSection";
import { WorkoutSection } from "../features/dashboard/components/sections/WorkoutSection";

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<DashboardTab>("overview");
  const { user } = useAuth();

  const { data, isLoading } = useDashboardData(user?.id);

  const overviewData = data?.overviewData;
  const bmiStatus = data?.bmiStatus;

  if (isLoading) {
    return <DashboardLoading />;
  }

  if (!overviewData) {
    return <DashboardEmpty primaryBg="bg-primary" primaryHover="bg-primary/90" />;
  }

  const { answers, calculations } = overviewData;

  return (
    <div className="min-h-screen pt-24 pb-16 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <BetaBanner />

        <DashboardTabs activeTab={activeTab} onTabChange={setActiveTab} primaryBg="bg-primary" />

        {activeTab === "overview" && (
          <OverviewSection answers={answers} calculations={calculations} bmiStatus={bmiStatus!} />
        )}

        {activeTab === "meal-plan" && user && (
          <DietPlanSection userId={user.id} calculations={calculations} />
        )}

        {activeTab === "exercise" && user && <WorkoutSection userId={user.id} />}
      </div>
    </div>
  );
}
