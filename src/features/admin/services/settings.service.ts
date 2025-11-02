import { supabase } from "@/lib/supabase";
import type { AppSettings, SettingsUpdate } from "../types/settings.types";

export const settingsService = {
  /**
   * Get all application settings
   */
  async getSettings(): Promise<AppSettings> {
    const { data, error } = await supabase.from("app_settings").select("*").eq("id", 1).single();

    if (error) {
      console.error("Error fetching settings:", error);
      throw new Error("Failed to fetch settings");
    }

    return data;
  },

  /**
   * Update application settings
   */
  async updateSettings(updates: SettingsUpdate): Promise<AppSettings> {
    const { data, error } = await supabase
      .from("app_settings")
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq("id", 1)
      .select()
      .single();

    if (error) {
      console.error("Error updating settings:", error);
      throw new Error("Failed to update settings");
    }

    return data;
  },

  /**
   * Toggle maintenance mode specifically
   */
  async toggleMaintenanceMode(enabled: boolean): Promise<void> {
    const { error } = await supabase
      .from("app_settings")
      .update({
        maintenance_mode: enabled,
        updated_at: new Date().toISOString(),
      })
      .eq("id", 1);

    if (error) {
      console.error("Error toggling maintenance mode:", error);
      throw new Error("Failed to toggle maintenance mode");
    }
  },

  /**
   * Trigger manual database backup (calls Supabase function)
   */
  async triggerBackup(): Promise<void> {
    const { error } = await supabase.rpc("trigger_backup");

    if (error) {
      console.error("Error triggering backup:", error);
      throw new Error("Failed to trigger backup");
    }
  },

  /**
   * Run database cleanup (calls Supabase function)
   */
  async runCleanup(): Promise<void> {
    const { error } = await supabase.rpc("run_database_cleanup");

    if (error) {
      console.error("Error running cleanup:", error);
      throw new Error("Failed to run cleanup");
    }
  },
};
