/**
 * Stats Data Hook
 * Fetches and manages stats data with React Query
 */

import { useQuery } from "@tanstack/react-query";
import { StatsService } from "../services/statsService";
import type { StatsData } from "../types/stats.types";

export function useStatsData(userId?: string) {
  return useQuery<StatsData>({
    queryKey: ["stats", userId],
    queryFn: () => StatsService.getStatsData(userId!),
    enabled: !!userId,
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchOnWindowFocus: true,
  });
}
