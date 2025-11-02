import { type LucideIcon, ArrowDownRight, ArrowUpRight } from "lucide-react";

interface AnalyticsStatCardProps {
  icon: LucideIcon;
  title: string;
  value: number | string;
  change: number;
  trend?: string;
  subtitle?: string;
}

// Stat Card Component
export const AnalyticsStatCard: React.FC<AnalyticsStatCardProps> = ({
  title,
  value,
  change,
  icon: Icon,
  trend,
  subtitle,
}) => (
  <div className="bg-card rounded-xl p-6 border border-border hover:shadow-lg transition-shadow">
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
