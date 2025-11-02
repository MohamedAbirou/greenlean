/**
 * Hero Summary Cards
 * Top-level summary cards showing key metrics
 */

import type { MonthlyHighlight, WeeklySummary } from "@/features/dashboard/types/stats.types";
import { Flame, TrendingUp, Trophy } from "lucide-react";

interface Props {
  currentStreak: number;
  weeklySummary: WeeklySummary;
  monthlyHighlight: MonthlyHighlight;
}

export function HeroSummaryCards({ currentStreak, weeklySummary, monthlyHighlight }: Props) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      {/* Streak Card */}
      <div className="bg-card rounded-xl shadow-sm border border-border p-6 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between mb-4">
          <div className="p-3 bg-orange-50 rounded-lg">
            <Flame className="w-6 h-6 text-orange-500" />
          </div>
          <span className="text-sm font-medium text-gray-500">Current Streak</span>
        </div>
        <div className="space-y-2">
          <div className="flex items-end gap-2">
            <span className="text-4xl font-bold text-foreground">{currentStreak}</span>
            <span className="text-lg text-gray-500 mb-1">days</span>
          </div>
          <p className="text-sm text-muted-foreground">Active this week</p>
        </div>
      </div>

      {/* Weekly Summary Card */}
      <div className="bg-card rounded-xl shadow-sm border border-border p-6 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between mb-4">
          <div className="p-3 bg-blue-50 rounded-lg">
            <TrendingUp className="w-6 h-6 text-blue-500" />
          </div>
          <span className="text-sm font-medium text-muted-foreground">This Week</span>
        </div>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Avg Calories</span>
            <span className="text-sm font-semibold text-foreground">
              {weeklySummary.avgCalories.toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Workouts</span>
            <span className="text-sm font-semibold text-foreground">
              {weeklySummary.workoutsCompleted}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Hydration</span>
            <span className="text-sm font-semibold text-foreground">
              {weeklySummary.avgHydration} glasses/day
            </span>
          </div>
        </div>
      </div>

      {/* Monthly Highlight Card */}
      <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/10 dark:to-pink-900/10 rounded-xl shadow-sm border border-purple-100 dark:border-purple-800 p-6 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between mb-4">
          <div className="p-3 bg-card/80 rounded-lg">
            <Trophy className="w-6 h-6 text-purple-500" />
          </div>
          <span className="text-sm font-medium text-purple-700">Monthly Best</span>
        </div>
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-foreground">{monthlyHighlight.title}</h3>
          <p className="text-sm text-muted-foreground">{monthlyHighlight.description}</p>
          <div className="mt-2 inline-block px-3 py-1 bg-card/80 rounded-full">
            <span className="text-sm font-semibold text-purple-700">{monthlyHighlight.value}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
