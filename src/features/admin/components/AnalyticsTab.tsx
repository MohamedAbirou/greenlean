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

interface AnalyticsTabProps {
  funnelData: { stage: string; count: number; percent: number }[];
  metrics: any;
  dateRange: string;
  onDateRangeChange: (range: "7d" | "30d" | "90d" | "1y") => void;
  isLoading: boolean;
}

export const AnalyticsTab: React.FC<AnalyticsTabProps> = ({
  funnelData,
  metrics,
  dateRange,
  onDateRangeChange,
  isLoading,
}) => {
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
    window.location.reload();
  };

  // Safely handle string to number conversions
  const safeNumber = (val: any): number => {
    if (typeof val === "string") return parseFloat(val) || 0;
    return val || 0;
  };

  if (isLoading) {
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

  // Generate revenue trend from current metrics (simplified - single data point)
  // const revenueTrendData = [
  //   {
  //     period: "Current",
  //     revenue: safeNumber(metrics?.revenue?.thisMonth),
  //     subscriptions: safeNumber(metrics?.subscriptions?.active),
  //   },
  // ];

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

  // Stat Card Component
  const StatCard = ({ title, value, change, icon: Icon, trend, subtitle }: any) => (
    <div className="bg-background rounded-xl p-6 border border-border hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <h3 className="text-2xl font-bold text-foreground mt-2">{value}</h3>
          {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
        </div>
        <div
          className={`p-3 rounded-lg ${
            trend === "up" ? "badge-green" : trend === "down" ? "badge-red" : "badge-blue"
          }`}
        >
          <Icon
            className={`h-6 w-6 ${
              trend === "up"
                ? "text-green-600 dark:text-green-400"
                : trend === "down"
                ? "text-red-600 dark:text-red-400"
                : "text-blue-600 dark:text-blue-400"
            }`}
          />
        </div>
      </div>
      {change !== undefined && change !== null && (
        <div className="mt-4 flex items-center">
          {change >= 0 ? (
            <ArrowUpRight className="h-4 w-4 text-green-600 dark:text-green-400" />
          ) : (
            <ArrowDownRight className="h-4 w-4 text-red-600 dark:text-red-400" />
          )}
          <span
            className={`text-sm font-medium ml-1 ${
              change >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
            }`}
          >
            {Math.abs(change)}%
          </span>
          <span className="text-sm text-muted-foreground ml-2">vs last period</span>
        </div>
      )}
    </div>
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

          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
            <Download className="h-4 w-4" />
            <span className="text-sm font-medium">Export</span>
          </button>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Revenue"
          value={`$${safeNumber(metrics?.revenue?.total).toLocaleString()}`}
          change={safeNumber(metrics?.revenue?.growth)}
          icon={DollarSign}
          trend={safeNumber(metrics?.revenue?.growth) >= 0 ? "up" : "down"}
          subtitle={`MRR: $${safeNumber(metrics?.revenue?.monthly).toLocaleString()}`}
        />
        <StatCard
          title="Total Users"
          value={safeNumber(metrics?.users?.total).toLocaleString()}
          change={safeNumber(metrics?.users?.growthRate)}
          icon={Users}
          trend="up"
          subtitle={`Active: ${safeNumber(metrics?.users?.active).toLocaleString()}`}
        />
        <StatCard
          title="Subscriptions"
          value={safeNumber(metrics?.subscriptions?.active).toLocaleString()}
          change={-safeNumber(metrics?.subscriptions?.churnRate)}
          icon={Activity}
          trend={safeNumber(metrics?.subscriptions?.churnRate) > 0 ? "down" : "neutral"}
          subtitle={`Total: ${safeNumber(metrics?.subscriptions?.total).toLocaleString()}`}
        />
        <StatCard
          title="Avg LTV"
          value={`$${safeNumber(metrics?.subscriptions?.ltv)}`}
          change={null}
          icon={Target}
          trend="neutral"
          subtitle={`ARR: $${safeNumber(metrics?.revenue?.arr).toLocaleString()}`}
        />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Distribution */}
        <div className="bg-background rounded-xl p-6 border border-border">
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
        <div className="bg-background rounded-xl p-6 border border-border">
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
              <div className="h-2 bg-card rounded-full">
                <div className="h-full bg-blue-500 rounded-full" style={{ width: "100%" }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-muted-foreground">Last 30 Days</span>
                <span className="text-2xl font-bold text-foreground">
                  ${safeNumber(metrics?.revenue?.last30Days).toLocaleString()}
                </span>
              </div>
              <div className="h-2 bg-card rounded-full">
                <div
                  className="h-full bg-purple-500 rounded-full"
                  style={{
                    width: `${Math.min(
                      100,
                      (safeNumber(metrics?.revenue?.last30Days) /
                        Math.max(safeNumber(metrics?.revenue?.thisMonth), 1)) *
                        100
                    )}%`,
                  }}
                ></div>
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
      <div className="bg-background rounded-xl p-6 border border-border">
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
                <div className="h-4 bg-card rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all rounded-full relative"
                    style={{ width: `${stage.percent}%` }}
                  >
                    <div className="absolute inset-0 bg-white opacity-20 animate-pulse"></div>
                  </div>
                </div>
                {idx < funnelData.length - 1 && stage.count > 0 && (
                  <div className="flex items-center gap-2 mt-2 ml-4">
                    <ArrowDownRight className="h-4 w-4 text-gray-400" />
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
        <div className="bg-background rounded-xl p-6 border border-border">
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
                    itemStyle={{ color: "#d1d5db" }} // softer gray if you want contrast
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
        <div className="bg-background rounded-xl p-6 border border-border">
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
                contentStyle={{
                  backgroundColor: "#1f2937",
                  border: "none",
                  borderRadius: "8px",
                  color: "#fff",
                }}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Quick Stats */}
        <div className="bg-background rounded-xl p-6 border border-border">
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
      <div className="bg-background rounded-xl p-6 border border-border">
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
              <div key={idx} className="p-4 rounded-lg bg-card border border-border">
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
                    <div className="h-2 bg-background rounded-full">
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
                    <div className="h-2 bg-background rounded-full">
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
