import type { PeriodizationPlan, ProgressionTracking } from "@/shared/types/dashboard";
import { motion } from "framer-motion";
import {
  Calendar,
  CheckCircle,
  Lightbulb,
  Target,
  TrendingUp,
} from "lucide-react";
import React, { useMemo } from "react";

interface ProgressPanelProps {
  periodization: PeriodizationPlan;
  progression: ProgressionTracking;
}

export const ProgressPanel: React.FC<ProgressPanelProps> = React.memo(
  ({ periodization, progression }) => {
    const periodizationEntries = useMemo(
      () => (periodization ? Object.entries(periodization) : []),
      [periodization]
    );

    if (!periodization && !progression) return null;

    return (
      <div className="space-y-6">
        {periodization && (
          <div className="bg-gradient-to-br from-blue-500/10 via-indigo-500/10 to-purple-500/10 rounded-md p-8 border border-blue-200/50 dark:border-blue-800/50 backdrop-blur-sm">
            <div className="flex items-center gap-4 mb-6">
              <div className="bg-gradient-to-br from-blue-600 to-indigo-600 p-4 rounded-md shadow-lg">
                <Calendar className="h-8 w-8 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
                  Periodization Plan
                </h3>
                <p className="text-slate-600 dark:text-slate-400">
                  Your structured training progression over time
                </p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              {periodizationEntries.map(([phase, description], index) => (
                <motion.div
                  key={phase}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-md p-5 border border-blue-200/50 dark:border-blue-800/50 hover:shadow-lg transition-all"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center">
                      <span className="text-white font-bold text-sm">
                        {phase.replace(/\D/g, "") || "8+"}
                      </span>
                    </div>
                    <h4 className="font-bold text-slate-900 dark:text-white capitalize">
                      {phase.replace(/_/g, " ")}
                    </h4>
                  </div>
                  <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                    {description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {progression && (
          <div className="bg-gradient-to-br from-green-500/10 via-emerald-500/10 to-teal-500/10 rounded-md p-8 border border-green-200/50 dark:border-green-800/50 backdrop-blur-sm">
            <div className="flex items-center gap-4 mb-6">
              <div className="bg-gradient-to-br from-green-600 to-emerald-600 p-4 rounded-md shadow-lg">
                <TrendingUp className="h-8 w-8 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
                  Progression Tracking
                </h3>
                <p className="text-slate-600 dark:text-slate-400">
                  Guidelines for making consistent gains
                </p>
              </div>
            </div>

            <div className="space-y-6">
              {progression.what_to_track &&
                progression.what_to_track.length > 0 && (
                  <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-md p-5 border border-green-200/50 dark:border-green-800/50">
                    <h4 className="font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                      What to Track
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {progression.what_to_track.map((item, index) => (
                        <span
                          key={index}
                          className="px-3 py-2 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-lg text-sm font-semibold text-slate-700 dark:text-slate-300 border border-green-200/50 dark:border-green-800/50"
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

              {progression.when_to_progress && (
                <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-md p-5 border border-green-200/50 dark:border-green-800/50">
                  <h4 className="font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                    <Target className="h-5 w-5 text-green-600 dark:text-green-400" />
                    When to Progress
                  </h4>
                  <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                    {progression.when_to_progress}
                  </p>
                </div>
              )}

              {progression.how_much_to_add && (
                <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-md p-5 border border-green-200/50 dark:border-green-800/50">
                  <h4 className="font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" />
                    How Much to Add
                  </h4>
                  <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                    {progression.how_much_to_add}
                  </p>
                </div>
              )}

              {progression.plateau_breakers &&
                progression.plateau_breakers.length > 0 && (
                  <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-md p-5 border border-green-200/50 dark:border-green-800/50">
                    <h4 className="font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                      <Lightbulb className="h-5 w-5 text-green-600 dark:text-green-400" />
                      Plateau Breakers
                    </h4>
                    <ul className="space-y-2">
                      {progression.plateau_breakers.map((breaker, index) => (
                        <li
                          key={index}
                          className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-300"
                        >
                          <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                          <span>{breaker}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
            </div>
          </div>
        )}
      </div>
    );
  }
);

ProgressPanel.displayName = "ProgressPanel";
