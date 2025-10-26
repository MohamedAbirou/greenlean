/**
 * Profile Hook
 * Manages profile data with React Query
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ProfileService } from "../api/profileService";
import type { ProfileUpdate } from "../types";

export function useProfile(userId?: string) {
  const queryClient = useQueryClient();

  const profileQuery = useQuery({
    queryKey: ["profile", userId],
    queryFn: () => ProfileService.getProfile(userId!),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
  });

  const updateProfileMutation = useMutation({
    mutationFn: (updates: ProfileUpdate) =>
      ProfileService.updateProfile(userId!, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile", userId] });
    },
  });

  const uploadAvatarMutation = useMutation({
    mutationFn: async (file: File) => {
      const { publicUrl } = await ProfileService.uploadAvatar(userId!, file);
      await ProfileService.updateAvatar(userId!, publicUrl);
      return publicUrl;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile", userId] });
    },
  });

  const deleteAvatarMutation = useMutation({
    mutationFn: (avatarUrl: string) =>
      ProfileService.deleteAvatar(userId!, avatarUrl),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile", userId] });
    },
  });

  return {
    profile: profileQuery.data,
    isLoading: profileQuery.isLoading,
    isError: profileQuery.isError,
    error: profileQuery.error,
    updateProfile: updateProfileMutation.mutateAsync,
    uploadAvatar: uploadAvatarMutation.mutateAsync,
    deleteAvatar: deleteAvatarMutation.mutateAsync,
    isUpdating: updateProfileMutation.isPending,
    isUploadingAvatar: uploadAvatarMutation.isPending || deleteAvatarMutation.isPending,
  };
}
