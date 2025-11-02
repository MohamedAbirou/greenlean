import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  DollarSign,
  Download,
  RefreshCw,
  Target,
  TrendingUp,
  Users,
} from "lucide-react";
import React, { useState } from "react";
import toast from "react-hot-toast";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { AdminService } from "../api/adminService";
import { safeNumber } from "../hooks/useAnalytics";
import { AnalyticsStatCard } from "./AnalyticsStatCard";

interface AnalyticsTabProps {
  funnelData: { stage: string; count: number; percent: number }[];
  metrics: any;
  dateRange: string;
  onDateRangeChange: (range: "7d" | "30d" | "90d" | "1y") => void;
  isLoading: boolean;
  refetchFunnel: () => void;
  refetchMetrics: () => void;
}

export const AnalyticsTab: React.FC<AnalyticsTabProps> = ({
  funnelData,
  metrics,
  dateRange,
  onDateRangeChange,
  isLoading,
  refetchFunnel,
  refetchMetrics,
}) => {
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
    refetchFunnel();
    refetchMetrics();
  };

  if (isLoading || refreshing) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Generate dynamic feature usage data from actual metrics
  const featureUsageData = [
    { name: "Meal Plans", value: safeNumber(metrics?.plans?.mealPlansGenerated), color: "#3b82f6" },
    {
      name: "Workout Plans",
      value: safeNumber(metrics?.plans?.workoutPlansGenerated),
      color: "#8b5cf6",
    },
    {
      name: "Challenges",
      value: safeNumber(metrics?.challenges?.totalParticipants),
      color: "#10b981",
    },
    { name: "Quizzes", value: safeNumber(metrics?.plans?.totalQuizzes), color: "#f59e0b" },
  ].filter((item) => item.value > 0);

  // Generate engagement radar data from actual metrics
  const maxEngagement =
    Math.max(
      safeNumber(metrics?.engagement?.dau),
      safeNumber(metrics?.engagement?.wau),
      safeNumber(metrics?.engagement?.mau)
    ) || 100;

  const engagementRadarData = [
    {
      metric: "DAU",
      value: maxEngagement > 0 ? (safeNumber(metrics?.engagement?.dau) / maxEngagement) * 100 : 0,
      fullMark: 100,
    },
    {
      metric: "WAU",
      value: maxEngagement > 0 ? (safeNumber(metrics?.engagement?.wau) / maxEngagement) * 100 : 0,
      fullMark: 100,
    },
    {
      metric: "MAU",
      value: maxEngagement > 0 ? (safeNumber(metrics?.engagement?.mau) / maxEngagement) * 100 : 0,
      fullMark: 100,
    },
    {
      metric: "Plans",
      value: safeNumber(metrics?.plans?.avgCompletionRate),
      fullMark: 100,
    },
    {
      metric: "Challenges",
      value: safeNumber(metrics?.challenges?.avgCompletionRate),
      fullMark: 100,
    },
  ];

  // Generate user stats from actual data
  const userStatsData = [
    {
      category: "Total Users",
      count: safeNumber(metrics?.users?.total),
      color: "#3b82f6",
    },
    {
      category: "Active Users",
      count: safeNumber(metrics?.users?.active),
      color: "#10b981",
    },
    {
      category: "New This Month",
      count: safeNumber(metrics?.users?.newThisMonth),
      color: "#8b5cf6",
    },
    {
      category: "Churned",
      count: safeNumber(metrics?.users?.churnedThisMonth),
      color: "#ef4444",
    },
  ];

  const handleExportCSV = async () => {
    try {
      const csv = await AdminService.exportToCSV("analytics");
      console.log(csv);
      const blob = new Blob([csv], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `analytics-export-${new Date().toISOString().split("T")[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      toast.success("Analytics exported successfully");
    } catch (error) {
      toast.error("Failed to export analytics");
    }
  };

  const maxRevenue = Math.max(
    safeNumber(metrics?.revenue?.thisMonth),
    safeNumber(metrics?.revenue?.last30Days),
    1
  );
  
  

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-foreground">Advanced Analytics</h2>
          <p className="text-muted-foreground mt-1">
            Comprehensive insights into your business performance
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleRefresh}
            className="px-4 py-2 bg-background border border-border transition-colors flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
            <span className="text-sm font-medium">Refresh</span>
          </button>

          <select
            value={dateRange}
            onChange={(e) => onDateRangeChange(e.target.value as any)}
            className="px-4 py-2 bg-background border border-border rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
          </select>

          <button
            onClick={handleExportCSV}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            <span className="text-sm font-medium">Export</span>
          </button>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <AnalyticsStatCard
          title="Total Revenue"
          value={`$${safeNumber(metrics?.revenue?.total).toLocaleString()}`}
          change={safeNumber(metrics?.revenue?.growth)}
          icon={DollarSign}
          trend={safeNumber(metrics?.revenue?.growth) >= 0 ? "up" : "down"}
          subtitle={`MRR: $${safeNumber(metrics?.revenue?.monthly).toLocaleString()}`}
        />
        <AnalyticsStatCard
          title="Total Users"
          value={safeNumber(metrics?.users?.total).toLocaleString()}
          change={safeNumber(metrics?.users?.growthRate)}
          icon={Users}
          trend="up"
          subtitle={`Active: ${safeNumber(metrics?.users?.active).toLocaleString()}`}
        />
        <AnalyticsStatCard
          title="Subscriptions"
          value={safeNumber(metrics?.subscriptions?.active).toLocaleString()}
          change={-safeNumber(metrics?.subscriptions?.churnRate)}
          icon={Activity}
          trend={safeNumber(metrics?.subscriptions?.churnRate) > 0 ? "down" : "neutral"}
          subtitle={`Total: ${safeNumber(metrics?.subscriptions?.total).toLocaleString()}`}
        />
        <AnalyticsStatCard
          title="Avg LTV"
          value={`$${safeNumber(metrics?.subscriptions?.ltv)}`}
          change={null!}
          icon={Target}
          trend="neutral"
          subtitle={`ARR: $${safeNumber(metrics?.revenue?.arr).toLocaleString()}`}
        />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Distribution */}
        <div className="bg-card rounded-xl p-6 border border-border">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-foreground">User Distribution</h3>
            <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
              <TrendingUp className="h-4 w-4" />
              <span className="text-sm font-medium">
                +{safeNumber(metrics?.users?.growthRate)}%
              </span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={userStatsData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
              <XAxis dataKey="category" stroke="#9ca3af" tick={{ fontSize: 12 }} />
              <YAxis stroke="#9ca3af" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1f2937",
                  border: "none",
                  borderRadius: "8px",
                  color: "#fff",
                }}
                labelStyle={{ color: "#fff" }}
                itemStyle={{ color: "#d1d5db" }}
              />
              <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                {userStatsData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Revenue Overview */}
        <div className="bg-card rounded-xl p-6 border border-border">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-foreground">Revenue Overview</h3>
            <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
              <TrendingUp className="h-4 w-4" />
              <span className="text-sm font-medium">+{safeNumber(metrics?.revenue?.growth)}%</span>
            </div>
          </div>
          <div className="space-y-6">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-muted-foreground">This Month</span>
                <span className="text-2xl font-bold text-foreground">
                  ${safeNumber(metrics?.revenue?.thisMonth).toLocaleString()}
                </span>
              </div>
              <div className="h-2 bg-background rounded-full overflow-hidden">
                <div
                  className="h-full bg-progress-green-emerald transition-all rounded-full relative"
                  style={{ width: `${safeNumber(metrics?.revenue?.thisMonth)}%` }}
                >
                  <div className="absolute inset-0 bg-gray-200 rounded-full opacity-20 animate-pulse"></div>
                </div>
              </div>
            </div>
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-muted-foreground">Last 30 Days</span>
                <span className="text-2xl font-bold text-foreground">
                  ${safeNumber(metrics?.revenue?.last30Days).toLocaleString()}
                </span>
              </div>
              <div className="h-2 bg-background rounded-full">
                <div
                  className="h-full bg-progress-purple-pink transition-all rounded-full relative"
                  style={{ width: `${(safeNumber(metrics?.revenue?.thisMonth) / maxRevenue) * 100}%` }}
                >
                  <div className="absolute inset-0 bg-gray-200 rounded-full opacity-20 animate-pulse"></div>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
              <div>
                <p className="text-xs text-muted-foreground">MRR</p>
                <p className="text-lg font-bold text-foreground">
                  ${safeNumber(metrics?.revenue?.monthly).toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">ARR</p>
                <p className="text-lg font-bold text-foreground">
                  ${safeNumber(metrics?.revenue?.arr).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Conversion Funnel */}
      <div className="bg-card rounded-xl p-6 border border-border">
        <h3 className="text-lg font-semibold text-foreground mb-6">Conversion Funnel</h3>
        <div className="space-y-4">
          {funnelData && funnelData.length > 0 ? (
            funnelData.map((stage, idx) => (
              <div key={idx}>
                <div className="flex justify-between text-sm mb-2">
                  <span className="font-medium text-foreground">{stage.stage}</span>
                  <span className="text-muted-foreground">
                    {stage.count.toLocaleString()} ({stage.percent}%)
                  </span>
                </div>
                <div className="h-2 bg-background rounded-full overflow-hidden">
                  <div
                    className="h-full bg-progress-green-emerald transition-all rounded-full relative"
                    style={{ width: `${stage.percent}%` }}
                  >
                    <div className="absolute inset-0 bg-gray-200 rounded-full opacity-20 animate-pulse"></div>
                  </div>
                </div>
                {idx < funnelData.length - 1 && stage.count > 0 && (
                  <div className="flex items-center gap-2 mt-2 ml-4">
                    {safeNumber(metrics?.revenue?.growth) >= 0 ? (
                      <ArrowDownRight className="h-4 w-4 text-green-500" />
                    ) : (
                      <ArrowUpRight className="h-4 w-4 text-red-500" />
                    )}
                    <span className="text-xs text-muted-foreground">
                      {Math.round((funnelData[idx + 1].count / stage.count) * 100)}% conversion rate
                    </span>
                  </div>
                )}
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">
              No funnel data available
            </p>
          )}
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Feature Usage Pie */}
        <div className="bg-card rounded-xl p-6 border border-border">
          <h3 className="text-lg font-semibold text-foreground mb-6">Feature Distribution</h3>
          {featureUsageData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={featureUsageData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {featureUsageData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1f2937",
                      border: "none",
                      borderRadius: "8px",
                      color: "#fff",
                    }}
                    labelStyle={{ color: "#fff" }}
                    itemStyle={{ color: "#d1d5db" }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="grid grid-cols-2 gap-2 mt-4">
                {featureUsageData.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: item.color }}
                    ></div>
                    <span className="text-xs text-muted-foreground">{item.name}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="h-[250px] flex items-center justify-center text-muted-foreground">
              <p className="text-sm">No feature usage data yet</p>
            </div>
          )}
        </div>

        {/* Engagement Radar */}
        <div className="bg-card rounded-xl p-6 border border-border">
          <h3 className="text-lg font-semibold text-foreground mb-6">Engagement Score</h3>
          <ResponsiveContainer width="100%" height={250}>
            <RadarChart data={engagementRadarData}>
              <PolarGrid stroke="#374151" />
              <PolarAngleAxis dataKey="metric" tick={{ fill: "#9ca3af", fontSize: 12 }} />
              <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fill: "#9ca3af" }} />
              <Radar
                name="Score"
                dataKey="value"
                stroke="#3b82f6"
                fill="#3b82f6"
                fillOpacity={0.5}
                strokeWidth={2}
              />
              <Tooltip
                labelStyle={{ color: "#fff" }}
                contentStyle={{
                  backgroundColor: "#1f2937",
                  border: "none",
                  borderRadius: "8px",
                  color: "#FFFFFF",
                }}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Quick Stats */}
        <div className="bg-card rounded-xl p-6 border border-border">
          <h3 className="text-lg font-semibold text-foreground mb-6">Quick Stats</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Avg Session Time</span>
              <span className="text-lg font-bold text-foreground">
                {safeNumber(metrics?.engagement?.avgWorkoutDuration)} min
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Plan Completion</span>
              <span className="text-lg font-bold text-foreground">
                {safeNumber(metrics?.plans?.avgCompletionRate)}%
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Challenge Completion</span>
              <span className="text-lg font-bold text-foreground">
                {safeNumber(metrics?.challenges?.avgCompletionRate)}%
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Points Awarded</span>
              <span className="text-lg font-bold text-foreground">
                {safeNumber(metrics?.challenges?.totalPointsAwarded).toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Active Challenges</span>
              <span className="text-lg font-bold text-foreground">
                {safeNumber(metrics?.challenges?.active)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Feature Performance Details */}
      <div className="bg-card rounded-xl p-6 border border-border">
        <h3 className="text-lg font-semibold text-foreground mb-6">Feature Performance</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              name: "Meal Plans",
              generated: safeNumber(metrics?.plans?.mealPlansGenerated),
              completed: safeNumber(metrics?.plans?.mealPlansCompleted),
              color: "blue",
            },
            {
              name: "Workout Plans",
              generated: safeNumber(metrics?.plans?.workoutPlansGenerated),
              completed: safeNumber(metrics?.plans?.workoutPlansCompleted),
              color: "purple",
            },
            {
              name: "Quizzes Taken",
              generated: safeNumber(metrics?.plans?.totalQuizzes),
              completed: Math.floor(safeNumber(metrics?.plans?.totalQuizzes) * 0.85),
              color: "green",
            },
            {
              name: "Challenge Participants",
              generated: safeNumber(metrics?.challenges?.totalParticipants),
              completed: safeNumber(metrics?.challenges?.completedChallenges),
              color: "orange",
            },
          ].map((feature, idx) => {
            const completionRate =
              feature.generated > 0
                ? ((feature.completed / feature.generated) * 100).toFixed(0)
                : 0;

            return (
              <div key={idx} className="bg-background p-4 rounded-lg border border-border">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-foreground text-sm">{feature.name}</h4>
                  <span className="text-xs font-medium px-2 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                    {completionRate}%
                  </span>
                </div>
                <div className="space-y-2">
                  <div>
                    <div className="flex justify-between text-xs text-muted-foreground mb-1">
                      <span>Generated</span>
                      <span>{feature.generated.toLocaleString()}</span>
                    </div>
                    <div className="h-2 bg-card rounded-full">
                      <div
                        className="h-full bg-blue-500 rounded-full"
                        style={{ width: "100%" }}
                      ></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs text-muted-foreground mb-1">
                      <span>Completed</span>
                      <span>{feature.completed.toLocaleString()}</span>
                    </div>
                    <div className="h-2 bg-card rounded-full">
                      <div
                        className="h-full bg-green-500 rounded-full"
                        style={{ width: `${completionRate}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default AnalyticsTab;
