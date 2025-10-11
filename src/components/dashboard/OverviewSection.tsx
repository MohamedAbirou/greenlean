import { motion } from "framer-motion";
import { Activity, Check, Flame, Scale, Target } from "lucide-react";
import React from "react";
import { HealthProfile, HealthCalculations } from "../../types/dashboard";

interface OverviewSectionProps {
  healthProfile: HealthProfile;
  healthCalculations: HealthCalculations;
  colorTheme: {
    primaryBg: string;
    primaryHover: string;
    primaryText: string;
  };
}

export const OverviewSection: React.FC<OverviewSectionProps> = ({
  healthProfile,
  healthCalculations,
  colorTheme,
}) => {
  const { answers, calculations } = healthProfile;
  const { bmiStatus, dailyCalorieTarget, macros } = healthCalculations;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
        Your Health Summary
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 flex items-center">
          <div className="rounded-full bg-blue-100 dark:bg-blue-900 p-3 mr-4">
            <Scale className="h-6 w-6 text-blue-500" />
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">BMI</p>
            <p className="text-lg font-semibold text-gray-800 dark:text-white">
              {calculations.bmi?.toFixed(1)}
              <span className={`text-sm ml-2 ${bmiStatus.color}`}>
                ({bmiStatus.status})
              </span>
            </p>
          </div>
        </div>

        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 flex items-center">
          <div className="rounded-full bg-green-100 dark:bg-green-900 p-3 mr-4">
            <Target className="h-6 w-6 text-green-500" />
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Daily Calories
            </p>
            <p className="text-lg font-semibold text-gray-800 dark:text-white">
              {dailyCalorieTarget} kcal
            </p>
          </div>
        </div>

        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 flex items-center">
          <div className="rounded-full bg-purple-100 dark:bg-purple-900 p-3 mr-4">
            <Activity className="h-6 w-6 text-purple-500" />
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Activity Level
            </p>
            <p className="text-lg font-semibold text-gray-800 dark:text-white">
              {answers[6] as string}
            </p>
          </div>
        </div>

        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 flex items-center">
          <div className="rounded-full bg-red-100 dark:bg-red-900 p-3 mr-4">
            <Flame className="h-6 w-6 text-red-500" />
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Daily Burn
            </p>
            <p className="text-lg font-semibold text-gray-800 dark:text-white">
              {Math.round(calculations.tdee)} kcal
            </p>
          </div>
        </div>
      </div>

      <div className="mb-8">
        <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
          Recommended Macronutrient Split
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600 dark:text-gray-300">Protein</span>
              <span className="text-green-500 font-semibold">
                {macros.protein}%
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
              <div
                className="bg-green-500 rounded-full h-2"
                style={{ width: `${macros.protein}%` }}
              ></div>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              {Math.round((dailyCalorieTarget * (macros.protein / 100)) / 4)}g
              per day
            </p>
          </div>

          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600 dark:text-gray-300">
                Carbohydrates
              </span>
              <span className="text-blue-500 font-semibold">
                {macros.carbs}%
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
              <div
                className="bg-blue-500 rounded-full h-2"
                style={{ width: `${macros.carbs}%` }}
              ></div>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              {Math.round((dailyCalorieTarget * (macros.carbs / 100)) / 4)}g per
              day
            </p>
          </div>

          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600 dark:text-gray-300">Fats</span>
              <span className="text-yellow-500 font-semibold">
                {macros.fats}%
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
              <div
                className="bg-yellow-500 rounded-full h-2"
                style={{ width: `${macros.fats}%` }}
              ></div>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              {Math.round((dailyCalorieTarget * (macros.fats / 100)) / 9)}g per
              day
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-6">
          <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
            Your Goals
          </h3>
          <ul className="space-y-3">
            <li className="flex items-start">
              <Check
                className={`h-5 w-5 ${colorTheme.primaryText} mr-2 flex-shrink-0 mt-0.5`}
              />
              <span className="text-gray-600 dark:text-gray-300">
                Primary Goal: {answers[8] as string}
              </span>
            </li>
            <li className="flex items-start">
              <Check
                className={`h-5 w-5 ${colorTheme.primaryText} mr-2 flex-shrink-0 mt-0.5`}
              />
              <span className="text-gray-600 dark:text-gray-300">
                Target Weight: {answers[5]} kg
              </span>
            </li>
            <li className="flex items-start">
              <Check
                className={`h-5 w-5 ${colorTheme.primaryText} mr-2 flex-shrink-0 mt-0.5`}
              />
              <span className="text-gray-600 dark:text-gray-300">
                Preferred Exercise: {answers[12] as string}
              </span>
            </li>
          </ul>
        </div>

        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-6">
          <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
            Recommendations
          </h3>
          <ul className="space-y-3">
            <li className="flex items-start">
              <Check
                className={`h-5 w-5 ${colorTheme.primaryText} mr-2 flex-shrink-0 mt-0.5`}
              />
              <span className="text-gray-600 dark:text-gray-300">
                Focus on{" "}
                {answers[8] === "Lose weight"
                  ? "calorie deficit"
                  : answers[8] === "Build muscle"
                  ? "protein intake"
                  : "balanced nutrition"}
              </span>
            </li>
            <li className="flex items-start">
              <Check
                className={`h-5 w-5 ${colorTheme.primaryText} mr-2 flex-shrink-0 mt-0.5`}
              />
              <span className="text-gray-600 dark:text-gray-300">
                Exercise {answers[11] as string} per day
              </span>
            </li>
            <li className="flex items-start">
              <Check
                className={`h-5 w-5 ${colorTheme.primaryText} mr-2 flex-shrink-0 mt-0.5`}
              />
              <span className="text-gray-600 dark:text-gray-300">
                {answers[9] as string} meals per day
              </span>
            </li>
          </ul>
        </div>
      </div>
    </motion.div>
  );
};
