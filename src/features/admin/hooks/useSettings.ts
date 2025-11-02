import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { settingsService } from "../services/settings.service";
import type { SettingsUpdate } from "../types/settings.types";

export const useSettings = () => {
  const queryClient = useQueryClient();

  const { data: settings, isLoading } = useQuery({
    queryKey: ["admin-settings"],
    queryFn: () => settingsService.getSettings(),
  });

  const updateMutation = useMutation({
    mutationFn: (updates: SettingsUpdate) => settingsService.updateSettings(updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-settings"] });
    },
  });

  const backupMutation = useMutation({
    mutationFn: () => settingsService.triggerBackup(),
  });

  const cleanupMutation = useMutation({
    mutationFn: () => settingsService.runCleanup(),
  });

  return {
    settings: settings || settingsService.getDefaultSettings(),
    isLoading,
    updateSettings: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
    triggerBackup: backupMutation.mutateAsync,
    runCleanup: cleanupMutation.mutateAsync,
  };
};
