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
      className={`relative overflow-hidden rounded-xl bg-gradient-to-br ${bgClass} p-6 border border-border backdrop-blur-sm`}
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
            <div className="text-xs text-foreground/80">
              Complete
            </div>
          </div>
        ) : (
          SecondaryIcon && (
            <SecondaryIcon className={`w-6 h-6 ${secondaryIconStyle}`} />
          )
        )}
      </div>

      <p className="text-sm text-foreground/80 mb-2 font-medium">
        {label}
      </p>

      <p className="text-3xl font-bold text-foreground mb-3">
        {value}
        {target && (
          <span className="text-lg text-muted-foreground font-normal ml-1">
            / {target}
          </span>
        )}
        {subtitle && (
          <span className="block text-sm text-muted-foreground font-normal">
            {subtitle}
          </span>
        )}
      </p>

      {percentage !== undefined && (
        <div className="h-3 bg-background rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(percentage, 100)}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
            className={`h-full ${iconStyle} rounded-full`}
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
          iconStyle="bg-progress-indigo-purple"
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
          iconStyle="bg-progress-orange-red"
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
          iconStyle="bg-progress-green-emerald"
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
          iconStyle="bg-progress-blue-cyan"
          delay={0.3}
        />
      </div>
    );
  }
);

ProgressCards.displayName = "ProgressCards";
