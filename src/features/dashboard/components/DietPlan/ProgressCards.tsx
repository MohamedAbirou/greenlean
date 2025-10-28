import { motion } from "framer-motion";
import { Flame, Heart, TrendingUp, Zap } from "lucide-react";
import React from "react";

interface ProgressStats {
  logged: number;
  target: number;
  percentage: number;
  remaining?: number;
}

interface ProgressCardsProps {
  calorieStats: ProgressStats;
  proteinStats: ProgressStats;
  carbsStats: ProgressStats;
  fatsStats: ProgressStats;
}

export const ProgressCards: React.FC<ProgressCardsProps> = ({
  calorieStats,
  proteinStats,
  carbsStats,
  fatsStats,
}) => {
  const cards = [
    {
      label: "Calories Today",
      value: calorieStats.logged,
      icon: Flame,
      target: calorieStats.target,
      percentage: calorieStats.percentage,
      subtitle: `/${calorieStats.target}`,
      footer:
        calorieStats.remaining !== undefined
          ? `${calorieStats.remaining} kcal remaining`
          : undefined,
      style:
        "from-orange-500/10 via-red-500/10 to-pink-500/10 p-6 border border-orange-200/20 dark:border-orange-800/20",
      iconStyle: "from-orange-500 to-red-500",
      color: "text-orange-600 dark:text-orange-400",
      delay: 0,
    },
    {
      label: "Protein",
      value: proteinStats.logged,
      icon: TrendingUp,
      target: proteinStats.target,
      percentage: proteinStats.percentage,
      subtitle: `g / ${proteinStats.target}g`,
      footer:
        proteinStats.remaining !== undefined
          ? `${proteinStats.remaining} g remaining`
          : undefined,
      style:
        "from-green-500/10 via-emerald-500/10 to-teal-500/10 p-6 border border-green-200/20 dark:border-green-800/20",
      iconStyle: "from-green-500 to-emerald-500",
      color: "text-green-600 dark:text-green-400",
      delay: 0.1,
    },
    {
      label: "Carbs",
      value: carbsStats.logged,
      icon: Zap,
      target: carbsStats.target,
      percentage: carbsStats.percentage,
      subtitle: `g / ${carbsStats.target}g`,
      footer:
        carbsStats.remaining !== undefined
          ? `${carbsStats.remaining} g remaining`
          : undefined,
      style:
        "from-blue-500/10 via-cyan-500/10 to-sky-500/10 p-6 border border-blue-200/20 dark:border-blue-800/20",
      iconStyle: "from-blue-500 to-cyan-500",
      color: "text-blue-600 dark:text-blue-400",
      delay: 0.2,
    },
    {
      label: "Healthy Fats",
      value: fatsStats.logged,
      icon: Heart,
      target: fatsStats.target,
      percentage: fatsStats.percentage,
      subtitle: `g / ${fatsStats.target}g`,
      footer:
        fatsStats.remaining !== undefined
          ? `${fatsStats.remaining} g remaining`
          : undefined,
      style:
        "from-yellow-500/10 via-amber-500/10 to-orange-500/10 p-6 border border-yellow-200/20 dark:border-yellow-800/20",
      iconStyle: "from-yellow-500 to-amber-500",
      color: "text-yellow-600 dark:text-yellow-400",
      delay: 0.3,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, index) => {
        const Icon = card.icon;
        return (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: card.delay }}
            className={`relative overflow-hidden rounded-md bg-gradient-to-br ${card.style} backdrop-blur-sm`}
          >
            <div className="flex items-center justify-between mb-4">
              <div
                className={`bg-gradient-to-br ${card.iconStyle} p-3 rounded-md shadow-lg`}
              >
                <Icon className="h-6 w-6 text-white" />
              </div>
              <div className="text-right">
                <div className={`text-2xl font-bold ${card.color}`}>
                  {card.percentage.toFixed(0)}%
                </div>
                <div className="text-xs text-slate-600 dark:text-slate-400">
                  Progress
                </div>
              </div>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-2 font-medium">
              {card.label}
            </p>
            <p className="text-3xl font-bold text-slate-900 dark:text-white mb-3">
              {card.value}
              <span className="text-lg text-slate-500 dark:text-slate-400 font-normal">
                {" "}
                / {card.target}
              </span>
            </p>
            <div className="h-3 bg-white/50 dark:bg-slate-800/50 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(card.percentage, 100)}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="h-full bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 rounded-full"
              />
            </div>
            <div className="mt-2 text-xs text-slate-600 dark:text-slate-400">
              {card.footer} kcal remaining
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};
