import {
    AlertCircle,
    Bell,
    CheckCircle,
    Database,
    DollarSign,
    Globe,
    Mail,
    RefreshCw,
    Save,
    Shield,
    Zap
} from "lucide-react";
import React, { useEffect, useState } from "react";

// Mock hooks - replace with your actual implementations
const useSettings = () => {
  const [settings, setSettings] = useState({
    // General Settings
    site_name: "GreenLean",
    site_description: "Your Health & Fitness Companion",
    maintenance_mode: false,
    max_free_ai_generations: 2,

    // Email Settings
    email_notifications_enabled: true,
    admin_email: "admin@greenlean.com",
    smtp_host: "smtp.gmail.com",
    smtp_port: "587",
    smtp_username: "",
    smtp_password: "",

    // Security Settings
    session_timeout_minutes: 60,
    max_login_attempts: 5,
    password_min_length: 8,
    require_email_verification: true,
    two_factor_auth_enabled: false,

    // AI Service Settings
    ai_service_url: "http://localhost:8000",
    ai_timeout_seconds: 30,
    ai_rate_limit_per_user: 10,
    ai_generation_retry_attempts: 3,

    // Notification Settings
    streak_warning_hours: 20,
    challenge_reminder_enabled: true,
    weekly_summary_enabled: true,
    plan_expiry_warning_days: 7,

    // Database Settings
    auto_backup_enabled: true,
    backup_frequency_hours: 24,
    data_retention_days: 365,

    // Analytics Settings
    analytics_enabled: true,
    anonymous_tracking: true,

    // Payment Settings
    stripe_webhook_secret: "",
    allow_plan_downgrades: true,
    trial_period_days: 7,
  });

  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  const updateSettings = async (newSettings: any) => {
    setLoading(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setSettings(newSettings);
    setLoading(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return { settings, updateSettings, loading, saved };
};

const SettingsTab: React.FC = () => {
  const { settings, updateSettings, loading, saved } = useSettings();
  const [activeSection, setActiveSection] = useState("general");
  const [formData, setFormData] = useState(settings);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    setFormData(settings);
  }, [settings]);

  useEffect(() => {
    setHasChanges(JSON.stringify(formData) !== JSON.stringify(settings));
  }, [formData, settings]);

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    updateSettings(formData);
  };

  const handleReset = () => {
    setFormData(settings);
  };

  const sections = [
    { id: "general", name: "General", icon: Globe },
    { id: "email", name: "Email", icon: Mail },
    { id: "security", name: "Security", icon: Shield },
    { id: "ai", name: "AI Service", icon: Zap },
    { id: "notifications", name: "Notifications", icon: Bell },
    { id: "database", name: "Database", icon: Database },
    { id: "payments", name: "Payments", icon: DollarSign },
  ];

  const renderSection = () => {
    switch (activeSection) {
      case "general":
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Site Name</label>
              <input
                type="text"
                value={formData.site_name}
                onChange={(e) => handleChange("site_name", e.target.value)}
                className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Site Description
              </label>
              <textarea
                value={formData.site_description}
                onChange={(e) => handleChange("site_description", e.target.value)}
                rows={3}
                className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            <div className="flex items-center justify-between p-4 bg-card border border-border rounded-lg">
              <div>
                <h4 className="font-medium text-foreground">Maintenance Mode</h4>
                <p className="text-sm text-muted-foreground">
                  Disable site access for all non-admin users
                </p>
              </div>
              <button
                onClick={() => handleChange("maintenance_mode", !formData.maintenance_mode)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  formData.maintenance_mode ? "bg-primary" : "bg-gray-300"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    formData.maintenance_mode ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Max Free AI Generations per User
              </label>
              <input
                type="number"
                value={formData.max_free_ai_generations}
                onChange={(e) => handleChange("max_free_ai_generations", parseInt(e.target.value))}
                min="0"
                className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
              <p className="text-sm text-muted-foreground mt-1">
                Number of free AI plan generations allowed before requiring a subscription
              </p>
            </div>
          </div>
        );

      case "email":
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between p-4 bg-card border border-border rounded-lg">
              <div>
                <h4 className="font-medium text-foreground">Email Notifications</h4>
                <p className="text-sm text-muted-foreground">
                  Enable email notifications system-wide
                </p>
              </div>
              <button
                onClick={() =>
                  handleChange("email_notifications_enabled", !formData.email_notifications_enabled)
                }
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  formData.email_notifications_enabled ? "bg-primary" : "bg-gray-300"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    formData.email_notifications_enabled ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Admin Email</label>
              <input
                type="email"
                value={formData.admin_email}
                onChange={(e) => handleChange("admin_email", e.target.value)}
                className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">SMTP Host</label>
                <input
                  type="text"
                  value={formData.smtp_host}
                  onChange={(e) => handleChange("smtp_host", e.target.value)}
                  className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">SMTP Port</label>
                <input
                  type="text"
                  value={formData.smtp_port}
                  onChange={(e) => handleChange("smtp_port", e.target.value)}
                  className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                SMTP Username
              </label>
              <input
                type="text"
                value={formData.smtp_username}
                onChange={(e) => handleChange("smtp_username", e.target.value)}
                className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                SMTP Password
              </label>
              <input
                type="password"
                value={formData.smtp_password}
                onChange={(e) => handleChange("smtp_password", e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
          </div>
        );

      case "security":
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Session Timeout (minutes)
              </label>
              <input
                type="number"
                value={formData.session_timeout_minutes}
                onChange={(e) => handleChange("session_timeout_minutes", parseInt(e.target.value))}
                min="5"
                className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Max Login Attempts
              </label>
              <input
                type="number"
                value={formData.max_login_attempts}
                onChange={(e) => handleChange("max_login_attempts", parseInt(e.target.value))}
                min="3"
                className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Minimum Password Length
              </label>
              <input
                type="number"
                value={formData.password_min_length}
                onChange={(e) => handleChange("password_min_length", parseInt(e.target.value))}
                min="6"
                className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            <div className="flex items-center justify-between p-4 bg-card border border-border rounded-lg">
              <div>
                <h4 className="font-medium text-foreground">Require Email Verification</h4>
                <p className="text-sm text-muted-foreground">
                  Users must verify email before accessing features
                </p>
              </div>
              <button
                onClick={() =>
                  handleChange("require_email_verification", !formData.require_email_verification)
                }
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  formData.require_email_verification ? "bg-primary" : "bg-gray-300"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    formData.require_email_verification ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between p-4 bg-card border border-border rounded-lg">
              <div>
                <h4 className="font-medium text-foreground">Two-Factor Authentication</h4>
                <p className="text-sm text-muted-foreground">Require 2FA for admin accounts</p>
              </div>
              <button
                onClick={() =>
                  handleChange("two_factor_auth_enabled", !formData.two_factor_auth_enabled)
                }
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  formData.two_factor_auth_enabled ? "bg-primary" : "bg-gray-300"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    formData.two_factor_auth_enabled ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>
          </div>
        );

      case "ai":
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                AI Service URL
              </label>
              <input
                type="text"
                value={formData.ai_service_url}
                onChange={(e) => handleChange("ai_service_url", e.target.value)}
                className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
              <p className="text-sm text-muted-foreground mt-1">URL of your FastAPI ML service</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Request Timeout (seconds)
              </label>
              <input
                type="number"
                value={formData.ai_timeout_seconds}
                onChange={(e) => handleChange("ai_timeout_seconds", parseInt(e.target.value))}
                min="10"
                className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Rate Limit Per User (per hour)
              </label>
              <input
                type="number"
                value={formData.ai_rate_limit_per_user}
                onChange={(e) => handleChange("ai_rate_limit_per_user", parseInt(e.target.value))}
                min="1"
                className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Retry Attempts on Failure
              </label>
              <input
                type="number"
                value={formData.ai_generation_retry_attempts}
                onChange={(e) =>
                  handleChange("ai_generation_retry_attempts", parseInt(e.target.value))
                }
                min="0"
                max="5"
                className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
          </div>
        );

      case "notifications":
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Streak Warning Time (hours before expiry)
              </label>
              <input
                type="number"
                value={formData.streak_warning_hours}
                onChange={(e) => handleChange("streak_warning_hours", parseInt(e.target.value))}
                min="1"
                max="48"
                className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            <div className="flex items-center justify-between p-4 bg-card border border-border rounded-lg">
              <div>
                <h4 className="font-medium text-foreground">Challenge Reminders</h4>
                <p className="text-sm text-muted-foreground">
                  Send reminders for active challenges
                </p>
              </div>
              <button
                onClick={() =>
                  handleChange("challenge_reminder_enabled", !formData.challenge_reminder_enabled)
                }
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  formData.challenge_reminder_enabled ? "bg-primary" : "bg-gray-300"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    formData.challenge_reminder_enabled ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between p-4 bg-card border border-border rounded-lg">
              <div>
                <h4 className="font-medium text-foreground">Weekly Summary</h4>
                <p className="text-sm text-muted-foreground">
                  Send weekly progress summaries to users
                </p>
              </div>
              <button
                onClick={() =>
                  handleChange("weekly_summary_enabled", !formData.weekly_summary_enabled)
                }
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  formData.weekly_summary_enabled ? "bg-primary" : "bg-gray-300"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    formData.weekly_summary_enabled ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Plan Expiry Warning (days before)
              </label>
              <input
                type="number"
                value={formData.plan_expiry_warning_days}
                onChange={(e) => handleChange("plan_expiry_warning_days", parseInt(e.target.value))}
                min="1"
                max="30"
                className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
          </div>
        );

      case "database":
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between p-4 bg-card border border-border rounded-lg">
              <div>
                <h4 className="font-medium text-foreground">Auto Backup</h4>
                <p className="text-sm text-muted-foreground">Automatically backup database</p>
              </div>
              <button
                onClick={() => handleChange("auto_backup_enabled", !formData.auto_backup_enabled)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  formData.auto_backup_enabled ? "bg-primary" : "bg-gray-300"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    formData.auto_backup_enabled ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Backup Frequency (hours)
              </label>
              <input
                type="number"
                value={formData.backup_frequency_hours}
                onChange={(e) => handleChange("backup_frequency_hours", parseInt(e.target.value))}
                min="1"
                className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Data Retention Period (days)
              </label>
              <input
                type="number"
                value={formData.data_retention_days}
                onChange={(e) => handleChange("data_retention_days", parseInt(e.target.value))}
                min="30"
                className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
              <p className="text-sm text-muted-foreground mt-1">
                How long to keep inactive user data and logs
              </p>
            </div>

            <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-500 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-medium text-yellow-800 dark:text-yellow-400">
                    Database Actions
                  </h4>
                  <p className="text-sm text-yellow-700 dark:text-yellow-500 mt-1">
                    Backup and cleanup operations should be performed during low-traffic periods
                  </p>
                  <div className="flex gap-2 mt-3">
                    <button className="px-3 py-1.5 bg-yellow-600 hover:bg-yellow-700 text-white rounded text-sm font-medium">
                      Run Backup Now
                    </button>
                    <button className="px-3 py-1.5 bg-gray-600 hover:bg-gray-700 text-white rounded text-sm font-medium">
                      Run Cleanup
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case "payments":
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Stripe Webhook Secret
              </label>
              <input
                type="password"
                value={formData.stripe_webhook_secret}
                onChange={(e) => handleChange("stripe_webhook_secret", e.target.value)}
                placeholder="whsec_••••••••"
                className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
              <p className="text-sm text-muted-foreground mt-1">
                Your Stripe webhook signing secret for validating events
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Trial Period (days)
              </label>
              <input
                type="number"
                value={formData.trial_period_days}
                onChange={(e) => handleChange("trial_period_days", parseInt(e.target.value))}
                min="0"
                className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            <div className="flex items-center justify-between p-4 bg-card border border-border rounded-lg">
              <div>
                <h4 className="font-medium text-foreground">Allow Plan Downgrades</h4>
                <p className="text-sm text-muted-foreground">
                  Users can downgrade to lower tier plans
                </p>
              </div>
              <button
                onClick={() =>
                  handleChange("allow_plan_downgrades", !formData.allow_plan_downgrades)
                }
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  formData.allow_plan_downgrades ? "bg-primary" : "bg-gray-300"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    formData.allow_plan_downgrades ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Settings</h1>
          <p className="text-muted-foreground mt-1">
            Configure your application settings and preferences
          </p>
        </div>

        {saved && (
          <div className="flex items-center gap-2 px-4 py-2 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-lg">
            <CheckCircle className="h-5 w-5" />
            <span className="font-medium">Settings saved successfully</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Sidebar Navigation */}
        <div className="col-span-3">
          <div className="bg-card border border-border rounded-lg p-2 sticky top-6">
            {sections.map((section) => {
              const Icon = section.icon;
              return (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all text-left ${
                    activeSection === section.id
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  }`}
                >
                  <Icon className="h-5 w-5 flex-shrink-0" />
                  <span className="font-medium">{section.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Main Content */}
        <div className="col-span-9">
          <div className="bg-card border border-border rounded-lg p-6">{renderSection()}</div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 mt-6">
            <button
              onClick={handleReset}
              disabled={!hasChanges || loading}
              className="px-6 py-2.5 bg-background border border-border text-foreground rounded-lg font-medium hover:bg-accent transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Reset Changes
            </button>
            <button
              onClick={handleSave}
              disabled={!hasChanges || loading}
              className="px-6 py-2.5 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Save Settings
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsTab;
