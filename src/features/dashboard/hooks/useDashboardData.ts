/**
 * Dashboard Data Hook
 * Fetches and manages dashboard data with React Query
 */

import { useQuery } from "@tanstack/react-query";
import { DashboardService, type DashboardData } from "../api/dashboardService";

export function useDashboardData(userId?: string) {
  return useQuery<DashboardData>({
    queryKey: ["dashboard", userId],
    queryFn: () => DashboardService.getDashboardData(userId!),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
  });
}
