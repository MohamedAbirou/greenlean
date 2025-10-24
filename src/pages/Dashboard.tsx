import EnhancedWorkoutSection from "@/components/dashboard/EnhancedExerciseSection";
import { EnhancedMealPlanSection } from "@/components/dashboard/EnhancedMealPlanSection";
import { OverviewSection } from "@/components/dashboard/OverviewSection";
import { usePlatform } from "@/contexts/PlatformContext";
import { useAuth } from "@/contexts/useAuth";
import { useDashboardData } from "@/hooks/useDashboardData";
import { useLogManager } from "@/hooks/useLogManager";
import { useColorTheme } from "@/utils/colorUtils";
import {
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
} from "chart.js";
import { ArrowRight, Loader } from "lucide-react";
import React, { useState } from "react";

ChartJS.register(
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend
);

const Dashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const platform = usePlatform();
  const colorTheme = useColorTheme(platform.settings?.theme_color);
  const { user } = useAuth();

  const { healthProfile, healthCalculations, loading } = useDashboardData();

  const {
    activityLogs,
    dashboardStats,
    saving,
    error,
    addLog,
    updateLog,
    deleteLog,
  } = useLogManager();

  if (loading) {
    return (
      <div className="min-h-screen pt-24 pb-16 flex items-center justify-center">
        <Loader className={`h-8 w-8 animate-spin ${colorTheme.primaryText}`} />
      </div>
    );
  }

  if (!healthProfile || !healthCalculations) {
    return (
      <div className="min-h-screen pt-52 pb-16 bg-background">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">
            No Health Profile Found
          </h1>
          <p className="text-secondary-foreground mb-6">
            Please take the quiz to get your personalized recommendations.
          </p>
          <a
            href="/quiz"
            className={`inline-flex items-center px-6 py-3 ${colorTheme.primaryBg} text-white rounded-full hover:${colorTheme.primaryHover} transition-colors`}
          >
            Take the Quiz <ArrowRight className="ml-2 h-5 w-5" />
          </a>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "meal-plan", label: "Meal Plan" },
    { id: "exercise", label: "Exercise Plan" },
  ];

  return (
    <div className="min-h-screen pt-24 pb-16 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* <DailyTip colorTheme={colorTheme} /> */}

        <div className="bg-yellow-100 border-b border-yellow-300 text-yellow-900 text-sm text-center rounded-lg py-2">
          ⚠️ This dashboard is in <span className="font-bold">BETA</span> mode —
          results may not be final.
        </div>

        <div className="bg-card rounded-md shadow-md my-4">
          <div className="flex">
            {tabs.map((tab, index) => (
              <button
                key={tab.id}
                className={`px-4 py-3 md:px-6 text-sm md:text-base font-medium ${
                  index === 0 ? "rounded-l-md" : ""
                } ${
                  activeTab === tab.id
                    ? colorTheme.primaryBg + " text-white"
                    : "bg-card text-foreground hover:text-primary"
                }`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {activeTab === "overview" && (
          <OverviewSection
            healthProfile={healthProfile}
            healthCalculations={healthCalculations}
            colorTheme={colorTheme}
          />
        )}

        {activeTab === "meal-plan" && user && healthCalculations && (
          <EnhancedMealPlanSection
            userId={user.id}
            dailyCalories={healthCalculations.dailyCalorieTarget}
            macros={healthCalculations.macros}
            colorTheme={colorTheme}
          />
        )}

        {activeTab === "exercise" && user && (
          <EnhancedWorkoutSection userId={user.id} colorTheme={colorTheme} />
        )}
      </div>
    </div>
  );
};

export default Dashboard;
