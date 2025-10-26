/**
 * Dashboard Page (Refactored)
 * Clean, modular dashboard implementation
 */

import { useState } from "react";
import { useAuth } from "../features/auth";
import { usePlatform } from "../contexts/PlatformContext";
import { useColorTheme } from "../utils/colorUtils";
import {
  useDashboardData,
  DashboardTabs,
  DashboardEmpty,
  DashboardLoading,
  BetaBanner,
} from "../features/dashboard";
import type { DashboardTab } from "../features/dashboard";
import { DietPlanSection } from "../components/dashboard/DietPlanSection";
import { OverviewSection } from "../components/dashboard/OverviewSection";
import { WorkoutSection } from "../components/dashboard/WorkoutSection";

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<DashboardTab>("overview");
  const platform = usePlatform();
  const colorTheme = useColorTheme(platform.settings?.theme_color);
  const { user } = useAuth();

  const { data, isLoading } = useDashboardData(user?.id);

  const overviewData = data?.overviewData;
  const dietPlanData = data?.dietPlanData;
  const workoutPlanData = data?.workoutPlanData;
  const bmiStatus = data?.bmiStatus;

  if (isLoading) {
    return <DashboardLoading />;
  }

  if (!overviewData) {
    return <DashboardEmpty primaryBg={colorTheme.primaryBg} primaryHover={colorTheme.primaryHover} />;
  }

  const { answers, calculations } = overviewData;

  return (
    <div className="min-h-screen pt-24 pb-16 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <BetaBanner />

        <DashboardTabs
          activeTab={activeTab}
          onTabChange={setActiveTab}
          primaryBg={colorTheme.primaryBg}
        />

        {activeTab === "overview" && (
          <OverviewSection
            answers={answers}
            calculations={calculations}
            bmiStatus={bmiStatus!}
            colorTheme={colorTheme}
          />
        )}

        {activeTab === "meal-plan" && user && dietPlanData && (
          <DietPlanSection
            userId={user.id}
            dietPlan={dietPlanData}
            calculations={calculations}
          />
        )}

        {activeTab === "exercise" && user && workoutPlanData && (
          <WorkoutSection
            userId={user.id}
            workoutPlanData={workoutPlanData}
          />
        )}
      </div>
    </div>
  );
}
