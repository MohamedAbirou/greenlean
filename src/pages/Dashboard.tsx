import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Calendar,
  BarChart3,
  Utensils,
  Dumbbell,
  Info,
  Award,
  Heart,
  ArrowRight,
  Check,
  Scale,
  Target,
  Activity,
  Flame,
} from "lucide-react";
import DailyTip from '../components/DailyTip';

interface HealthProfile {
  answers: { [key: number]: string | number };
  calculations: {
    bmi: number;
    bmr: number;
    tdee: number;
  };
}

const Dashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [healthProfile, setHealthProfile] = useState<HealthProfile | null>(
    null
  );

  useEffect(() => {
    const storedProfile = localStorage.getItem("healthProfile");
    if (storedProfile) {
      setHealthProfile(JSON.parse(storedProfile));
    }
  }, []);

  if (!healthProfile) {
    return (
      <div className="min-h-screen pt-24 pb-16 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
            No Health Profile Found
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Please take the quiz to get your personalized recommendations.
          </p>
          <a
            href="/quiz"
            className="inline-flex items-center px-6 py-3 bg-green-500 text-white rounded-full hover:bg-green-600 transition-colors"
          >
            Take the Quiz <ArrowRight className="ml-2 h-5 w-5" />
          </a>
        </div>
      </div>
    );
  }

  const { answers, calculations } = healthProfile;

  // Calculate weight status based on BMI
  const getBMIStatus = (bmi: number) => {
    if (bmi < 18.5) return { status: "Underweight", color: "text-blue-500" };
    if (bmi < 25) return { status: "Normal", color: "text-green-500" };
    if (bmi < 30) return { status: "Overweight", color: "text-yellow-500" };
    return { status: "Obese", color: "text-red-500" };
  };

  const bmiStatus = getBMIStatus(calculations.bmi);

  // Calculate daily calorie target based on goal
  const goalAdjustment =
    answers[8] === "Lose weight"
      ? -500
      : answers[8] === "Build muscle"
      ? 300
      : 0;
  const dailyCalorieTarget = Math.round(calculations.tdee + goalAdjustment);

  // Recommended macros based on goal
  const getMacroSplit = () => {
    if (answers[8] === "Lose weight") {
      return { protein: 40, carbs: 30, fats: 30 };
    }
    if (answers[8] === "Build muscle") {
      return { protein: 35, carbs: 45, fats: 20 };
    }
    return { protein: 30, carbs: 40, fats: 30 };
  };

  const macros = getMacroSplit();

  return (
    <div className="min-h-screen pt-24 pb-16 bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-4">
            Your Personalized Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Welcome to your customized health journey. Here's your personalized
            plan based on your quiz results.
          </p>
        </div>

        {/* Daily Tip */}
        <div className="mb-8">
          <DailyTip />
        </div>

        {/* Tabs */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md mb-8">
          <div className="flex flex-wrap">
            <button
              className={`px-4 py-3 md:px-6 text-sm md:text-base font-medium rounded-tl-xl ${
                activeTab === "overview"
                  ? "bg-green-500 text-white"
                  : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white"
              }`}
              onClick={() => setActiveTab("overview")}
            >
              Overview
            </button>
            <button
              className={`px-4 py-3 md:px-6 text-sm md:text-base font-medium ${
                activeTab === "meal-plan"
                  ? "bg-green-500 text-white"
                  : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white"
              }`}
              onClick={() => setActiveTab("meal-plan")}
            >
              Meal Plan
            </button>
            <button
              className={`px-4 py-3 md:px-6 text-sm md:text-base font-medium ${
                activeTab === "exercise"
                  ? "bg-green-500 text-white"
                  : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white"
              }`}
              onClick={() => setActiveTab("exercise")}
            >
              Exercise Plan
            </button>
            <button
              className={`px-4 py-3 md:px-6 text-sm md:text-base font-medium rounded-tr-xl ${
                activeTab === "progress"
                  ? "bg-green-500 text-white"
                  : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white"
              }`}
              onClick={() => setActiveTab("progress")}
            >
              Progress
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
          {/* Overview Tab */}
          {activeTab === "overview" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
                Your Health Summary
              </h2>

              {/* Key Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 flex items-center">
                  <div className="rounded-full bg-blue-100 dark:bg-blue-900 p-3 mr-4">
                    <Scale className="h-6 w-6 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      BMI
                    </p>
                    <p className="text-lg font-semibold text-gray-800 dark:text-white">
                      {calculations.bmi.toFixed(1)}
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

              {/* Macronutrient Distribution */}
              <div className="mb-8">
                <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
                  Recommended Macronutrient Split
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-gray-600 dark:text-gray-300">
                        Protein
                      </span>
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
                      {Math.round(
                        (dailyCalorieTarget * (macros.protein / 100)) / 4
                      )}
                      g per day
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
                      {Math.round(
                        (dailyCalorieTarget * (macros.carbs / 100)) / 4
                      )}
                      g per day
                    </p>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-gray-600 dark:text-gray-300">
                        Fats
                      </span>
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
                      {Math.round(
                        (dailyCalorieTarget * (macros.fats / 100)) / 9
                      )}
                      g per day
                    </p>
                  </div>
                </div>
              </div>

              {/* Goals and Recommendations */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-6">
                  <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
                    Your Goals
                  </h3>
                  <ul className="space-y-3">
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-600 dark:text-gray-300">
                        Primary Goal: {answers[8] as string}
                      </span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-600 dark:text-gray-300">
                        Target Weight: {answers[5]} kg
                      </span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
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
                      <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
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
                      <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-600 dark:text-gray-300">
                        Exercise {answers[11] as string} per day
                      </span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-600 dark:text-gray-300">
                        {answers[9] as string} meals per day
                      </span>
                    </li>
                  </ul>
                </div>
              </div>
            </motion.div>
          )}

          {/* Meal Plan Tab */}
          {activeTab === "meal-plan" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
                Your Personalized Meal Plan
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-6">
                  <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
                    Daily Targets
                  </h3>
                  <ul className="space-y-4">
                    <li className="flex justify-between items-center">
                      <span className="text-gray-600 dark:text-gray-300">
                        Calories
                      </span>
                      <span className="font-semibold text-gray-800 dark:text-white">
                        {dailyCalorieTarget} kcal
                      </span>
                    </li>
                    <li className="flex justify-between items-center">
                      <span className="text-gray-600 dark:text-gray-300">
                        Protein
                      </span>
                      <span className="font-semibold text-gray-800 dark:text-white">
                        {Math.round(
                          (dailyCalorieTarget * (macros.protein / 100)) / 4
                        )}
                        g
                      </span>
                    </li>
                    <li className="flex justify-between items-center">
                      <span className="text-gray-600 dark:text-gray-300">
                        Carbohydrates
                      </span>
                      <span className="font-semibold text-gray-800 dark:text-white">
                        {Math.round(
                          (dailyCalorieTarget * (macros.carbs / 100)) / 4
                        )}
                        g
                      </span>
                    </li>
                    <li className="flex justify-between items-center">
                      <span className="text-gray-600 dark:text-gray-300">
                        Fats
                      </span>
                      <span className="font-semibold text-gray-800 dark:text-white">
                        {Math.round(
                          (dailyCalorieTarget * (macros.fats / 100)) / 9
                        )}
                        g
                      </span>
                    </li>
                  </ul>
                </div>

                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-6">
                  <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
                    Meal Distribution
                  </h3>
                  <div className="space-y-4">
                    {["Breakfast", "Lunch", "Dinner", "Snacks"].map(
                      (meal, index) => (
                        <div
                          key={meal}
                          className="flex justify-between items-center"
                        >
                          <span className="text-gray-600 dark:text-gray-300">
                            {meal}
                          </span>
                          <span className="font-semibold text-gray-800 dark:text-white">
                            {Math.round(
                              dailyCalorieTarget *
                                (meal === "Snacks" ? 0.1 : 0.3)
                            )}{" "}
                            kcal
                          </span>
                        </div>
                      )
                    )}
                  </div>
                </div>
              </div>

              {/* Sample Meal Plan */}
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-6">
                <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-6">
                  Sample Meal Plan
                </h3>
                <div className="space-y-6">
                  {["Breakfast", "Lunch", "Dinner", "Snacks"].map(
                    (meal, index) => (
                      <div
                        key={meal}
                        className="border-b dark:border-gray-600 last:border-0 pb-6 last:pb-0"
                      >
                        <h4 className="font-medium text-gray-800 dark:text-white mb-3">
                          {meal}
                        </h4>
                        <ul className="space-y-2">
                          {[
                            "Oatmeal with berries and nuts",
                            "Greek yogurt with honey",
                            "Whole grain toast with avocado",
                          ].map((item, i) => (
                            <li
                              key={i}
                              className="flex items-center text-gray-600 dark:text-gray-300"
                            >
                              <Check className="h-4 w-4 text-green-500 mr-2" />
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* Exercise Plan Tab */}
          {activeTab === "exercise" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
                Your Exercise Routine
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-6">
                  <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
                    Workout Summary
                  </h3>
                  <ul className="space-y-4">
                    <li className="flex justify-between items-center">
                      <span className="text-gray-600 dark:text-gray-300">
                        Preferred Type
                      </span>
                      <span className="font-semibold text-gray-800 dark:text-white">
                        {answers[12] as string}
                      </span>
                    </li>
                    <li className="flex justify-between items-center">
                      <span className="text-gray-600 dark:text-gray-300">
                        Duration
                      </span>
                      <span className="font-semibold text-gray-800 dark:text-white">
                        {answers[11] as string}
                      </span>
                    </li>
                    <li className="flex justify-between items-center">
                      <span className="text-gray-600 dark:text-gray-300">
                        Frequency
                      </span>
                      <span className="font-semibold text-gray-800 dark:text-white">
                        4-5 times per week
                      </span>
                    </li>
                  </ul>
                </div>

                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-6">
                  <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
                    Weekly Goals
                  </h3>
                  <ul className="space-y-3">
                    <li className="flex items-center">
                      <Check className="h-5 w-5 text-green-500 mr-2" />
                      <span className="text-gray-600 dark:text-gray-300">
                        Complete 4-5 workout sessions
                      </span>
                    </li>
                    <li className="flex items-center">
                      <Check className="h-5 w-5 text-green-500 mr-2" />
                      <span className="text-gray-600 dark:text-gray-300">
                        Maintain consistent intensity
                      </span>
                    </li>
                    <li className="flex items-center">
                      <Check className="h-5 w-5 text-green-500 mr-2" />
                      <span className="text-gray-600 dark:text-gray-300">
                        Include both cardio and strength
                      </span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Weekly Schedule */}
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-6">
                <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-6">
                  Weekly Schedule
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[
                    {
                      day: "Monday",
                      workout: "Cardio + Core",
                      duration: "45 min",
                    },
                    {
                      day: "Tuesday",
                      workout: "Upper Body Strength",
                      duration: "40 min",
                    },
                    {
                      day: "Wednesday",
                      workout: "Rest/Light Stretching",
                      duration: "20 min",
                    },
                    {
                      day: "Thursday",
                      workout: "Lower Body Strength",
                      duration: "40 min",
                    },
                    {
                      day: "Friday",
                      workout: "HIIT Training",
                      duration: "30 min",
                    },
                    {
                      day: "Saturday",
                      workout: "Full Body Workout",
                      duration: "45 min",
                    },
                    {
                      day: "Sunday",
                      workout: "Rest/Recovery",
                      duration: "0 min",
                    },
                  ].map((day, index) => (
                    <div
                      key={index}
                      className="bg-white dark:bg-gray-800 rounded-lg p-4 border dark:border-gray-700"
                    >
                      <h4 className="font-medium text-gray-800 dark:text-white mb-2">
                        {day.day}
                      </h4>
                      <p className="text-gray-600 dark:text-gray-300">
                        {day.workout}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        {day.duration}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* Progress Tab */}
          {activeTab === "progress" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
                Track Your Progress
              </h2>

              <div className="text-center py-12">
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  Start tracking your progress to see your journey visualized
                  here!
                </p>
                <button className="px-6 py-3 bg-green-500 hover:bg-green-600 text-white font-medium rounded-full transition-colors">
                  Log Today's Activities
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-6">
                  <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
                    Weight Progress
                  </h3>
                  <div className="h-64 flex items-center justify-center">
                    <p className="text-gray-500 dark:text-gray-400">
                      No weight data recorded yet
                    </p>
                  </div>
                </div>

                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-6">
                  <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
                    Workout Consistency
                  </h3>
                  <div className="h-64 flex items-center justify-center">
                    <p className="text-gray-500 dark:text-gray-400">
                      No workout data recorded yet
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
