import { useSettings } from "@/features/admin/hooks/useSettings";
import {
  AlertCircle,
  Bell,
  Database,
  DollarSign,
  Globe,
  Loader2,
  RefreshCw,
  Save,
  Shield,
  Zap
} from "lucide-react";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";

const SettingsTab: React.FC = () => {
  const { settings, updateSettings, isLoading, isUpdating } = useSettings();
  const [activeSection, setActiveSection] = useState("general");
  const [formData, setFormData] = useState(settings);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (settings) {
      setFormData(settings);
    }
  }, [settings]);

  useEffect(() => {
    if (settings) {
      setHasChanges(JSON.stringify(formData) !== JSON.stringify(settings));
    }
  }, [formData, settings]);

  const handleChange = (field: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    try {
      await updateSettings(formData!);
      toast.success("✅ Settings saved successfully");
    } catch (error) {
      toast.error((error as Error).message || "Failed to save settings");
    }
  };

  const handleReset = () => {
    setFormData(settings);
    toast.success("Changes reset");
  };

  const sections = [
    { id: "general", name: "General", icon: Globe },
    { id: "security", name: "Security", icon: Shield },
    { id: "ai", name: "AI Service", icon: Zap },
    { id: "notifications", name: "Notifications", icon: Bell },
    { id: "database", name: "Database", icon: Database },
    { id: "payments", name: "Payments", icon: DollarSign },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

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
                value={formData.site_description || ""}
                onChange={(e) => handleChange("site_description", e.target.value)}
                rows={3}
                className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            <div className="flex items-center justify-between p-4 bg-card border border-border rounded-lg">
              <div>
                <h4 className="font-medium text-foreground">Maintenance Mode</h4>
                <p className="text-sm text-muted-foreground">Restrict site access to admins only</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Non-admin users will see a maintenance page
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
                Free users can generate {formData.max_free_ai_generations} AI plans before requiring
                a subscription
              </p>
            </div>

            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-medium text-blue-800 dark:text-blue-400">Email Settings</h4>
                  <p className="text-sm text-blue-700 dark:text-blue-500 mt-1">
                    All emails are handled by Supabase's built-in email service. Contact form and
                    streak notifications use Resend via Edge Functions.
                  </p>
                </div>
              </div>
            </div>
          </div>
        );

      case "security":
        return (
          <div className="space-y-6">
            <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
              <div className="flex items-start gap-3">
                <Shield className="h-5 w-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-medium text-yellow-800 dark:text-yellow-400">
                    Auth Managed by Supabase
                  </h4>
                  <p className="text-sm text-yellow-700 dark:text-yellow-500 mt-1">
                    Authentication, password resets, and email verification are handled entirely by
                    Supabase Auth.
                  </p>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Session Timeout (minutes)
              </label>
              <input
                type="number"
                value={formData.session_timeout_minutes}
                onChange={(e) => handleChange("session_timeout_minutes", parseInt(e.target.value))}
                min="5"
                max="1440"
                className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
              <p className="text-sm text-muted-foreground mt-1">
                Default: 60 minutes (controlled by Supabase Auth settings)
              </p>
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
                max="10"
                className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
              <p className="text-sm text-muted-foreground mt-1">
                Default: 5 attempts before temporary lockout
              </p>
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
                max="32"
                className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
              <p className="text-sm text-muted-foreground mt-1">
                Default: 8 characters (configured in Supabase Auth)
              </p>
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
                <p className="text-sm text-muted-foreground">
                  Required for admin accounts (Supabase setting)
                </p>
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
            <div className="p-4 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg">
              <div className="flex items-start gap-3">
                <Zap className="h-5 w-5 text-purple-600 dark:text-purple-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-medium text-purple-800 dark:text-purple-400">
                    ML Service on Railway
                  </h4>
                  <p className="text-sm text-purple-700 dark:text-purple-500 mt-1">
                    Your FastAPI ML service generates workout and nutrition plans. Currently hosted
                    on Railway.
                  </p>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                AI Service URL
              </label>
              <input
                type="text"
                value={formData.ai_service_url}
                onChange={(e) => handleChange("ai_service_url", e.target.value)}
                placeholder="https://greenlean-ml-production.up.railway.app"
                className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent font-mono text-sm"
              />
              <p className="text-sm text-muted-foreground mt-1">
                Default local: http://localhost:8000 | Production: Railway URL
              </p>
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
                max="120"
                className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
              <p className="text-sm text-muted-foreground mt-1">Default: 30 seconds</p>
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
                max="100"
                className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
              <p className="text-sm text-muted-foreground mt-1">Default: 10 requests per hour</p>
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
              <p className="text-sm text-muted-foreground mt-1">Default: 3 retry attempts</p>
            </div>
          </div>
        );

      case "notifications":
        return (
          <div className="space-y-6">
            <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
              <div className="flex items-start gap-3">
                <Bell className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-medium text-green-800 dark:text-green-400">
                    Notification System
                  </h4>
                  <p className="text-sm text-green-700 dark:text-green-500 mt-1">
                    Streak warnings and challenge notifications are handled by the{" "}
                    <code className="px-1 py-0.5 bg-green-100 dark:bg-green-800 rounded">
                      streak-monitor
                    </code>{" "}
                    Edge Function (runs via cron).
                  </p>
                </div>
              </div>
            </div>

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
              <p className="text-sm text-muted-foreground mt-1">
                Default: 20 hours (2 hours before expiry via streak-monitor function)
              </p>
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
                <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-1">
                  ⚠️ Not yet implemented - requires Edge Function
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
              <p className="text-sm text-muted-foreground mt-1">Default: 7 days</p>
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
                max="168"
                className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
              <p className="text-sm text-muted-foreground mt-1">
                Default: 24 hours (Supabase provides automatic backups)
              </p>
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
                max="3650"
                className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
              <p className="text-sm text-muted-foreground mt-1">
                Default: 365 days - Used by{" "}
                <code className="px-1 py-0.5 bg-muted rounded text-xs">run_database_cleanup()</code>{" "}
                function
              </p>
            </div>

            <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
              <div className="flex items-start gap-3">
                <Database className="h-5 w-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h4 className="font-medium text-yellow-800 dark:text-yellow-400 mb-2">
                    Database Maintenance
                  </h4>
                  <p className="text-sm text-yellow-700 dark:text-yellow-500 mb-3">
                    Manual operations use existing Supabase functions
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={async () => {
                        try {
                          toast.success("Triggering backup...");
                          // Call the trigger_backup() function
                          await fetch("/api/admin/trigger-backup", { method: "POST" });
                          toast.success("✅ Backup triggered");
                        } catch (error) {
                          toast.error("Failed to trigger backup");
                        }
                      }}
                      className="px-3 py-1.5 bg-yellow-600 hover:bg-yellow-700 text-white rounded text-sm font-medium transition-colors"
                    >
                      Run Backup Now
                    </button>
                    <button
                      onClick={async () => {
                        try {
                          toast.success("Running cleanup...");
                          // Call the run_database_cleanup() function
                          await fetch("/api/admin/database-cleanup", { method: "POST" });
                          toast.success("✅ Cleanup completed");
                        } catch (error) {
                          toast.error("Failed to run cleanup");
                        }
                      }}
                      className="px-3 py-1.5 bg-gray-600 hover:bg-gray-700 text-white rounded text-sm font-medium transition-colors"
                    >
                      Run Cleanup
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-card border border-border rounded-lg">
              <div>
                <h4 className="font-medium text-foreground">Analytics Enabled</h4>
                <p className="text-sm text-muted-foreground">Track usage metrics and engagement</p>
              </div>
              <button
                onClick={() => handleChange("analytics_enabled", !formData.analytics_enabled)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  formData.analytics_enabled ? "bg-primary" : "bg-gray-300"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    formData.analytics_enabled ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between p-4 bg-card border border-border rounded-lg">
              <div>
                <h4 className="font-medium text-foreground">Anonymous Tracking</h4>
                <p className="text-sm text-muted-foreground">
                  Use anonymous user IDs for analytics
                </p>
              </div>
              <button
                onClick={() => handleChange("anonymous_tracking", !formData.anonymous_tracking)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  formData.anonymous_tracking ? "bg-primary" : "bg-gray-300"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    formData.anonymous_tracking ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
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
                value={formData.stripe_webhook_secret || ""}
                onChange={(e) => handleChange("stripe_webhook_secret", e.target.value)}
                placeholder="whsec_••••••••"
                className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent font-mono text-sm"
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
                max="30"
                className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
              <p className="text-sm text-muted-foreground mt-1">
                Default: 7 days free trial for new subscriptions
              </p>
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

            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <div className="flex items-start gap-3">
                <DollarSign className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-medium text-blue-800 dark:text-blue-400">
                    Subscription Management
                  </h4>
                  <p className="text-sm text-blue-700 dark:text-blue-500 mt-1">
                    Plan quotas are enforced via{" "}
                    <code className="px-1 py-0.5 bg-blue-100 dark:bg-blue-800 rounded">
                      refuse_quiz_over_quota
                    </code>{" "}
                    trigger. Monthly resets handled by cron job calling{" "}
                    <code className="px-1 py-0.5 bg-blue-100 dark:bg-blue-800 rounded">
                      reset_quiz_usage_monthly()
                    </code>
                    .
                  </p>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Platform Settings</h1>
          <p className="text-muted-foreground mt-1">
            Configure your application settings and preferences
          </p>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
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

        <div className="col-span-9">
          <div className="bg-card border border-border rounded-lg p-6">{renderSection()}</div>

          <div className="flex items-center justify-end gap-3 mt-6">
            <button
              onClick={handleReset}
              disabled={!hasChanges || isUpdating}
              className="px-6 py-2.5 bg-background border border-border text-foreground rounded-lg font-medium hover:bg-accent transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Reset Changes
            </button>
            <button
              onClick={handleSave}
              disabled={!hasChanges || isUpdating}
              className="px-6 py-2.5 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isUpdating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
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
