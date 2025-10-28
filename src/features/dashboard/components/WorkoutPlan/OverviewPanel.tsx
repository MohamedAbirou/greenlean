import type { WeeklySummary } from "@/shared/types/dashboard";
import { motion } from "framer-motion";
import {
  Activity,
  Calendar,
  Clock,
  Dumbbell,
  Flame,
  Heart,
  Target,
  TrendingUp,
  Zap,
} from "lucide-react";
import React, { useMemo } from "react";

interface OverviewPanelProps {
  summary: WeeklySummary;
}

export const OverviewPanel: React.FC<OverviewPanelProps> = React.memo(
  ({ summary }) => {
    const stats = useMemo(
      () => [
        {
          icon: Activity,
          label: "Workout Days",
          value: summary?.total_workout_days,
          color: "from-indigo-600 to-purple-600",
          textColor: "text-indigo-600 dark:text-indigo-400",
          bgColor: "from-indigo-500/10 to-purple-500/10",
        },
        {
          icon: Heart,
          label: "Rest Days",
          value: summary?.rest_days,
          color: "from-green-600 to-emerald-600",
          textColor: "text-green-600 dark:text-green-400",
          bgColor: "from-green-500/10 to-emerald-500/10",
        },
        {
          icon: Dumbbell,
          label: "Strength Days",
          value: summary?.strength_days,
          color: "from-orange-600 to-red-600",
          textColor: "text-orange-600 dark:text-orange-400",
          bgColor: "from-orange-500/10 to-red-500/10",
        },
        {
          icon: Zap,
          label: "Cardio Days",
          value: summary?.cardio_days,
          color: "from-blue-600 to-cyan-600",
          textColor: "text-blue-600 dark:text-blue-400",
          bgColor: "from-blue-500/10 to-cyan-500/10",
        },
        {
          icon: Clock,
          label: "Total Minutes",
          value: summary?.total_time_minutes,
          color: "from-purple-600 to-pink-600",
          textColor: "text-purple-600 dark:text-purple-400",
          bgColor: "from-purple-500/10 to-pink-500/10",
        },
        {
          icon: Target,
          label: "Total Exercises",
          value: summary?.total_exercises,
          color: "from-pink-600 to-rose-600",
          textColor: "text-pink-600 dark:text-pink-400",
          bgColor: "from-pink-500/10 to-rose-500/10",
        },
        {
          icon: TrendingUp,
          label: "Difficulty",
          value: summary?.difficulty_level,
          color: "from-yellow-600 to-orange-600",
          textColor: "text-yellow-600 dark:text-yellow-400",
          bgColor: "from-yellow-500/10 to-orange-500/10",
          isText: true,
        },
        {
          icon: Flame,
          label: "Est. Weekly Calories",
          value: summary?.estimated_weekly_calories_burned,
          color: "from-red-600 to-orange-600",
          textColor: "text-red-600 dark:text-red-400",
          bgColor: "from-red-500/10 to-orange-500/10",
        },
      ],
      [summary]
    );

    if (!summary) return null;

    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="bg-gradient-to-br from-indigo-600 to-purple-600 p-4 rounded-md shadow-lg">
            <Calendar className="h-8 w-8 text-white" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
              Weekly Overview
            </h3>
            <p className="text-slate-600 dark:text-slate-400">
              Complete breakdown of your training week
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              className={`bg-gradient-to-br ${stat.bgColor} rounded-md p-5 border border-slate-200/50 dark:border-slate-700/50 backdrop-blur-sm hover:shadow-lg transition-all`}
            >
              <div className="flex flex-col items-center text-center">
                <div
                  className={`bg-gradient-to-br ${stat.color} p-3 rounded-md shadow-lg mb-3`}
                >
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
                <p className={`text-3xl font-bold ${stat.textColor} mb-1`}>
                  {stat.isText ? (
                    <span className="capitalize">{stat.value}</span>
                  ) : (
                    stat.value
                  )}
                </p>
                <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                  {stat.label}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          {summary.training_split && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 rounded-md p-6 border border-indigo-200/50 dark:border-indigo-800/50 backdrop-blur-sm"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="bg-gradient-to-br from-indigo-600 to-purple-600 p-2 rounded-lg">
                  <Dumbbell className="h-5 w-5 text-white" />
                </div>
                <h4 className="font-bold text-slate-900 dark:text-white">
                  Training Split
                </h4>
              </div>
              <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed">
                {summary.training_split}
              </p>
            </motion.div>
          )}

          {summary.progression_strategy && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-md p-6 border border-green-200/50 dark:border-green-800/50 backdrop-blur-sm"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="bg-gradient-to-br from-green-600 to-emerald-600 p-2 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-white" />
                </div>
                <h4 className="font-bold text-slate-900 dark:text-white">
                  Progression Strategy
                </h4>
              </div>
              <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed">
                {summary.progression_strategy}
              </p>
            </motion.div>
          )}
        </div>
      </div>
    );
  }
);

OverviewPanel.displayName = "OverviewPanel";
