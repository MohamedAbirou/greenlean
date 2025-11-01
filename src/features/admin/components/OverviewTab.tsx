import {
  Activity,
  Award,
  DollarSign,
  FileText,
  Target,
  TrendingUp,
  Trophy,
  UserCheck,
  Users,
  UserX,
} from "lucide-react";
import StatCard from "./StatCard";

interface OverviewTabProps {
  data: any;
  recentActivity: any[];
  topUsers: any[];
  dateRange: string;
  onDateRangeChange: (range: "7d" | "30d" | "90d" | "1y") => void;
  isLoading: boolean;
}

export const OverviewTab: React.FC<OverviewTabProps> = ({
  data,
  recentActivity,
  topUsers,
  dateRange,
  onDateRangeChange,
  isLoading,
}) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Dashboard Overview</h2>
          <p className="text-muted-foreground mt-1">
            Real-time insights into your platform performance
          </p>
        </div>
        <select
          value={dateRange}
          onChange={(e) => onDateRangeChange(e.target.value as any)}
          className="px-4 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="7d">Last 7 days</option>
          <option value="30d">Last 30 days</option>
          <option value="90d">Last 90 days</option>
          <option value="1y">Last year</option>
        </select>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={DollarSign}
          label="Monthly Recurring Revenue"
          value={`$${data?.revenue?.monthly?.toLocaleString()}`}
          change={`${data?.revenue?.growth?.toFixed(1)}%`}
          trend={data?.revenue?.growth > 0 ? "up" : "down"}
          color="bg-green-500"
          subtext={`ARR: $${data?.revenue?.arr?.toLocaleString()}`}
        />
        <StatCard
          icon={Users}
          label="Total Users"
          value={data?.users?.total?.toLocaleString()}
          change={`+${data?.users?.newThisMonth}`}
          trend={data?.users?.newThisMonth > 0 ? "up" : "down"}
          color="bg-blue-500"
          subtext={`${data?.users?.active} active users`}
        />
        <StatCard
          icon={TrendingUp}
          label="Active Subscriptions"
          value={data?.subscriptions?.active}
          change={`${data?.subscriptions?.churnRate?.toFixed(1)}% churn`}
          trend="down"
          color="bg-purple-500"
          subtext={`${data?.subscriptions?.trial} on trial`}
        />
        <StatCard
          icon={Target}
          label="Conversion Rate"
          value={`${data?.conversionRate?.toFixed(1)}%`}
          change={`${data?.conversionRateGrowth?.toFixed(1)}%`}
          trend={data?.conversionRateGrowt > 0 ? "up" : "down"}
          color="bg-orange-500"
          subtext="Visitor → Paid"
        />
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={FileText}
          label="Plans Generated"
          value={data?.plans?.mealPlansGenerated + data?.plans?.workoutPlansGenerated}
          change={`+${data?.plans?.mealPlansGenerated + data?.plans?.workoutPlansGenerated}`}
          trend={
            data?.plans?.mealPlansGenerated + data?.plans?.workoutPlansGenerated > 0 ? "up" : "down"
          }
          color="bg-cyan-500"
          subtext={`${data?.plans?.mealPlansGenerated} meal plans, ${data?.plans?.workoutPlansGenerated} workout plans`}
        />
        <StatCard
          icon={Trophy}
          label="Active Challenges"
          value={data?.challenges?.active}
          change={`${data?.challenges?.avgCompletionRate}% completion`}
          trend={data?.challenges?.avgCompletionRate > 0 ? "up" : "down"}
          color="bg-amber-500"
          subtext={`${data?.challenges?.totalParticipants} participants`}
        />
        <StatCard
          icon={Activity}
          label="Daily Active Users"
          value={data?.engagement?.dau}
          change={`+${data?.engagement?.dauGrowth?.toFixed(1)}%`}
          trend={data?.engagement?.dauGrowth?.toFixed(1) > 0 ? "up" : "down"}
          color="bg-pink-500"
          subtext={`${data?.engagement?.avgWorkoutDuration} min avg workout, ${data?.engagement?.avgWaterIntake} ml avg water, ${data?.engagement?.avgNutritionIntake} calories avg nutrition`}
        />
        <StatCard
          icon={Award}
          label="Lifetime Value"
          value={`$${data?.subscriptions?.ltv?.toLocaleString()}`}
          change={`+${data?.subscriptions?.ltvGrowth?.toFixed(1)}%`}
          trend={data?.subscriptions?.ltvGrowth > 0 ? "up" : "down"}
          color="bg-indigo-500"
          subtext="Per user"
        />
      </div>

      {/* Recent Activity & Top Users */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="bg-card rounded-xl p-6 border border-border">
          <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
          <div className="space-y-3 max-h-[300px] overflow-y-auto">
            {recentActivity && recentActivity.length > 0 ? (
              recentActivity.map((activity, idx) => {
                const IconMap = {
                  user_signup: UserCheck,
                  plan_generated: FileText,
                  subscription_upgraded: TrendingUp,
                  challenge_completed: Trophy,
                  user_churned: UserX,
                };
                const Icon = IconMap[activity.type as keyof typeof IconMap] || Activity;

                return (
                  <div
                    key={idx}
                    className="flex items-center gap-4 py-2 border-b border-border last:border-0"
                  >
                    <div className="h-10 w-10 rounded-full bg-accent flex items-center justify-center">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{activity.user}</p>
                      <p className="text-xs text-muted-foreground">
                        {activity.type.replace(/_/g, " ")}
                        {activity.plan && ` - ${activity.plan}`}
                        {activity.challenge && ` - ${activity.challenge}`}
                      </p>
                    </div>
                    <span className="text-xs text-muted-foreground">{activity.time}</span>
                  </div>
                );
              })
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">No recent activity</p>
            )}
          </div>
        </div>

        {/* Top Users */}
        <div className="bg-card rounded-xl p-6 border border-border">
          <h3 className="text-lg font-semibold mb-4">Top Users</h3>
          <div className="space-y-3 max-h-[300px] overflow-y-auto">
            {topUsers && topUsers.length > 0 ? (
              topUsers.map((user, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between py-2 border-b border-border last:border-0"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <span className="text-lg font-bold text-muted-foreground w-6">{idx + 1}</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{user.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold">{user.points} pts</p>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full ${
                        user.status === "pro"
                          ? "bg-primary/10 text-primary"
                          : "bg-accent text-muted-foreground"
                      }`}
                    >
                      {user.status}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">No users data</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
export default OverviewTab;
