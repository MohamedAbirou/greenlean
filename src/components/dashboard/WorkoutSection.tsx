import { supabase } from "@/lib/supabase";
import type { DashboardWorkoutPlan } from "@/types/dashboard";
import type { ColorTheme } from "@/utils/colorUtils";
import { AnimatePresence, motion } from "framer-motion";
import {
  Activity,
  AlertCircle,
  Award,
  BarChart3,
  Calendar,
  Check,
  ChevronDown,
  ChevronUp,
  Clock,
  Dumbbell,
  Flame,
  Heart,
  Info,
  MapPin,
  Plus,
  Repeat,
  Save,
  Sparkles,
  Target,
  Timer,
  TrendingUp,
  Trophy,
  Wind,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";

interface WorkoutSectionProps {
  userId: string;
  workoutPlanData: DashboardWorkoutPlan;
  colorTheme: ColorTheme;
}

interface TodayLog {
  duration_minutes: number;
  calories_burned: number;
  completed: boolean;
}

interface ExerciseLog {
  name: string;
  reps: number;
  sets: number;
  difficulty: string;
  category: string;
  rest_seconds: number;
}

interface WorkoutLog {
  workout_type: string;
  exercises: ExerciseLog[];
  notes: string;
}

export const WorkoutSection: React.FC<WorkoutSectionProps> = ({
  userId,
  workoutPlanData,
  colorTheme,
}) => {
  const [showLogModal, setShowLogModal] = useState(false);
  const [expandedDay, setExpandedDay] = useState<string | null>("");
  const [expandedExercise, setExpandedExercise] = useState<string | null>("");
  const [workoutLog, setWorkoutLog] = useState<WorkoutLog>({
    workout_type: "Strength training",
    exercises: [],
    notes: "",
  });
  const [todayLogs, setTodayLogs] = useState<TodayLog[]>([]);
  const [newExercise, setNewExercise] = useState<ExerciseLog>({
    name: "",
    reps: 0,
    sets: 0,
    difficulty: "",
    category: "",
    rest_seconds: 0,
  });
  const [selectedTab, setSelectedTab] = useState("weekly");

  useEffect(() => {
    loadTodayLogs();
  }, [userId]);

  const loadTodayLogs = async () => {
    try {
      const today = new Date().toISOString().split("T")[0];
      const { data, error } = await supabase
        .from("workout_logs")
        .select("duration_minutes, calories_burned, completed")
        .eq("user_id", userId)
        .eq("workout_date", today)
        .order("created_at", { ascending: false });

      if (data && !error) {
        setTodayLogs(data);
      }
    } catch (error) {
      console.error("Error loading today's logs:", error);
    }
  };

  const addWorkoutToLog = () => {
    if (!newExercise.name || newExercise.reps <= 0 || newExercise.sets <= 0) {
      toast.error("Please fill in exercise name, reps and sets");
      return;
    }

    setWorkoutLog((prev) => ({
      ...prev,
      exercises: [...prev.exercises, { ...newExercise }],
    }));

    setNewExercise({
      name: "",
      reps: 0,
      sets: 0,
      difficulty: "",
      category: "",
      rest_seconds: 0,
    });
  };

  const removeExerciseFromLog = (index: number) => {
    setWorkoutLog((prev) => ({
      ...prev,
      exercises: prev.exercises.filter((_, i) => i !== index),
    }));
  };

  const saveWorkoutLog = async () => {
    if (workoutLog.exercises.length === 0) {
      toast.error("Please add at least one exercise item");
      return;
    }

    try {
      const totalReps = workoutLog.exercises.reduce(
        (sum, e) => sum + e.reps,
        0
      );
      const totalSets = workoutLog.exercises.reduce(
        (sum, e) => sum + e.sets,
        0
      );

      const { error } = await supabase.from("workout_logs").insert({
        user_id: userId,
        workout_type: workoutLog.workout_type,
        exercises: workoutLog.exercises,
        total_reps: totalReps,
        total_sets: totalSets,
        notes: workoutLog.notes,
      });

      if (error) throw error;

      toast.success("Workout logged successfully! 🎉");
      setShowLogModal(false);
      setWorkoutLog({
        workout_type: "Strength training",
        exercises: [],
        notes: "",
      });
      loadTodayLogs();
    } catch (error) {
      console.error("Error saving workout log:", error);
      toast.error("Failed to save workout log");
    }
  };

  const weeklyWorkoutCount = todayLogs.filter((log) => log.completed).length;
  const weeklyCaloriesBurned = todayLogs.reduce(
    (sum, log) => sum + (log.calories_burned || 0),
    0
  );
  const weeklyTarget =
    workoutPlanData?.plan_data.weekly_summary?.total_workout_days || 5;
  const weeklyProgress = (weeklyWorkoutCount / weeklyTarget) * 100;

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty?.toLowerCase()) {
      case "beginner":
        return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
      case "intermediate":
        return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400";
      case "advanced":
        return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
      default:
        return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400";
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category?.toLowerCase()) {
      case "compound":
        return <Dumbbell className="h-4 w-4" />;
      case "isolation":
        return <Target className="h-4 w-4" />;
      case "cardio":
        return <Activity className="h-4 w-4" />;
      case "mobility":
        return <Wind className="h-4 w-4" />;
      default:
        return <Dumbbell className="h-4 w-4" />;
    }
  };

  const getIntensityColor = (intensity: string) => {
    switch (intensity?.toLowerCase()) {
      case "low":
        return "from-green-500/20 to-emerald-500/20";
      case "moderate":
        return "from-yellow-500/20 to-orange-500/20";
      case "moderate-high":
        return "from-orange-500/20 to-red-500/20";
      case "high":
        return "from-red-500/20 to-pink-500/20";
      default:
        return "from-blue-500/20 to-cyan-500/20";
    }
  };

  if (!workoutPlanData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950 p-6">
        <div className="max-w-4xl mx-auto text-center py-12">
          <div className="bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm rounded-md p-12 border border-slate-200/50 dark:border-slate-700/50">
            <AlertCircle className="h-16 w-16 text-indigo-600 mx-auto mb-4" />
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
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between flex-wrap gap-4"
      >
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Your AI Workout Plan
          </h2>
          <p className="text-slate-600 dark:text-slate-400">
            Personalized training designed for your goals
          </p>
        </div>
        <button
          onClick={() => setShowLogModal(true)}
          className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-md font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all flex items-center gap-2"
        >
          <Plus className="h-5 w-5" />
          Log Workout
        </button>
      </motion.div>

      {/* Weekly Progress Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-md bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-pink-500/10 p-6 border border-indigo-200/20 dark:border-indigo-800/20 backdrop-blur-sm"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="bg-gradient-to-br from-indigo-600 to-purple-600 p-3 rounded-md shadow-lg">
              <Activity className="h-6 w-6 text-white" />
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                {weeklyProgress.toFixed(0)}%
              </div>
              <div className="text-xs text-slate-600 dark:text-slate-400">
                Complete
              </div>
            </div>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-2 font-medium">
            This Week
          </p>
          <p className="text-3xl font-bold text-slate-900 dark:text-white mb-3">
            {weeklyWorkoutCount}
            <span className="text-lg text-slate-500 dark:text-slate-400 font-normal">
              {" "}
              / {weeklyTarget} workouts
            </span>
          </p>
          <div className="h-3 bg-white/50 dark:bg-slate-800/50 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(weeklyProgress, 100)}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full"
            />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-md bg-gradient-to-br from-orange-500/10 via-red-500/10 to-pink-500/10 p-6 border border-orange-200/20 dark:border-orange-800/20 backdrop-blur-sm"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="bg-gradient-to-br from-orange-600 to-red-600 p-3 rounded-md shadow-lg">
              <Flame className="h-6 w-6 text-white" />
            </div>
            <Trophy className="h-6 w-6 text-orange-600 dark:text-orange-400" />
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-2 font-medium">
            Calories Burned
          </p>
          <p className="text-3xl font-bold text-slate-900 dark:text-white">
            {weeklyCaloriesBurned}
            <span className="text-sm text-slate-500 dark:text-slate-400 font-normal">
              {" "}
              kcal
            </span>
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-md bg-gradient-to-br from-green-500/10 via-emerald-500/10 to-teal-500/10 p-6 border border-green-200/20 dark:border-green-800/20 backdrop-blur-sm"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="bg-gradient-to-br from-green-600 to-emerald-600 p-3 rounded-md shadow-lg">
              <TrendingUp className="h-6 w-6 text-white" />
            </div>
            <Sparkles className="h-6 w-6 text-green-600 dark:text-green-400" />
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-2 font-medium">
            Streak
          </p>
          <p className="text-3xl font-bold text-slate-900 dark:text-white">
            {weeklyWorkoutCount}
            <span className="text-sm text-slate-500 dark:text-slate-400 font-normal">
              {" "}
              days
            </span>
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-md bg-gradient-to-br from-blue-500/10 via-cyan-500/10 to-sky-500/10 p-6 border border-blue-200/20 dark:border-blue-800/20 backdrop-blur-sm"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="bg-gradient-to-br from-blue-600 to-cyan-600 p-3 rounded-md shadow-lg">
              <Timer className="h-6 w-6 text-white" />
            </div>
            <BarChart3 className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-2 font-medium">
            Total Time
          </p>
          <p className="text-3xl font-bold text-slate-900 dark:text-white">
            {workoutPlanData?.plan_data.weekly_summary?.total_time_minutes}
            <span className="text-sm text-slate-500 dark:text-slate-400 font-normal">
              {" "}
              min
            </span>
          </p>
        </motion.div>
      </div>

      {/* Tab Navigation */}
      <div className="flex overflow-auto gap-2 bg-white/50 dark:bg-slate-900/50 p-2 rounded-md backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50">
        {["weekly", "nutrition", "tips"].map((tab) => (
          <button
            key={tab}
            onClick={() => setSelectedTab(tab)}
            className={`flex-1 px-4 py-3 rounded-lg font-semibold transition-all ${
              selectedTab === tab
                ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg"
                : "text-slate-600 dark:text-slate-400 hover:bg-white/50 dark:hover:bg-slate-800/50"
            }`}
          >
            {tab === "weekly" && <Calendar className="h-4 w-4 inline mr-2" />}
            {tab === "nutrition" && <Heart className="h-4 w-4 inline mr-2" />}
            {tab === "tips" && <Info className="h-4 w-4 inline mr-2" />}
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        {selectedTab === "weekly" && (
          <motion.div
            key="weekly"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-4"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-gradient-to-br from-indigo-600 to-purple-600 p-3 rounded-md shadow-lg">
                <Calendar className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
                  Weekly Schedule
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {workoutPlanData?.plan_data.weekly_summary?.training_split}
                </p>
              </div>
            </div>

            <div className="grid gap-4">
              {workoutPlanData?.plan_data.weekly_plan.map((workout, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.05 * index }}
                  className={`rounded-md bg-gradient-to-br ${getIntensityColor(
                    workout.intensity
                  )} border border-white/20 dark:border-slate-700/20 overflow-hidden backdrop-blur-sm shadow-lg hover:shadow-xl transition-all`}
                >
                  <button
                    onClick={() =>
                      setExpandedDay(
                        expandedDay === workout.day ? null : workout.day
                      )
                    }
                    className="w-full p-6 flex items-center justify-between hover:bg-white/10 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm p-4 rounded-md shadow-lg">
                        <Calendar className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                      </div>
                      <div className="text-left">
                        <div className="flex items-center gap-3 mb-1">
                          <h4 className="font-bold text-slate-900 dark:text-white text-lg">
                            {workout.day}
                          </h4>
                          {workout.optional && (
                            <span className="px-2 py-1 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 rounded-full text-xs font-semibold">
                              Optional
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-slate-700 dark:text-slate-300 font-medium">
                          {workout.workout_type}
                        </p>
                        <div className="flex items-center gap-3 mt-2 text-xs text-slate-600 dark:text-slate-400">
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {workout.training_location}
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Target className="h-3 w-3" />
                            {workout.focus}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right hidden sm:block">
                        <div className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300 font-semibold">
                          <Clock className="h-4 w-4" />
                          {workout.duration_minutes} min
                        </div>
                        {workout.estimated_calories_burned && (
                          <div className="flex items-center gap-2 text-sm text-orange-600 dark:text-orange-400 font-semibold mt-1">
                            <Flame className="h-4 w-4" />
                            {workout.estimated_calories_burned} cal
                          </div>
                        )}
                        <div className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                          {workout.intensity} intensity
                        </div>
                      </div>
                      {expandedDay === workout.day ? (
                        <ChevronUp className="h-6 w-6 text-slate-700 dark:text-slate-300" />
                      ) : (
                        <ChevronDown className="h-6 w-6 text-slate-700 dark:text-slate-300" />
                      )}
                    </div>
                  </button>

                  <AnimatePresence>
                    {expandedDay === workout.day && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="px-6 pb-6 space-y-4"
                      >
                        {/* Warmup */}
                        {workout.warmup && (
                          <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 backdrop-blur-sm rounded-md p-5 border border-blue-200/50 dark:border-blue-800/50">
                            <h5 className="font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                              <Wind className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                              Warm-up ({workout.warmup.duration_minutes} min)
                            </h5>
                            <div className="space-y-2">
                              {workout.warmup.activities.map(
                                (activity, actIndex) => (
                                  <div
                                    key={actIndex}
                                    className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-300"
                                  >
                                    <Check className="h-4 w-4 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                                    <span>{activity}</span>
                                  </div>
                                )
                              )}
                            </div>
                          </div>
                        )}

                        {/* Exercises */}
                        {workout.exercises && workout.exercises.length > 0 && (
                          <div className="space-y-3">
                            <h5 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                              <Dumbbell className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                              Exercises ({workout.exercises.length})
                            </h5>
                            {workout.exercises.map((exercise, exIndex) => (
                              <div
                                key={exIndex}
                                className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-md border border-slate-200/50 dark:border-slate-700/50 overflow-hidden"
                              >
                                <button
                                  onClick={() =>
                                    setExpandedExercise(
                                      expandedExercise ===
                                        `${workout.day}-${exIndex}`
                                        ? null
                                        : `${workout.day}-${exIndex}`
                                    )
                                  }
                                  className="w-full p-4 flex items-start justify-between hover:bg-white/70 dark:hover:bg-slate-800/70 transition-colors"
                                >
                                  <div className="flex items-start gap-3 flex-1">
                                    <div className="bg-gradient-to-br from-indigo-600 to-purple-600 p-2 rounded-lg shadow-md">
                                      {getCategoryIcon(exercise.category)}
                                      <div className="text-white text-xs font-bold mt-1">
                                        {exIndex + 1}
                                      </div>
                                    </div>
                                    <div className="text-left">
                                      <div className="flex items-center gap-2 mb-1">
                                        <h6 className="font-semibold text-slate-900 dark:text-white">
                                          {exercise.name}
                                        </h6>
                                        <span
                                          className={`px-2 py-0.5 rounded-full text-xs font-semibold ${getDifficultyColor(
                                            exercise.difficulty
                                          )}`}
                                        >
                                          {exercise.difficulty}
                                        </span>
                                      </div>
                                      <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400">
                                        <span className="font-semibold">
                                          {exercise.sets} sets × {exercise.reps}
                                        </span>
                                        <span>•</span>
                                        <span className="flex items-center gap-1">
                                          <Timer className="h-3 w-3" />
                                          {exercise.rest_seconds}s rest
                                        </span>
                                      </div>
                                      {exercise.tempo && (
                                        <div className="text-xs text-slate-500 dark:text-slate-500 mt-1">
                                          Tempo: {exercise.tempo}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                  {expandedExercise ===
                                  `${workout.day}-${exIndex}` ? (
                                    <ChevronUp className="h-5 w-5 text-slate-600 dark:text-slate-400 flex-shrink-0" />
                                  ) : (
                                    <ChevronDown className="h-5 w-5 text-slate-600 dark:text-slate-400 flex-shrink-0" />
                                  )}
                                </button>

                                <AnimatePresence>
                                  {expandedExercise ===
                                    `${workout.day}-${exIndex}` && (
                                    <motion.div
                                      initial={{ height: 0, opacity: 0 }}
                                      animate={{ height: "auto", opacity: 1 }}
                                      exit={{ height: 0, opacity: 0 }}
                                      transition={{ duration: 0.2 }}
                                      className="px-4 pb-4 space-y-3"
                                    >
                                      {/* Instructions */}
                                      <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-lg p-4 border border-purple-200/50 dark:border-purple-800/50">
                                        <p className="text-xs font-semibold text-purple-600 dark:text-purple-400 mb-2 flex items-center gap-1">
                                          <Info className="h-3 w-3" />
                                          Instructions
                                        </p>
                                        <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                                          {exercise.instructions}
                                        </p>
                                      </div>

                                      <>
                                        {/* Muscle Groups */}
                                        {exercise.muscle_groups &&
                                          exercise.muscle_groups.length > 0 && (
                                            <div>
                                              <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-2">
                                                Target Muscles
                                              </p>
                                              <div className="flex flex-wrap gap-2">
                                                {exercise.muscle_groups.map(
                                                  (muscle, mIndex) => (
                                                    <span
                                                      key={mIndex}
                                                      className="px-3 py-1 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-full text-xs font-semibold text-slate-700 dark:text-slate-300 border border-indigo-200/50 dark:border-indigo-800/50"
                                                    >
                                                      {muscle}
                                                    </span>
                                                  )
                                                )}
                                              </div>
                                            </div>
                                          )}

                                        {/* Equipement */}
                                        {exercise.equipment_needed &&
                                          exercise.equipment_needed.length >
                                            0 && (
                                            <div>
                                              <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-2">
                                                Equipment Needed
                                              </p>
                                              <div className="flex flex-wrap gap-2">
                                                {exercise.equipment_needed.map(
                                                  (equip, eIndex) => (
                                                    <span
                                                      key={eIndex}
                                                      className="px-3 py-1 bg-white/70 dark:bg-slate-900/70 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-300 border border-slate-200/50 dark:border-slate-700/50"
                                                    >
                                                      {equip}
                                                    </span>
                                                  )
                                                )}
                                              </div>
                                            </div>
                                          )}

                                        {/* Progression & Safety */}
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                          {exercise.progression && (
                                            <div className="bg-green-500/10 rounded-lg p-3 border border-green-200/50 dark:border-green-800/50">
                                              <p className="text-xs font-semibold text-green-600 dark:text-green-400 mb-1 flex items-center gap-1">
                                                <TrendingUp className="h-3 w-3" />
                                                Progression
                                              </p>
                                              <p className="text-xs text-slate-700 dark:text-slate-300">
                                                {exercise.progression}
                                              </p>
                                            </div>
                                          )}
                                          {exercise.safety_notes && (
                                            <div className="bg-red-500/10 rounded-lg p-3 border border-red-200/50 dark:border-red-800/50">
                                              <p className="text-xs font-semibold text-red-600 dark:text-red-400 mb-1 flex items-center gap-1">
                                                <AlertCircle className="h-3 w-3" />
                                                Safety
                                              </p>
                                              <p className="text-xs text-slate-700 dark:text-slate-300">
                                                {exercise.safety_notes}
                                              </p>
                                            </div>
                                          )}
                                        </div>

                                        {/* Alternatives */}
                                        {exercise.alternatives &&
                                          Object.keys(exercise.alternatives)
                                            .length > 0 && (
                                            <div className="bg-blue-500/10 rounded-lg p-3 border border-blue-200/50 dark:border-blue-800/50">
                                              <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 mb-2 flex items-center gap-1">
                                                <Repeat className="h-3 w-3" />
                                                Alternative Options
                                              </p>
                                              <div className="grid grid-cols-2 gap-2">
                                                {Object.entries(
                                                  exercise.alternatives
                                                ).map(([key, value]) => (
                                                  <div
                                                    key={key}
                                                    className="text-xs"
                                                  >
                                                    <span className="font-semibold text-slate-600 dark:text-slate-400 capitalize">
                                                      {key}:
                                                    </span>
                                                    <span className="text-slate-700 dark:text-slate-300 ml-1">
                                                      {value}
                                                    </span>
                                                  </div>
                                                ))}
                                              </div>
                                            </div>
                                          )}
                                      </>
                                    </motion.div>
                                  )}
                                </AnimatePresence>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Cooldown */}
                        {workout.cooldown && (
                          <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 backdrop-blur-sm rounded-md p-5 border border-green-200/50 dark:border-green-800/50">
                            <h5 className="font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                              <Heart className="h-5 w-5 text-green-600 dark:text-green-400" />
                              Cool-down ({workout.cooldown.duration_minutes}{" "}
                              min)
                            </h5>
                            <div className="space-y-2">
                              {workout.cooldown.activities.map(
                                (activity, actIndex) => (
                                  <div
                                    key={actIndex}
                                    className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-300"
                                  >
                                    <Check className="h-4 w-4 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                                    <span>{activity}</span>
                                  </div>
                                )
                              )}
                            </div>
                          </div>
                        )}

                        {/* Workout Notes */}
                        {(workout.success_criteria ||
                          workout.if_low_energy ||
                          workout.rpe_target) && (
                          <div className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 rounded-md p-5 border border-yellow-200/50 dark:border-yellow-800/50">
                            <h5 className="font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                              <Sparkles className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                              Workout Notes
                            </h5>
                            <div className="space-y-2 text-sm text-slate-700 dark:text-slate-300">
                              {workout.rpe_target && (
                                <p>
                                  <strong>Target Intensity:</strong> RPE{" "}
                                  {workout.rpe_target}
                                </p>
                              )}
                              {workout.success_criteria && (
                                <p>
                                  <strong>Success Criteria:</strong>{" "}
                                  {workout.success_criteria}
                                </p>
                              )}
                              {workout.if_low_energy && (
                                <p>
                                  <strong>Low Energy Option:</strong>{" "}
                                  {workout.if_low_energy}
                                </p>
                              )}
                              {workout.if_feeling_good && (
                                <p>
                                  <strong>Feeling Great?</strong>{" "}
                                  {workout.if_feeling_good}
                                </p>
                              )}
                            </div>
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {selectedTab === "nutrition" && (
          <motion.div
            key="nutrition"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <div className="bg-gradient-to-br from-pink-500/10 via-rose-500/10 to-red-500/10 rounded-md p-8 border border-pink-200/50 dark:border-pink-800/50 backdrop-blur-sm">
              <div className="flex items-center gap-4 mb-6">
                <div className="bg-gradient-to-br from-pink-600 to-rose-600 p-4 rounded-md shadow-lg">
                  <Heart className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
                    Nutrition Timing
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400">
                    Optimize your meals around workouts
                  </p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {Object.entries(workoutPlanData.plan_data.nutrition_timing).map(
                  ([key, value], index) => (
                    <motion.div
                      key={key}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-md p-5 border border-pink-200/50 dark:border-pink-800/50"
                    >
                      <h4 className="font-bold text-slate-900 dark:text-white capitalize mb-3 flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-gradient-to-r from-pink-500 to-rose-500"></div>
                        {key.replace("_", " ")}
                      </h4>
                      <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                        {value}
                      </p>
                    </motion.div>
                  )
                )}
              </div>
            </div>
            <>
              {workoutPlanData.injury_prevention && (
                <div className="bg-gradient-to-br from-red-500/10 to-orange-500/10 rounded-md p-8 border border-red-200/50 dark:border-red-800/50 backdrop-blur-sm">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="bg-gradient-to-br from-red-600 to-orange-600 p-4 rounded-md shadow-lg">
                      <AlertCircle className="h-8 w-8 text-white" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
                        Injury Prevention
                      </h3>
                      <p className="text-slate-600 dark:text-slate-400">
                        Stay safe and train smart
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {Object.entries(workoutPlanData.injury_prevention).map(
                      ([key, value]) => (
                        <div
                          key={key}
                          className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-md p-5 border border-red-200/50 dark:border-red-800/50"
                        >
                          <h4 className="font-bold text-slate-900 dark:text-white capitalize mb-2 flex items-center gap-2">
                            <Check className="h-4 w-4 text-red-600 dark:text-red-400" />
                            {key.replace("_", " ")}
                          </h4>
                          <p className="text-sm text-slate-700 dark:text-slate-300">
                            {value}
                          </p>
                        </div>
                      )
                    )}
                  </div>
                </div>
              )}
            </>
          </motion.div>
        )}

        {selectedTab === "tips" && (
          <motion.div
            key="tips"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <div className="flex items-center gap-4 mb-6">
              <div className="bg-gradient-to-br from-purple-600 to-pink-600 p-4 rounded-md shadow-lg">
                <Award className="h-8 w-8 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
                  Training Insights
                </h3>
                <p className="text-slate-600 dark:text-slate-400">
                  Expert tips for success
                </p>
              </div>
            </div>

            {/* Weekly Summary */}
            <div className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 rounded-md p-8 border border-indigo-200/50 dark:border-indigo-800/50 backdrop-blur-sm">
              <h4 className="font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                Weekly Summary
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-white/60 dark:bg-slate-800/60 rounded-md">
                  <p className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">
                    {
                      workoutPlanData.plan_data.weekly_summary
                        ?.total_workout_days
                    }
                  </p>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                    Workout Days
                  </p>
                </div>
                <div className="text-center p-4 bg-white/60 dark:bg-slate-800/60 rounded-md">
                  <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                    {workoutPlanData.plan_data.weekly_summary?.strength_days}
                  </p>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                    Strength Days
                  </p>
                </div>
                <div className="text-center p-4 bg-white/60 dark:bg-slate-800/60 rounded-md">
                  <p className="text-3xl font-bold text-orange-600 dark:text-orange-400">
                    {workoutPlanData.plan_data.weekly_summary?.cardio_days}
                  </p>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                    Cardio Days
                  </p>
                </div>
                <div className="text-center p-4 bg-white/60 dark:bg-slate-800/60 rounded-md">
                  <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                    {workoutPlanData.plan_data.weekly_summary?.rest_days}
                  </p>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                    Rest Days
                  </p>
                </div>
              </div>
              <div className="mt-6 space-y-3">
                <div className="flex items-center justify-between bg-white/60 dark:bg-slate-800/60 p-4 rounded-md">
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Training Split
                  </span>
                  <span className="text-sm font-bold text-slate-900 dark:text-white">
                    {workoutPlanData.plan_data.weekly_summary?.training_split}
                  </span>
                </div>
                <div className="flex items-center justify-between bg-white/60 dark:bg-slate-800/60 p-4 rounded-md">
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Total Weekly Time
                  </span>
                  <span className="text-sm font-bold text-slate-900 dark:text-white">
                    {
                      workoutPlanData.plan_data.weekly_summary
                        ?.total_time_minutes
                    }{" "}
                    minutes
                  </span>
                </div>
                <div className="flex items-center justify-between bg-white/60 dark:bg-slate-800/60 p-4 rounded-md">
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Est. Calories Burned
                  </span>
                  <span className="text-sm font-bold text-orange-600 dark:text-orange-400">
                    {
                      workoutPlanData.plan_data.weekly_summary
                        ?.estimated_weekly_calories_burned
                    }{" "}
                    kcal
                  </span>
                </div>
                <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 p-4 rounded-md">
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Progression Strategy
                  </p>
                  <p className="text-sm text-slate-700 dark:text-slate-300">
                    {
                      workoutPlanData.plan_data.weekly_summary
                        ?.progression_strategy
                    }
                  </p>
                </div>
              </div>
            </div>

            {/* Additional Tips Card */}
            <div className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 rounded-md p-8 border border-yellow-200/50 dark:border-yellow-800/50 backdrop-blur-sm">
              <h4 className="font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                Success Tips
              </h4>
              <div className="space-y-3">
                {workoutPlanData.plan_data.personalized_tips.map(
                  (tip, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-start gap-3 bg-white/60 dark:bg-slate-800/60 p-4 rounded-md"
                    >
                      <Check className="h-5 w-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-slate-700 dark:text-slate-300">
                        {tip}
                      </p>
                    </motion.div>
                  )
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {showLogModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-foreground">
                Log Your Workout
              </h3>
              <button onClick={() => setShowLogModal(false)} className="p-2">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <Label>Workout Type</Label>
                <select
                  value={workoutLog.workout_type}
                  onChange={(e) =>
                    setWorkoutLog({
                      ...workoutLog,
                      workout_type: e.target.value,
                    })
                  }
                  className="w-full p-2 border rounded-lg bg-background"
                >
                  <option value="cardio">Cardio</option>
                  <option value="strength training">Strength training</option>
                  <option value="hiit">HIIT</option>
                  <option value="yoga">Yoga</option>
                  <option value="pilates">Pilates</option>
                  <option value="swimming">Swimming</option>
                  <option value="cycling">Cycling</option>
                  <option value="running">Running</option>
                  <option value="sports">Sports</option>
                  <option value="dance">Dance</option>
                  <option value="other">other</option>
                </select>
              </div>

              <div className="border rounded-lg p-4 space-y-3">
                <h4 className="font-semibold">Add Exercises</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Exercise Name</Label>
                    <Input
                      value={newExercise.name}
                      onChange={(e) =>
                        setNewExercise({ ...newExercise, name: e.target.value })
                      }
                      placeholder="e.g., Barbell Bench Press"
                    />
                  </div>
                  <div>
                    <Label>Reps</Label>
                    <Input
                      type="number"
                      value={newExercise.reps}
                      onChange={(e) =>
                        setNewExercise({
                          ...newExercise,
                          reps: Number(e.target.value),
                        })
                      }
                      placeholder="e.g., 8"
                    />
                  </div>
                  <div>
                    <Label>Sets</Label>
                    <Input
                      type="number"
                      value={newExercise.sets || ""}
                      onChange={(e) =>
                        setNewExercise({
                          ...newExercise,
                          sets: Number(e.target.value),
                        })
                      }
                    />
                  </div>
                  difficulty: "", category: "", rest_seconds: 0,
                  <div>
                    <Label>Difficulty</Label>
                    <select
                      value={newExercise.difficulty}
                      onChange={(e) =>
                        setNewExercise({
                          ...newExercise,
                          difficulty: e.target.value,
                        })
                      }
                      className="w-full p-2 border rounded-lg bg-background"
                    >
                      <option value="easy">Easy</option>
                      <option value="medium">Medium</option>
                      <option value="hard">Hard</option>
                      <option value="extremely hard">Extremely Hard</option>
                    </select>
                  </div>
                  <div>
                    <Label>category</Label>
                    <select
                      value={newExercise.category}
                      onChange={(e) =>
                        setNewExercise({
                          ...newExercise,
                          category: e.target.value,
                        })
                      }
                      className="w-full p-2 border rounded-lg bg-background"
                    >
                      <option value="strength training">
                        Strength training
                      </option>
                      <option value="functional training">
                        Functional training
                      </option>
                      <option value="calisthenics">Calisthenics</option>
                      <option value="plyometrics">Plyometrics</option>
                      <option value="hiit">HIIT</option>
                      <option value="pilates">Pilates</option>
                      <option value="cardio">Cardio</option>
                      <option value="stretching">Stretching</option>
                      <option value="flexibility training">
                        Flexibility training
                      </option>
                    </select>
                  </div>
                  <div>
                    <Label>rest_seconds (s)</Label>
                    <Input
                      type="number"
                      value={newExercise.rest_seconds || ""}
                      onChange={(e) =>
                        setNewExercise({
                          ...newExercise,
                          rest_seconds: Number(e.target.value),
                        })
                      }
                    />
                  </div>
                </div>
                <Button
                  onClick={addWorkoutToLog}
                  variant="outline"
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Exercise
                </Button>
              </div>

              {workoutLog.exercises.length > 0 && (
                <div className="border rounded-lg p-4">
                  <h4 className="font-semibold mb-2">Added Exercises</h4>
                  <div className="space-y-2">
                    {workoutLog.exercises.map((exercise, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between bg-background p-2 rounded"
                      >
                        <div>
                          <div className="font-medium">{exercise.name}</div>
                          <div className="text-sm text-foreground/70">
                            {exercise.reps} • {exercise.sets}
                          </div>
                        </div>
                        <button
                          onClick={() => removeExerciseFromLog(index)}
                          className="text-red-500"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <Label>Notes (optional)</Label>
                <Textarea
                  value={workoutLog.notes}
                  onChange={(e) =>
                    setWorkoutLog({ ...workoutLog, notes: e.target.value })
                  }
                  placeholder="Any additional notes about this workout..."
                />
              </div>

              <Button
                onClick={saveWorkoutLog}
                className={`w-full ${colorTheme.primaryBg} ${colorTheme.primaryHover} text-white`}
              >
                <Save className="h-4 w-4 mr-2" />
                Save Workout Log
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};
