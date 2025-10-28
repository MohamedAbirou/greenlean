import type { InjuryPrevention, NutritionTiming } from "@/shared/types/dashboard";
import { motion } from "framer-motion";
import { AlertCircle, Check, Heart } from "lucide-react";
import React, { useMemo } from "react";

interface NutritionPanelProps {
  nutrition: NutritionTiming;
  injuryPrevention: InjuryPrevention;
}

export const NutritionPanel: React.FC<NutritionPanelProps> = React.memo(
  ({ nutrition, injuryPrevention }) => {
    const nutritionEntries = useMemo(
      () => (nutrition ? Object.entries(nutrition) : []),
      [nutrition]
    );

    const injuryEntries = useMemo(
      () => (injuryPrevention ? Object.entries(injuryPrevention) : []),
      [injuryPrevention]
    );

    if (!nutrition && !injuryPrevention) return null;

    return (
      <motion.div
        key="nutrition"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="space-y-6"
      >
        {nutrition && (
          <div className="bg-gradient-to-br from-pink-500/10 via-rose-500/10 to-red-500/10 rounded-md p-8 border border-pink-200/50 dark:border-pink-800/50 backdrop-blur-sm">
            <div className="flex items-center gap-4 mb-6">
              <div className="bg-gradient-to-br from-pink-600 to-rose-600 p-4 rounded-md shadow-lg">
                <Heart className="h-8 w-8 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
                  Nutrition Timing
                </h3>
                <p className="text-slate-600 dark:text-slate-400">
                  Optimize your meals around workouts
                </p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {nutritionEntries.map(([key, value], index) => (
                <motion.div
                  key={key}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-md p-5 border border-pink-200/50 dark:border-pink-800/50"
                >
                  <h4 className="font-bold text-slate-900 dark:text-white capitalize mb-3 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-gradient-to-r from-pink-500 to-rose-500"></div>
                    {key.replace("_", " ")}
                  </h4>
                  <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                    {value}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {injuryPrevention && (
          <div className="bg-gradient-to-br from-red-500/10 to-orange-500/10 rounded-md p-8 border border-red-200/50 dark:border-red-800/50 backdrop-blur-sm">
            <div className="flex items-center gap-4 mb-6">
              <div className="bg-gradient-to-br from-red-600 to-orange-600 p-4 rounded-md shadow-lg">
                <AlertCircle className="h-8 w-8 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
                  Injury Prevention
                </h3>
                <p className="text-slate-600 dark:text-slate-400">
                  Stay safe and train smart
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {injuryEntries.map(([key, value]) => (
                <div
                  key={key}
                  className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-md p-5 border border-red-200/50 dark:border-red-800/50"
                >
                  <h4 className="font-bold text-slate-900 dark:text-white capitalize mb-2 flex items-center gap-2">
                    <Check className="h-4 w-4 text-red-600 dark:text-red-400" />
                    {key.replace("_", " ")}
                  </h4>
                  <p className="text-sm text-slate-700 dark:text-slate-300">
                    {value}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </motion.div>
    );
  }
);

NutritionPanel.displayName = "NutritionPanel";
