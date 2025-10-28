/**
 * Nutrition Feature Exports
 */

export { NutritionService } from "./api/nutritionService";
export { useNutritionLogs } from "./hooks/useNutritionLogs";
export type {
    MacroTargets, NutritionLog, NutritionStats, TodayLog
} from "./types";

// Re-export types for convenience
export type {
    NutritionLog as DefaultNutritionLog,
    TodayLog as DefaultTodayLog
};
