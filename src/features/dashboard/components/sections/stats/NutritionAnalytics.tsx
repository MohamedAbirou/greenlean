/**
 * Nutrition Analytics Component
 * Shows calorie balance, macro distribution, and meal consistency
 */

import type { CalorieBalance, MacroDistribution, MealConsistency } from "@/features/dashboard/types/stats.types";
import { useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";

interface Props {
  calorieBalance: CalorieBalance[];
  macroDistribution: MacroDistribution[];
  mealConsistency: MealConsistency[];
  avgMacros: { protein: number; carbs: number; fats: number };
}

type TimeRange = "7d" | "30d";

export function NutritionAnalytics({
  calorieBalance,
  macroDistribution,
  mealConsistency,
  avgMacros,
}: Props) {
  const [timeRange, setTimeRange] = useState<TimeRange>("30d");

  const filteredCalories = calorieBalance.slice(timeRange === "7d" ? -7 : -30);
  const filteredMacros = macroDistribution.slice(timeRange === "7d" ? -7 : -30);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const totalProtein = avgMacros.protein + avgMacros.carbs + avgMacros.fats;
  const proteinPct = totalProtein > 0 ? Math.round((avgMacros.protein / totalProtein) * 100) : 0;
  const carbsPct = totalProtein > 0 ? Math.round((avgMacros.carbs / totalProtein) * 100) : 0;
  const fatsPct = totalProtein > 0 ? Math.round((avgMacros.fats / totalProtein) * 100) : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">Nutrition Analytics</h2>
        <div className="flex gap-2">
          <button
            onClick={() => setTimeRange("7d")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              timeRange === "7d"
                ? "bg-primary text-white"
                : "bg-gray-100 text-muted-foreground hover:bg-gray-200"
            }`}
          >
            7 Days
          </button>
          <button
            onClick={() => setTimeRange("30d")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              timeRange === "30d"
                ? "bg-primary text-white"
                : "bg-gray-100 text-muted-foreground hover:bg-gray-200"
            }`}
          >
            30 Days
          </button>
        </div>
      </div>

      {/* Calorie Balance Chart */}
      <div className="bg-card rounded-xl shadow-sm border border-border p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Calorie Balance</h3>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={filteredCalories}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis
              dataKey="date"
              tickFormatter={formatDate}
              stroke="#9ca3af"
              style={{ fontSize: "12px" }}
            />
            <YAxis stroke="#9ca3af" style={{ fontSize: "12px" }} />
            <Tooltip
              contentStyle={{
                backgroundColor: "white",
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
              }}
              labelFormatter={(label) => formatDate(label as string)}
            />
            <Legend />
            <defs>
              <linearGradient id="colorConsumed" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <Area
              type="monotone"
              dataKey="goal"
              stroke="#94a3b8"
              fill="none"
              strokeDasharray="5 5"
              name="Goal"
            />
            <Area
              type="monotone"
              dataKey="consumed"
              stroke="#3b82f6"
              fill="url(#colorConsumed)"
              name="Consumed"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Macro Distribution */}
        <div className="bg-card rounded-xl shadow-sm border border-border p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Macro Distribution</h3>
          <div className="space-y-4 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                <span className="text-sm text-muted-foreground">Protein</span>
              </div>
              <span className="text-sm font-semibold text-foreground">{proteinPct}%</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                <span className="text-sm text-muted-foreground">Carbs</span>
              </div>
              <span className="text-sm font-semibold text-foreground">{carbsPct}%</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                <span className="text-sm text-muted-foreground">Fats</span>
              </div>
              <span className="text-sm font-semibold text-foreground">{fatsPct}%</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={filteredMacros}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="date"
                tickFormatter={formatDate}
                stroke="#9ca3af"
                style={{ fontSize: "10px" }}
              />
              <YAxis stroke="#9ca3af" style={{ fontSize: "10px" }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "white",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                }}
                labelFormatter={(label) => formatDate(label as string)}
              />
              <Area
                type="monotone"
                dataKey="protein"
                stackId="1"
                stroke="#3b82f6"
                fill="#3b82f6"
                fillOpacity={0.6}
              />
              <Area
                type="monotone"
                dataKey="carbs"
                stackId="1"
                stroke="#f97316"
                fill="#f97316"
                fillOpacity={0.6}
              />
              <Area
                type="monotone"
                dataKey="fats"
                stackId="1"
                stroke="#a855f7"
                fill="#a855f7"
                fillOpacity={0.6}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Meal Consistency Heatmap */}
        <div className="bg-card rounded-xl shadow-sm border border-border p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Meal Consistency</h3>
          <p className="text-sm text-muted-foreground mb-4">Daily meal logging (last 30 days)</p>
          <div className="grid grid-cols-10 gap-1">
            {mealConsistency.slice(-30).map((day, idx) => {
              const percentage = (day.mealsLogged / day.expectedMeals) * 100;
              let bgColor = "bg-gray-100";
              if (percentage >= 80) bgColor = "bg-green-500";
              else if (percentage >= 50) bgColor = "bg-yellow-400";
              else if (percentage > 0) bgColor = "bg-orange-300";

              return (
                <div
                  key={idx}
                  className={`aspect-square rounded ${bgColor} hover:ring-2 hover:ring-primary transition-all cursor-pointer`}
                  title={`${formatDate(day.date)}: ${day.mealsLogged}/${day.expectedMeals} meals`}
                />
              );
            })}
          </div>
          <div className="flex items-center justify-between mt-4 text-xs text-gray-500">
            <span>Less</span>
            <div className="flex gap-1">
              <div className="w-4 h-4 rounded bg-gray-100"></div>
              <div className="w-4 h-4 rounded bg-orange-300"></div>
              <div className="w-4 h-4 rounded bg-yellow-400"></div>
              <div className="w-4 h-4 rounded bg-green-500"></div>
            </div>
            <span>More</span>
          </div>
        </div>
      </div>
    </div>
  );
}
