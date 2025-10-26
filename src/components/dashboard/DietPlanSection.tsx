import type {
  DashboardCalculations,
  DashboardDietPlan,
} from "@/types/dashboard";
import { NutritionService } from "@/features/nutrition";
import { Plus } from "lucide-react";
import { useEffect, useState } from "react";
import {
  HydrationPanel,
  MealList,
  MealLogModal,
  MealTabs,
  ProgressCards,
  ShoppingPanel,
  TipsPanel,
} from "./DietPlan";

interface DietPlanSectionProps {
  userId: string;
  dietPlan: DashboardDietPlan;
  calculations: DashboardCalculations;
}

interface TodayLog {
  total_calories: number;
  total_protein: number;
  total_carbs: number;
  total_fats: number;
}

const tabs = [
  {
    name: "Meals",
    bg: "from-primary to-emerald-600",
    color: "text-white",
    ringColor: "focus:ring-emerald-500/50",
  },
  {
    name: "Hydration",
    bg: "from-blue-600 to-cyan-600",
    color: "text-blue-600 dark:text-blue-400",
    ringColor: "focus:ring-blue-500/50",
  },
  {
    name: "Shopping",
    bg: "from-primary to-emerald-600",
    color: "text-green-600 dark:text-green-400",
    ringColor: "focus:ring-green-500/50",
  },
  {
    name: "Tips",
    bg: "from-purple-500 to-pink-500",
    color: "text-purple-600 dark:text-purple-400",
    ringColor: "focus:ring-purple-500/50",
  },
];

export const DietPlanSection: React.FC<DietPlanSectionProps> = ({
  userId,
  dietPlan,
  calculations,
}) => {
  const dietPlanData = dietPlan?.plan_data;
  const [showLogModal, setShowLogModal] = useState(false);
  const [expandedMeal, setExpandedMeal] = useState<string | null>(null);
  const [todayLogs, setTodayLogs] = useState<TodayLog[]>([]);

  const [selectedTab, setSelectedTab] = useState(tabs[0].name); // "Meals"

  useEffect(() => {
    loadTodayLogs();
  }, [userId]);

  const loadTodayLogs = async () => {
    const logs = await NutritionService.getTodayLogs(userId);
    setTodayLogs(logs);
  };

  const totalLoggedToday = todayLogs.reduce(
    (sum, log) => sum + (log.total_calories || 0),
    0
  );
  const totalProteinLogged = todayLogs.reduce(
    (sum, log) => sum + (log.total_protein || 0),
    0
  );
  const totalCarbsLogged = todayLogs.reduce(
    (sum, log) => sum + (log.total_carbs || 0),
    0
  );
  const totalFatsLogged = todayLogs.reduce(
    (sum, log) => sum + (log.total_fats || 0),
    0
  );
  const dailyCalories = calculations.goalCalories;
  const macros = calculations.macros;
  const remainingCalories = dailyCalories - totalLoggedToday;
  const remainingProtein = calculations.macros.protein_g - totalProteinLogged;
  const remainingCarbs = calculations.macros.carbs_g - totalCarbsLogged;
  const remainingFats = calculations.macros.fat_g - totalFatsLogged;
  const caloriePercentage = (totalLoggedToday / dailyCalories) * 100;
  const proteinPercentage = (totalProteinLogged / macros.protein_g) * 100;
  const carbsPercentage = (totalCarbsLogged / macros.carbs_g) * 100;
  const fatsPercentage = (totalFatsLogged / macros.fat_g) * 100;

  if (!dietPlanData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950 p-6">
        <div className="max-w-4xl mx-auto text-center py-12">
          <div className="bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm rounded-md p-12 border border-slate-200/50 dark:border-slate-700/50">
            <Plus className="h-16 w-16 text-indigo-600 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
              No Diet Plan Yet
            </h3>
            <p className="text-slate-600 dark:text-slate-400">
              Complete the nutrition quiz to get your personalized AI meal plan!
            </p>
          </div>
        </div>
      </div>
    );
  }

  const tabPanels = [
    <MealList
      key="meals"
      dietPlanData={dietPlanData}
      expandedMeal={expandedMeal}
      setExpandedMeal={setExpandedMeal}
    />,
    <HydrationPanel
      key="hydration"
      hydrationPlan={dietPlanData.hydration_plan}
    />,
    <ShoppingPanel
      key="shopping"
      shoppingList={dietPlanData.shopping_list}
      mealPrepStrategy={dietPlanData.meal_prep_strategy}
    />,
    <TipsPanel
      key="tips"
      tips={dietPlanData.personalized_tips}
      dailyTotals={dietPlanData.daily_totals}
      variance={dietPlanData.daily_totals.variance}
    />,
  ];

  return (
    <div className="mx-auto space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-primary to-emerald-600 bg-clip-text text-transparent mb-2">
            Your Personalized Meal Plan
          </h2>
          <p className="text-slate-600 dark:text-slate-400">
            AI-optimized nutrition designed for your goals
          </p>
        </div>
        <button
          onClick={() => setShowLogModal(true)}
          className="px-6 py-3 bg-gradient-to-r from-primary to-emerald-600 text-white rounded-md font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all flex items-center gap-2"
        >
          <Plus className="h-5 w-5" /> Log Meal
        </button>
      </div>
      <ProgressCards
        calorieStats={{
          logged: totalLoggedToday,
          target: dailyCalories,
          percentage: caloriePercentage,
          remaining: remainingCalories,
        }}
        proteinStats={{
          logged: totalProteinLogged,
          target: macros.protein_g,
          percentage: proteinPercentage,
          remaining: remainingProtein,
        }}
        carbsStats={{
          logged: totalCarbsLogged,
          target: macros.carbs_g,
          percentage: carbsPercentage,
          remaining: remainingCarbs,
        }}
        fatsStats={{
          logged: totalFatsLogged,
          target: macros.fat_g,
          percentage: fatsPercentage,
          remaining: remainingFats,
        }}
      />
      <MealTabs
        currentTab={selectedTab}
        onTabChange={setSelectedTab}
        tabs={tabs}
        tabPanels={tabPanels}
      />
      <MealLogModal
        userId={userId}
        show={showLogModal}
        setShowLogModal={setShowLogModal}
        onClose={() => setShowLogModal(false)}
        loadTodayLogs={loadTodayLogs}
      />
    </div>
  );
};
