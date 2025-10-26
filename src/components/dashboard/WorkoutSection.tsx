import { supabase } from "@/lib/supabase";
import type { DashboardWorkoutPlan, WorkoutExercise } from "@/types/dashboard";
import { Plus } from "lucide-react";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import {
  LogWorkoutModal,
  NutritionPanel,
  TipsPanel,
  WorkoutList,
  ProgressCards as WorkoutProgressCards,
  WorkoutTabs,
} from "./WorkoutPlan";
import { LifestylePanel } from "./WorkoutPlan/LifestylePanel";
import { OverviewPanel } from "./WorkoutPlan/OverviewPanel";
import { ProgressPanel } from "./WorkoutPlan/ProgressPanel";

interface WorkoutSectionProps {
  userId: string;
  workoutPlanData: DashboardWorkoutPlan;
}

type WorkoutLogData = {
  workout_date: string;
  duration_minutes: number;
  calories_burned: number;
  completed: boolean;
};

type ExerciseLog = Omit<
  WorkoutExercise,
  | "progression"
  | "alternatives"
  | "instructions"
  | "safety_notes"
  | "muscle_groups"
  | "equipment_needed"
  | "tempo"
> & { difficulty: string };

type WorkoutLog = {
  workout_type: string;
  exercises: ExerciseLog[];
  notes: string;
  duration_minutes?: number;
  calories_burned?: number;
  completed?: boolean;
};

const INITIAL_EXERCISE: ExerciseLog = {
  name: "",
  reps: 0,
  sets: 0,
  difficulty: "",
  category: "",
  rest_seconds: 0,
};

const INITIAL_WORKOUT_LOG: WorkoutLog = {
  workout_type: "Strength training",
  exercises: [],
  notes: "",
  duration_minutes: 0,
  calories_burned: 0,
  completed: false,
};

const getWeekStartDate = (): string => {
  const today = new Date();
  const dayOfWeek = today.getDay();
  const diff = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  const monday = new Date(today);
  monday.setDate(today.getDate() - diff);
  return monday.toISOString().split("T")[0];
};

const calculateStreak = (logs: WorkoutLogData[]): number => {
  if (logs.length === 0) return 0;

  const sortedDates = Array.from(
    new Set(logs.filter(log => log.completed).map(log => log.workout_date))
  ).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

  if (sortedDates.length === 0) return 0;

  const today = new Date().toISOString().split("T")[0];
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split("T")[0];

  if (sortedDates[0] !== today && sortedDates[0] !== yesterdayStr) {
    return 0;
  }

  let streak = 1;
  for (let i = 1; i < sortedDates.length; i++) {
    const currentDate = new Date(sortedDates[i - 1]);
    const previousDate = new Date(sortedDates[i]);
    const diffDays = Math.floor(
      (currentDate.getTime() - previousDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    if (diffDays === 1) {
      streak++;
    } else {
      break;
    }
  }
  return streak;
};

export const WorkoutSection: React.FC<WorkoutSectionProps> = React.memo(
  ({ userId, workoutPlanData }) => {
    const [showLogModal, setShowLogModal] = useState(false);
    const [expandedDay, setExpandedDay] = useState<string | null>("");
    const [expandedExercise, setExpandedExercise] = useState<string | null>("");
    const [workoutLog, setWorkoutLog] =
      useState<WorkoutLog>(INITIAL_WORKOUT_LOG);
    const [weeklyLogs, setWeeklyLogs] = useState<WorkoutLogData[]>([]);
    const [newExercise, setNewExercise] =
      useState<ExerciseLog>(INITIAL_EXERCISE);
    const [selectedTab, setSelectedTab] = useState("overview");

    const loadWeeklyLogs = useCallback(async () => {
      try {
        const weekStart = getWeekStartDate();
        const { data, error } = await supabase
          .from("workout_logs")
          .select("workout_date, duration_minutes, calories_burned, completed")
          .eq("user_id", userId)
          .gte("workout_date", weekStart)
          .order("workout_date", { ascending: false });
        if (data && !error) setWeeklyLogs(data);
      } catch (error) {
        console.error("Error loading weekly logs:", error);
      }
    }, [userId]);

    useEffect(() => {
      loadWeeklyLogs();
    }, [loadWeeklyLogs]);

    const addWorkoutToLog = useCallback(() => {
      if (!newExercise.name || newExercise.reps <= 0 || newExercise.sets <= 0) {
        toast.error("Please fill in exercise name, reps and sets");
        return;
      }
      setWorkoutLog((prev) => ({
        ...prev,
        exercises: [...prev.exercises, { ...newExercise }],
      }));
      setNewExercise(INITIAL_EXERCISE);
    }, [newExercise]);

    const removeExerciseFromLog = useCallback((index: number) => {
      setWorkoutLog((prev) => ({
        ...prev,
        exercises: prev.exercises.filter((_, i) => i !== index),
      }));
    }, []);

    const saveWorkoutLog = useCallback(async () => {
      if (!workoutLog.duration_minutes || !workoutLog.calories_burned) {
        toast.error("Please fill in duration and calories burned");
        return;
      }
      if (workoutLog.exercises.length === 0) {
        toast.error("Please add at least one exercise");
        return;
      }
      try {
        const { error } = await supabase.from("workout_logs").insert({
          user_id: userId,
          workout_type: workoutLog.workout_type,
          exercises: workoutLog.exercises,
          duration_minutes: workoutLog.duration_minutes,
          calories_burned: workoutLog.calories_burned,
          completed: workoutLog.completed ?? false,
          notes: workoutLog.notes,
        });
        if (error) throw error;
        toast.success("Workout logged successfully! 🎉");
        setShowLogModal(false);
        setWorkoutLog(INITIAL_WORKOUT_LOG);
        loadWeeklyLogs();
      } catch (error) {
        console.error("Error saving workout log:", error);
        toast.error("Failed to save workout log");
      }
    }, [workoutLog, userId, loadWeeklyLogs]);

    const handleCloseModal = useCallback(() => setShowLogModal(false), []);
    const handleOpenModal = useCallback(() => setShowLogModal(true), []);

    // Memoized stat calculations
    const stats = useMemo(() => {
      const uniqueCompletedDays = new Set(
        weeklyLogs.filter(log => log.completed).map(log => log.workout_date)
      ).size;

      const weeklyCaloriesBurned = weeklyLogs
        .filter(log => log.completed)
        .reduce((sum, log) => sum + (log.calories_burned || 0), 0);

      const weeklyTotalTime = weeklyLogs
        .filter(log => log.completed)
        .reduce((sum, log) => sum + (log.duration_minutes || 0), 0);

      const currentStreak = calculateStreak(weeklyLogs);

      const weeklyTarget =
        workoutPlanData?.plan_data.weekly_summary?.total_workout_days || 5;
      const weeklyProgress = (uniqueCompletedDays / weeklyTarget) * 100;

      return {
        weeklyWorkoutCount: uniqueCompletedDays,
        weeklyCaloriesBurned,
        weeklyTarget,
        weeklyProgress,
        weeklyTotalTime,
        currentStreak,
      };
    }, [weeklyLogs, workoutPlanData?.plan_data.weekly_summary]);

    // Memoized tabs configuration
    const tabs = useMemo(
      () => [
        {
          name: "overview",
          bg: "from-indigo-600 to-purple-600",
          color: "text-white",
          ringColor: "ring-indigo-500/50",
        },
        {
          name: "weekly",
          bg: "from-blue-600 to-cyan-600",
          color: "text-white",
          ringColor: "ring-blue-500/50",
        },
        {
          name: "progress",
          bg: "from-green-600 to-emerald-600",
          color: "text-white",
          ringColor: "ring-green-500/50",
        },
        {
          name: "lifestyle",
          bg: "from-purple-600 to-pink-600",
          color: "text-white",
          ringColor: "ring-purple-500/50",
        },
        {
          name: "nutrition",
          bg: "from-pink-600 to-rose-600",
          color: "text-white",
          ringColor: "ring-pink-500/50",
        },
        {
          name: "tips",
          bg: "from-orange-600 to-red-600",
          color: "text-white",
          ringColor: "ring-orange-500/50",
        },
      ],
      []
    );

    // Memoized tab panels
    const tabPanels = useMemo(
      () => [
        <OverviewPanel
          key="overview"
          summary={workoutPlanData?.plan_data?.weekly_summary}
        />,
        <WorkoutList
          key="weekly"
          planData={workoutPlanData?.plan_data}
          expandedDay={expandedDay}
          setExpandedDay={setExpandedDay}
          expandedExercise={expandedExercise}
          setExpandedExercise={setExpandedExercise}
        />,
        <ProgressPanel
          key="progress"
          periodization={workoutPlanData?.plan_data?.periodization_plan}
          progression={workoutPlanData?.plan_data?.progression_tracking}
        />,
        <LifestylePanel
          key="lifestyle"
          lifestyle={workoutPlanData?.plan_data?.lifestyle_integration}
          exerciseLibrary={
            workoutPlanData?.plan_data?.exercise_library_by_location
          }
        />,
        <NutritionPanel
          key="nutrition"
          nutrition={workoutPlanData?.plan_data?.nutrition_timing}
          injuryPrevention={workoutPlanData?.plan_data?.injury_prevention}
        />,
        <TipsPanel
          key="tips"
          summary={workoutPlanData?.plan_data?.weekly_summary}
          tips={workoutPlanData?.plan_data?.personalized_tips}
        />,
      ],
      [workoutPlanData, expandedDay, expandedExercise]
    );

    // Memoized progress stats
    const progressStats = useMemo(
      () => ({
        progress: {
          value: stats.weeklyWorkoutCount,
          target: stats.weeklyTarget,
          label: "Sessions Complete",
          percentage: stats.weeklyProgress,
          subtitle: `of ${stats.weeklyTarget} days`,
          color: "text-indigo-600 dark:text-indigo-400",
          bg: "from-indigo-500/10 via-purple-500/10 to-pink-500/10",
        },
        burned: {
          value: stats.weeklyCaloriesBurned,
          label: "Calories Burned",
          subtitle: "This week",
          color: "text-orange-600 dark:text-orange-400",
          bg: "from-orange-500/10 via-red-500/10 to-pink-500/10",
        },
        streak: {
          value: stats.currentStreak,
          label: "Workout Streak",
          subtitle: "Consecutive days",
          color: "text-green-600 dark:text-green-400",
          bg: "from-green-500/10 via-emerald-500/10 to-teal-500/10",
        },
        time: {
          value: stats.weeklyTotalTime,
          label: "Total Time (min)",
          subtitle: "This week",
          color: "text-blue-600 dark:text-blue-400",
          bg: "from-blue-500/10 via-cyan-500/10 to-sky-500/10",
        },
      }),
      [stats]
    );

    if (!workoutPlanData) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950 p-6">
          <div className="max-w-4xl mx-auto text-center py-12">
            <div className="bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm rounded-md p-12 border border-slate-200/50 dark:border-slate-700/50">
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                No Workout Plan Yet
              </h3>
              <p className="text-slate-600 dark:text-slate-400">
                Complete the fitness quiz to get your personalized AI workout
                plan!
              </p>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="mx-auto space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
              Your AI Workout Plan
            </h2>
            <p className="text-slate-600 dark:text-slate-400">
              Personalized training designed for your goals
            </p>
          </div>
          <button
            onClick={handleOpenModal}
            className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-md font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all flex items-center gap-2"
          >
            <Plus className="h-5 w-5" /> Log Workout
          </button>
        </div>
        <WorkoutProgressCards {...progressStats} />
        <WorkoutTabs
          currentTab={selectedTab}
          onTabChange={setSelectedTab}
          tabs={tabs}
          tabPanels={tabPanels}
        />
        <LogWorkoutModal
          show={showLogModal}
          onClose={handleCloseModal}
          workoutLog={workoutLog}
          newExercise={newExercise}
          onNewExerciseChange={setNewExercise}
          onWorkoutLogChange={setWorkoutLog}
          onAddExercise={addWorkoutToLog}
          onRemoveExercise={removeExerciseFromLog}
          onSave={saveWorkoutLog}
        />
      </div>
    );
  }
);
