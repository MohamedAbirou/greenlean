import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import {
  Activity,
  BarChart3,
  Flame,
  Sparkles,
  Timer,
  TrendingUp,
  Trophy,
} from "lucide-react";
import React from "react";

interface ProgressCardProps {
  icon: LucideIcon;
  secondaryIcon?: LucideIcon;
  label: string;
  value: number;
  subtitle?: string;
  colorClass: string;
  bgClass: string;
  iconStyle: string;
  secondaryIconStyle?: string;
  delay?: number;
  percentage?: number;
  target?: number;
}

export const ProgressCard: React.FC<ProgressCardProps> = React.memo(
  ({
    icon: Icon,
    secondaryIcon: SecondaryIcon,
    label,
    value,
    subtitle,
    colorClass,
    bgClass,
    iconStyle,
    secondaryIconStyle,
    delay = 0,
    percentage,
    target,
  }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className={`relative overflow-hidden rounded-xl bg-gradient-to-br ${bgClass} p-6 border border-slate-200/20 dark:border-slate-800/20 backdrop-blur-sm`}
    >
      <div className="flex items-center justify-between mb-4">
        <div
          className={`bg-gradient-to-br ${iconStyle} p-3 rounded-md shadow-lg`}
        >
          <Icon className="h-6 w-6 text-white" />
        </div>
        {percentage !== undefined ? (
          <div className="text-right">
            <div className={`text-2xl font-bold ${colorClass}`}>
              {percentage.toFixed(0)}%
            </div>
            <div className="text-xs text-slate-600 dark:text-slate-400">
              Complete
            </div>
          </div>
        ) : (
          SecondaryIcon && (
            <SecondaryIcon className={`w-6 h-6 ${secondaryIconStyle}`} />
          )
        )}
      </div>

      <p className="text-sm text-slate-600 dark:text-slate-400 mb-2 font-medium">
        {label}
      </p>

      <p className="text-3xl font-bold text-slate-900 dark:text-white mb-3">
        {value}
        {target && (
          <span className="text-lg text-slate-500 dark:text-slate-400 font-normal ml-1">
            / {target}
          </span>
        )}
        {subtitle && (
          <span className="block text-sm text-slate-500 dark:text-slate-400 font-normal">
            {subtitle}
          </span>
        )}
      </p>

      {percentage !== undefined && (
        <div className="h-3 bg-white/50 dark:bg-slate-800/50 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(percentage, 100)}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full"
          />
        </div>
      )}
    </motion.div>
  )
);

ProgressCard.displayName = "ProgressCard";

interface ProgressCardsProps {
  progress: {
    value: number;
    target: number;
    label: string;
    percentage: number;
    subtitle: string;
    color: string;
    bg: string;
  };
  burned: {
    value: number;
    label: string;
    subtitle: string;
    color: string;
    bg: string;
  };
  streak: {
    value: number;
    label: string;
    subtitle: string;
    color: string;
    bg: string;
  };
  time: {
    value: number;
    label: string;
    subtitle: string;
    color: string;
    bg: string;
  };
}

export const ProgressCards: React.FC<ProgressCardsProps> = React.memo(
  ({ progress, burned, streak, time }) => {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mt-6">
        <ProgressCard
          icon={Activity}
          label={progress.label}
          value={progress.value}
          target={progress.target}
          subtitle={progress.subtitle}
          colorClass={progress.color}
          bgClass={progress.bg}
          iconStyle="from-indigo-600 to-purple-600"
          percentage={progress.percentage}
          delay={0}
        />
        <ProgressCard
          icon={Flame}
          secondaryIcon={Trophy}
          secondaryIconStyle="text-orange-600 dark:text-orange-400"
          label={burned.label}
          value={burned.value}
          subtitle={burned.subtitle}
          colorClass={burned.color}
          bgClass={burned.bg}
          iconStyle="from-orange-600 to-red-600"
          delay={0.1}
        />
        <ProgressCard
          icon={TrendingUp}
          secondaryIcon={Sparkles}
          secondaryIconStyle="text-green-600 dark:text-green-400"
          label={streak.label}
          value={streak.value}
          subtitle={streak.subtitle}
          colorClass={streak.color}
          bgClass={streak.bg}
          iconStyle="from-green-600 to-emerald-600"
          delay={0.2}
        />
        <ProgressCard
          icon={Timer}
          secondaryIcon={BarChart3}
          secondaryIconStyle="text-blue-600 dark:text-blue-400"
          label={time.label}
          value={time.value}
          subtitle={time.subtitle}
          colorClass={time.color}
          bgClass={time.bg}
          iconStyle="from-blue-600 to-cyan-600"
          delay={0.3}
        />
      </div>
    );
  }
);

ProgressCards.displayName = "ProgressCards";
