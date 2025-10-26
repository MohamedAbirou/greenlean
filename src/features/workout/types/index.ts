/**
 * Workout Feature Types
 */

import type { WorkoutExercise } from "@/types/dashboard";

export interface WorkoutLogData {
  workout_date: string;
  duration_minutes: number;
  calories_burned: number;
  completed: boolean;
}

export type ExerciseLog = Omit<
  WorkoutExercise,
  | "progression"
  | "alternatives"
  | "instructions"
  | "safety_notes"
  | "muscle_groups"
  | "equipment_needed"
  | "tempo"
> & { difficulty: string };

export interface WorkoutLog {
  workout_type: string;
  exercises: ExerciseLog[];
  notes: string;
  duration_minutes?: number;
  calories_burned?: number;
  completed?: boolean;
}

export interface WorkoutStats {
  weeklyWorkoutCount: number;
  weeklyCaloriesBurned: number;
  weeklyTarget: number;
  weeklyProgress: number;
  weeklyTotalTime: number;
  currentStreak: number;
}
