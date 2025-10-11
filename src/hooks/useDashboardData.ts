import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../contexts/useAuth";
import { supabase } from "../lib/supabase";
import { HealthCalculations, HealthProfile, Meal } from "../types/dashboard";
import { logError } from "../utils/errorLogger";
import { generateMealPlan } from "../utils/mealPlan";

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
      const activityLevel = answers[6] as string;
      const age = answers[1] as number;
      const gender = answers[2] as string;

      let baseAdjustment = 0;

      switch (goal) {
        case "Lose fat":
          baseAdjustment = -500;
          break;

        case "Build muscle":
          baseAdjustment = 300;
          break;

        case "Maintain weight":
          baseAdjustment = 0;
          break;

        case "Improve health & wellbeing":
          baseAdjustment = -200;
          break;

        default:
          break;
      }

      const activity = activityLevel.toLowerCase();

      if (
        activity.includes("very active") ||
        activity.includes("extremely active")
      ) {
        baseAdjustment += 200;
      } else if (activity.includes("sedentary")) {
        baseAdjustment -= 200;
      }

      if (age > 50) baseAdjustment -= 200;
      else if (age > 40) baseAdjustment -= 100;

      if (gender === "Male") {
        baseAdjustment += 100;
      }

      return baseAdjustment;
    };

    const goalAdjustment = getGoalAdjustment();
    const dailyCalorieTarget = Math.round(calculations.tdee + goalAdjustment);

    const getMacroSplit = () => {
      const goal = answers[8] as string;
      const dietType = answers[7] as string;
      const activityLevel = answers[6] as string;

      let protein = 30,
        carbs = 40,
        fats = 30;

      if (goal === "Lose fat") {
        protein = 35;
        carbs = 35;
        fats = 30;
      } else if (goal === "Build muscle") {
        protein = 40;
        carbs = 40;
        fats = 20;
      } else if (goal === "Maintain weight") {
        protein = 30;
        carbs = 40;
        fats = 30;
      } else if (goal === "Improve health & wellbeing") {
        protein = 30;
        carbs = 35;
        fats = 35;
      }

      if (dietType === "Keto") {
        protein = 25;
        carbs = 5;
        fats = 70;
      } else if (dietType === "Vegan") {
        protein = 25;
        carbs = 45;
        fats = 30;
      } else if (dietType === "Vegetarian") {
        protein = 30;
        carbs = 40;
        fats = 30;
      }

      if (
        activityLevel.includes("Very active") ||
        activityLevel.includes("Extremely active")
      ) {
        carbs += 5;
        protein += 2;
        fats -= 2;
      }

      return { protein, carbs, fats };
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
