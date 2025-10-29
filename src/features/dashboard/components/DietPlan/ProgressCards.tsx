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
        "p-6 bg-stat-orange border border-orange-200/50 dark:border-orange-800/30",
      iconStyle: "bg-progress-orange-red",
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
        "p-6 bg-stat-green border border-green-200/50 dark:border-green-800/30",
      iconStyle: "bg-progress-green-emerald",
      color: "text-gradient-green-emerald",
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
        "p-6 bg-stat-blue border border-blue-200/50 dark:border-blue-800/30",
      iconStyle: "bg-progress-blue-cyan",
      color: "text-gradient-blue-cyan",
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
        "p-6 bg-stat-yellow border border-yellow-200/50 dark:border-yellow-800/30",
      iconStyle: "bg-progress-yellow-amber",
      color: "text-gradient-yellow-amber",
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
                <div className="text-xs text-muted-foreground">
                  Progress
                </div>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mb-2 font-medium">
              {card.label}
            </p>
            <p className="text-3xl font-bold text-foreground mb-3">
              {card.value}
              <span className="text-lg text-muted-foreground font-normal">
                {" "}
                / {card.target}
              </span>
            </p>
            <div className="h-3 bg-background rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(card.percentage, 100)}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                className={`h-full ${card.iconStyle} rounded-full`}
              />
            </div>
            <div className="mt-2 text-xs text-muted-foreground">
              {card.footer} kcal remaining
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};
