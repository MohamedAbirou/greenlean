/**
 * Workout Performance Component
 * Shows workout calendar, stats, and effort trends
 */

import type {
  WeeklyEffort,
  WorkoutCalendarDay,
  WorkoutStats,
} from "@/features/dashboard/types/stats.types";
import { Dumbbell, Flame } from "lucide-react";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface Props {
  workoutCalendar: WorkoutCalendarDay[];
  workoutStats: WorkoutStats;
  weeklyEffort: WeeklyEffort[];
}

export function WorkoutPerformance({ workoutCalendar, workoutStats, weeklyEffort }: Props) {
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const getWorkoutIcon = (type: string | null) => {
    if (!type) return null;
    const iconMap: Record<string, string> = {
      strength: "💪",
      cardio: "🏃",
      yoga: "🧘",
      flexibility: "🤸",
      hiit: "⚡",
      sports: "⚽",
    };
    return iconMap[type.toLowerCase()] || "🏋️";
  };

  const getIntensityColor = (calories: number) => {
    if (calories >= 400) return "badge-red";
    if (calories >= 300) return "badge-orange";
    if (calories >= 200) return "badge-yellow";
    if (calories > 0) return "badge-green";
    return "badge-gray";
  };

  // Group calendar into weeks
  const weeks: WorkoutCalendarDay[][] = [];
  for (let i = 0; i < workoutCalendar.length; i += 7) {
    weeks.push(workoutCalendar.slice(i, i + 7));
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-foreground">Workout Performance</h2>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Workout Calendar */}
        <div className="lg:col-span-2 bg-card rounded-xl shadow-sm border border-border p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Monthly Calendar</h3>
          <div className="space-y-2">
            <div className="grid grid-cols-7 gap-2 text-xs font-medium text-muted-foreground mb-2">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                <div key={day} className="text-center">
                  {day}
                </div>
              ))}
            </div>
            {weeks.map((week, weekIdx) => (
              <div key={weekIdx} className="grid grid-cols-7 gap-2">
                {week.map((day, dayIdx) => (
                  <div
                    key={dayIdx}
                    className={`aspect-square rounded-lg border-2 flex flex-col items-center justify-center p-1 cursor-pointer transition-all hover:scale-105 ${
                      day.workoutType ? "border-primary bg-primary/5" : "border-gray-200 bg-gray-50"
                    } ${getIntensityColor(day.caloriesBurned)}`}
                    title={
                      day.workoutType
                        ? `${formatDate(day.date)}: ${day.workoutType}\n${day.duration}min, ${
                            day.caloriesBurned
                          }cal`
                        : formatDate(day.date)
                    }
                  >
                    <span className="text-xs font-medium text-foreground/80">
                      {new Date(day.date).getDate()}
                    </span>
                    {day.workoutType && (
                      <span className="text-xs sm:text-lg">{getWorkoutIcon(day.workoutType)}</span>
                    )}
                  </div>
                ))}
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between mt-4 text-xs text-muted-foreground">
            <span>Intensity:</span>
            <div className="flex gap-2 items-center">
              <div className="flex gap-1">
                <div className="w-4 h-4 rounded border badge-green"></div>
                <span>Low</span>
              </div>
              <div className="flex gap-1">
                <div className="w-4 h-4 rounded border badge-yellow"></div>
                <span>Med</span>
              </div>
              <div className="flex gap-1">
                <div className="w-4 h-4 rounded border badge-orange"></div>
                <span>High</span>
              </div>
              <div className="flex gap-1">
                <div className="w-4 h-4 rounded border badge-red"></div>
                <span>Max</span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Panel */}
        <div className="space-y-4">
          <div className="bg-card rounded-xl shadow-sm border border-border p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-purple-50 rounded-lg">
                <Dumbbell className="w-5 h-5 text-purple-500" />
              </div>
              <span className="text-sm font-medium text-foreground/80">This Month</span>
            </div>
            <div className="space-y-3">
              <div>
                <p className="text-3xl font-bold text-foreground">{workoutStats.totalWorkouts}</p>
                <p className="text-sm text-muted-foreground">Total Workouts</p>
              </div>
              <div className="pt-3 border-t border-border">
                <p className="text-2xl font-bold text-foreground">{workoutStats.totalMinutes}</p>
                <p className="text-sm text-muted-foreground">Total Minutes</p>
              </div>
            </div>
          </div>

          <div className="badge-orange rounded-xl shadow-sm border p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-card/80 rounded-lg">
                <Flame className="w-5 h-5 text-orange-500" />
              </div>
              <span className="text-sm font-medium text-orange-700">Calories Burned</span>
            </div>
            <div className="space-y-3">
              <div>
                <p className="text-3xl font-bold text-foreground">
                  {workoutStats.totalCaloriesBurned.toLocaleString()}
                </p>
                <p className="text-sm text-muted-foreground">Total This Month</p>
              </div>
              <div className="pt-3 border-t border-orange-100">
                <p className="text-2xl font-bold text-foreground">
                  {workoutStats.avgCaloriesPerSession}
                </p>
                <p className="text-sm text-muted-foreground">Avg per Session</p>
              </div>
            </div>
          </div>

          <div className="bg-card rounded-xl shadow-sm border border-border p-6">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Most Common</span>
                <span className="text-sm font-semibold text-foreground capitalize">
                  {workoutStats.mostCommonType}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Longest Workout</span>
                <span className="text-sm font-semibold text-foreground">
                  {workoutStats.longestWorkout} min
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Weekly Effort Trend */}
      <div className="bg-card rounded-xl shadow-sm border border-border p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Effort Over Time (8 Weeks)</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={weeklyEffort}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="week" stroke="#9ca3af" style={{ fontSize: "12px" }} />
            <YAxis yAxisId="left" stroke="#9ca3af" style={{ fontSize: "12px" }} />
            <YAxis
              yAxisId="right"
              orientation="right"
              stroke="#9ca3af"
              style={{ fontSize: "12px" }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "white",
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
              }}
            />
            <Legend />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="totalMinutes"
              stroke="#3b82f6"
              strokeWidth={3}
              dot={{ fill: "#3b82f6", r: 4 }}
              name="Minutes"
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="totalCalories"
              stroke="#f97316"
              strokeWidth={3}
              dot={{ fill: "#f97316", r: 4 }}
              name="Calories"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
