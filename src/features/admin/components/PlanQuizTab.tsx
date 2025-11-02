import { Activity, AlertCircle, CheckCircle, Clock, FileText, ShieldQuestionMark, TrendingUp } from "lucide-react";

interface PlanQuizTabProps {
  metrics: any;
  isLoading: boolean;
}

export const PlanQuizTab: React.FC<PlanQuizTabProps> = ({ metrics, isLoading }) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const plans = metrics?.plans || {};

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold">Plans & Quizzes</h2>
        <p className="text-muted-foreground mt-1">
          Monitor AI plan generation and quiz performance
        </p>
      </div>

      {/* Top Level Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <div className="bg-card rounded-xl p-6 border border-border shadow-sm">
          <div className="p-3 rounded-lg bg-yellow-500 w-fit mb-3">
            <ShieldQuestionMark className="h-5 w-5 text-white" />
          </div>
          <p className="text-sm text-muted-foreground mb-1">Total Quizzes</p>
          <p className="text-3xl font-bold">{plans.totalQuizzes || 0}</p>
        </div>
        <div className="bg-card rounded-xl p-6 border border-border shadow-sm">
          <div className="p-3 rounded-lg bg-blue-500 w-fit mb-3">
            <FileText className="h-5 w-5 text-white" />
          </div>
          <p className="text-sm text-muted-foreground mb-1">Total Plans Generated</p>
          <p className="text-3xl font-bold">{plans.totalGenerated || 0}</p>
        </div>

        <div className="bg-card rounded-xl p-6 border border-border shadow-sm">
          <div className="p-3 rounded-lg bg-green-500 w-fit mb-3">
            <CheckCircle className="h-5 w-5 text-white" />
          </div>
          <p className="text-sm text-muted-foreground mb-1">Total Completed</p>
          <p className="text-3xl font-bold">{plans.totalCompleted || 0}</p>
        </div>

        <div className="bg-card rounded-xl p-6 border border-border shadow-sm">
          <div className="p-3 rounded-lg bg-purple-500 w-fit mb-3">
            <TrendingUp className="h-5 w-5 text-white" />
          </div>
          <p className="text-sm text-muted-foreground mb-1">Overall Success Rate</p>
          <p className="text-3xl font-bold">{plans.avgCompletionRate?.toFixed(1) || 0}%</p>
        </div>

        <div className="bg-card rounded-xl p-6 border border-border shadow-sm">
          <div className="p-3 rounded-lg bg-red-500 w-fit mb-3">
            <AlertCircle className="h-5 w-5 text-white" />
          </div>
          <p className="text-sm text-muted-foreground mb-1">Total Failed</p>
          <p className="text-3xl font-bold">{plans.totalFailed || 0}</p>
        </div>
      </div>

      {/* Meal Plans vs Workout Plans Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Meal Plans Card */}
        <div className="bg-card rounded-xl p-6 border border-border shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-green-500">
              <FileText className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-semibold">Meal Plans</h3>
              <p className="text-sm text-muted-foreground">Nutrition planning performance</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 badge-gray border rounded-lg">
              <span className="text-sm font-medium">Generated</span>
              <span className="text-lg font-bold">{plans.mealPlansGenerated || 0}</span>
            </div>

            <div className="flex justify-between items-center p-3 badge-green border rounded-lg">
              <span className="text-sm font-medium text-green-800 dark:text-green-300">
                Completed
              </span>
              <span className="text-lg font-bold text-green-800 dark:text-green-300">
                {plans.mealPlansCompleted || 0}
              </span>
            </div>

            <div className="flex justify-between items-center p-3 badge-red border rounded-lg">
              <span className="text-sm font-medium text-red-800 dark:text-red-300">Failed</span>
              <span className="text-lg font-bold text-red-800 dark:text-red-300">
                {plans.mealPlansFailed || 0}
              </span>
            </div>

            <div className="pt-4 border-t border-border">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Success Rate</span>
                <span className="text-lg font-bold text-green-600 dark:text-green-400">
                  {plans.mealPlanSuccessRate || 0}%
                </span>
              </div>
              <div className="h-2.5 bg-background rounded-full">
                <div
                  className="h-full bg-green-500 rounded-full transition-all"
                  style={{ width: `${plans.mealPlanSuccessRate || 0}%` }}
                />
              </div>
            </div>

            <div className="flex items-center gap-2 p-3 badge-blue border rounded-lg">
              <Clock className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <span className="text-sm font-medium">Avg Generation Time:</span>
              <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
                {plans.avgMealPlanGenerationTime?.toFixed(1) || 0}s
              </span>
            </div>
          </div>
        </div>

        {/* Workout Plans Card */}
        <div className="bg-card rounded-xl p-6 border border-border shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-orange-500">
              <Activity className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-semibold">Workout Plans</h3>
              <p className="text-sm text-muted-foreground">Exercise planning performance</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 badge-gray border rounded-lg">
              <span className="text-sm font-medium">Generated</span>
              <span className="text-lg font-bold">{plans.workoutPlansGenerated || 0}</span>
            </div>

            <div className="flex justify-between items-center p-3 badge-green border rounded-lg">
              <span className="text-sm font-medium text-green-800 dark:text-green-300">
                Completed
              </span>
              <span className="text-lg font-bold text-green-800 dark:text-green-300">
                {plans.workoutPlansCompleted || 0}
              </span>
            </div>

            <div className="flex justify-between items-center p-3 badge-red border rounded-lg">
              <span className="text-sm font-medium text-red-800 dark:text-red-300">Failed</span>
              <span className="text-lg font-bold text-red-800 dark:text-red-300">
                {plans.workoutPlansFailed || 0}
              </span>
            </div>

            <div className="pt-4 border-t border-border">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Success Rate</span>
                <span className="text-lg font-bold text-orange-600 dark:text-orange-400">
                  {plans.workoutPlanSuccessRate || 0}%
                </span>
              </div>
              <div className="h-2.5 bg-background rounded-full">
                <div
                  className="h-full bg-orange-500 rounded-full transition-all"
                  style={{ width: `${plans.workoutPlanSuccessRate || 0}%` }}
                />
              </div>
            </div>

            <div className="flex items-center gap-2 p-3 badge-blue border rounded-lg">
              <Clock className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <span className="text-sm font-medium">Avg Generation Time:</span>
              <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
                {plans.avgWorkoutPlanGenerationTime?.toFixed(1) || 0}s
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Overview */}
      <div className="bg-card rounded-xl p-6 border border-border shadow-sm">
        <h3 className="text-xl font-semibold mb-6">Generation Performance Overview</h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-6 badge-blue border rounded-xl">
            <div className="text-4xl font-bold text-blue-600 dark:text-blue-400 mb-2">
              {((plans.totalGenerated || 0) > 0
                ? ((plans.totalCompleted || 0) / (plans.totalGenerated || 1)) * 100
                : 0
              ).toFixed(1)}
              %
            </div>
            <p className="text-sm font-medium text-foreground">Completion Rate</p>
            <p className="text-xs text-muted-foreground mt-1">
              {plans.totalCompleted || 0} of {plans.totalGenerated || 0} plans
            </p>
          </div>

          <div className="text-center p-6 badge-green border rounded-xl">
            <div className="text-4xl font-bold text-green-600 dark:text-green-400 mb-2">
              {(
                ((plans.avgMealPlanGenerationTime || 0) +
                  (plans.avgWorkoutPlanGenerationTime || 0)) /
                2
              ).toFixed(1)}
              s
            </div>
            <p className="text-sm font-medium text-foreground">Avg Generation Time</p>
            <p className="text-xs text-muted-foreground mt-1">Across all plan types</p>
          </div>

          <div className="text-center p-6 badge-purple border rounded-xl">
            <div className="text-4xl font-bold text-purple-600 dark:text-purple-400 mb-2">
              {((plans.totalFailed || 0) > 0 && (plans.totalGenerated || 0) > 0
                ? ((plans.totalFailed || 0) / (plans.totalGenerated || 1)) * 100
                : 0
              ).toFixed(1)}
              %
            </div>
            <p className="text-sm font-medium text-foreground">Failure Rate</p>
            <p className="text-xs text-muted-foreground mt-1">
              {plans.totalFailed || 0} failed generations
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
