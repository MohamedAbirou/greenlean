import type { DietPlanData } from "@/shared/types/dashboard";
import { AnimatePresence, motion } from "framer-motion";
import {
  Apple,
  Check,
  ChefHat,
  ChevronDown,
  ChevronUp,
  Clock,
  Flame,
  Heart,
  Lightbulb,
  ShoppingCart,
  TrendingUp,
  Zap,
} from "lucide-react";
import React from "react";
import { getDifficultyColor, getMealGradient, getMealIcon } from "./helpers";

interface MealListProps {
  dietPlanData: DietPlanData;
  expandedMeal: string | null;
  setExpandedMeal: (mealType: string | null) => void;
}

export const MealList: React.FC<MealListProps> = ({
  dietPlanData,
  expandedMeal,
  setExpandedMeal,
}) => {
  const meals = dietPlanData?.meals;
  if (!meals || meals.length === 0)
    return <div>No meals found for this day.</div>;

  return (
    <>
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-gradient-to-br from-primary to-emerald-600 p-3 rounded-md shadow-lg">
          <ChefHat className="h-6 w-6 text-white" />
        </div>
        <div>
          <h3 className="text-2xl font-bold text-foreground">
            Today's Meals
          </h3>
          <p className="text-sm text-foreground/70">
            {dietPlanData?.meals.length} meals •{" "}
            {dietPlanData?.daily_totals.calories} total calories •{"  "}✓ Macros
            match targets within ±5%
          </p>
        </div>
      </div>
      <div className="grid gap-4">
        {meals.map((meal, index) => (
          <div
            key={index}
            className={`rounded-md ${getMealGradient(
              meal.meal_type
            )} border border-border overflow-hidden backdrop-blur-sm shadow-lg hover:shadow-xl transition-all`}
          >
            {/* Top summary row */}
            <button
              type="button"
              onClick={() =>
                setExpandedMeal(
                  expandedMeal === meal.meal_type ? null : meal.meal_type
                )
              }
              className="w-full p-6 flex items-center justify-between hover:bg-white/10 transition-colors"
              aria-expanded={expandedMeal === meal.meal_type}
            >
              <div className="flex items-center gap-4">
                <div className="bg-background p-4 rounded-md shadow-lg">
                  {getMealIcon(meal.meal_type)}
                </div>
                <div className="text-left">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-bold text-foreground capitalize text-lg">
                      {meal.meal_type}
                    </h4>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-semibold ${getDifficultyColor(
                        meal.difficulty
                      )}`}
                    >
                      {meal?.difficulty}
                    </span>
                  </div>
                  <p className="text-sm text-foreground/80 font-medium">
                    {meal.meal_name}
                  </p>
                  <p className="text-xs text-secondary-foreground mt-1">
                    {meal.meal_timing}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <div className="text-right hidden sm:block">
                  <div className="flex items-center gap-2 text-sm text-foreground/80 font-semibold">
                    <Clock className="h-4 w-4" />
                    {meal.prep_time_minutes} min
                  </div>
                  <div className="flex items-center gap-2 text-sm text-foreground/80 font-semibold mt-1">
                    <Flame className="h-4 w-4 text-orange-500" />
                    {meal.total_calories} cal
                  </div>
                </div>
                {expandedMeal === meal.meal_type ? (
                  <ChevronUp className="h-6 w-6 text-foreground/80" />
                ) : (
                  <ChevronDown className="h-6 w-6 text-foreground/80" />
                )}
              </div>
            </button>

            {/* Expandable details */}
            <AnimatePresence>
              {expandedMeal === meal.meal_type && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="px-6 pb-6 space-y-4"
                >
                  {/* Tags */}
                  <div className="flex flex-wrap gap-2">
                    {meal.tags.map((tag, tagIndex) => (
                      <span
                        key={tagIndex}
                        className="px-3 py-1 bg-background/60 rounded-full text-xs font-semibold text-foreground/80 border border-border/50"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>

                  {/* Ingredients */}
                  <div className="bg-background/60 rounded-md p-5 border border-border/50">
                    <h5 className="font-bold text-foreground/90 mb-4 flex items-center gap-2">
                      <ShoppingCart className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                      Ingredients
                    </h5>
                    <div className="grid gap-3">
                      {meal.foods.map((food, foodIndex) => (
                        <motion.div
                          key={foodIndex}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: foodIndex * 0.05 }}
                          className="flex items-center justify-between bg-background p-4 rounded-lg hover:bg-card transition-all border border-border group"
                        >
                          <div className="flex items-center gap-3 flex-1">
                            <div className="bg-gradient-to-br from-green-500 to-emerald-500 p-2 rounded-lg shadow-md group-hover:scale-110 transition-transform">
                              <Check className="h-4 w-4 text-white" />
                            </div>
                            <div>
                              <p className="font-semibold text-foreground">
                                {food.name}
                              </p>
                              <p className="text-sm text-foreground-50">
                                {food.portion} • {food.grams}g
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-foreground">
                              {food.calories} cal
                            </p>
                            <p className="text-xs text-foreground-50">
                              P:{food.protein}g C:{food.carbs}g F:
                              {food.fats}g
                            </p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  {/* Recipe Instructions */}
                  <div className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 backdrop-blur-sm rounded-md p-5 border border-blue-200/50 dark:border-blue-800/50">
                    <h5 className="font-bold text-foreground mb-4 flex items-center gap-2">
                      <ChefHat className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      How to Prepare
                    </h5>
                    <div className="space-y-3">
                      {meal.recipe.split("\n").map((step, stepIndex) => (
                        <div key={stepIndex} className="flex gap-3">
                          <div className="flex-shrink-0 w-6 h-6 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 text-white flex items-center justify-center text-xs font-bold">
                            {stepIndex + 1}
                          </div>
                          <p className="text-sm text-foreground/80 leading-relaxed flex-1">
                            {step.replace(/^\d+\.\s*/, "")}
                          </p>
                        </div>
                      ))}
                    </div>
                    {meal.tips && meal.tips.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-blue-200/50 dark:border-blue-800/50">
                        <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 mb-2 flex items-center gap-1">
                          <Lightbulb className="h-3 w-3" />
                          Pro Tips
                        </p>
                        {meal.tips.map((tip, tipIndex) => (
                          <p
                            key={tipIndex}
                            className="text-xs text-foreground-50 mb-1"
                          >
                            • {tip}
                          </p>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Nutrition Summary */}
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                    <div className="bg-gradient-to-br from-orange-500/20 to-red-500/20 rounded-md p-4 text-center border border-orange-200/50 dark:border-orange-800/50">
                      <Flame className="h-6 w-6 text-orange-600 dark:text-orange-400 mx-auto mb-2" />
                      <p className="text-xs text-foreground-50 font-medium">
                        Calories
                      </p>
                      <p className="text-2xl font-bold text-foreground">
                        {meal.total_calories}
                      </p>
                    </div>
                    <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-md p-4 text-center border border-green-200/50 dark:border-green-800/50">
                      <TrendingUp className="h-6 w-6 text-green-600 dark:text-green-400 mx-auto mb-2" />
                      <p className="text-xs text-foreground-50 font-medium">
                        Protein
                      </p>
                      <p className="text-2xl font-bold text-foreground">
                        {meal.total_protein}g
                      </p>
                    </div>
                    <div className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-md p-4 text-center border border-blue-200/50 dark:border-blue-800/50">
                      <Zap className="h-6 w-6 text-blue-600 dark:text-blue-400 mx-auto mb-2" />
                      <p className="text-xs text-foreground-50 font-medium">
                        Carbs
                      </p>
                      <p className="text-2xl font-bold text-foreground">
                        {meal.total_carbs}g
                      </p>
                    </div>
                    <div className="bg-gradient-to-br from-yellow-500/20 to-amber-500/20 rounded-md p-4 text-center border border-yellow-200/50 dark:border-yellow-800/50">
                      <Heart className="h-6 w-6 text-yellow-600 dark:text-yellow-400 mx-auto mb-2" />
                      <p className="text-xs text-foreground-50 font-medium">
                        Fats
                      </p>
                      <p className="text-2xl font-bold text-foreground">
                        {meal.total_fats}g
                      </p>
                    </div>
                    <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-md p-4 text-center border border-purple-200/50 dark:border-purple-800/50">
                      <Apple className="h-6 w-6 text-purple-600 dark:text-purple-400 mx-auto mb-2" />
                      <p className="text-xs text-foreground-50 font-medium">
                        Fiber
                      </p>
                      <p className="text-2xl font-bold text-foreground">
                        {meal.total_fiber}g
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </>
  );
};
