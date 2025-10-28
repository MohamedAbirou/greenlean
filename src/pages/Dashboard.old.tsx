import { useAuth } from "@/features/auth";
import { DietPlanSection } from "@/features/dashboard/components/sections/DietPlanSection";
import { OverviewSection } from "@/features/dashboard/components/sections/OverviewSection";
import { WorkoutSection } from "@/features/dashboard/components/sections/WorkoutSection";
import { useDashboardDataQuery } from "@/shared/hooks/Queries/useDashboardData";
import { ArrowRight, Loader } from "lucide-react";
import React, { useState } from "react";

const Dashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const { user } = useAuth();

  const { data, isLoading } = useDashboardDataQuery(user?.id);

  const overviewData = data?.overviewData;
  const dietPlanData = data?.dietPlanData;
  const workoutPlanData = data?.workoutPlanData;
  const bmiStatus = data?.bmiStatus;

  if (isLoading) {
    return (
      <div className="min-h-screen pt-24 pb-16 flex items-center justify-center">
        <Loader className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!overviewData) {
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
            className={`inline-flex items-center px-6 py-3 bg-primary text-white rounded-full hover:bg-primary/90 transition-colors`}
          >
            Take the Quiz <ArrowRight className="ml-2 h-5 w-5" />
          </a>
        </div>
      </div>
    );
  }

  const { answers, calculations } = overviewData;

  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "meal-plan", label: "Meal Plan" },
    { id: "exercise", label: "Exercise Plan" },
  ];

  return (
    <div className="min-h-screen pt-24 pb-16 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
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
                    ? "bg-primary text-white"
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
            answers={answers}
            calculations={calculations}
            bmiStatus={bmiStatus!}
          />
        )}

        {activeTab === "meal-plan" && user && (
          <DietPlanSection
            userId={user.id}
            dietPlan={dietPlanData!}
            calculations={calculations}
          />
        )}

        {activeTab === "exercise" && user && (
          <WorkoutSection
            userId={user.id}
            workoutPlanData={workoutPlanData!}
          />
        )}
      </div>
    </div>
  );
};

export default Dashboard;
