import type { BmiStatus, DashboardCalculations } from "@/shared/types/dashboard";
import { motion } from "framer-motion";
import {
  Activity,
  Award,
  Brain,
  Calendar,
  Flame,
  Heart,
  Percent,
  Scale,
  Target,
  TrendingUp,
  Zap,
} from "lucide-react";
import React from "react";

interface OverviewSectionProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  answers: Record<string, any>;
  calculations: DashboardCalculations;
  bmiStatus: BmiStatus;
  // Add profile to props
  profile: { weight_kg?: number };
}

function getWeight(weightObj: { kg?: string | number; lbs?: string | number }) {
  if (weightObj?.kg !== undefined) {
    const value = typeof weightObj.kg === "string" ? parseFloat(weightObj.kg) : weightObj.kg;
    return { value, unit: "kg" };
  } else if (weightObj?.lbs !== undefined) {
    const value = typeof weightObj.lbs === "string" ? parseFloat(weightObj.lbs) : weightObj.lbs;
    return { value, unit: "lbs" };
  }
  return { value: 0, unit: "kg" };
}

export const OverviewSection: React.FC<OverviewSectionProps> = ({
  answers,
  calculations,
  bmiStatus,
  profile,
}) => {
  const startingWeight = getWeight(answers.currentWeight).value;
  const goalWeight = getWeight(answers.targetWeight).value;
  // Use user profile weight if available, else fallback to quiz answer
  const currentWeight = (typeof profile.weight_kg === 'number' && !isNaN(profile.weight_kg))
    ? profile.weight_kg
    : startingWeight;
  const totalWeightChange = Math.abs(startingWeight - goalWeight);
  const progressMade = Math.abs(startingWeight - currentWeight);
  const progressPercentage = totalWeightChange > 0 ? Math.min((progressMade / totalWeightChange) * 100, 100) : 0;

  const getBMIColor = (status: string) => {
    if (status.toLowerCase().includes("normal")) return "text-green-500";
    if (status.toLowerCase().includes("underweight")) return "text-blue-500";
    if (status.toLowerCase().includes("overweight")) return "text-yellow-500";
    return "text-red-500";
  };

  const statCards = [
    {
      icon: Scale,
      label: "Current BMI",
      value: calculations.bmi?.toFixed(1),
      subtitle: bmiStatus.status,
      color: "blue",
      bgGradient: "bg-stat-blue",
      iconBg: "bg-blue-500/10 dark:bg-blue-500/20",
      iconColor: "text-blue-600 dark:text-blue-400",
      subtitleColor: getBMIColor(bmiStatus.status),
    },
    {
      icon: Target,
      label: "Daily Target",
      value: `${Math.round(calculations.goalCalories ?? 0)}`,
      subtitle: "calories",
      color: "green",
      bgGradient: "bg-stat-green",
      iconBg: "bg-green-500/10 dark:bg-green-500/20",
      iconColor: "text-green-600 dark:text-green-400",
    },
    {
      icon: Flame,
      label: "Daily Burn",
      value: `${Math.round(calculations.tdee)}`,
      subtitle: "calories",
      color: "orange",
      bgGradient: "bg-stat-orange",
      iconBg: "bg-orange-500/10 dark:bg-orange-500/20",
      iconColor: "text-orange-600 dark:text-orange-400",
    },
    {
      icon: Activity,
      label: "Activity Level",
      value: answers.exerciseFrequency.split(" ")[0],
      subtitle: "per week",
      color: "purple",
      bgGradient: "bg-stat-purple",
      iconBg: "bg-purple-500/10 dark:bg-purple-500/20",
      iconColor: "text-purple-600 dark:text-purple-400",
    },
    // Show Body Fat Percentage IF it exists in calculations!
    ...(calculations.bodyFatPercentage
      ? [
          {
            icon: Percent,
            label: "Body Fat Percentage",
            value: `${calculations.bodyFatPercentage}%`,
            subtitle: "body fat percentage",
            color: "red",
            bgGradient: "bg-stat-red",
            iconBg: "bg-red-500/10 dark:bg-red-500/20",
            iconColor: "text-red-600 dark:text-red-400",
          },
        ]
      : []),
  ];

  const macroData = [
    {
      name: "Protein",
      percentage: calculations.macros.protein_pct_of_calories,
      grams: calculations.macros.protein_g,
      color: "bg-progress-green-emerald",
      lightColor: "badge-green border",
      icon: "🥩",
    },
    {
      name: "Carbs",
      percentage: calculations.macros.carbs_pct_of_calories,
      grams: calculations.macros.carbs_g,
      color: "bg-progress-blue-cyan",
      lightColor: "badge-blue border",
      icon: "🍞",
    },
    {
      name: "Fats",
      percentage: calculations.macros.fat_pct_of_calories,
      grams: calculations.macros.fat_g,
      color: "bg-progress-yellow-amber",
      lightColor: "badge-yellow border",
      icon: "🥑",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Hero Stats Grid */}
      <div className={`grid grid-cols-1 sm:grid-cols-2 ${calculations.bodyFatPercentage ? "lg:grid-cols-5" : "lg:grid-cols-4"} gap-4`}>
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className={`relative overflow-hidden rounded-md ${stat.bgGradient} p-6 backdrop-blur-sm border border-border/30 dark:border-white/10 hover:scale-105 transition-transform duration-300 cursor-pointer group shadow-sm`}
          >
            <div className="flex items-start justify-between mb-4">
              <div
                className={`${stat.iconBg} p-3 rounded-md group-hover:scale-110 transition-transform`}
              >
                <stat.icon className={`h-6 w-6 ${stat.iconColor}`} />
              </div>
              <Zap className="h-4 w-4 text-foreground/20 group-hover:text-foreground/40 transition-colors" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-foreground/70">{stat.label}</p>
              <p className="text-3xl font-bold text-foreground">{stat.value}</p>
              <p className={`text-sm font-medium ${stat.subtitleColor || "text-foreground/60"}`}>
                {stat.subtitle}
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Goal Progress Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.4 }}
        className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-500/10 dark:to-pink-500/10 rounded-md p-6 border border-purple-200/50 dark:border-white/10 shadow-sm"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="bg-purple-500/10 dark:bg-purple-500/20 p-3 rounded-md">
              <Target className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground">Your Journey</h3>
              <p className="text-sm text-foreground/70">
                {answers.mainGoal} • {answers.timeFrame}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {progressPercentage.toFixed(0)}%
            </p>
            <p className="text-xs text-foreground/60">Progress</p>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm text-foreground/70">
            <span>
              Current: {currentWeight} {getWeight(answers.currentWeight).unit}
            </span>
            <span>
              Target: {goalWeight} {getWeight(answers.targetWeight).unit}
            </span>
          </div>
          <div className="relative h-3 bg-muted/50 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(progressPercentage, 100)}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="absolute inset-y-0 left-0 bg-progress-purple-pink rounded-full"
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 mt-4">
          <div className="bg-background/50 rounded-lg p-3 text-center border border-border/30">
            <Calendar className="h-5 w-5 text-purple-600 dark:text-purple-400 mx-auto mb-1" />
            <p className="text-xs text-foreground/60">Timeline</p>
            <p className="text-sm font-semibold text-foreground">{answers.timeFrame}</p>
          </div>
          <div className="bg-background/50 rounded-lg p-3 text-center border border-border/30">
            <Brain className="h-5 w-5 text-pink-600 dark:text-pink-400 mx-auto mb-1" />
            <p className="text-xs text-foreground/60">Motivation</p>
            <p className="text-sm font-semibold text-foreground">{answers.motivationLevel}/10</p>
          </div>
          <div className="bg-background/50 rounded-lg p-3 text-center border border-border/30">
            <Heart className="h-5 w-5 text-red-600 dark:text-red-500 mx-auto mb-1" />
            <p className="text-xs text-foreground/60">Stress</p>
            <p className="text-sm font-semibold text-foreground">{answers.stressLevel}/10</p>
          </div>
        </div>
      </motion.div>

      {/* Macronutrient Distribution */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.5 }}
        className="bg-card rounded-md p-6 border border-border shadow-sm"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-primary/10 dark:bg-primary/20 p-3 rounded-md">
            <TrendingUp className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">Daily Macros</h3>
            <p className="text-sm text-foreground/70">
              Optimized for {answers.mainGoal.toLowerCase()}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {macroData.map((macro, index) => (
            <motion.div
              key={macro.name}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: 0.6 + index * 0.1 }}
              className={`${macro.lightColor} rounded-md p-5 relative overflow-hidden group hover:scale-105 transition-transform`}
            >
              <div className="absolute top-2 right-2 text-3xl opacity-20 group-hover:opacity-30 transition-opacity">
                {macro.icon}
              </div>
              <div className="relative z-10">
                <p className="text-sm font-medium text-foreground/70 mb-2">{macro.name}</p>
                <div className="flex items-baseline gap-2 mb-3">
                  <span className="text-3xl font-bold text-foreground">{macro.grams}g</span>
                  <span className="text-lg font-semibold text-foreground/60">
                    {macro.percentage}%
                  </span>
                </div>
                <div className="h-2 bg-muted/50 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${macro.percentage}%` }}
                    transition={{ duration: 0.8, delay: 0.8 + index * 0.1 }}
                    className={`h-full ${macro.color} rounded-full`}
                  />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Macro Tips */}
        <div className="mt-6 bg-muted/30 rounded-md p-4 border border-border/30">
          <p className="text-sm text-foreground/70 mb-2 font-medium">💡 Smart Tips:</p>
          <ul className="space-y-1.5 text-sm text-foreground/80">
            <li className="flex items-start gap-2">
              <span className="text-green-600 dark:text-green-400 mt-0.5">•</span>
              <span>High protein intake supports muscle recovery and satiety</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 dark:text-blue-400 mt-0.5">•</span>
              <span>Time carbs around workouts for optimal performance</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-yellow-600 dark:text-yellow-400 mt-0.5">•</span>
              <span>Healthy fats support hormone production and absorption</span>
            </li>
          </ul>
        </div>
      </motion.div>

      {/* Goals & Preferences Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Your Goals */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: 0.7 }}
          className="bg-card rounded-md p-6 border border-border shadow-sm"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-primary/10 dark:bg-primary/20 p-3 rounded-md">
              <Award className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-lg font-semibold text-foreground">Your Goals</h3>
          </div>
          <div className="space-y-3">
            <div className="bg-muted/30 rounded-md p-4 border border-border/30">
              <p className="text-xs font-medium text-foreground/60 mb-1">PRIMARY GOAL</p>
              <p className="text-lg font-semibold text-foreground">{answers.mainGoal}</p>
            </div>
            <div className="bg-muted/30 rounded-md p-4 border border-border/30">
              <p className="text-xs font-medium text-foreground/60 mb-2">SECONDARY GOALS</p>
              <div className="flex flex-wrap gap-2">
                {(answers.secondaryGoals || []).map((goal: string, idx: number) => (
                  <span
                    key={idx}
                    className="px-3 py-1.5 badge-green text-primary text-sm rounded-full font-medium border"
                  >
                    {goal}
                  </span>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-muted/30 rounded-md p-3 border border-border/30">
                <p className="text-xs font-medium text-foreground/60 mb-1">Target Weight</p>
                <p className="text-lg font-bold text-foreground">
                  {goalWeight} {getWeight(answers.targetWeight).unit}
                </p>
              </div>
              <div className="bg-muted/30 rounded-md p-3 border border-border/30">
                <p className="text-xs font-medium text-foreground/60 mb-1">Timeframe</p>
                <p className="text-lg font-bold text-foreground">{answers.timeFrame}</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Key Recommendations */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: 0.8 }}
          className="bg-card rounded-md p-6 border border-border shadow-sm"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-primary/10 dark:bg-primary/20 p-3 rounded-md">
              <Zap className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-lg font-semibold text-foreground">Action Plan</h3>
          </div>
          <div className="space-y-3">
            {[
              {
                icon: "🎯",
                title: "Calorie Strategy",
                description:
                  answers.mainGoal === "Lose weight" || answers.mainGoal === "Lose fat"
                    ? "Moderate calorie deficit for sustainable fat loss"
                    : answers.mainGoal === "Build muscle"
                    ? "Slight calorie surplus with high protein"
                    : "Balanced approach with strategic cycling",
              },
              {
                icon: "💪",
                title: "Training Focus",
                description: `${answers.exerciseFrequency} with ${answers.preferredExercise[0]}`,
              },
              {
                icon: "🍽️",
                title: "Meal Plan",
                description: `${answers.mealsPerDay} optimized for your schedule`,
              },
              {
                icon: "😴",
                title: "Recovery",
                description: `Prioritize ${
                  answers.sleepQuality.includes("Poor")
                    ? "improving sleep quality"
                    : "maintaining good sleep"
                }`,
              },
            ].map((item, idx) => (
              <div
                key={idx}
                className="bg-muted/30 rounded-md p-4 hover:bg-muted/40 transition-colors border border-border/30"
              >
                <div className="flex items-start gap-3">
                  <span className="text-2xl">{item.icon}</span>
                  <div className="flex-1">
                    <p className="font-semibold text-foreground mb-1">{item.title}</p>
                    <p className="text-sm text-foreground/70">{item.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Challenges & Support */}
      {answers.challenges && answers.challenges.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.9 }}
          className="bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-500/10 dark:to-red-500/10 rounded-md p-6 border border-orange-200/50 dark:border-white/10 shadow-sm"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-orange-500/10 dark:bg-orange-500/20 p-3 rounded-md">
              <Brain className="h-6 w-6 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground">We've Got You Covered</h3>
              <p className="text-sm text-foreground/70">Your plan addresses these challenges</p>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {answers.challenges.map((challenge: string, idx: number) => (
              <div
                key={idx}
                className="bg-background/50 rounded-md p-3 text-center hover:scale-105 transition-transform border border-border/30"
              >
                <p className="text-sm font-medium text-foreground">{challenge}</p>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
};
