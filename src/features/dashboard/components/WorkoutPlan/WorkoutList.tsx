import type { WeeklyPlan, WorkoutPlanData } from "@/shared/types/dashboard";
import { AnimatePresence, motion } from "framer-motion";
import {
  Activity,
  AlertCircle,
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
  Repeat,
  Sparkles,
  Target,
  Timer,
  TrendingUp,
  Wind,
} from "lucide-react";
import React, { useCallback, useMemo } from "react";
import {
  getCategoryIcon,
  getDifficultyColor,
  getIntensityColor,
} from "./helpers";

interface WorkoutListProps {
  planData: WorkoutPlanData;
  expandedDay: string | null;
  setExpandedDay: (day: string | null) => void;
  expandedExercise: string | null;
  setExpandedExercise: (exercise: string | null) => void;
}

const WorkoutDay = React.memo<{
  workout: WeeklyPlan;
  index: number;
  expandedDay: string | null;
  setExpandedDay: (day: string | null) => void;
  expandedExercise: string | null;
  setExpandedExercise: (exercise: string | null) => void;
}>(
  ({
    workout,
    index,
    expandedDay,
    setExpandedDay,
    expandedExercise,
    setExpandedExercise,
  }) => {
    const isExpanded = expandedDay === workout.day;

    const toggleDay = useCallback(() => {
      setExpandedDay(isExpanded ? null : workout.day);
    }, [isExpanded, workout.day, setExpandedDay]);

    const toggleExercise = useCallback(
      (exIndex: number) => {
        const exerciseId = `${workout.day}-${exIndex}`;
        setExpandedExercise(
          expandedExercise === exerciseId ? null : exerciseId
        );
      },
      [workout.day, expandedExercise, setExpandedExercise]
    );

    const intensityColor = useMemo(
      () => getIntensityColor(workout.intensity),
      [workout.intensity]
    );

    return (
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.05 * index }}
        className={`rounded-md ${intensityColor} border border-border overflow-hidden backdrop-blur-sm shadow-lg hover:shadow-xl transition-all`}
      >
        <button
          onClick={toggleDay}
          className="w-full p-6 flex items-center justify-between hover:bg-card/10 transition-colors"
        >
          <div className="flex items-center gap-4">
            <div className="bg-background backdrop-blur-sm p-4 rounded-md shadow-lg">
              <Calendar className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div className="text-left">
              <div className="flex items-center gap-3 mb-1">
                <h4 className="font-bold text-foreground text-lg">
                  {workout.day}
                </h4>
                {workout.optional && (
                  <span className="px-2 py-1 bg-stat-blue text-foreground rounded-full text-xs font-semibold">
                    Optional
                  </span>
                )}
              </div>
              <p className="text-sm text-muted-foreground font-medium">
                {workout.workout_type}
              </p>
              <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
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
              <div className="flex items-center gap-2 text-sm text-muted-foreground font-semibold">
                <Clock className="h-4 w-4" />
                {workout.duration_minutes} min
              </div>
              {workout.estimated_calories_burned && (
                <div className="flex items-center gap-2 text-sm text-orange-600 dark:text-orange-400 font-semibold mt-1">
                  <Flame className="h-4 w-4" />
                  {workout.estimated_calories_burned} cal
                </div>
              )}
              <div className="text-xs text-muted-foreground mt-1">
                {workout.intensity} intensity
              </div>
            </div>
            {isExpanded ? (
              <ChevronUp className="h-6 w-6 text-muted-foreground" />
            ) : (
              <ChevronDown className="h-6 w-6 text-muted-foreground" />
            )}
          </div>
        </button>

        <AnimatePresence>
          {isExpanded && workout.exercises?.length > 0 && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="px-6 pb-6 space-y-4"
            >
              {/* Warmup */}
              {workout.warmup && (
                <div className="bg-stat-blue backdrop-blur-sm rounded-md p-5 border border-blue-200/50 dark:border-blue-800/50">
                  <h5 className="font-bold text-foreground mb-3 flex items-center gap-2">
                    <Wind className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    Warm-up ({workout.warmup.duration_minutes} min)
                  </h5>
                  <div className="space-y-2">
                    {workout.warmup.activities.map((activity, actIndex) => (
                      <div
                        key={actIndex}
                        className="flex items-start gap-2 text-sm text-muted-foreground"
                      >
                        <Check className="h-4 w-4 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                        <span>{activity}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Exercises */}
              {workout.exercises && workout.exercises.length > 0 && (
                <div className="space-y-3">
                  <h5 className="font-bold text-foreground flex items-center gap-2">
                    <Dumbbell className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                    Exercises ({workout.exercises.length})
                  </h5>
                  {workout.exercises.map((exercise, exIndex) => {
                    const exerciseId = `${workout.day}-${exIndex}`;
                    const isExerciseExpanded = expandedExercise === exerciseId;

                    return (
                      <div
                        key={exIndex}
                        className="bg-background backdrop-blur-sm rounded-md border border-border overflow-hidden"
                      >
                        <button
                          onClick={() => toggleExercise(exIndex)}
                          className="w-full p-4 flex items-start justify-between hover:bg-background dark:hover:bg-background transition-colors"
                        >
                          <div className="flex items-start gap-3 flex-1">
                            <div className="flex items-center space-x-1 bg-progress-indigo-purple p-2 rounded-lg shadow-md">
                              {getCategoryIcon(exercise.category)}
                              <div className="text-white text-xs font-bold">
                                {exIndex + 1}
                              </div>
                            </div>
                            <div className="text-left">
                              <div className="flex items-center gap-2 mb-1">
                                <h6 className="font-semibold text-foreground">
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
                              <div className="flex items-center gap-3 text-sm text-muted-foreground">
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
                                <div className="text-xs text-muted-foreground/80 mt-1">
                                  Tempo: {exercise.tempo}
                                </div>
                              )}
                            </div>
                          </div>
                          {isExerciseExpanded ? (
                            <ChevronUp className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                          ) : (
                            <ChevronDown className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                          )}
                        </button>

                        <AnimatePresence>
                          {isExerciseExpanded && (
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
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                  {exercise.instructions}
                                </p>
                              </div>

                              <>
                                {/* Muscle Groups */}
                                {exercise.muscle_groups &&
                                  exercise.muscle_groups.length > 0 && (
                                    <div>
                                      <p className="text-xs font-semibold text-muted-foreground mb-2">
                                        Target Muscles
                                      </p>
                                      <div className="flex flex-wrap gap-2">
                                        {exercise.muscle_groups.map(
                                          (muscle, mIndex) => (
                                            <span
                                              key={mIndex}
                                              className="px-3 py-1 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-full text-xs font-semibold text-muted-foreground border border-indigo-200/50 dark:border-indigo-800/50"
                                            >
                                              {muscle}
                                            </span>
                                          )
                                        )}
                                      </div>
                                    </div>
                                  )}

                                {/* Equipment */}
                                {exercise.equipment_needed &&
                                  exercise.equipment_needed.length > 0 && (
                                    <div>
                                      <p className="text-xs font-semibold text-muted-foreground mb-2">
                                        Equipment Needed
                                      </p>
                                      <div className="flex flex-wrap gap-2">
                                        {exercise.equipment_needed.map(
                                          (equip, eIndex) => (
                                            <span
                                              key={eIndex}
                                              className="px-3 py-1 bg-background rounded-lg text-xs font-medium text-muted-foreground border border-border"
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
                                      <p className="text-xs text-muted-foreground">
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
                                      <p className="text-xs text-muted-foreground">
                                        {exercise.safety_notes}
                                      </p>
                                    </div>
                                  )}
                                </div>
                                {/* Alternatives */}
                                {exercise.alternatives &&
                                  Object.keys(exercise.alternatives).length >
                                    0 && (
                                    <div className="bg-blue-500/10 rounded-lg p-3 border border-blue-200/50 dark:border-blue-800/50">
                                      <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 mb-2 flex items-center gap-1">
                                        <Repeat className="h-3 w-3" />
                                        Alternative Options
                                      </p>
                                      <div className="grid grid-cols-2 gap-2">
                                        {Object.entries(
                                          exercise.alternatives
                                        ).map(([key, value]) => (
                                          <div key={key} className="text-xs">
                                            <span className="font-semibold text-muted-foreground capitalize">
                                              {key}:
                                            </span>
                                            <span className="text-muted-foreground ml-1">
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
                    );
                  })}
                </div>
              )}

              {/* Cooldown */}
              {workout.cooldown && (
                <div className="bg-stat-green backdrop-blur-sm rounded-md p-5 border border-green-200/50 dark:border-green-800/50">
                  <h5 className="font-bold text-foreground mb-3 flex items-center gap-2">
                    <Heart className="h-5 w-5 text-green-600 dark:text-green-400" />
                    Cool-down ({workout.cooldown.duration_minutes} min)
                  </h5>
                  <div className="space-y-2">
                    {workout.cooldown.activities.map((activity, actIndex) => (
                      <div
                        key={actIndex}
                        className="flex items-start gap-2 text-sm text-muted-foreground"
                      >
                        <Check className="h-4 w-4 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                        <span>{activity}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Workout Notes */}
              {(workout.success_criteria ||
                workout.if_low_energy ||
                workout.rpe_target) && (
                <div className="bg-stat-orange rounded-md p-5 border border-yellow-200/50 dark:border-yellow-800/50">
                  <h5 className="font-bold text-foreground mb-3 flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                    Workout Notes
                  </h5>
                  <div className="space-y-2 text-sm text-muted-foreground">
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
    );
  }
);

WorkoutDay.displayName = "WorkoutDay";

export const WorkoutList: React.FC<WorkoutListProps> = React.memo(
  ({
    planData,
    expandedDay,
    setExpandedDay,
    expandedExercise,
    setExpandedExercise,
  }) => {
    if (!planData?.weekly_plan) {
      return <div>No workout plan available.</div>;
    }

    const weeklyPlan = planData.weekly_plan;

    return (
      <>
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-progress-blue-cyan p-3 rounded-md shadow-lg">
            <Activity className="h-6 w-6 text-white" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-foreground/90">
              Weekly Workout Schedule
            </h3>
            <p className="text-sm text-muted-foreground">
              {weeklyPlan.length} workout days •{" "}
              {planData.weekly_summary?.total_time_minutes} total minutes
            </p>
          </div>
        </div>

        <div className="grid gap-4">
          {weeklyPlan.map((workout: WeeklyPlan, index: number) => (
            <WorkoutDay
              key={workout.day}
              workout={workout}
              index={index}
              expandedDay={expandedDay}
              setExpandedDay={setExpandedDay}
              expandedExercise={expandedExercise}
              setExpandedExercise={setExpandedExercise}
            />
          ))}
        </div>
      </>
    );
  }
);
