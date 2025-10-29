import type { Challenge } from "@/shared/types/challenge";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as api from "../api/challengesApi";

export function useUserRewards(userId?: string | null) {
  return useQuery({
    queryKey: ["userRewards", userId],
    queryFn: () => (userId ? api.fetchUserRewards(userId) : Promise.resolve(undefined)),
    enabled: !!userId,
  });
}

export function useChallengesQuery(userId?: string | null) {
  return useQuery({
    queryKey: ["challenges", userId],
    queryFn: () => api.fetchChallenges(userId || undefined),
    staleTime: 5 * 60 * 1000,
  });
}

export function useJoinChallenge(userId: string | null | undefined, onSuccess?: () => void) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (challenge: Challenge) => api.joinChallenge({ userId: userId!, challenge }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["challenges"] });
      await queryClient.invalidateQueries({ queryKey: ["userRewards"] });
      onSuccess && onSuccess();
    },
  });
}

export function useQuitChallenge(userId: string | null | undefined, onSuccess?: () => void) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (challengeId: string) => api.quitChallenge({ userId: userId!, challengeId }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["challenges"] });
      await queryClient.invalidateQueries({ queryKey: ["userRewards"] });
      onSuccess && onSuccess();
    },
  });
}

export function useUpdateChallengeProgress(userId: string | null | undefined, onSuccess?: (opts: { isCompleting: boolean }) => void) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ challenge, newProgress }: { challenge: Challenge; newProgress: number }) =>
      api.updateProgress({ userId: userId!, challenge, newProgress }),
    onSuccess: async (data) => {
      await queryClient.invalidateQueries({ queryKey: ["challenges"] });
      await queryClient.invalidateQueries({ queryKey: ["userRewards"] });
      onSuccess && onSuccess(data);
    },
  });
}
