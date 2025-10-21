import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/lib/supabase";
import type { WorkoutDay, WorkoutPlanResponse } from "@/services/mlService";
import { motion } from "framer-motion";
import {
  Activity,
  Calendar,
  Check,
  ChevronDown,
  ChevronUp,
  Clock,
  Dumbbell,
  Flame,
  Plus,
  Save,
  Target,
  TrendingUp,
  X,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";

interface Props {
  userId: string;
  colorTheme: {
    primaryText: string;
    primaryBg: string;
    primaryHover: string;
  };
}

interface ExerciseLog {
  name: string;
  sets: number;
  reps: string;
  weight: number;
  completed: boolean;
}

interface WorkoutLog {
  workout_type: string;
  exercises: ExerciseLog[];
  duration_minutes: number;
  notes: string;
}

export const EnhancedExerciseSection: React.FC<Props> = ({
  userId,
  colorTheme,
}) => {
  const [aiWorkoutPlan, setAiWorkoutPlan] = useState<WorkoutPlanResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedDay, setExpandedDay] = useState<string | null>(null);
  const [showLogModal, setShowLogModal] = useState(false);
  const [workoutLog, setWorkoutLog] = useState<WorkoutLog>({
    workout_type: "",
    exercises: [],
    duration_minutes: 0,
    notes: "",
  });
  const [weeklyLogs, setWeeklyLogs] = useState<any[]>([]);
  const [newExercise, setNewExercise] = useState<ExerciseLog>({
    name: "",
    sets: 0,
    reps: "",
    weight: 0,
    completed: false,
  });

  useEffect(() => {
    loadAIWorkoutPlan();
    loadWeeklyLogs();
  }, [userId]);

  const loadAIWorkoutPlan = async () => {
    try {
      const stored = localStorage.getItem("aiGeneratedPlans");
      if (stored) {
        const plans = JSON.parse(stored);
        setAiWorkoutPlan(plans.workoutPlan);
      }

      const { data, error } = await supabase
        .from("ai_workout_plans")
        .select("*")
        .eq("user_id", userId)
        .eq("is_active", true)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (data && !error) {
        setAiWorkoutPlan(data.plan_data);
      }
    } catch (error) {
      console.error("Error loading AI workout plan:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadWeeklyLogs = async () => {
    try {
      const today = new Date();
      const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

      const { data, error } = await supabase
        .from("workout_logs")
        .select("*")
        .eq("user_id", userId)
        .gte("workout_date", weekAgo.toISOString().split("T")[0])
        .order("workout_date", { ascending: false });

      if (data && !error) {
        setWeeklyLogs(data);
      }
    } catch (error) {
      console.error("Error loading weekly logs:", error);
    }
  };

  const addExerciseToLog = () => {
    if (!newExercise.name || newExercise.sets <= 0) {
      toast.error("Please fill in exercise name and sets");
      return;
    }

    setWorkoutLog((prev) => ({
      ...prev,
      exercises: [...prev.exercises, { ...newExercise }],
    }));

    setNewExercise({
      name: "",
      sets: 0,
      reps: "",
      weight: 0,
      completed: false,
    });
  };

  const removeExerciseFromLog = (index: number) => {
    setWorkoutLog((prev) => ({
      ...prev,
      exercises: prev.exercises.filter((_, i) => i !== index),
    }));
  };

  const toggleExerciseCompletion = (index: number) => {
    setWorkoutLog((prev) => ({
      ...prev,
      exercises: prev.exercises.map((ex, i) =>
        i === index ? { ...ex, completed: !ex.completed } : ex
      ),
    }));
  };

  const saveWorkoutLog = async () => {
    if (workoutLog.exercises.length === 0) {
      toast.error("Please add at least one exercise");
      return;
    }

    if (!workoutLog.workout_type) {
      toast.error("Please specify workout type");
      return;
    }

    try {
      const completedCount = workoutLog.exercises.filter((e) => e.completed).length;
      const allCompleted = completedCount === workoutLog.exercises.length;

      const estimatedCalories = Math.round(
        workoutLog.duration_minutes * (workoutLog.workout_type.toLowerCase().includes("cardio") ? 8 : 5)
      );

      const { error } = await supabase.from("workout_logs").insert({
        user_id: userId,
        workout_type: workoutLog.workout_type,
        exercises: workoutLog.exercises,
        duration_minutes: workoutLog.duration_minutes,
        calories_burned: estimatedCalories,
        notes: workoutLog.notes,
        completed: allCompleted,
      });

      if (error) throw error;

      toast.success("Workout logged successfully!");
      setShowLogModal(false);
      setWorkoutLog({ workout_type: "", exercises: [], duration_minutes: 0, notes: "" });
      loadWeeklyLogs();
    } catch (error) {
      console.error("Error saving workout log:", error);
      toast.error("Failed to save workout log");
    }
  };

  const startWorkout = (workout: WorkoutDay) => {
    setWorkoutLog({
      workout_type: workout.workout_type,
      exercises: workout.exercises.map((ex) => ({
        name: ex.name,
        sets: ex.sets,
        reps: ex.reps,
        weight: 0,
        completed: false,
      })),
      duration_minutes: workout.duration_minutes,
      notes: "",
    });
    setShowLogModal(true);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case "beginner":
        return "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300";
      case "intermediate":
        return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300";
      case "advanced":
        return "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300";
      default:
        return "bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-300";
    }
  };

  const weeklyCaloriesBurned = weeklyLogs.reduce((sum, log) => sum + (log.calories_burned || 0), 0);
  const weeklyWorkoutCount = weeklyLogs.filter((log) => log.completed).length;

  if (loading) {
    return <div className="text-center py-8">Loading workout plan...</div>;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">
          AI-Powered Workout Plan
        </h2>
        <Button
          onClick={() => setShowLogModal(true)}
          className={`${colorTheme.primaryBg} ${colorTheme.primaryHover} text-white`}
        >
          <Plus className="h-4 w-4 mr-2" />
          Log Workout
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-foreground/70">This Week</span>
            <Activity className={`h-5 w-5 ${colorTheme.primaryText}`} />
          </div>
          <div className="text-2xl font-bold text-foreground">
            {weeklyWorkoutCount}
            <span className="text-sm text-foreground/70"> / 5 workouts</span>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-foreground/70">Calories Burned</span>
            <Flame className="h-5 w-5 text-orange-500" />
          </div>
          <div className="text-2xl font-bold text-foreground">{weeklyCaloriesBurned}</div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-foreground/70">Progress</span>
            <TrendingUp className="h-5 w-5 text-green-500" />
          </div>
          <div className="text-2xl font-bold text-green-500">
            {Math.round((weeklyWorkoutCount / 5) * 100)}%
          </div>
        </Card>
      </div>

      {aiWorkoutPlan && (
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-foreground">Weekly Schedule</h3>
          {aiWorkoutPlan.weekly_plan.map((workout, index) => (
            <Card key={index} className="overflow-hidden">
              <button
                onClick={() => setExpandedDay(expandedDay === workout.day ? null : workout.day)}
                className="w-full p-4 flex items-center justify-between hover:bg-background/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-lg ${colorTheme.primaryBg}/10`}>
                    <Calendar className={`h-5 w-5 ${colorTheme.primaryText}`} />
                  </div>
                  <div className="text-left">
                    <h4 className="font-semibold text-foreground">{workout.day}</h4>
                    <p className="text-sm text-foreground/70">{workout.workout_type}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right text-sm text-foreground/70">
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {workout.duration_minutes} min
                    </div>
                    <div className="flex items-center gap-1 mt-1">
                      <Flame className="h-4 w-4" />
                      {workout.estimated_calories_burned} cal
                    </div>
                  </div>
                  {expandedDay === workout.day ? (
                    <ChevronUp className="h-5 w-5" />
                  ) : (
                    <ChevronDown className="h-5 w-5" />
                  )}
                </div>
              </button>

              {expandedDay === workout.day && (
                <div className="px-4 pb-4 space-y-4">
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                    <div className="font-medium text-sm mb-1">Warm-up</div>
                    <div className="text-sm text-foreground/70">{workout.warmup}</div>
                  </div>

                  <div className="space-y-2">
                    <div className="font-medium text-sm">Exercises</div>
                    {workout.exercises.map((exercise, exIndex) => (
                      <div key={exIndex} className="bg-background p-3 rounded-lg">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Dumbbell className={`h-4 w-4 ${colorTheme.primaryText}`} />
                            <span className="font-medium">{exercise.name}</span>
                          </div>
                          <span className={`px-2 py-1 rounded-full text-xs ${getDifficultyColor(exercise.difficulty)}`}>
                            {exercise.difficulty}
                          </span>
                        </div>
                        <div className="text-sm text-foreground/70 mb-2">
                          <span className="font-medium">{exercise.sets} sets × {exercise.reps} reps</span>
                          {" • "}
                          <span>Rest: {exercise.rest_seconds}s</span>
                        </div>
                        <div className="text-sm text-foreground/60 italic">{exercise.instructions}</div>
                        <div className="mt-2 flex flex-wrap gap-1">
                          {exercise.muscle_groups.map((muscle, mIndex) => (
                            <span
                              key={mIndex}
                              className="px-2 py-0.5 bg-gray-100 dark:bg-gray-800 rounded-full text-xs"
                            >
                              {muscle}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
                    <div className="font-medium text-sm mb-1">Cool-down</div>
                    <div className="text-sm text-foreground/70">{workout.cooldown}</div>
                  </div>

                  <Button
                    onClick={() => startWorkout(workout)}
                    className={`w-full ${colorTheme.primaryBg} ${colorTheme.primaryHover} text-white`}
                  >
                    <Target className="h-4 w-4 mr-2" />
                    Start This Workout
                  </Button>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      {aiWorkoutPlan?.tips && aiWorkoutPlan.tips.length > 0 && (
        <Card className="p-4 bg-purple-50 dark:bg-purple-900/20">
          <h4 className="font-semibold text-foreground mb-2">Training Tips</h4>
          <ul className="space-y-1">
            {aiWorkoutPlan.tips.map((tip, index) => (
              <li key={index} className="text-sm text-foreground/80 flex items-start gap-2">
                <Check className="h-4 w-4 text-purple-500 mt-0.5" />
                {tip}
              </li>
            ))}
          </ul>
        </Card>
      )}

      {showLogModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-foreground">Log Your Workout</h3>
              <button onClick={() => setShowLogModal(false)} className="p-2">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <Label>Workout Type</Label>
                <Input
                  value={workoutLog.workout_type}
                  onChange={(e) => setWorkoutLog({ ...workoutLog, workout_type: e.target.value })}
                  placeholder="e.g., Upper Body Strength"
                />
              </div>

              <div>
                <Label>Duration (minutes)</Label>
                <Input
                  type="number"
                  value={workoutLog.duration_minutes || ""}
                  onChange={(e) => setWorkoutLog({ ...workoutLog, duration_minutes: Number(e.target.value) })}
                />
              </div>

              <div className="border rounded-lg p-4 space-y-3">
                <h4 className="font-semibold">Add Exercises</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2">
                    <Label>Exercise Name</Label>
                    <Input
                      value={newExercise.name}
                      onChange={(e) => setNewExercise({ ...newExercise, name: e.target.value })}
                      placeholder="e.g., Bench Press"
                    />
                  </div>
                  <div>
                    <Label>Sets</Label>
                    <Input
                      type="number"
                      value={newExercise.sets || ""}
                      onChange={(e) => setNewExercise({ ...newExercise, sets: Number(e.target.value) })}
                    />
                  </div>
                  <div>
                    <Label>Reps</Label>
                    <Input
                      value={newExercise.reps}
                      onChange={(e) => setNewExercise({ ...newExercise, reps: e.target.value })}
                      placeholder="e.g., 8-12"
                    />
                  </div>
                  <div className="col-span-2">
                    <Label>Weight (kg) - optional</Label>
                    <Input
                      type="number"
                      value={newExercise.weight || ""}
                      onChange={(e) => setNewExercise({ ...newExercise, weight: Number(e.target.value) })}
                    />
                  </div>
                </div>
                <Button onClick={addExerciseToLog} variant="outline" className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Exercise
                </Button>
              </div>

              {workoutLog.exercises.length > 0 && (
                <div className="border rounded-lg p-4">
                  <h4 className="font-semibold mb-2">Exercises in This Workout</h4>
                  <div className="space-y-2">
                    {workoutLog.exercises.map((exercise, index) => (
                      <div key={index} className="flex items-center justify-between bg-background p-3 rounded">
                        <div className="flex items-center gap-3 flex-1">
                          <Checkbox
                            checked={exercise.completed}
                            onCheckedChange={() => toggleExerciseCompletion(index)}
                          />
                          <div className={exercise.completed ? "line-through text-foreground/50" : ""}>
                            <div className="font-medium">{exercise.name}</div>
                            <div className="text-sm text-foreground/70">
                              {exercise.sets} sets × {exercise.reps} reps
                              {exercise.weight > 0 && ` @ ${exercise.weight}kg`}
                            </div>
                          </div>
                        </div>
                        <button onClick={() => removeExerciseFromLog(index)} className="text-red-500">
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
                  onChange={(e) => setWorkoutLog({ ...workoutLog, notes: e.target.value })}
                  placeholder="How did you feel? Any observations?"
                />
              </div>

              <Button onClick={saveWorkoutLog} className={`w-full ${colorTheme.primaryBg} ${colorTheme.primaryHover} text-white`}>
                <Save className="h-4 w-4 mr-2" />
                Save Workout Log
              </Button>
            </div>
          </Card>
        </div>
      )}
    </motion.div>
  );
};
