import { type ExerciseLog, useWorkoutLogs, type WorkoutLog } from "@/features/workout";
import { Plus } from "lucide-react";
import React, { memo, useCallback, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { useWorkoutPlan } from "../../hooks/useWorkoutPlan";
import { PlanGenerationError } from "@/shared/components/feedback/PlanGenerationError";
import { useQueryClient } from "@tanstack/react-query";
import {
  LogWorkoutModal,
  NutritionPanel,
  TipsPanel,
  WorkoutList,
  ProgressCards as WorkoutProgressCards,
  WorkoutTabs,
} from "../WorkoutPlan";
import { LifestylePanel } from "../WorkoutPlan/LifestylePanel";
import { OverviewPanel } from "../WorkoutPlan/OverviewPanel";
import { ProgressPanel } from "../WorkoutPlan/ProgressPanel";
import { WorkoutPlanSkeleton } from "../WorkoutPlan/WorkoutPlanSkeleton";

interface WorkoutSectionProps {
  userId: string;
}

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

const TABS = [
  {
    name: "overview",
    bg: "bg-progress-indigo-purple",
    color: "text-white",
    ringColor: "ring-indigo-500/50",
  },
  {
    name: "weekly",
    bg: "bg-progress-blue-cyan",
    color: "text-white",
    ringColor: "ring-blue-500/50",
  },
  {
    name: "progress",
    bg: "bg-progress-green-emerald",
    color: "text-white",
    ringColor: "ring-green-500/50",
  },
  {
    name: "lifestyle",
    bg: "bg-progress-purple-pink",
    color: "text-white",
    ringColor: "ring-purple-500/50",
  },
  {
    name: "nutrition",
    bg: "bg-progress-purple-pink",
    color: "text-white",
    ringColor: "ring-pink-500/50",
  },
  {
    name: "tips",
    bg: "bg-progress-orange-red",
    color: "text-white",
    ringColor: "ring-orange-500/50",
  },
];

export const WorkoutSection: React.FC<WorkoutSectionProps> = memo(({ userId }) => {
  const [showLogModal, setShowLogModal] = useState(false);
  const [expandedDay, setExpandedDay] = useState<string | null>("");
  const [expandedExercise, setExpandedExercise] = useState<string | null>("");
  const [workoutLog, setWorkoutLog] = useState<WorkoutLog>(INITIAL_WORKOUT_LOG);
  const [newExercise, setNewExercise] = useState<ExerciseLog>(INITIAL_EXERCISE);
  const [selectedTab, setSelectedTab] = useState("overview");
  const queryClient = useQueryClient();

  // Unified data fetching with polling
  const {
    data: workoutPlanData,
    isLoading,
    isGenerating,
    isError,
    errorMessage,
    hasNoPlan,
  } = useWorkoutPlan(userId);

  // Get weekly target from workout plan
  const weeklyTarget = workoutPlanData?.plan_data?.weekly_summary?.total_workout_days || 5;

  // Use the workout logs hook
  const { stats, logWorkout, isLoggingWorkout } = useWorkoutLogs(userId, weeklyTarget);

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

  const saveWorkoutLog = useCallback(() => {
    if (!workoutLog.duration_minutes || !workoutLog.calories_burned) {
      toast.error("Please fill in duration and calories burned");
      return;
    }
    if (workoutLog.exercises.length === 0) {
      toast.error("Please add at least one exercise");
      return;
    }

    // Add today's date to the workout log
    const logWithDate = {
      ...workoutLog,
      workout_date: new Date().toISOString().split("T")[0],
      completed: true,
    };

    // Use the hook's mutation function
    logWorkout(logWithDate);
  }, [workoutLog, logWorkout]);

  const handleCloseModal = useCallback(() => setShowLogModal(false), []);
  const handleOpenModal = useCallback(() => setShowLogModal(true), []);

  // Memoized tab panels
  const tabPanels = useMemo(
    () => [
      <OverviewPanel key="overview" summary={workoutPlanData?.plan_data?.weekly_summary!} />,
      <WorkoutList
        key="weekly"
        planData={workoutPlanData?.plan_data!}
        expandedDay={expandedDay}
        setExpandedDay={setExpandedDay}
        expandedExercise={expandedExercise}
        setExpandedExercise={setExpandedExercise}
      />,
      <ProgressPanel
        key="progress"
        periodization={workoutPlanData?.plan_data?.periodization_plan!}
        progression={workoutPlanData?.plan_data?.progression_tracking!}
      />,
      <LifestylePanel
        key="lifestyle"
        lifestyle={workoutPlanData?.plan_data?.lifestyle_integration!}
        exerciseLibrary={workoutPlanData?.plan_data?.exercise_library_by_location!}
      />,
      <NutritionPanel
        key="nutrition"
        nutrition={workoutPlanData?.plan_data?.nutrition_timing!}
        injuryPrevention={workoutPlanData?.plan_data?.injury_prevention!}
      />,
      <TipsPanel
        key="tips"
        summary={workoutPlanData?.plan_data?.weekly_summary!}
        tips={workoutPlanData?.plan_data?.personalized_tips!}
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
        color: "text-gradient-indigo-purple",
        bg: "bg-stat-indigo",
      },
      burned: {
        value: stats.weeklyCaloriesBurned,
        label: "Calories Burned",
        subtitle: "This week",
        color: "text-gradient-orange-red",
        bg: "bg-stat-orange",
      },
      streak: {
        value: stats.currentStreak,
        label: "Workout Streak",
        subtitle: "Consecutive days",
        color: "text-gradient-green-emerald",
        bg: "bg-stat-green",
      },
      time: {
        value: stats.weeklyTotalTime,
        label: "Total Time (min)",
        subtitle: "This week",
        color: "text-gradient-blue-cyan",
        bg: "bg-stat-blue",
        },
    }),
    [stats]
  );

  // Loading state (initial load or generating)
  if (isLoading || isGenerating) {
    return (
      <div className="mx-auto space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h2 className="text-3xl font-bold text-gradient-indigo-purple mb-2">
              Your AI Workout Plan
            </h2>
            <p className="text-muted-foreground">
              {isGenerating ? "Being generated by AI..." : "Loading..."}
            </p>
          </div>
        </div>
        <WorkoutPlanSkeleton />
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <PlanGenerationError
        userId={userId}
        planType="workout"
        errorMessage={errorMessage}
        onRetrySuccess={() => {
          // Invalidate queries to refetch data after retry
          queryClient.invalidateQueries({ queryKey: ["workoutPlan", userId] });
        }}
      />
    );
  }

  // Empty state - no plan exists
  if (hasNoPlan) {
    return (
      <div className="min-h-screen bg-page-slate-blue p-6">
        <div className="max-w-4xl mx-auto text-center py-12">
          <div className="bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm rounded-md p-12 border border-slate-200/50 dark:border-slate-700/50">
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
              No Workout Plan Yet
            </h3>
            <p className="text-muted-foreground">
              Complete the fitness quiz to get your personalized AI workout plan!
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
          <h2 className="text-3xl font-bold text-gradient-indigo-purple mb-2">
            Your AI Workout Plan
          </h2>
          <p className="text-muted-foreground">
            Personalized training designed for your goals
          </p>
        </div>
        <button
          onClick={handleOpenModal}
          disabled={isLoggingWorkout}
          className="px-6 py-3 bg-progress-indigo-purple text-white rounded-md font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus className="h-5 w-5" /> {isLoggingWorkout ? "Logging..." : "Log Workout"}
        </button>
      </div>
      <WorkoutProgressCards {...progressStats} />
      <WorkoutTabs
        currentTab={selectedTab}
        onTabChange={setSelectedTab}
        tabs={TABS}
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
});

WorkoutSection.displayName = "WorkoutSection";