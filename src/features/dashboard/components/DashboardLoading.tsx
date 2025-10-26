/**
 * Dashboard Loading Component
 * Loading state for dashboard
 */

import { LoadingSpinner } from "../../../shared/components/feedback";

export function DashboardLoading() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <LoadingSpinner size="xl" text="Loading your dashboard..." />
    </div>
  );
}
