import { Activity, CheckCircle, FileText } from "lucide-react";

interface PlanQuizTabTabProps {
  metrics: any;
}

export const PlanQuizTab: React.FC<PlanQuizTabTabProps> = ({ metrics }) => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold">Plans & Quizzes</h2>
        <p className="text-muted-foreground mt-1">
          Monitor AI plan generation and quiz performance
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          {
            label: "Total Plans Generated",
            value: (
              (metrics?.plans?.mealPlansGenerated || 0) +
              (metrics?.plans?.workoutPlansGenerated || 0)
            ).toString(),
            icon: FileText,
            color: "bg-cyan-500",
          },
          {
            label: "Meal Plans",
            value: (metrics?.plans?.mealPlansGenerated || 0).toString(),
            icon: FileText,
            color: "bg-green-500",
          },
          {
            label: "Workout Plans",
            value: (metrics?.plans?.workoutPlansGenerated || 0).toString(),
            icon: Activity,
            color: "bg-orange-500",
          },
          {
            label: "Quizzes Completed",
            value: (metrics?.plans?.totalQuizzes || 0).toString(),
            icon: CheckCircle,
            color: "bg-purple-500",
          },
        ].map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div key={idx} className="bg-card rounded-xl p-6 border border-border">
              <div className={`p-3 rounded-lg ${stat.color} w-fit mb-3`}>
                <Icon className="h-5 w-5 text-white" />
              </div>
              <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
              <p className="text-2xl font-bold">{stat.value}</p>
            </div>
          );
        })}
      </div>

      {/* Completion Rate & Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card rounded-xl p-6 border border-border">
          <h3 className="text-lg font-semibold mb-4">Generation Performance</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="font-medium">Completion Rate</span>
                <span className="text-muted-foreground">
                  {metrics?.plans?.avgCompletionRate?.toFixed(1) || 0}%
                </span>
              </div>
              <div className="h-2 bg-accent rounded-full">
                <div
                  className="h-full bg-primary rounded-full transition-all"
                  style={{ width: `${metrics?.plans?.avgCompletionRate || 0}%` }}
                />
              </div>
            </div>

            <div className="pt-4 border-t border-border">
              <div className="flex justify-between items-center py-2">
                <span className="text-sm text-muted-foreground">Meal Plans Completed</span>
                <span className="font-bold">{metrics?.plans?.mealPlansCompleted || 0}</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-sm text-muted-foreground">Workout Plans Completed</span>
                <span className="font-bold">{metrics?.plans?.workoutPlansCompleted || 0}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-xl p-6 border border-border">
          <h3 className="text-lg font-semibold mb-4">Quick Stats</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-accent rounded-lg">
              <span className="font-medium">Avg Generation Time</span>
              <span className="px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                18.5s
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-accent rounded-lg">
              <span className="font-medium">Success Rate</span>
              <span className="px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                98.5%
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-accent rounded-lg">
              <span className="font-medium">Failed Generations</span>
              <span className="px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                67
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
