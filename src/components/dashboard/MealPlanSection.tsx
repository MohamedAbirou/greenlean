import type { HealthCalculations, Meal } from "@/types/dashboard";
import { motion } from "framer-motion";
import { Activity, Check } from "lucide-react";
import React from "react";

interface MealPlanSectionProps {
  mealPlan: Meal[] | null;
  healthCalculations: HealthCalculations;
  colorTheme: {
    primaryText: string;
  };
}

export const MealPlanSection: React.FC<MealPlanSectionProps> = ({
  mealPlan,
  healthCalculations,
  colorTheme,
}) => {
  const { dailyCalorieTarget, macros } = healthCalculations;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <h2 className="text-2xl font-bold text-foreground mb-6">
        Your Personalized Meal Plan
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <div className="bg-background rounded-lg p-3">
          <h3 className="text-xl font-semibold text-foreground mb-4">
            Daily Targets
          </h3>
          <ul className="bg-card p-2 rounded-lg space-y-4">
            <li className="flex justify-between items-center">
              <span className="text-foreground">Calories</span>
              <span className="font-semibold text-foreground">
                {dailyCalorieTarget} kcal
              </span>
            </li>
            <li className="flex justify-between items-center">
              <span className="text-foreground">Protein</span>
              <span className="font-semibold text-foreground">
                {Math.round((dailyCalorieTarget * (macros.protein / 100)) / 4)} g
              </span>
            </li>
            <li className="flex justify-between items-center">
              <span className="text-foreground">Carbs</span>
              <span className="font-semibold text-foreground">
                {Math.round((dailyCalorieTarget * (macros.carbs / 100)) / 4)} g
              </span>
            </li>
            <li className="flex justify-between items-center">
              <span className="text-foreground">Fats</span>
              <span className="font-semibold text-foreground">
                {Math.round((dailyCalorieTarget * (macros.fats / 100)) / 9)} g
              </span>
            </li>
          </ul>
        </div>

        <div className="bg-background text-foreground rounded-lg p-3">
          <h3 className="text-xl font-semibold mb-4">Meal Distribution</h3>
          {mealPlan && mealPlan.length > 0 ? (
            mealPlan.map((meal) => (
              <div
                key={meal.name}
                className="bg-card p-2 rounded-lg flex justify-between items-center mb-2"
              >
                <span>{meal.name}</span>
                <span>{Math.round(meal.total.calories)} kcal</span>
              </div>
            ))
          ) : (
            <p className="text-foreground/70 text-sm">
              No meal distribution available
            </p>
          )}
        </div>
      </div>

      <div className="bg-background rounded-lg p-3">
        <h3 className="text-xl font-semibold mb-6 text-foreground">
          Your Personalized Meal Plan
        </h3>
        {mealPlan && mealPlan.length > 0 ? (
          mealPlan.map((meal) => (
            <div
              key={meal.name}
              className="bg-card p-2 rounded-lg mb-3 last:mb-0"
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3">
                <h4 className="font-medium text-lg text-foreground">
                  {meal.name}
                </h4>
                <div className="flex items-center gap-4 text-sm text-foreground/70">
                  {meal.templateName && (
                    <span className="italic">"{meal.templateName}"</span>
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
                    className="flex flex-col sm:flex-row sm:items-center text-foreground"
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
                    <div className="sm:ml-auto text-sm text-foreground/80">
                      {item.protein}g P • {item.carbs}g C • {item.fats}g F •{" "}
                      {item.calories} kcal
                    </div>
                  </li>
                ))}
              </ul>
              <hr className="bg-background h-0.5 my-3" />
                <div className=" flex justify-between text-sm font-medium text-foreground/90">
                  <span>Total: {Math.round(meal.total.calories)} kcal</span>
                  <span>
                    {Math.round(meal.total.protein)}g P •{" "}
                    {Math.round(meal.total.carbs)}g C •{" "}
                    {Math.round(meal.total.fats)}g F
                  </span>
                </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8">
            <p className="text-foreground mb-4">
              No meal plan generated. This might be due to:
            </p>
            <ul className="text-sm text-foreground/70 space-y-1">
              <li>• Missing quiz answers</li>
              <li>• Invalid diet type selection</li>
              <li>• No suitable meal templates found</li>
            </ul>
            <p className="text-xs text-foreground/70 mt-4">
              Check the browser console for debugging information.
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
};
