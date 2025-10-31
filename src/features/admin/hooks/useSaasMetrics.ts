import { useQuery } from "@tanstack/react-query";
import { AdminService } from "../api/adminService";

interface SaasMetrics {
  mrr: number;
  totalEarnings: number;
  earningsThisMonth: number;
  earningsLast30Days: number;
  activeSubscribers: number;
  totalSubscribers: number;
  newSubsThisMonth: number;
  churnedThisMonth: number;
  subscribersByMonth: Record<string, number>;
  recentCanceled: Array<{
    customer_email: string;
    canceled_at: number;
    plan: string;
  }>;
}

interface SubscribersResponse {
  subscribers: Array<{
    customer_id: string;
    subscription_id?: string;
    email?: string;
    status?: string;
    created?: number;
    current_period_end?: number;
    canceled_at?: number;
    is_active?: boolean;
    plans?: Array<{
      price_id?: string;
      nickname?: string;
      amount?: number;
      currency?: string;
      interval?: string;
      quantity?: number;
    }>;
  }>;
}

interface StripePlan {
  price_id?: string;
  nickname?: string;
  amount?: number;
  currency?: string;
  interval?: string;
  quantity?: number;
}
/**
 * Hook to fetch SaaS metrics (MRR, revenue, subscribers, etc.)
 */
export function useSaasMetrics() {
  return useQuery<SaasMetrics>({
    queryKey: ["saas-metrics"],
    queryFn: () => AdminService.getSaasMetrics(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
  });
}

/**
 * Hook to fetch all subscribers with their subscription details
 */
export function useAllSubscribers(filters?: {
  status?: string;
  plan_id?: string;
  created_after?: number;
  created_before?: number;
}) {
  return useQuery<SubscribersResponse>({
    queryKey: ["subscribers", filters],
    queryFn: () => AdminService.getAllSubscribers(),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

/**
 * Hook to fetch filtered subscribers
 */
export function useFilteredSubscribers(
  status?: string,
  planId?: string,
  dateRange?: { start?: number; end?: number }
) {
  return useQuery<SubscribersResponse>({
    queryKey: ["subscribers", "filtered", { status, planId, dateRange }],
    queryFn: async () => {
      const allSubs = await AdminService.getAllSubscribers();

      // Apply filters client-side if needed
      let filtered = allSubs.subscribers;

      if (status) {
        filtered = filtered.filter(
          (sub: SubscribersResponse["subscribers"][0]) => sub.status === status
        );
      }

      if (planId) {
        filtered = filtered.filter((sub: SubscribersResponse["subscribers"][0]) =>
          sub.plans?.some((plan: StripePlan) => plan.price_id === planId)
        );
      }

      if (dateRange?.start) {
        filtered = filtered.filter(
          (sub: SubscribersResponse["subscribers"][0]) =>
            sub.created && sub.created >= dateRange.start!
        );
      }

      if (dateRange?.end) {
        filtered = filtered.filter(
          (sub: SubscribersResponse["subscribers"][0]) =>
            sub.created && sub.created <= dateRange.end!
        );
      }

      return { subscribers: filtered };
    },
    staleTime: 2 * 60 * 1000,
  });
}
