import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ProfileService } from "../services/profile.service";
import type { ProfileUpdateData } from "../types/profile.types";

export const useProfile = (userId: string | undefined) => {
  const queryClient = useQueryClient();

  const {
    data: profile,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["profile", userId],
    queryFn: () => ProfileService.getProfile(userId!),
    enabled: !!userId,
  });

  const updateMutation = useMutation({
    mutationFn: (updates: ProfileUpdateData) => ProfileService.updateProfile(userId!, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile", userId] });
    },
  });

  const uploadAvatarMutation = useMutation({
    mutationFn: (file: File) => ProfileService.uploadAvatar(userId!, file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile", userId] });
    },
  }); 

  const deleteAvatarMutation = useMutation({
    mutationFn: (avatarUrl: string) => ProfileService.deleteAvatar(userId!, avatarUrl),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile", userId] });
    },
  });

  const calculateAge = (dob: string | Date): number => {
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const calculateDOB = (age: number): string => {
    const today = new Date();
    const birthYear = today.getFullYear() - age;
    // Return as YYYY-MM-DD string
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    return `${birthYear}-${month}-${day}`;
  };

  return {
    profile,
    isLoading,
    error,
    updateProfile: updateMutation.mutateAsync,
    calculateAge,
    calculateDOB,
    isUpdating: updateMutation.isPending,
    uploadAvatar: uploadAvatarMutation.mutateAsync,
    isUploadingAvatar: uploadAvatarMutation.isPending,
    deleteAvatar: deleteAvatarMutation.mutateAsync,
    isDeletingAvatar: deleteAvatarMutation.isPending,
  };
};
