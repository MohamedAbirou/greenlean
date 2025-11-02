import { supabase } from "@/lib/supabase";
import type { AppSettings, SettingsUpdate } from "../types/settings.types";

export const settingsService = {
  /**
   * Get all application settings
   */
  async getSettings(): Promise<AppSettings> {
    const { data, error } = await supabase.from("app_settings").select("*").single();

    if (error) {
      // If no settings exist, return defaults
      if (error.code === "PGRST116") {
        return this.getDefaultSettings();
      }
      throw error;
    }

    return data;
  },

  /**
   * Update application settings
   */
  async updateSettings(updates: SettingsUpdate): Promise<AppSettings> {
    const { data, error } = await supabase
      .from("app_settings")
      .upsert({
        id: 1, // Single row for settings
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Get default settings (fallback)
   */
  getDefaultSettings(): AppSettings {
    return {
      site_name: "GreenLean",
      site_description: "Your Health & Fitness Companion",
      maintenance_mode: false,
      max_free_ai_generations: 2,

      email_notifications_enabled: true,
      admin_email: "admin@greenlean.com",
      smtp_host: "smtp.gmail.com",
      smtp_port: "587",
      smtp_username: "",
      smtp_password: "",

      session_timeout_minutes: 60,
      max_login_attempts: 5,
      password_min_length: 8,
      require_email_verification: true,
      two_factor_auth_enabled: false,

      ai_service_url: "http://localhost:8000",
      ai_timeout_seconds: 30,
      ai_rate_limit_per_user: 10,
      ai_generation_retry_attempts: 3,

      streak_warning_hours: 20,
      challenge_reminder_enabled: true,
      weekly_summary_enabled: true,
      plan_expiry_warning_days: 7,

      auto_backup_enabled: true,
      backup_frequency_hours: 24,
      data_retention_days: 365,

      analytics_enabled: true,
      anonymous_tracking: true,

      stripe_webhook_secret: "",
      allow_plan_downgrades: true,
      trial_period_days: 7,
    };
  },

  /**
   * Trigger manual database backup
   */
  async triggerBackup(): Promise<void> {
    const { error } = await supabase.rpc("trigger_backup");
    if (error) throw error;
  },

  /**
   * Run database cleanup
   */
  async runCleanup(): Promise<void> {
    const { error } = await supabase.rpc("run_database_cleanup");
    if (error) throw error;
  },

  /**
   * Test email configuration
   */
  async testEmailConfig(email: string): Promise<boolean> {
    try {
      const { error } = await supabase.functions.invoke("test-email", {
        body: { email },
      });
      return !error;
    } catch {
      return false;
    }
  },
};
