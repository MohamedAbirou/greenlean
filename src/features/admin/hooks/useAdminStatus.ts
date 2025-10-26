/**
 * Admin Status Hook
 * Checks if user has admin privileges
 */

import { useQuery } from "@tanstack/react-query";
import { AdminService } from "../api/adminService";

export function useAdminStatus(userId?: string) {
  const adminQuery = useQuery({
    queryKey: ["admin-status", userId],
    queryFn: () => AdminService.checkAdminStatus(userId!),
    enabled: !!userId,
    staleTime: 10 * 60 * 1000,
  });

  return {
    isAdmin: adminQuery.data ?? false,
    isLoading: adminQuery.isLoading,
    isError: adminQuery.isError,
  };
}
