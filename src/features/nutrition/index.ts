/**
 * Nutrition Feature Exports
 */

export { NutritionService } from "./api/nutritionService";
export { useNutritionLogs } from "./hooks/useNutritionLogs";
export type {
    NutritionLog as DefaultNutritionLog, TodayLog as DefaultTodayLog, MacroTargets, NutritionStats
} from "./types";

