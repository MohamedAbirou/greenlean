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
          color: "bg-progress-indigo-purple",
          textColor: "text-gradient-indigo-purple",
          bgColor: "bg-stat-indigo",
        },
        {
          icon: Heart,
          label: "Rest Days",
          value: summary?.rest_days,
          color: "bg-progress-green-emerald",
          textColor: "text-gradient-green-emerald",
          bgColor: "bg-stat-green",
        },
        {
          icon: Dumbbell,
          label: "Strength Days",
          value: summary?.strength_days,
          color: "bg-progress-orange-red",
          textColor: "text-foreground/90",
          bgColor: "bg-stat-orange",
        },
        {
          icon: Zap,
          label: "Cardio Days",
          value: summary?.cardio_days,
          color: "bg-progress-blue-cyan",
          textColor: "text-gradient-blue-cyan",
          bgColor: "bg-stat-blue",
        },
        {
          icon: Clock,
          label: "Total Minutes",
          value: summary?.total_time_minutes,
            color: "bg-progress-purple-pink",
          textColor: "text-gradient-purple-pink",
          bgColor: "bg-stat-purple",
        },
        {
          icon: Target,
          label: "Total Exercises",
          value: summary?.total_exercises,
          color: "bg-progress-purple-pink",
          textColor: "text-gradient-purple-pink",
          bgColor: "bg-stat-purple",
        },
        {
          icon: TrendingUp,
          label: "Difficulty",
          value: summary?.difficulty_level,
          color: "bg-progress-yellow-amber",
          textColor: "text-gradient-yellow-amber",
          bgColor: "bg-stat-yellow",
          isText: true,
        },
        {
          icon: Flame,
          label: "Est. Weekly Calories",
          value: summary?.estimated_weekly_calories_burned,
          color: "bg-progress-orange-red",
          textColor: "text-foreground/90",
          bgColor: "bg-stat-orange",
        },
      ],
      [summary]
    );

    if (!summary) return null;

    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="bg-progress-indigo-purple p-4 rounded-md shadow-lg">
            <Calendar className="h-8 w-8 text-white" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-foreground/90">
              Weekly Overview
            </h3>
            <p className="text-muted-foreground">
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
                <p className="text-xs text-muted-foreground font-medium">
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
              className="bg-stat-indigo rounded-md p-6 border border-indigo-200/50 dark:border-indigo-800/50 backdrop-blur-sm"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="bg-progress-indigo-purple p-2 rounded-lg">
                  <Dumbbell className="h-5 w-5 text-white" />
                </div>
                <h4 className="font-bold text-foreground/90">
                  Training Split
                </h4>
              </div>
              <p className="text-muted-foreground text-sm leading-relaxed">
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
                <h4 className="font-bold text-foreground/90">
                  Progression Strategy
                </h4>
              </div>
              <p className="text-muted-foreground text-sm leading-relaxed">
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
