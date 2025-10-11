import {
  AlertTriangle,
  Bell,
  Loader,
  Save,
  Settings,
  Shield,
  PenTool as Tool
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { usePlatform } from "../../contexts/PlatformContext";
import { supabase } from "../../lib/supabase";
import { ColorTheme } from "../../utils/colorUtils";
import { logFrontendError, logInfo } from "../../utils/errorLogger";
// Sections import
import CustomizationTab from "./SettingsTabs/CustomizationTab";
import LogsTab from "./SettingsTabs/LogsTab";
import MaintenanceTab from "./SettingsTabs/MaintenanceTab";
import NotificationsTab from "./SettingsTabs/NotificationsTab";
import SecurityTab from "./SettingsTabs/SecurityTab";

export interface PlatformSettings {
  id: string;
  theme_color: string;
  theme_mode: "light" | "dark" | "system";
  platform_name: string;
  logo_url: string | null;
  favicon_url: string | null;
  admin_2fa_required: boolean;
  account_lockout_attempts: number;
  session_timeout_minutes: number;
  maintenance_mode: boolean;
  maintenance_message: string | null;
  maintenance_start_time: string | null;
  maintenance_end_time: string | null;
  email_notifications_enabled: boolean;
  notification_frequency: "daily" | "weekly" | "monthly";
}

interface SettingsTabProps {
  colorTheme: ColorTheme;
}

const SettingsTab: React.FC<SettingsTabProps> = ({ colorTheme }) => {
  const [settings, setSettings] = useState<PlatformSettings | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<string>("customization");
  const [fetching, setFetching] = useState(true); // initial fetch
  const [saving, setSaving] = useState(false); // when saving settings

  const platform = usePlatform();

  useEffect(() => {
    fetchSettings();
  }, []);

  useEffect(() => {
    if (settings) {
      // Apply theme color
      document.documentElement.style.setProperty(
        "--primary-color",
        settings.theme_color
      );

      // Update favicon
      const favicon =
        document.querySelector<HTMLLinkElement>('link[rel="icon"]');
      if (favicon && settings.favicon_url) {
        favicon.href = settings.favicon_url;
      }

      // Update page title with platform name
      document.title = settings.platform_name;
    }
  }, [settings]);

  const fetchSettings = async () => {
    setFetching(true);
    try {
      const { data, error } = await supabase
        .from("platform_settings")
        .select("*")
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      setSettings(data);
    } catch (error) {
      console.error("Error fetching settings:", error);
      setError("Failed to load settings");
    } finally {
      setFetching(false);
    }
  };

  const handleSettingChange = (key: keyof PlatformSettings, value: unknown) => {
    if (!settings) return;
    setSettings({ ...settings, [key]: value });
  };

  const handleSaveSettings = async (section: string) => {
    if (!settings) return;

    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      let updateData: Partial<PlatformSettings> = {};

      if (section === "customization") {
        updateData = {
          id: settings.id,
          platform_name: settings.platform_name,
          theme_color: settings.theme_color,
          logo_url: settings.logo_url,
        };
      } else if (section === "security") {
        updateData = {
          id: settings.id,
          admin_2fa_required: settings.admin_2fa_required,
          account_lockout_attempts: settings.account_lockout_attempts,
          session_timeout_minutes: settings.session_timeout_minutes,
        };
      } else if (section === "notifications") {
        updateData = {
          id: settings.id,
          email_notifications_enabled: settings.email_notifications_enabled,
          notification_frequency: settings.notification_frequency,
        };
      }

      const { error } = await supabase
        .from("platform_settings")
        .upsert([updateData], { onConflict: "id" });

      if (error) {
        setError(`Failed to save ${section} settings`);
        await logFrontendError(
          `Failed to save ${section} settings`,
          error.message
        );
      } else {
        setSuccess(`${section} settings saved successfully`);
        await logInfo("frontend", `${section} settings updated successfully`);
        // Refresh platform settings
        platform.refreshSettings();
      }
    } catch (err) {
      setError(`Failed to save ${section} settings`);
      await logFrontendError(
        `Exception while saving ${section} settings`,
        err instanceof Error ? err : String(err)
      );
    } finally {
      setSaving(false);
    }
  };

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
    type: "logo" | "favicon"
  ) => {
    const file = event.target.files?.[0];
    if (!file || !settings) return;

    try {
      // Delete old file if exists
      const currentUrl =
        type === "logo" ? settings.logo_url : settings.favicon_url;
      if (currentUrl) {
        const fileName = currentUrl.split("/").pop();
        await supabase.storage.from("public").remove([`platform/${fileName}`]);
      }

      // Upload new file
      const fileExt = file.name.split(".").pop();
      const fileName = `${type}_${Date.now()}.${fileExt}`;
      const filePath = `platform/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("public")
        .upload(filePath, file, { cacheControl: "3600", upsert: true });

      if (uploadError) throw uploadError;

      const {
        data: { publicUrl },
      } = supabase.storage.from("public").getPublicUrl(filePath);

      handleSettingChange(
        type === "logo" ? "logo_url" : "favicon_url",
        publicUrl
      );
    } catch (error) {
      console.error("Error uploading file:", error);
      setError(`Failed to upload ${type}`);
    }
  };

  if (fetching) {
    return (
      <div className="flex items-center justify-center p-6">
        <Loader className="h-8 w-8 animate-spin text-green-500" />
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="p-6 text-center">
        <p className="text-red-500">Failed to load settings</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold dark:text-white">
          Platform Settings
        </h2>
        <button
          onClick={() => handleSaveSettings(activeSection)}
          className={`px-4 py-2 ${colorTheme.primaryBg} text-white rounded-lg hover:${colorTheme.primaryHover} transition-colors flex items-center`}
          disabled={saving}
        >
          {saving ? (
            <Loader className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <Save className="h-4 w-4 mr-2" />
          )}
          Save Changes
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 rounded-lg">
          {error}
        </div>
      )}

      {success && (
        <div className="p-4 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded-lg">
          {success}
        </div>
      )}

      {/* Navigation */}
      <div className="flex space-x-4 border-b border-gray-200 dark:border-gray-700">
        {[
          { id: "customization", label: "Customization", icon: Settings },
          { id: "security", label: "Security", icon: Shield },
          { id: "notifications", label: "Notifications", icon: Bell },
          { id: "maintenance", label: "Maintenance", icon: Tool },
          { id: "logs", label: "Logs", icon: AlertTriangle },
        ].map((section) => (
          <button
            key={section.id}
            onClick={() => setActiveSection(section.id)}
            className={`flex items-center px-4 py-2 border-b-2 transition-colors ${
              activeSection === section.id
                ? "border-green-500 text-green-500"
                : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            }`}
          >
            <section.icon className="h-5 w-5 mr-2" />
            {section.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
        {/* Customization Section */}
        {activeSection === "customization" && (
          <CustomizationTab settings={settings} handleSettingChange={handleSettingChange} handleFileUpload={handleFileUpload} />
        )}

        {/* Security Section */}
        {activeSection === "security" && (
          <SecurityTab settings={settings} handleSettingChange={handleSettingChange} />
        )}

        {/* Notifications Section */}
        {activeSection === "notifications" && (
          <NotificationsTab settings={settings} handleSettingChange={handleSettingChange} />
        )}

        {/* Maintenance Section */}
        {activeSection === "maintenance" && (
          <MaintenanceTab settings={settings} handleSettingChange={handleSettingChange} />
        )}

        {/* Logs Section */}
        {activeSection === "logs" && (
          <LogsTab colorTheme={colorTheme} setSuccess={setSuccess} />
        )}
      </div>
    </div>
  );
};

export default SettingsTab;
