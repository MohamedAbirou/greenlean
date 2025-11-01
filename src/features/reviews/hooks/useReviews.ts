import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchAllReviewsWithProfiles, fetchMyReview, submitReview } from "../api/reviewApi";
import type { UserReview } from "../types/review.types";

export function useReviews() {
  return useQuery({
    queryKey: ["reviews", "all"],
    queryFn: () => fetchAllReviewsWithProfiles(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 60 * 1000, // Refresh every minute
  });
}

export function useMyReview(userId?: string) {
  return useQuery({
    queryKey: ["reviews", "mine", userId],
    queryFn: () => fetchMyReview(userId!),
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 60 * 1000, // Refresh every minute
  });
}

export function useSubmitReview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (params: Omit<UserReview, "id" | "created_at">) => submitReview(params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reviews", "all"] });
      queryClient.invalidateQueries({ queryKey: ["reviews", "mine"] });
    },
  });
}
