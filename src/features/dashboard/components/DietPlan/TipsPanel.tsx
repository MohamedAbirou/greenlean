import { motion } from "framer-motion";
import { Info, Lightbulb } from "lucide-react";
import React from "react";

interface DailyTotals {
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  fiber?: number;
  variance: string;
}

interface TipsPanelProps {
  tips: string[];
  dailyTotals: DailyTotals;
  variance: string;
}

export const TipsPanel: React.FC<TipsPanelProps> = ({
  tips,
  dailyTotals,
  variance,
}) => (
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
          Tailored advice for your success
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

    <div className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 rounded-md p-6 border border-indigo-200/50 dark:border-indigo-800/50 mt-6">
      <h4 className="font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
        <Info className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
        Daily Totals Summary
      </h4>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="text-center">
          <p className="text-3xl font-bold text-slate-900 dark:text-white">
            {dailyTotals.calories}
          </p>
          <p className="text-sm text-slate-600 dark:text-slate-400">Calories</p>
        </div>
        <div className="text-center">
          <p className="text-3xl font-bold text-green-600 dark:text-green-400">
            {dailyTotals.protein}g
          </p>
          <p className="text-sm text-slate-600 dark:text-slate-400">Protein</p>
        </div>
        <div className="text-center">
          <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
            {dailyTotals.carbs}g
          </p>
          <p className="text-sm text-slate-600 dark:text-slate-400">Carbs</p>
        </div>
        <div className="text-center">
          <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">
            {dailyTotals.fats}g
          </p>
          <p className="text-sm text-slate-600 dark:text-slate-400">Fats</p>
        </div>
        <div className="text-center">
          <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">
            {dailyTotals.fiber}g
          </p>
          <p className="text-sm text-slate-600 dark:text-slate-400">Fiber</p>
        </div>
      </div>
      <p className="text-center text-xs text-slate-500 dark:text-slate-500 mt-4">
        Variance: {variance}
      </p>
    </div>
  </>
);
