import { useAuth } from "@/contexts/useAuth";
import { supabase } from "@/lib/supabase";
import type { HealthCalculations, HealthProfile } from "@/types/dashboard";
import { logError } from "@/utils/errorLogger";
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

    const { calculations } = healthProfile;

    if (!calculations) return null;

    // If you want, you can still compute BMI status for UI
    const getBMIStatus = (bmi: number) => {
      if (bmi < 18.5) return { status: "Underweight", color: "text-blue-500" };
      if (bmi < 25) return { status: "Normal", color: "text-green-500" };
      if (bmi < 30) return { status: "Overweight", color: "text-yellow-500" };
      return { status: "Obese", color: "text-red-500" };
    };

    const bmiStatus = getBMIStatus(calculations.bmi);

    return {
      bmiStatus,
      dailyCalorieTarget: calculations.goalCalories,
      macros: calculations.macros,
      goalAdjustment: calculations.goalCalories - calculations.tdee,
    };
  }, [healthProfile]);

  return {
    healthProfile,
    healthCalculations,
    loading,
  };
};
