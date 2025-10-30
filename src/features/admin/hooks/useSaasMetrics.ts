import { useQuery } from '@tanstack/react-query';
import { AdminService } from '../api/adminService';

export function useSaasMetrics() {
  return useQuery({
    queryKey: ['saas-metrics'],
    queryFn: AdminService.getSaasMetrics,
    staleTime: 5 * 60 * 1000,
  });
}

export function useAllSubscribers() {
  return useQuery({
    queryKey: ['admin-subscribers'],
    queryFn: AdminService.getAllSubscribers,
    staleTime: 5 * 60 * 1000,
  });
}
