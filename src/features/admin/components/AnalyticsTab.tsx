import { ArrowDownRight } from "lucide-react";

interface AnalyticsTabProps {
  funnelData: { stage: string; count: number; percent: number }[];
  metrics: any;
  // dateRange: string;
  isLoading: boolean;
}

export const AnalyticsTab: React.FC<AnalyticsTabProps> = ({
  funnelData,
  metrics,
  // dateRange,
  isLoading,
}) => {
  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold">Advanced Analytics</h2>
        <p className="text-muted-foreground mt-1">Deep insights into your business performance</p>
      </div>

      {/* Conversion Funnel */}
      <div className="bg-card rounded-xl p-6 border border-border">
        <h3 className="text-lg font-semibold mb-6">Conversion Funnel</h3>
        <div className="space-y-4">
          {funnelData && funnelData.length > 0 ? (
            funnelData.map((stage, idx) => (
              <div key={idx}>
                <div className="flex justify-between text-sm mb-2">
                  <span className="font-medium">{stage.stage}</span>
                  <span className="text-muted-foreground">
                    {stage.count.toLocaleString()} ({stage.percent}%)
                  </span>
                </div>
                <div className="h-3 bg-accent rounded-full overflow-hidden">
                  <div
                    className={`h-full bg-primary transition-all rounded-full`}
                    style={{ width: `${stage.percent}%` }}
                  />
                </div>
                {idx < funnelData.length - 1 && (
                  <div className="flex items-center gap-2 mt-2 ml-4">
                    <ArrowDownRight className="h-4 w-4 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">
                      {Math.round((funnelData[idx + 1].count / stage.count) * 100)}% conversion
                    </span>
                  </div>
                )}
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">Loading funnel data...</p>
          )}
        </div>
      </div>

      {/* Feature Performance & Engagement */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-card rounded-xl p-6 border border-border">
          <h3 className="text-lg font-semibold mb-4">Feature Usage</h3>
          <div className="space-y-4">
            {[
              {
                feature: "Meal Plan Generator",
                usage: metrics?.plans?.mealPlansGenerated || 0,
                growth: metrics?.plans?.mealPlansGeneratedGrowth || 0,
              },
              {
                feature: "Workout Planner",
                usage: metrics?.plans?.workoutPlansGenerated || 0,
                growth: metrics?.plans?.workoutPlansGeneratedGrowth || 0,
              },
              {
                feature: "Challenges",
                usage: metrics?.challenges?.totalParticipants || 0,
                growth: metrics?.challenges?.challengesGeneratedGrowth || 0,
              },
              {
                feature: "Progress Tracking",
                usage: metrics?.engagement?.mau || 0,
                growth: metrics?.engagement?.mauGrowth || 0,
              },
            ].map((item, idx) => {
              const maxUsage = Math.max(
                ...[
                  metrics?.plans?.mealPlansGenerated || 0,
                  metrics?.plans?.workoutPlansGenerated || 0,
                  metrics?.challenges?.totalParticipants || 0,
                  metrics?.engagement?.mau || 0,
                ]
              );

              return (
                <div key={idx} className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="font-medium text-sm">{item.feature}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex-1 h-2 bg-accent rounded-full">
                        <div
                          className="h-full bg-primary rounded-full"
                          style={{ width: `${maxUsage > 0 ? (item.usage / maxUsage) * 100 : 0}%` }}
                        />
                      </div>
                      <span className="text-xs text-muted-foreground w-16">{item.usage}</span>
                    </div>
                  </div>
                  <span className="text-sm font-medium text-green-600 ml-4">+{item.growth}%</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-card rounded-xl p-6 border border-border">
          <h3 className="text-lg font-semibold mb-4">Engagement Metrics</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Daily Active Users</span>
              <span className="text-lg font-bold">{metrics?.engagement?.dau || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Weekly Active Users</span>
              <span className="text-lg font-bold">{metrics?.engagement?.wau || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Monthly Active Users</span>
              <span className="text-lg font-bold">{metrics?.engagement?.mau || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Avg Session Duration</span>
              <span className="text-lg font-bold">
                {metrics?.engagement?.avgSessionDuration || 0} min
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
