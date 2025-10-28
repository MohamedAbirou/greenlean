import { queryKeys } from "@/lib/queryKeys";
import { supabase } from "@/lib/supabase/client";
import type {
  DashboardAnswers,
  DashboardCalculations,
  DashboardDietPlan,
  DashboardOverview,
  DashboardProps,
  DashboardWorkoutPlan,
} from "@/shared/types/dashboard";
import { useQuery } from "@tanstack/react-query";

export const fetchDashboardData = async (
  userId?: string
): Promise<DashboardProps> => {
  const [overviewResp, dietPlanResp, workoutPlanResp] = await Promise.all([
    supabase
      .from("quiz_results")
      .select("answers, calculations")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from("ai_meal_plans")
      .select("*")
      .eq("user_id", userId)
      .eq("is_active", true)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from("ai_workout_plans")
      .select("*")
      .eq("user_id", userId)
      .eq("is_active", true)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  const overviewData = (overviewResp?.data as {
    answers: DashboardAnswers;
    calculations: DashboardCalculations;
  });

  const dietPlanData = (dietPlanResp?.data as DashboardDietPlan | null) ?? null;
  const workoutPlanData =
    (workoutPlanResp?.data as DashboardWorkoutPlan | null) ?? null;

  const { answers, calculations } = overviewData;

  const getBMIStatus = (bmi?: number) => {
    if (bmi === undefined || bmi === null)
      return { status: "Unknown", color: "text-gray-500" };
    if (bmi < 18.5) return { status: "Underweight", color: "text-blue-500" };
    if (bmi < 25) return { status: "Normal", color: "text-green-500" };
    if (bmi < 30) return { status: "Overweight", color: "text-yellow-500" };
    return { status: "Obese", color: "text-red-500" };
  };

  const bmiStatus = getBMIStatus(calculations?.bmi);

  const overview: DashboardOverview = {answers, calculations}

  return {
    overviewData: overview,
    bmiStatus,
    dietPlanData,
    workoutPlanData,
  };
};

export const useDashboardDataQuery = (userId?: string) =>
  useQuery({
    queryKey: [...queryKeys.dashboard, userId ?? "me"],
    queryFn: () => fetchDashboardData(userId),
    staleTime: 5 * 60 * 1000,
  });
