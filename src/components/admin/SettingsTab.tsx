import { usePlatform } from "@/contexts/PlatformContext";
import { supabase } from "@/lib/supabase";
import { logFrontendError, logInfo } from "@/utils/errorLogger";
import {
  AlertTriangle,
  Loader,
  Save,
  Settings,
  PenTool as Tool
} from "lucide-react";
import React, { useEffect, useState } from "react";
// Sections import
import { useSettingsQuery, type PlatformSettings } from "@/hooks/Queries/useSettings";
import { queryKeys } from "@/lib/queryKeys";
import type { ColorTheme } from "@/utils/colorUtils";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "../ui/button";
import CustomizationTab from "./SettingsTabs/CustomizationTab";
import LogsTab from "./SettingsTabs/LogsTab";
import MaintenanceTab from "./SettingsTabs/MaintenanceTab";

interface SettingsTabProps {
  colorTheme: ColorTheme;
}

const SettingsTab: React.FC<SettingsTabProps> = ({ colorTheme }) => {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<string>("customization");
  const [saving, setSaving] = useState(false); // when saving settings
  const queryClient = useQueryClient();

  const platform = usePlatform();

  const { data: settings, isLoading } = useSettingsQuery();

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

  const handleSettingChange = (key: keyof PlatformSettings, value: unknown) => {
    if (!settings) return;
    queryClient.setQueryData<PlatformSettings | null>(queryKeys.settings, {
      ...settings,
      [key]: value,
    });
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-6">
        <Loader className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="p-6 text-center">
        <p className="text-destructive">Failed to load settings</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 justify-between items-center">
        <h2 className="text-2xl font-bold text-foreground">
          Platform Settings
        </h2>
        <Button
          onClick={() => handleSaveSettings(activeSection)}
          className={`w-full sm:w-fit ${colorTheme.primaryBg} text-white rounded-lg hover:${colorTheme.primaryHover} transition-colors flex items-center`}
          disabled={saving}
        >
          {saving ? (
            <Loader className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <Save className="h-4 w-4 mr-2" />
          )}
          Save Changes
        </Button>
      </div>

      {error && (
        <div className="p-4 bg-destructive/30 text-destructive rounded-lg">
          {error}
        </div>
      )}

      {success && (
        <div className="p-4 bg-primary/30 text-primary rounded-lg">
          {success}
        </div>
      )}

      {/* Navigation */}
      <div className="flex space-x-4 border-b border-border overflow-x-auto">
        {[
          { id: "customization", label: "Customization", icon: Settings },
          { id: "maintenance", label: "Maintenance", icon: Tool },
          { id: "logs", label: "Logs", icon: AlertTriangle },
        ].map((section) => (
          <button
            key={section.id}
            onClick={() => setActiveSection(section.id)}
            className={`flex items-center px-4 py-2 border-b-2 transition-colors cursor-pointer ${
              activeSection === section.id
                ? "border-primary text-primary"
                : "border-transparent text-foreground hover:text-primary"
            }`}
          >
            <section.icon className="h-5 w-5 mr-2" />
            {section.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="bg-card rounded-xl shadow-md p-2">
        {/* Customization Section */}
        {activeSection === "customization" && (
          <CustomizationTab
            settings={settings}
            handleSettingChange={handleSettingChange}
            handleFileUpload={handleFileUpload}
          />
        )}

        {/* Maintenance Section */}
        {activeSection === "maintenance" && (
          <MaintenanceTab
            settings={settings}
            handleSettingChange={handleSettingChange}
          />
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
