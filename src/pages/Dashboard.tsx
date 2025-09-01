import {
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
} from "chart.js";
import { motion } from "framer-motion";
import {
  Activity,
  ArrowRight,
  Check,
  Edit,
  Flame,
  Scale,
  Target,
  Trash2,
  X,
} from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";
import { Line } from "react-chartjs-2";
import DailyTip from "../components/DailyTip";
import { useAuth } from "../contexts/AuthContext";
import { usePlatform } from "../contexts/PlatformContext";
import { supabase } from "../lib/supabase";
import { useColorTheme } from "../utils/colorUtils";
import { logError } from "../utils/errorLogger";
import { generateMealPlan } from "../utils/mealPlan";
ChartJS.register(
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend
);

interface HealthProfile {
  answers: { [key: number]: string | number };
  calculations: {
    bmi: number;
    bmr: number;
    tdee: number;
  };
}

// Add ActivityLog type
interface ActivityLog {
  id: string;
  activity_date: string;
  activity_type: string;
  duration_minutes?: number;
  calories_burned?: number;
  steps?: number;
  notes?: string;
}

const Dashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [healthProfile, setHealthProfile] = useState<HealthProfile | null>(
    null
  );
  const [showLogModal, setShowLogModal] = useState(false);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [logForm, setLogForm] = useState({
    activity_type: "Workout",
    duration_minutes: "",
    calories_burned: "",
    steps: "",
    notes: "",
  });
  const [logLoading, setLogLoading] = useState(false);
  // Add state for editing/deleting
  const [editLog, setEditLog] = useState<ActivityLog | null>(null);
  const [editForm, setEditForm] = useState({
    activity_type: "Workout",
    duration_minutes: "",
    calories_burned: "",
    steps: "",
    notes: "",
  });
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);
  const [deleteLogId, setDeleteLogId] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const { user } = useAuth();
  const platform = usePlatform();
  const colorTheme = useColorTheme(platform.settings?.theme_color);

  // Extract fetchLogs so it can be called after edit/delete
  const fetchLogs = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from("user_activity_logs")
        .select("*")
        .eq("user_id", user.id)
        .order("activity_date", { ascending: false })
        .limit(30);
      if (data) setActivityLogs(data);
      if (error) {
        console.error("Error fetching activity logs:", error);
        try {
          await logError(
            "error",
            "frontend",
            "Failed to fetch activity logs",
            error.message,
            { userId: user.id }
          );
        } catch (logErr) {
          console.error("Failed to log error:", logErr);
        }
      }
    } catch (err) {
      console.error("Error fetching activity logs:", err);
      const errorMessage = err instanceof Error ? err.stack : String(err);
      try {
        await logError(
          "error",
          "frontend",
          "Exception while fetching activity logs",
          errorMessage,
          { userId: user.id }
        );
      } catch (logErr) {
        console.error("Failed to log error:", logErr);
      }
    }
  };

  // Fetch activity logs for this user (last 14 days)
  useEffect(() => {
    fetchLogs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, showLogModal]);

  useEffect(() => {
    const fetchQuizResult = async () => {
      if (!user) return;
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
      }
    };
    fetchQuizResult();
  }, [user]);

  // Memoized calculations to prevent regeneration on tab switches
  const healthCalculations = useMemo(() => {
    if (!healthProfile) return null; // fallback
    // calculations using healthProfile.answers and healthProfile.calculations
    const { answers, calculations } = healthProfile;

    // Calculate weight status based on BMI
    const getBMIStatus = (bmi: number) => {
      if (bmi < 18.5) return { status: "Underweight", color: "text-blue-500" };
      if (bmi < 25) return { status: "Normal", color: "text-green-500" };
      if (bmi < 30) return { status: "Overweight", color: "text-yellow-500" };
      return { status: "Obese", color: "text-red-500" };
    };

    const bmiStatus = getBMIStatus(calculations.bmi);

    // Enhanced goal adjustment based on multiple factors
    const getGoalAdjustment = () => {
      const goal = answers[8] as string;
      const activityLevel = answers[6] as string;
      const age = answers[1] as number;
      const gender = answers[2] as string;

      let baseAdjustment = 0;

      // Base goal adjustments
      if (goal === "Lose fat") {
        baseAdjustment = -500; // 1 lb per week deficit
      } else if (goal === "Build muscle") {
        baseAdjustment = 300; // Moderate surplus
      } else if (goal === "Maintain weight") {
        baseAdjustment = 0;
      } else if (goal === "Improve health & wellbeing") {
        baseAdjustment = -200; // Slight deficit for health
      }

      // Adjust based on activity level
      if (
        activityLevel.includes("Very active") ||
        activityLevel.includes("Extremely active")
      ) {
        baseAdjustment += 200; // More calories for high activity
      } else if (activityLevel.includes("Sedentary")) {
        baseAdjustment -= 200; // Fewer calories for sedentary
      }

      // Adjust based on age (metabolism slows with age)
      if (age > 40) {
        baseAdjustment -= 100;
      } else if (age > 50) {
        baseAdjustment -= 200;
      }

      // Adjust based on gender (men typically need more calories)
      if (gender === "Male") {
        baseAdjustment += 100;
      }

      return baseAdjustment;
    };

    const goalAdjustment = getGoalAdjustment();
    const dailyCalorieTarget = Math.round(calculations.tdee + goalAdjustment);

    // Enhanced macro split based on goal, diet type, and activity level
    const getMacroSplit = () => {
      const goal = answers[8] as string;
      const dietType = answers[7] as string;
      const activityLevel = answers[6] as string;

      let protein = 30,
        carbs = 40,
        fats = 30; // Default

      // Goal-based adjustments
      if (goal === "Lose fat") {
        protein = 35;
        carbs = 35;
        fats = 30; // Higher protein for satiety
      } else if (goal === "Build muscle") {
        protein = 40;
        carbs = 40;
        fats = 20; // Higher protein and carbs
      } else if (goal === "Maintain weight") {
        protein = 30;
        carbs = 40;
        fats = 30; // Balanced
      } else if (goal === "Improve health & wellbeing") {
        protein = 30;
        carbs = 35;
        fats = 35; // Higher healthy fats
      }

      // Diet type adjustments
      if (dietType === "Keto") {
        protein = 25;
        carbs = 5;
        fats = 70; // Keto macros
      } else if (dietType === "Vegan") {
        protein = 25;
        carbs = 45;
        fats = 30; // Plant-based adjustments
      } else if (dietType === "Vegetarian") {
        protein = 30;
        carbs = 40;
        fats = 30; // Slightly higher protein
      }

      // Activity level adjustments
      if (
        activityLevel.includes("Very active") ||
        activityLevel.includes("Extremely active")
      ) {
        carbs += 5; // More carbs for high activity
        protein += 2; // Slightly more protein
        fats -= 2; // Slightly less fat
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

  // Memoized meal plan to prevent regeneration on tab switches
  const mealPlan = useMemo(() => {
    if (!healthProfile) return null; // fallback
    // calculations using healthProfile.answers and healthProfile.calculations
    const { answers } = healthProfile;

    if (!healthCalculations) return null;

    const plan = generateMealPlan(
      healthCalculations.dailyCalorieTarget,
      healthCalculations.macros,
      answers[7] as string, // restriction - will be normalized in the function
      answers[8] as
        | "Lose fat"
        | "Build muscle"
        | "Maintain weight"
        | "Improve health & wellbeing", // goal
      answers[9] as string | number, // meals per day - could be string like "2 (intermittent fasting)"
      answers // Pass all quiz answers for better personalization
    );

    // Debug: Check if meal plan is empty
    if (!plan || plan.length === 0) {
      console.error("Meal plan is empty! Check the generation logic.");
    }

    return plan;
  }, [healthProfile, healthCalculations]);

  if (!healthProfile) {
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

  const { answers, calculations } = healthProfile;

  // Extract values for easier access
  const { bmiStatus, dailyCalorieTarget, macros } = healthCalculations;

  // Helper: Today's logs and summary
  const today = new Date().toISOString().slice(0, 10);
  const todaysLogs = activityLogs.filter((log) => log.activity_date === today);
  const totalCalories = todaysLogs.reduce(
    (sum, l) =>
      sum + (typeof l.calories_burned === "number" ? l.calories_burned : 0),
    0
  );
  const totalSteps = todaysLogs.reduce(
    (sum, l) => sum + (typeof l.steps === "number" ? l.steps : 0),
    0
  );
  const totalDuration = todaysLogs.reduce(
    (sum, l) =>
      sum + (typeof l.duration_minutes === "number" ? l.duration_minutes : 0),
    0
  );

  // Handle log form submit
  const handleLogSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLogLoading(true);

    if (!user) return;

    try {
      const { activity_type, duration_minutes, calories_burned, steps, notes } =
        logForm;
      const { error } = await supabase.from("user_activity_logs").insert([
        {
          user_id: user.id,
          activity_type,
          duration_minutes: duration_minutes ? Number(duration_minutes) : null,
          calories_burned: calories_burned ? Number(calories_burned) : null,
          steps: steps ? Number(steps) : null,
          notes,
        },
      ]);

      if (error) {
        await logError(
          "error",
          "backend",
          "Failed to log activity. Please try again.",
          error.message,
          { userId: user.id }
        );
        try {
          await logError(
            "error",
            "frontend",
            "Failed to log activity",
            error.message,
            { userId: user.id, activityType: activity_type }
          );
        } catch (logErr) {
          console.error("Failed to log error:", logErr);
        }
      } else {
        setShowLogModal(false);
        setLogForm({
          activity_type: "Workout",
          duration_minutes: "",
          calories_burned: "",
          steps: "",
          notes: "",
        });
        try {
          await logError(
            "info",
            "frontend",
            "Activity logged successfully",
            undefined,
            { userId: user.id, activityType: activity_type }
          );
        } catch (logErr) {
          console.error("Failed to log info:", logErr);
        }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.stack : String(err);
      try {
        await logError(
          "error",
          "frontend",
          "Exception while logging activity",
          errorMessage,
          { userId: user.id }
        );
      } catch (logErr) {
        console.error("Failed to log error:", logErr);
      }
    } finally {
      setLogLoading(false);
    }
  };

  // Edit log handlers
  const openEditModal = (log: ActivityLog) => {
    setEditLog(log);
    setEditForm({
      activity_type: log.activity_type,
      duration_minutes: log.duration_minutes?.toString() || "",
      calories_burned: log.calories_burned?.toString() || "",
      steps: log.steps?.toString() || "",
      notes: log.notes || "",
    });
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editLog || !user) return;
    setEditLoading(true);
    setEditError(null);

    try {
      const { activity_type, duration_minutes, calories_burned, steps, notes } =
        editForm;
      const { error } = await supabase
        .from("user_activity_logs")
        .update({
          activity_type,
          duration_minutes: duration_minutes ? Number(duration_minutes) : null,
          calories_burned: calories_burned ? Number(calories_burned) : null,
          steps: steps ? Number(steps) : null,
          notes,
        })
        .eq("id", editLog.id)
        .eq("user_id", user.id);

      if (error) {
        setEditError("Failed to update activity. Please try again.");
        try {
          await logError(
            "error",
            "frontend",
            "Failed to update activity",
            error.message,
            { userId: user.id, activityId: editLog.id }
          );
        } catch (logErr) {
          console.error("Failed to log error:", logErr);
        }
      } else {
        setEditLog(null);
        fetchLogs(); // Refresh logs after edit
        try {
          await logError(
            "info",
            "frontend",
            "Activity updated successfully",
            undefined,
            { userId: user.id, activityId: editLog.id }
          );
        } catch (logErr) {
          console.error("Failed to log info:", logErr);
        }
      }
    } catch (err) {
      setEditError("Failed to update activity. Please try again.");
      const errorMessage = err instanceof Error ? err.stack : String(err);
      try {
        await logError(
          "error",
          "frontend",
          "Exception while updating activity",
          errorMessage,
          { userId: user.id, activityId: editLog.id }
        );
      } catch (logErr) {
        console.error("Failed to log error:", logErr);
      }
    } finally {
      setEditLoading(false);
    }
  };

  // Delete log handlers
  const handleDelete = async () => {
    if (!deleteLogId || !user) return;
    setDeleteLoading(true);
    setDeleteError(null);

    try {
      const { error } = await supabase
        .from("user_activity_logs")
        .delete()
        .eq("id", deleteLogId)
        .eq("user_id", user.id);

      if (error) {
        setDeleteError("Failed to delete activity. Please try again.");
        try {
          await logError(
            "error",
            "frontend",
            "Failed to delete activity",
            error.message,
            { userId: user.id, activityId: deleteLogId }
          );
        } catch (logErr) {
          console.error("Failed to log error:", logErr);
        }
      } else {
        setDeleteLogId(null);
        fetchLogs(); // Refresh logs after delete
        try {
          await logError(
            "info",
            "frontend",
            "Activity deleted successfully",
            undefined,
            { userId: user.id, activityId: deleteLogId }
          );
        } catch (logErr) {
          console.error("Failed to log info:", logErr);
        }
      }
    } catch (err) {
      setDeleteError("Failed to delete activity. Please try again.");
      const errorMessage = err instanceof Error ? err.stack : String(err);
      try {
        await logError(
          "error",
          "frontend",
          "Exception while deleting activity",
          errorMessage,
          { userId: user.id, activityId: deleteLogId }
        );
      } catch (logErr) {
        console.error("Failed to log error:", logErr);
      }
    } finally {
      setDeleteLoading(false);
    }
  };

  // Chart data (last 14 days)
  const chartLabels = Array.from(
    new Set(activityLogs.map((l) => l.activity_date))
  )
    .reverse()
    .slice(-14);
  const chartData = (field: keyof ActivityLog) => ({
    labels: chartLabels,
    datasets: [
      {
        label:
          field === "calories_burned"
            ? "Calories"
            : field === "steps"
            ? "Steps"
            : "Duration (min)",
        data: chartLabels.map((date) => {
          return activityLogs
            .filter((l) => l.activity_date === date)
            .reduce((sum, l) => sum + Number(l[field] || 0), 0);
        }),
        fill: false,
        borderColor:
          field === "calories_burned"
            ? "#ef4444"
            : field === "steps"
            ? "#8b5cf6"
            : "#22c55e",
        backgroundColor:
          field === "calories_burned"
            ? "#fee2e2"
            : field === "steps"
            ? "#ede9fe"
            : "#bbf7d0",
        tension: 0.3,
      },
    ],
  });

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

        {/* Daily Tip */}
        <div className="mb-8">
          <DailyTip colorTheme={colorTheme} />
        </div>

        {/* Tabs */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md mb-8">
          <div className="flex flex-wrap">
            <button
              className={`px-4 py-3 md:px-6 text-sm md:text-base font-medium rounded-tl-xl ${
                activeTab === "overview"
                  ? colorTheme.primaryBg + " text-white"
                  : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white"
              }`}
              onClick={() => setActiveTab("overview")}
            >
              Overview
            </button>
            <button
              className={`px-4 py-3 md:px-6 text-sm md:text-base font-medium ${
                activeTab === "meal-plan"
                  ? colorTheme.primaryBg + " text-white"
                  : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white"
              }`}
              onClick={() => setActiveTab("meal-plan")}
            >
              Meal Plan
            </button>
            <button
              className={`px-4 py-3 md:px-6 text-sm md:text-base font-medium ${
                activeTab === "exercise"
                  ? colorTheme.primaryBg + " text-white"
                  : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white"
              }`}
              onClick={() => setActiveTab("exercise")}
            >
              Exercise Plan
            </button>
            <button
              className={`px-4 py-3 md:px-6 text-sm md:text-base font-medium rounded-tr-xl ${
                activeTab === "progress"
                  ? colorTheme.primaryBg + " text-white"
                  : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white"
              }`}
              onClick={() => setActiveTab("progress")}
            >
              Progress
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
          {/* Overview Tab */}
          {activeTab === "overview" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
                Your Health Summary
              </h2>

              {/* Key Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 flex items-center">
                  <div className="rounded-full bg-blue-100 dark:bg-blue-900 p-3 mr-4">
                    <Scale className="h-6 w-6 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      BMI
                    </p>
                    <p className="text-lg font-semibold text-gray-800 dark:text-white">
                      {calculations.bmi?.toFixed(1)}
                      <span className={`text-sm ml-2 ${bmiStatus.color}`}>
                        ({bmiStatus.status})
                      </span>
                    </p>
                  </div>
                </div>

                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 flex items-center">
                  <div className="rounded-full bg-green-100 dark:bg-green-900 p-3 mr-4">
                    <Target className="h-6 w-6 text-green-500" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Daily Calories
                    </p>
                    <p className="text-lg font-semibold text-gray-800 dark:text-white">
                      {dailyCalorieTarget} kcal
                    </p>
                  </div>
                </div>

                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 flex items-center">
                  <div className="rounded-full bg-purple-100 dark:bg-purple-900 p-3 mr-4">
                    <Activity className="h-6 w-6 text-purple-500" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Activity Level
                    </p>
                    <p className="text-lg font-semibold text-gray-800 dark:text-white">
                      {answers[6] as string}
                    </p>
                  </div>
                </div>

                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 flex items-center">
                  <div className="rounded-full bg-red-100 dark:bg-red-900 p-3 mr-4">
                    <Flame className="h-6 w-6 text-red-500" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Daily Burn
                    </p>
                    <p className="text-lg font-semibold text-gray-800 dark:text-white">
                      {Math.round(calculations.tdee)} kcal
                    </p>
                  </div>
                </div>
              </div>

              {/* Macronutrient Distribution */}
              <div className="mb-8">
                <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
                  Recommended Macronutrient Split
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-gray-600 dark:text-gray-300">
                        Protein
                      </span>
                      <span className="text-green-500 font-semibold">
                        {macros.protein}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                      <div
                        className="bg-green-500 rounded-full h-2"
                        style={{ width: `${macros.protein}%` }}
                      ></div>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                      {Math.round(
                        (dailyCalorieTarget * (macros.protein / 100)) / 4
                      )}
                      g per day
                    </p>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-gray-600 dark:text-gray-300">
                        Carbohydrates
                      </span>
                      <span className="text-blue-500 font-semibold">
                        {macros.carbs}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                      <div
                        className="bg-blue-500 rounded-full h-2"
                        style={{ width: `${macros.carbs}%` }}
                      ></div>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                      {Math.round(
                        (dailyCalorieTarget * (macros.carbs / 100)) / 4
                      )}
                      g per day
                    </p>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-gray-600 dark:text-gray-300">
                        Fats
                      </span>
                      <span className="text-yellow-500 font-semibold">
                        {macros.fats}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                      <div
                        className="bg-yellow-500 rounded-full h-2"
                        style={{ width: `${macros.fats}%` }}
                      ></div>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                      {Math.round(
                        (dailyCalorieTarget * (macros.fats / 100)) / 9
                      )}
                      g per day
                    </p>
                  </div>
                </div>
              </div>

              {/* Goals and Recommendations */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-6">
                  <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
                    Your Goals
                  </h3>
                  <ul className="space-y-3">
                    <li className="flex items-start">
                      <Check
                        className={`h-5 w-5 ${colorTheme.primaryText} mr-2 flex-shrink-0 mt-0.5`}
                      />
                      <span className="text-gray-600 dark:text-gray-300">
                        Primary Goal: {answers[8] as string}
                      </span>
                    </li>
                    <li className="flex items-start">
                      <Check
                        className={`h-5 w-5 ${colorTheme.primaryText} mr-2 flex-shrink-0 mt-0.5`}
                      />
                      <span className="text-gray-600 dark:text-gray-300">
                        Target Weight: {answers[5]} kg
                      </span>
                    </li>
                    <li className="flex items-start">
                      <Check
                        className={`h-5 w-5 ${colorTheme.primaryText} mr-2 flex-shrink-0 mt-0.5`}
                      />
                      <span className="text-gray-600 dark:text-gray-300">
                        Preferred Exercise: {answers[12] as string}
                      </span>
                    </li>
                  </ul>
                </div>

                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-6">
                  <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
                    Recommendations
                  </h3>
                  <ul className="space-y-3">
                    <li className="flex items-start">
                      <Check
                        className={`h-5 w-5 ${colorTheme.primaryText} mr-2 flex-shrink-0 mt-0.5`}
                      />
                      <span className="text-gray-600 dark:text-gray-300">
                        Focus on{" "}
                        {answers[8] === "Lose weight"
                          ? "calorie deficit"
                          : answers[8] === "Build muscle"
                          ? "protein intake"
                          : "balanced nutrition"}
                      </span>
                    </li>
                    <li className="flex items-start">
                      <Check
                        className={`h-5 w-5 ${colorTheme.primaryText} mr-2 flex-shrink-0 mt-0.5`}
                      />
                      <span className="text-gray-600 dark:text-gray-300">
                        Exercise {answers[11] as string} per day
                      </span>
                    </li>
                    <li className="flex items-start">
                      <Check
                        className={`h-5 w-5 ${colorTheme.primaryText} mr-2 flex-shrink-0 mt-0.5`}
                      />
                      <span className="text-gray-600 dark:text-gray-300">
                        {answers[9] as string} meals per day
                      </span>
                    </li>
                  </ul>
                </div>
              </div>
            </motion.div>
          )}

          {/* Meal Plan Tab */}
          {activeTab === "meal-plan" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
                Your Personalized Meal Plan
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-6">
                  <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
                    Daily Targets
                  </h3>
                  <ul className="space-y-4">
                    <li className="flex justify-between items-center">
                      <span className="text-gray-600 dark:text-gray-300">
                        Calories
                      </span>
                      <span className="font-semibold text-gray-800 dark:text-white">
                        {dailyCalorieTarget} kcal
                      </span>
                    </li>
                    <li className="flex justify-between items-center">
                      <span className="text-gray-600 dark:text-gray-300">
                        Protein
                      </span>
                      <span className="font-semibold text-gray-800 dark:text-white">
                        {Math.round(
                          (dailyCalorieTarget * (macros.protein / 100)) / 4
                        )}{" "}
                        g
                      </span>
                    </li>
                    <li className="flex justify-between items-center">
                      <span className="text-gray-600 dark:text-gray-300">
                        Carbs
                      </span>
                      <span className="font-semibold text-gray-800 dark:text-white">
                        {Math.round(
                          (dailyCalorieTarget * (macros.carbs / 100)) / 4
                        )}{" "}
                        g
                      </span>
                    </li>
                    <li className="flex justify-between items-center">
                      <span className="text-gray-600 dark:text-gray-300">
                        Fats
                      </span>
                      <span className="font-semibold text-gray-800 dark:text-white">
                        {Math.round(
                          (dailyCalorieTarget * (macros.fats / 100)) / 9
                        )}{" "}
                        g
                      </span>
                    </li>
                  </ul>
                </div>

                {/* Meal distribution */}
                <div className="bg-gray-50 dark:bg-gray-700/50 text-gray-800 dark:text-white rounded-lg p-6">
                  <h3 className="text-xl font-semibold mb-4">
                    Meal Distribution
                  </h3>
                  {mealPlan && mealPlan.length > 0 ? (
                    mealPlan.map((meal) => (
                      <div
                        key={meal.name}
                        className="flex justify-between items-center mb-2"
                      >
                        <span>{meal.name}</span>
                        <span>{Math.round(meal.total.calories)} kcal</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 dark:text-gray-400 text-sm">
                      No meal distribution available
                    </p>
                  )}
                </div>
              </div>

              {/* Meal plan */}
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-6">
                <h3 className="text-xl font-semibold mb-6 text-gray-800 dark:text-white">
                  Your Personalized Meal Plan
                </h3>
                {mealPlan && mealPlan.length > 0 ? (
                  mealPlan.map((meal) => (
                    <div
                      key={meal.name}
                      className="mb-6 border-b pb-6 last:border-0 last:pb-0"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3">
                        <h4 className="font-medium text-lg text-gray-800 dark:text-white">
                          {meal.name}
                        </h4>
                        <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                          {meal.templateName && (
                            <span className="italic">
                              "{meal.templateName}"
                            </span>
                          )}
                          {meal.difficulty && (
                            <span
                              className={`px-2 py-1 rounded-full text-xs ${
                                meal.difficulty === "easy"
                                  ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                                  : meal.difficulty === "medium"
                                  ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300"
                                  : "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"
                              }`}
                            >
                              {meal.difficulty}
                            </span>
                          )}
                          {meal.prepTime && (
                            <span className="flex items-center">
                              <Activity className="h-4 w-4 mr-1" />
                              {meal.prepTime} min
                            </span>
                          )}
                        </div>
                      </div>
                      <ul className="space-y-2">
                        {meal.items.map((item, i) => (
                          <li
                            key={i}
                            className="flex flex-col sm:flex-row sm:items-center text-gray-600 dark:text-gray-300"
                          >
                            <div className="flex items-center">
                              <Check
                                className={`h-4 w-4 ${colorTheme.primaryText} mr-2`}
                              />
                              <span className="font-medium">{item.food}</span>
                              <span className="ml-2 text-sm text-gray-500">
                                ({item.grams}g)
                              </span>
                            </div>
                            <div className="sm:ml-auto text-sm text-gray-500 dark:text-gray-300">
                              {item.protein}g P • {item.carbs}g C • {item.fats}g
                              F • {item.calories} kcal
                            </div>
                          </li>
                        ))}
                      </ul>
                      <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
                        <div className="flex justify-between text-sm font-medium text-gray-700 dark:text-gray-300">
                          <span>
                            Total: {Math.round(meal.total.calories)} kcal
                          </span>
                          <span>
                            {Math.round(meal.total.protein)}g P •{" "}
                            {Math.round(meal.total.carbs)}g C •{" "}
                            {Math.round(meal.total.fats)}g F
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-600 dark:text-gray-300 mb-4">
                      No meal plan generated. This might be due to:
                    </p>
                    <ul className="text-sm text-gray-500 dark:text-gray-400 space-y-1">
                      <li>• Missing quiz answers</li>
                      <li>• Invalid diet type selection</li>
                      <li>• No suitable meal templates found</li>
                    </ul>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-4">
                      Check the browser console for debugging information.
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* Exercise Plan Tab */}
          {activeTab === "exercise" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
                Your Exercise Routine
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-6">
                  <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
                    Workout Summary
                  </h3>
                  <ul className="space-y-4">
                    <li className="flex justify-between items-center">
                      <span className="text-gray-600 dark:text-gray-300">
                        Preferred Type
                      </span>
                      <span className="font-semibold text-gray-800 dark:text-white">
                        {answers[12] as string}
                      </span>
                    </li>
                    <li className="flex justify-between items-center">
                      <span className="text-gray-600 dark:text-gray-300">
                        Duration
                      </span>
                      <span className="font-semibold text-gray-800 dark:text-white">
                        {answers[11] as string}
                      </span>
                    </li>
                    <li className="flex justify-between items-center">
                      <span className="text-gray-600 dark:text-gray-300">
                        Frequency
                      </span>
                      <span className="font-semibold text-gray-800 dark:text-white">
                        4-5 times per week
                      </span>
                    </li>
                  </ul>
                </div>

                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-6">
                  <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
                    Weekly Goals
                  </h3>
                  <ul className="space-y-3">
                    <li className="flex items-center">
                      <Check
                        className={`h-5 w-5 ${colorTheme.primaryText} mr-2`}
                      />
                      <span className="text-gray-600 dark:text-gray-300">
                        Complete 4-5 workout sessions
                      </span>
                    </li>
                    <li className="flex items-center">
                      <Check
                        className={`h-5 w-5 ${colorTheme.primaryText} mr-2`}
                      />
                      <span className="text-gray-600 dark:text-gray-300">
                        Maintain consistent intensity
                      </span>
                    </li>
                    <li className="flex items-center">
                      <Check
                        className={`h-5 w-5 ${colorTheme.primaryText} mr-2`}
                      />
                      <span className="text-gray-600 dark:text-gray-300">
                        Include both cardio and strength
                      </span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Weekly Schedule */}
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-6">
                <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-6">
                  Weekly Schedule
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[
                    {
                      day: "Monday",
                      workout: "Cardio + Core",
                      duration: "45 min",
                    },
                    {
                      day: "Tuesday",
                      workout: "Upper Body Strength",
                      duration: "40 min",
                    },
                    {
                      day: "Wednesday",
                      workout: "Rest/Light Stretching",
                      duration: "20 min",
                    },
                    {
                      day: "Thursday",
                      workout: "Lower Body Strength",
                      duration: "40 min",
                    },
                    {
                      day: "Friday",
                      workout: "HIIT Training",
                      duration: "30 min",
                    },
                    {
                      day: "Saturday",
                      workout: "Full Body Workout",
                      duration: "45 min",
                    },
                    {
                      day: "Sunday",
                      workout: "Rest/Recovery",
                      duration: "0 min",
                    },
                  ].map((day, index) => (
                    <div
                      key={index}
                      className="bg-white dark:bg-gray-800 rounded-lg p-4 border dark:border-gray-700"
                    >
                      <h4 className="font-medium text-gray-800 dark:text-white mb-2">
                        {day.day}
                      </h4>
                      <p className="text-gray-600 dark:text-gray-300">
                        {day.workout}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        {day.duration}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* Progress Tab */}
          {activeTab === "progress" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
                Track Your Progress
              </h2>
              <div className="text-center py-6">
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  Log your daily activities to visualize your journey!
                </p>
                <button
                  className={`px-6 py-3 ${colorTheme.primaryBg} hover:${colorTheme.primaryHover} text-white font-medium rounded-full transition-colors`}
                  onClick={() => setShowLogModal(true)}
                >
                  Log Today's Activities
                </button>
              </div>
              {/* Progression cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 flex flex-col items-center">
                  <Flame className="h-6 w-6 text-red-500 mb-2" />
                  <span className="text-gray-600 dark:text-gray-300">
                    Calories Burned
                  </span>
                  <span className="text-2xl font-bold text-gray-800 dark:text-white">
                    {totalCalories} kcal
                  </span>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 flex flex-col items-center">
                  <Activity className="h-6 w-6 text-purple-500 mb-2" />
                  <span className="text-gray-600 dark:text-gray-300">
                    Steps
                  </span>
                  <span className="text-2xl font-bold text-gray-800 dark:text-white">
                    {totalSteps}
                  </span>
                </div>
                {/* Add the following card for total duration: */}
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 flex flex-col items-center">
                  <Check className="h-6 w-6 text-green-500 mb-2" />
                  <span className="text-gray-600 dark:text-gray-300">
                    Duration
                  </span>
                  <span className="text-2xl font-bold text-gray-800 dark:text-white">
                    {totalDuration} min
                  </span>
                </div>
              </div>
              {/* Charts */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                  <h4 className="font-semibold mb-2 text-gray-800 dark:text-white">
                    Calories Burned
                  </h4>
                  <Line
                    data={chartData("calories_burned")}
                    options={{
                      plugins: { legend: { display: false } },
                      scales: { y: { beginAtZero: true } },
                    }}
                  />
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                  <h4 className="font-semibold mb-2 text-gray-800 dark:text-white">
                    Steps
                  </h4>
                  <Line
                    data={chartData("steps")}
                    options={{
                      plugins: { legend: { display: false } },
                      scales: { y: { beginAtZero: true } },
                    }}
                  />
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                  <h4 className="font-semibold mb-2 text-gray-800 dark:text-white">
                    Duration (min)
                  </h4>
                  <Line
                    data={chartData("duration_minutes")}
                    options={{
                      plugins: { legend: { display: false } },
                      scales: { y: { beginAtZero: true } },
                    }}
                  />
                </div>
              </div>
              {/* Recent Activity Logs Table with Edit/Delete */}
              <div className="mb-8">
                <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
                  Recent Activity Logs
                </h3>
                {activityLogs.length === 0 ? (
                  <p className="text-gray-500 dark:text-gray-400">
                    No activity logs yet.
                  </p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                      <thead>
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                            Date
                          </th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                            Type
                          </th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                            Duration
                          </th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                            Calories
                          </th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                            Steps
                          </th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                            Notes
                          </th>
                          <th className="px-4 py-2"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {activityLogs.map((log) => (
                          <tr
                            key={log.id}
                            className="bg-white dark:bg-gray-800"
                          >
                            <td className="px-4 py-2 text-sm text-gray-700 dark:text-gray-200">
                              {log.activity_date}
                            </td>
                            <td className="px-4 py-2 text-sm text-gray-700 dark:text-gray-200">
                              {log.activity_type}
                            </td>
                            <td className="px-4 py-2 text-sm text-gray-700 dark:text-gray-200">
                              {log.duration_minutes || "-"}
                            </td>
                            <td className="px-4 py-2 text-sm text-gray-700 dark:text-gray-200">
                              {log.calories_burned || "-"}
                            </td>
                            <td className="px-4 py-2 text-sm text-gray-700 dark:text-gray-200">
                              {log.steps || "-"}
                            </td>
                            <td className="px-4 py-2 text-sm text-gray-700 dark:text-gray-200">
                              {log.notes || "-"}
                            </td>
                            <td className="px-4 py-2 flex gap-2">
                              <button
                                onClick={() => openEditModal(log)}
                                className="text-blue-500 hover:text-blue-700"
                              >
                                <Edit className="h-5 w-5" />
                              </button>
                              <button
                                onClick={() => setDeleteLogId(log.id)}
                                className="text-red-500 hover:text-red-700"
                              >
                                <Trash2 className="h-5 w-5" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
              {/* Log Modal */}
              {showLogModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
                  <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-8 w-full max-w-md relative">
                    <button
                      className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                      onClick={() => setShowLogModal(false)}
                    >
                      <X className="h-6 w-6" />
                    </button>
                    <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-6">
                      Log Today's Activity
                    </h2>
                    <form onSubmit={handleLogSubmit} className="space-y-4">
                      <div>
                        <label className="block text-gray-700 dark:text-gray-200 mb-1">
                          Activity Type
                        </label>
                        <select
                          className="w-full p-2 border rounded-lg bg-white dark:bg-gray-800 dark:text-white"
                          value={logForm.activity_type}
                          onChange={(e) =>
                            setLogForm((f) => ({
                              ...f,
                              activity_type: e.target.value,
                            }))
                          }
                          required
                        >
                          <option>Workout</option>
                          <option>Steps</option>
                          <option>Cardio</option>
                          <option>Yoga</option>
                          <option>Swimming</option>
                          <option>Cycling</option>
                          <option>Running</option>
                          <option>Walking</option>
                          <option>Meditation</option>
                          <option>Other</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-gray-700 dark:text-gray-200 mb-1">
                          Duration (minutes)
                        </label>
                        <input
                          type="number"
                          className="w-full p-2 border rounded-lg bg-white dark:bg-gray-800 dark:text-white"
                          value={logForm.duration_minutes}
                          onChange={(e) =>
                            setLogForm((f) => ({
                              ...f,
                              duration_minutes: e.target.value,
                            }))
                          }
                          min={0}
                        />
                      </div>
                      <div>
                        <label className="block text-gray-700 dark:text-gray-200 mb-1">
                          Calories Burned
                        </label>
                        <input
                          type="number"
                          className="w-full p-2 border rounded-lg bg-white dark:bg-gray-800 dark:text-white"
                          value={logForm.calories_burned}
                          onChange={(e) =>
                            setLogForm((f) => ({
                              ...f,
                              calories_burned: e.target.value,
                            }))
                          }
                          min={0}
                        />
                      </div>
                      <div>
                        <label className="block text-gray-700 dark:text-gray-200 mb-1">
                          Steps
                        </label>
                        <input
                          type="number"
                          className="w-full p-2 border rounded-lg bg-white dark:bg-gray-800 dark:text-white"
                          value={logForm.steps}
                          onChange={(e) =>
                            setLogForm((f) => ({ ...f, steps: e.target.value }))
                          }
                          min={0}
                        />
                      </div>
                      <div>
                        <label className="block text-gray-700 dark:text-gray-200 mb-1">
                          Notes
                        </label>
                        <textarea
                          className="w-full p-2 border rounded-lg bg-white dark:bg-gray-800 dark:text-white"
                          value={logForm.notes}
                          onChange={(e) =>
                            setLogForm((f) => ({ ...f, notes: e.target.value }))
                          }
                          rows={2}
                        />
                      </div>
                      <button
                        type="submit"
                        className={`w-full py-2 ${colorTheme.primaryBg} hover:${colorTheme.primaryHover} text-white font-semibold rounded-lg transition-colors`}
                        disabled={logLoading}
                      >
                        {logLoading ? "Logging..." : "Save Activity"}
                      </button>
                    </form>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </div>
      </div>
      {/* Edit Modal */}
      {editLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-8 w-full max-w-md relative">
            <button
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              onClick={() => setEditLog(null)}
            >
              <X className="h-6 w-6" />
            </button>
            <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-6">
              Edit Activity
            </h2>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="block text-gray-700 dark:text-gray-200 mb-1">
                  Activity Type
                </label>
                <select
                  className="w-full p-2 border rounded-lg bg-white dark:bg-gray-800 dark:text-white"
                  value={editForm.activity_type}
                  onChange={(e) =>
                    setEditForm((f) => ({
                      ...f,
                      activity_type: e.target.value,
                    }))
                  }
                  required
                >
                  <option>Workout</option>
                  <option>Steps</option>
                  <option>Cardio</option>
                  <option>Yoga</option>
                  <option>Swimming</option>
                  <option>Cycling</option>
                  <option>Running</option>
                  <option>Walking</option>
                  <option>Meditation</option>
                  <option>Other</option>
                </select>
              </div>
              <div>
                <label className="block text-gray-700 dark:text-gray-200 mb-1">
                  Duration (minutes)
                </label>
                <input
                  type="number"
                  className="w-full p-2 border rounded-lg bg-white dark:bg-gray-800 dark:text-white"
                  value={editForm.duration_minutes}
                  onChange={(e) =>
                    setEditForm((f) => ({
                      ...f,
                      duration_minutes: e.target.value,
                    }))
                  }
                  min={0}
                />
              </div>
              <div>
                <label className="block text-gray-700 dark:text-gray-200 mb-1">
                  Calories Burned
                </label>
                <input
                  type="number"
                  className="w-full p-2 border rounded-lg bg-white dark:bg-gray-800 dark:text-white"
                  value={editForm.calories_burned}
                  onChange={(e) =>
                    setEditForm((f) => ({
                      ...f,
                      calories_burned: e.target.value,
                    }))
                  }
                  min={0}
                />
              </div>
              <div>
                <label className="block text-gray-700 dark:text-gray-200 mb-1">
                  Steps
                </label>
                <input
                  type="number"
                  className="w-full p-2 border rounded-lg bg-white dark:bg-gray-800 dark:text-white"
                  value={editForm.steps}
                  onChange={(e) =>
                    setEditForm((f) => ({ ...f, steps: e.target.value }))
                  }
                  min={0}
                />
              </div>
              <div>
                <label className="block text-gray-700 dark:text-gray-200 mb-1">
                  Notes
                </label>
                <textarea
                  className="w-full p-2 border rounded-lg bg-white dark:bg-gray-800 dark:text-white"
                  value={editForm.notes}
                  onChange={(e) =>
                    setEditForm((f) => ({ ...f, notes: e.target.value }))
                  }
                  rows={2}
                />
              </div>
              {editError && <p className="text-red-500 text-sm">{editError}</p>}
              <button
                type="submit"
                className={`w-full py-2 ${colorTheme.primaryBg} hover:${colorTheme.primaryHover} text-white font-semibold rounded-lg transition-colors`}
                disabled={editLoading}
              >
                {editLoading ? "Saving..." : "Save Changes"}
              </button>
            </form>
          </div>
        </div>
      )}
      {/* Delete Confirmation Modal */}
      {deleteLogId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-8 w-full max-w-sm relative">
            <button
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              onClick={() => setDeleteLogId(null)}
            >
              <X className="h-6 w-6" />
            </button>
            <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-6">
              Delete Activity
            </h2>
            <p className="mb-6 text-gray-700 dark:text-gray-300">
              Are you sure you want to delete this activity log?
            </p>
            {deleteError && (
              <p className="text-red-500 text-sm mb-2">{deleteError}</p>
            )}
            <div className="flex gap-4">
              <button
                className="flex-1 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded-lg"
                onClick={() => setDeleteLogId(null)}
                disabled={deleteLoading}
              >
                Cancel
              </button>
              <button
                className="flex-1 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg"
                onClick={handleDelete}
                disabled={deleteLoading}
              >
                {deleteLoading ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
