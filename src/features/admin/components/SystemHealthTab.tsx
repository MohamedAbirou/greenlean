import { Activity, AlertCircle, CheckCircle } from "lucide-react";
import { formatBytes } from "../hooks/useAnalytics";
import ServiceStatus from "./ServiceStatus";

interface SystemHealthTabProps {
  health: any;
  isLoading: boolean;
}

export const SystemHealthTab: React.FC<SystemHealthTabProps> = ({ health, isLoading }) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!health) return <div>No system health data available...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold">System Health</h2>
        <p className="text-muted-foreground mt-1">Monitor system performance and infrastructure</p>
      </div>

      {/* Health Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-card rounded-xl p-6 border border-border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">API Uptime</h3>
            <CheckCircle className="h-5 w-5 text-green-500" />
          </div>
          <p className="text-3xl font-bold mb-1">{health.apiUptime}%</p>
          <p className="text-sm text-muted-foreground">Last 30 days</p>
        </div>

        <div className="bg-card rounded-xl p-6 border border-border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Avg Response Time</h3>
            <Activity className="h-5 w-5 text-blue-500" />
          </div>
          <p className="text-3xl font-bold mb-1">{health.avgResponseTime}ms</p>
          <p className="text-sm text-green-600">-12ms vs last week</p>
        </div>

        <div className="bg-card rounded-xl p-6 border border-border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Error Rate</h3>
            <AlertCircle className="h-5 w-5 text-orange-500" />
          </div>
          <p className="text-3xl font-bold mb-1">{health.errorRate}%</p>
          <p className="text-sm text-green-600">Within normal range</p>
        </div>
      </div>

      {/* Infrastructure */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card rounded-xl p-6 border border-border">
          <h3 className="text-lg font-semibold mb-4">Database</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Database Size</span>
              <span className="font-medium">{formatBytes(health.dbSize)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Active Connections</span>
              <span className="font-medium">{health.activeConnections}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Storage Used</span>
              <span className="font-medium">{health.storageUsed}%</span>
            </div>
            <div>
              <div className="h-2 bg-accent rounded-full">
                <div
                  className="h-full bg-primary rounded-full transition-all"
                  style={{ width: `${health.storageUsed}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        <ServiceStatus />
      </div>
    </div>
  );
};
