export interface AppSettings {
  id: number;
  // General Settings
  site_name: string;
  site_description: string | null;
  maintenance_mode: boolean;
  max_free_ai_generations: number;

  // Email Settings (Info only - handled by Supabase)
  email_notifications_enabled: boolean;
  admin_email: string | null;
  smtp_host: string | null;
  smtp_port: string | null;
  smtp_username: string | null;
  smtp_password: string | null;

  // Security Settings
  session_timeout_minutes: number;
  max_login_attempts: number;
  password_min_length: number;
  require_email_verification: boolean;
  two_factor_auth_enabled: boolean;

  // AI Service Settings
  ai_service_url: string;
  ai_timeout_seconds: number;
  ai_rate_limit_per_user: number;
  ai_generation_retry_attempts: number;

  // Notification Settings
  streak_warning_hours: number;
  challenge_reminder_enabled: boolean;
  weekly_summary_enabled: boolean;
  plan_expiry_warning_days: number;

  // Database Settings
  auto_backup_enabled: boolean;
  backup_frequency_hours: number;
  data_retention_days: number;

  // Analytics Settings
  analytics_enabled: boolean;
  anonymous_tracking: boolean;

  // Payment Settings
  stripe_webhook_secret: string | null;
  allow_plan_downgrades: boolean;
  trial_period_days: number;

  created_at: string;
  updated_at: string;
}


export interface SettingsUpdate
  extends Partial<Omit<AppSettings, "id" | "created_at" | "updated_at">> {}
