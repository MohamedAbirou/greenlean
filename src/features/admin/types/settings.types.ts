export interface AppSettings {
  // General Settings
  site_name: string;
  site_description: string;
  maintenance_mode: boolean;
  max_free_ai_generations: number;

  // Email Settings
  email_notifications_enabled: boolean;
  admin_email: string;
  smtp_host: string;
  smtp_port: string;
  smtp_username: string;
  smtp_password: string;

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
  stripe_webhook_secret: string;
  allow_plan_downgrades: boolean;
  trial_period_days: number;
}

export interface SettingsUpdate extends Partial<AppSettings> {}
