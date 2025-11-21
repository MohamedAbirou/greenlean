/**
 * Dashboard Data Hook
 * Fetches and manages dashboard data with React Query and real-time updates
 */

import { useQuery } from "@tanstack/react-query";
import { DashboardService, type DashboardData } from "../api/dashboardService";
import { useDashboardRealtime } from "@/shared/hooks/useSupabaseRealtime";

export function useDashboardData(userId?: string) {
  // Subscribe to real-time dashboard data updates
  useDashboardRealtime(userId, !!userId);

  return useQuery<DashboardData>({
    queryKey: ["dashboard", userId],
    queryFn: () => DashboardService.getDashboardData(userId!),
    enabled: !!userId,
    staleTime: 0, // Always fresh with real-time
    refetchOnWindowFocus: false, // Rely on realtime
  });
}
