/**
 * Plan Adherence Component
 * Shows diet and workout plan adherence scores
 */

import type { AdherenceScore } from "@/features/dashboard/types/stats.types";
import { CheckCircle, Target } from "lucide-react";

interface Props {
  dietAdherence: AdherenceScore;
  workoutAdherence: AdherenceScore;
}

export function PlanAdherence({ dietAdherence, workoutAdherence }: Props) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return { bg: "bg-green-500", text: "text-green-600" };
    if (score >= 60) return { bg: "bg-yellow-500", text: "text-yellow-600" };
    return { bg: "bg-red-500", text: "text-red-600" };
  };

  const getScoreLabel = (score: number) => {
    if (score >= 90) return "Excellent";
    if (score >= 80) return "Great";
    if (score >= 70) return "Good";
    if (score >= 60) return "Fair";
    return "Needs Work";
  };

  const dietColor = getScoreColor(dietAdherence.overall);
  const workoutColor = getScoreColor(workoutAdherence.overall);

  const weekLabels = ["Week 1", "Week 2", "Week 3", "Week 4"];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-foreground">AI Plan Adherence</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Diet Adherence */}
        <div className="bg-card rounded-xl shadow-sm border border-border p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-foreground">Diet Plan</h3>
            <div className="p-2 bg-stat-blue rounded-lg">
              <Target className="w-5 h-5 text-blue-500" />
            </div>
          </div>

          {/* Circular Progress */}
          <div className="flex flex-col items-center mb-6">
            <div className="relative w-40 h-40">
              <svg className="transform -rotate-90 w-40 h-40">
                <circle cx="80" cy="80" r="70" stroke="#e5e7eb" strokeWidth="12" fill="none" />
                <circle
                  cx="80"
                  cy="80"
                  r="70"
                  stroke={dietColor.bg.replace("bg-", "#")}
                  strokeWidth="12"
                  fill="none"
                  strokeDasharray={`${2 * Math.PI * 70}`}
                  strokeDashoffset={`${2 * Math.PI * 70 * (1 - dietAdherence.overall / 100)}`}
                  strokeLinecap="round"
                  className={dietColor.bg}
                  style={{
                    stroke:
                      dietColor.bg === "bg-green-500"
                        ? "#10b981"
                        : dietColor.bg === "bg-yellow-500"
                        ? "#eab308"
                        : "#ef4444",
                  }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-4xl font-bold text-foreground">{dietAdherence.overall}%</span>
                <span className={`text-sm font-medium ${dietColor.text}`}>
                  {getScoreLabel(dietAdherence.overall)}
                </span>
              </div>
            </div>
          </div>

          {/* Weekly Breakdown */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-muted-foreground">Weekly Trend</h4>
            {dietAdherence.weeklyTrend.map((score, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <span className="text-sm text-muted-foreground w-16">{weekLabels[idx]}</span>
                <div className="flex-1 bg-gray-100 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all ${getScoreColor(score).bg}`}
                    style={{ width: `${score}%` }}
                  />
                </div>
                <span className="text-sm font-medium text-foreground w-10 text-right">
                  {score}%
                </span>
              </div>
            ))}
          </div>

          {/* Daily Dots (Last 7 days) */}
          <div className="mt-6">
            <h4 className="text-sm font-medium text-muted-foreground mb-3">Last 7 Days</h4>
            <div className="flex gap-2">
              {dietAdherence.dailyScores.slice(-7).map((day, idx) => {
                const color = getScoreColor(day.score);
                return (
                  <div
                    key={idx}
                    className="flex-1 aspect-square rounded-lg flex items-center justify-center"
                    style={{
                      backgroundColor:
                        color.bg === "bg-green-500"
                          ? "#d1fae5"
                          : color.bg === "bg-yellow-500"
                          ? "#fef3c7"
                          : "#fee2e2",
                    }}
                    title={`${new Date(day.date).toLocaleDateString()}: ${day.score}%`}
                  >
                    {day.score >= 80 && <CheckCircle className="w-5 h-5 text-green-600" />}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Workout Adherence */}
        <div className="bg-card rounded-xl shadow-sm border border-border p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-foreground">Workout Plan</h3>
            <div className="p-2 bg-stat-purple rounded-lg">
              <Target className="w-5 h-5 text-purple-500" />
            </div>
          </div>

          {/* Circular Progress */}
          <div className="flex flex-col items-center mb-6">
            <div className="relative w-40 h-40">
              <svg className="transform -rotate-90 w-40 h-40">
                <circle cx="80" cy="80" r="70" stroke="#e5e7eb" strokeWidth="12" fill="none" />
                <circle
                  cx="80"
                  cy="80"
                  r="70"
                  strokeWidth="12"
                  fill="none"
                  strokeDasharray={`${2 * Math.PI * 70}`}
                  strokeDashoffset={`${2 * Math.PI * 70 * (1 - workoutAdherence.overall / 100)}`}
                  strokeLinecap="round"
                  style={{
                    stroke:
                      workoutColor.bg === "bg-green-500"
                        ? "#10b981"
                        : workoutColor.bg === "bg-yellow-500"
                        ? "#eab308"
                        : "#ef4444",
                  }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-4xl font-bold text-foreground">
                  {workoutAdherence.overall}%
                </span>
                <span className={`text-sm font-medium ${workoutColor.text}`}>
                  {getScoreLabel(workoutAdherence.overall)}
                </span>
              </div>
            </div>
          </div>

          {/* Weekly Breakdown */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-muted-foreground">Weekly Trend</h4>
            {workoutAdherence.weeklyTrend.map((score, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <span className="text-sm text-muted-foreground w-16">{weekLabels[idx]}</span>
                <div className="flex-1 bg-gray-100 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all ${getScoreColor(score).bg}`}
                    style={{ width: `${score}%` }}
                  />
                </div>
                <span className="text-sm font-medium text-foreground w-10 text-right">
                  {score}%
                </span>
              </div>
            ))}
          </div>

          {/* Daily Dots (Last 7 days) */}
          <div className="mt-6">
            <h4 className="text-sm font-medium text-muted-foreground mb-3">Last 7 Days</h4>
            <div className="flex gap-2">
              {workoutAdherence.dailyScores.slice(-7).map((day, idx) => (
                <div
                  key={idx}
                  className="flex-1 aspect-square rounded-lg flex items-center justify-center"
                  style={{
                    backgroundColor:
                      day.score >= 80 ? "#d1fae5" : day.score >= 50 ? "#fef3c7" : "#fee2e2",
                  }}
                  title={`${new Date(day.date).toLocaleDateString()}: ${
                    day.score > 0 ? "Completed" : "Missed"
                  }`}
                >
                  {day.score >= 80 && <CheckCircle className="w-5 h-5 text-green-600" />}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
