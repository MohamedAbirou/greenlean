import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { settingsService } from "../services/settings.service";
import type { AppSettings, SettingsUpdate } from "../types/settings.types";

export const useSettings = () => {
  const queryClient = useQueryClient();

  const { data: settings, isLoading, error } = useQuery({
    queryKey: ["app-settings"],
    queryFn: () => settingsService.getSettings(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: true,
  });

  const updateMutation = useMutation({
    mutationFn: (updates: SettingsUpdate) =>
      settingsService.updateSettings(updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["app-settings"] });
    },
  });

  const toggleMaintenanceMutation = useMutation({
    mutationFn: (enabled: boolean) =>
      settingsService.toggleMaintenanceMode(enabled),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["app-settings"] });
    },
  });

  const backupMutation = useMutation({
    mutationFn: () => settingsService.triggerBackup(),
  });

  const cleanupMutation = useMutation({
    mutationFn: () => settingsService.runCleanup(),
  });

  return {
    settings: settings as AppSettings,
    isLoading,
    error,
    updateSettings: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
    toggleMaintenanceMode: toggleMaintenanceMutation.mutateAsync,
    triggerBackup: backupMutation.mutateAsync,
    runCleanup: cleanupMutation.mutateAsync,
  };
}