import { useQuery } from "@tanstack/react-query";
import { AnalyticsService } from "../api/analyticsService";

export function useDashboardMetrics(dateRange: "7d" | "30d" | "90d" | "1y" = "30d") {
  return useQuery({
    queryKey: ["dashboard-metrics", dateRange],
    queryFn: () => AnalyticsService.getDashboardMetrics(dateRange),
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 60 * 1000, // Refresh every minute
  });
}

export function useConversionFunnel(dateRange: string) {
  return useQuery({
    queryKey: ["conversion-funnel", dateRange],
    queryFn: () => AnalyticsService.getConversionFunnel(dateRange),
    staleTime: 10 * 60 * 1000,
  });
}

export function useRecentActivity(limit = 10) {
  return useQuery({
    queryKey: ["recent-activity", limit],
    queryFn: () => AnalyticsService.getRecentActivity(limit),
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 30 * 1000,
  });
}

export function useTopUsers(limit = 10) {
  return useQuery({
    queryKey: ["top-users", limit],
    queryFn: () => AnalyticsService.getTopUsers(limit),
    staleTime: 5 * 60 * 1000,
  });
}

export function useSystemHealth() {
  return useQuery({
    queryKey: ["system-health"],
    queryFn: () => AnalyticsService.getSystemHealth(),
    staleTime: 60 * 1000,
    refetchInterval: 60 * 1000,
  });
}
