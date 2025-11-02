/**
 * Hydration Tracking Component
 * Shows water intake trends and insights
 */

import type { HydrationTrend } from "@/features/dashboard/types/stats.types";
import { Award, Droplet, TrendingUp } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface Props {
  hydrationTrends: HydrationTrend[];
  hydrationInsights: {
    bestDay: { date: string; glasses: number };
    currentStreak: number;
    avgGlassesPerDay: number;
    lastMonthAvg: number;
  };
}

export function HydrationTracking({ hydrationTrends, hydrationInsights }: Props) {
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const getBarColor = (glasses: number, goal: number) => {
    const percentage = (glasses / goal) * 100;
    if (percentage >= 80) return "#10b981"; // green
    if (percentage >= 50) return "#fbbf24"; // yellow
    return "#d1d5db"; // gray
  };

  const changeFromLastMonth =
    hydrationInsights.lastMonthAvg > 0
      ? Math.round(
          ((hydrationInsights.avgGlassesPerDay - hydrationInsights.lastMonthAvg) /
            hydrationInsights.lastMonthAvg) *
            100
        )
      : 0;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-foreground">Hydration Tracking</h2>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart */}
        <div className="lg:col-span-2 bg-card rounded-xl shadow-sm border border-border p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Water Intake (Last 14 Days)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={hydrationTrends}>
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
                formatter={(value: number) => [`${value} glasses`, "Consumed"]}
              />
              <ReferenceLine y={8} stroke="#94a3b8" strokeDasharray="5 5" label="Goal" />
              <Bar
                dataKey="glasses"
                fill="#3b82f6"
                radius={[8, 8, 0, 0]}
                shape={(props: any) => {
                  const { x, y, width, height, payload } = props;
                  const color = getBarColor(payload.glasses, payload.goal);
                  return <rect x={x} y={y} width={width} height={height} fill={color} rx={8} />;
                }}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Insights Panel */}
        <div className="space-y-4">
          <div className="badge-blue rounded-xl shadow-sm border p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-card/80 rounded-lg">
                <Droplet className="w-5 h-5 text-blue-500" />
              </div>
              <span className="text-sm font-medium text-blue-700">Best Day</span>
            </div>
            <div className="space-y-2">
              <p className="text-2xl font-bold text-foreground">
                {hydrationInsights.bestDay.glasses} glasses
              </p>
              <p className="text-sm text-muted-foreground">{formatDate(hydrationInsights.bestDay.date)}</p>
            </div>
          </div>

          <div className="bg-card rounded-xl shadow-sm border border-border p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-orange-50 rounded-lg">
                <Award className="w-5 h-5 text-orange-500" />
              </div>
              <span className="text-sm font-medium text-foreground/80">Current Streak</span>
            </div>
            <div className="space-y-2">
              <p className="text-2xl font-bold text-foreground">
                {hydrationInsights.currentStreak} days
              </p>
              <p className="text-sm text-muted-foreground">at goal</p>
            </div>
          </div>

          <div className="bg-card rounded-xl shadow-sm border border-border p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-green-50 rounded-lg">
                <TrendingUp className="w-5 h-5 text-green-500" />
              </div>
              <span className="text-sm font-medium text-foreground/80">Monthly Average</span>
            </div>
            <div className="space-y-2">
              <p className="text-2xl font-bold text-foreground">
                {hydrationInsights.avgGlassesPerDay} glasses/day
              </p>
              <div className="flex items-center gap-2">
                {changeFromLastMonth !== 0 && (
                  <span
                    className={`text-sm font-medium ${
                      changeFromLastMonth > 0 ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {changeFromLastMonth > 0 ? "+" : ""}
                    {changeFromLastMonth}%
                  </span>
                )}
                <span className="text-sm text-gray-500">vs last month</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
