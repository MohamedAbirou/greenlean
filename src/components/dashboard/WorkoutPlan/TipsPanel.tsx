import type { WeeklySummary } from "@/types/dashboard";
import { motion } from "framer-motion";
import {
  Activity,
  Clock,
  Info,
  Lightbulb,
  Target,
  TrendingUp,
} from "lucide-react";
import React, { useMemo } from "react";

interface TipsPanelProps {
  summary: WeeklySummary;
  tips: string[];
}

export const TipsPanel: React.FC<TipsPanelProps> = React.memo(
  ({ summary, tips }) => {
    const summaryStats = useMemo(
      () => [
        {
          icon: Activity,
          label: "Workout Days",
          value: summary?.total_workout_days,
          color: "indigo",
        },
        {
          icon: Clock,
          label: "Minutes",
          value: summary?.total_time_minutes,
          color: "green",
        },
        {
          icon: Target,
          label: "Exercises",
          value: summary?.total_exercises,
          color: "orange",
        },
        {
          icon: TrendingUp,
          label: "Difficulty",
          value: summary?.difficulty_level,
          color: "blue",
        },
      ],
      [summary]
    );

    return (
      <div className="space-y-6">
        {tips && (
          <>
            <div className="flex items-center gap-4 mb-6">
              <div className="bg-gradient-to-br from-purple-600 to-pink-600 p-4 rounded-md shadow-lg">
                <Lightbulb className="h-8 w-8 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
                  Personalized Tips
                </h3>
                <p className="text-slate-600 dark:text-slate-400">
                  Tailored advice for your fitness journey
                </p>
              </div>
            </div>

            <div className="grid gap-4">
              {tips.map((tip: string, index: number) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-gradient-to-br from-purple-500/10 via-pink-500/10 to-rose-500/10 rounded-md p-6 border border-purple-200/50 dark:border-purple-800/50 backdrop-blur-sm hover:shadow-lg transition-all"
                >
                  <p className="text-slate-800 dark:text-slate-200 leading-relaxed">
                    {tip}
                  </p>
                </motion.div>
              ))}
            </div>
          </>
        )}

        {summary && (
          <div className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 rounded-md p-6 border border-indigo-200/50 dark:border-indigo-800/50">
            <h4 className="font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <Info className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
              Weekly Summary
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {summaryStats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div
                    className={`bg-gradient-to-br from-${stat.color}-500/20 to-${stat.color}-500/20 rounded-md p-4`}
                  >
                    <stat.icon
                      className={`h-6 w-6 text-${stat.color}-600 dark:text-${stat.color}-400 mx-auto mb-2`}
                    />
                    <p className="text-3xl font-bold text-slate-900 dark:text-white">
                      {stat.value}
                    </p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {stat.label}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }
);

TipsPanel.displayName = "TipsPanel";
