import { useAuth } from "@/contexts/useAuth";
import { supabase } from "@/lib/supabase";
import type { HealthCalculations, HealthProfile, Meal } from "@/types/dashboard";
import { logError } from "@/utils/errorLogger";
import { generateMealPlan } from "@/utils/mealPlan";
import { useEffect, useMemo, useState } from "react";

export const useDashboardData = () => {
  const [healthProfile, setHealthProfile] = useState<HealthProfile | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchQuizResult = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from("quiz_results")
          .select("answers, calculations")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (data) {
          setHealthProfile(data);
        }

        if (error) {
          console.error("Error fetching quiz result:", error);
          try {
            await logError(
              "error",
              "frontend",
              "Failed to fetch quiz result",
              error.message,
              { userId: user.id }
            );
          } catch (logErr) {
            console.error("Failed to log error:", logErr);
          }
        }
      } catch (err) {
        console.error("Error fetching quiz result:", err);
        const errorMessage = err instanceof Error ? err.stack : String(err);
        try {
          await logError(
            "error",
            "frontend",
            "Exception while fetching quiz result",
            errorMessage,
            { userId: user.id }
          );
        } catch (logErr) {
          console.error("Failed to log error:", logErr);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchQuizResult();
  }, [user]);

  const healthCalculations = useMemo<HealthCalculations | null>(() => {
    if (!healthProfile) return null;

    const { answers, calculations } = healthProfile;

    const getBMIStatus = (bmi: number) => {
      if (bmi < 18.5) return { status: "Underweight", color: "text-blue-500" };
      if (bmi < 25) return { status: "Normal", color: "text-green-500" };
      if (bmi < 30) return { status: "Overweight", color: "text-yellow-500" };
      return { status: "Obese", color: "text-red-500" };
    };

    const bmiStatus = getBMIStatus(calculations.bmi);

    const getGoalAdjustment = () => {
      const goal = answers[8] as string;
      // const activityLevel = answers[6] as string;
      const age = answers[1] as number;
      const gender = answers[2] as string;
      const weight = answers[3] as number;
      const height = answers[4] as number;

      // Calculate BMR for safety checks
      let bmr;
      if (gender === "Male") {
        bmr = 10 * weight + 6.25 * height - 5 * age + 5;
      } else {
        bmr = 10 * weight + 6.25 * height - 5 * age - 161;
      }

      const safeMinimumCalories = Math.max(bmr * 1.1, gender === "Male" ? 1500 : 1200);
      const tdee = calculations.tdee;

      let baseAdjustment = 0;
      let deficit;

      switch (goal) {
        case "Lose fat":
          // Safe deficit: 15-25% below TDEE
          deficit = Math.min(500, tdee * 0.25);
          baseAdjustment = -deficit;
          break;

        case "Build muscle":
          // Moderate surplus: 10-15% above TDEE
          baseAdjustment = Math.min(300, tdee * 0.15);
          break;

        case "Maintain weight":
          baseAdjustment = 0;
          break;

        case "Improve health & wellbeing":
          // Slight deficit: 5-10% below TDEE
          baseAdjustment = -Math.min(200, tdee * 0.1);
          break;

        default:
          baseAdjustment = 0;
          break;
      }

      // Apply safety constraints
      const targetCalories = tdee + baseAdjustment;
      if (targetCalories < safeMinimumCalories) {
        baseAdjustment = safeMinimumCalories - tdee;
      }

      return Math.round(baseAdjustment);
    };

    const goalAdjustment = getGoalAdjustment();
    const dailyCalorieTarget = Math.max(
      calculations.tdee + goalAdjustment,
      // Absolute minimum safety threshold
      answers[2] === "Male" ? 1500 : 1200
    );

    const getMacroSplit = () => {
      const goal = answers[8] as string;
      const dietType = answers[7] as string;
      const activityLevel = answers[6] as string;
      const weight = answers[3] as number;

      let proteinPercent = 30,
        carbsPercent = 40,
        fatsPercent = 30;

      // First, set base macros by goal
      if (goal === "Lose fat") {
        proteinPercent = 35;
        carbsPercent = 35;
        fatsPercent = 30;
      } else if (goal === "Build muscle") {
        proteinPercent = 35;
        carbsPercent = 45;
        fatsPercent = 20;
      } else if (goal === "Maintain weight") {
        proteinPercent = 30;
        carbsPercent = 40;
        fatsPercent = 30;
      } else if (goal === "Improve health & wellbeing") {
        proteinPercent = 30;
        carbsPercent = 40;
        fatsPercent = 30;
      }

      // Override with diet-specific macros (these take priority)
      if (dietType === "Keto") {
        proteinPercent = 25;
        carbsPercent = 5;
        fatsPercent = 70;
      } else if (dietType === "Vegan") {
        proteinPercent = 20;
        carbsPercent = 50;
        fatsPercent = 30;
      } else if (dietType === "Vegetarian") {
        proteinPercent = 25;
        carbsPercent = 45;
        fatsPercent = 30;
      } else if (dietType === "Pescatarian") {
        proteinPercent = 30;
        carbsPercent = 40;
        fatsPercent = 30;
      }

      // Adjust for activity level (only if not keto)
      if (dietType !== "Keto") {
        if (
          activityLevel.includes("Very active") ||
          activityLevel.includes("Extremely active")
        ) {
          carbsPercent += 5;
          proteinPercent += 5;
          fatsPercent -= 10;
        }
      }

      // Ensure percentages sum to 100
      const total = proteinPercent + carbsPercent + fatsPercent;
      if (total !== 100) {
        const adjustment = (100 - total) / 3;
        proteinPercent += adjustment;
        carbsPercent += adjustment;
        fatsPercent += adjustment;
      }

      // Calculate grams based on calories
      const proteinGrams = Math.round((dailyCalorieTarget * (proteinPercent / 100)) / 4);
      const carbsGrams = Math.round((dailyCalorieTarget * (carbsPercent / 100)) / 4);
      const fatsGrams = Math.round((dailyCalorieTarget * (fatsPercent / 100)) / 9);

      // Also calculate based on body weight for protein (minimum)
      const proteinByWeight = weight * (goal === "Build muscle" ? 2.2 : goal === "Lose fat" ? 1.8 : 1.6);
      const finalProteinGrams = Math.max(proteinGrams, proteinByWeight);

      return {
        protein: Math.round(proteinPercent),
        carbs: Math.round(carbsPercent),
        fats: Math.round(fatsPercent),
        proteinGrams: Math.round(finalProteinGrams),
        carbsGrams,
        fatsGrams,
      };
    };

    const macros = getMacroSplit();

    return {
      bmiStatus,
      dailyCalorieTarget,
      macros,
      goalAdjustment,
    };
  }, [healthProfile]);

  const mealPlan = useMemo<Meal[] | null>(() => {
    if (!healthProfile || !healthCalculations) return null;

    const { answers } = healthProfile;

    const plan = generateMealPlan(
      healthCalculations.dailyCalorieTarget,
      healthCalculations.macros,
      answers[7] as string,
      answers[8] as
        | "Lose fat"
        | "Build muscle"
        | "Maintain weight"
        | "Improve health & wellbeing",
      answers[9] as string | number,
      answers
    );

    if (!plan || plan.length === 0) {
      console.error("Meal plan is empty! Check the generation logic.");
    }

    return plan;
  }, [healthProfile, healthCalculations]);

  return {
    healthProfile,
    healthCalculations,
    mealPlan,
    loading,
  };
};
