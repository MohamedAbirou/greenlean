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
import DailyTip from "../components/DailyTip";
import { ExerciseSection } from "../components/dashboard/ExerciseSection";
import { MealPlanSection } from "../components/dashboard/MealPlanSection";
import { OverviewSection } from "../components/dashboard/OverviewSection";
import { ProgressSection } from "../components/dashboard/ProgressSection";
import { usePlatform } from "../contexts/PlatformContext";
import { useDashboardData } from "../hooks/useDashboardData";
import { useLogManager } from "../hooks/useLogManager";
import { useColorTheme } from "../utils/colorUtils";

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

  const { healthProfile, healthCalculations, mealPlan, loading } =
    useDashboardData();

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
      <div className="min-h-screen pt-24 pb-16 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
            No Health Profile Found
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
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
    { id: "progress", label: "Progress" },
  ];

  return (
    <div className="min-h-screen pt-24 pb-16 bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-4">
            Your Personalized Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Welcome to your customized health journey. Here's your personalized
            plan based on your quiz results.
          </p>
        </div>

        <div className="mb-8">
          <DailyTip colorTheme={colorTheme} />
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md mb-8">
          <div className="flex flex-wrap">
            {tabs.map((tab, index) => (
              <button
                key={tab.id}
                className={`px-4 py-3 md:px-6 text-sm md:text-base font-medium ${
                  index === 0 ? "rounded-tl-xl" : ""
                } ${index === tabs.length - 1 ? "rounded-tr-xl" : ""} ${
                  activeTab === tab.id
                    ? colorTheme.primaryBg + " text-white"
                    : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white"
                }`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
          {activeTab === "overview" && (
            <OverviewSection
              healthProfile={healthProfile}
              healthCalculations={healthCalculations}
              colorTheme={colorTheme}
            />
          )}

          {activeTab === "meal-plan" && (
            <MealPlanSection
              mealPlan={mealPlan}
              healthCalculations={healthCalculations}
              colorTheme={colorTheme}
            />
          )}

          {activeTab === "exercise" && (
            <ExerciseSection
              healthProfile={healthProfile}
              colorTheme={colorTheme}
            />
          )}

          {activeTab === "progress" && (
            <ProgressSection
              activityLogs={activityLogs}
              dashboardStats={dashboardStats}
              onAddLog={addLog}
              onUpdateLog={updateLog}
              onDeleteLog={deleteLog}
              saving={saving}
              error={error}
              colorTheme={colorTheme}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
