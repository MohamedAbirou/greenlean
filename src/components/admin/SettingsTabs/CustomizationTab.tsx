import type { PlatformSettings } from "@/hooks/Queries/useSettings";
import { motion } from "framer-motion";
import { PenTool as Tool, Upload } from "lucide-react";
import React from "react";

type HandleSettingChange = <K extends keyof PlatformSettings>(
  key: K,
  value: PlatformSettings[K]
) => void;

type HandleFileUpload = (
  event: React.ChangeEvent<HTMLInputElement>,
  type: "logo" | "favicon"
) => Promise<void>;

interface CustomizationTabProps {
  settings: PlatformSettings;
  handleSettingChange: HandleSettingChange;
  handleFileUpload: HandleFileUpload;
}

const CustomizationTab: React.FC<CustomizationTabProps> = ({
  settings,
  handleSettingChange,
  handleFileUpload
}) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-4"
    >
      <div className="bg-background p-2 rounded-lg grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-foreground/80 mb-1">
            Platform Name
          </label>
          <input
            type="text"
            value={settings.platform_name}
            onChange={(e) =>
              handleSettingChange("platform_name", e.target.value)
            }
            className="w-full px-4 py-2 rounded-lg border border-border bg-input text-foreground"
            placeholder="Enter platform name..."
          />
          <p className="text-sm text-foreground/70 mt-1">
            This name will appear throughout the platform
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground/80 mb-1">
            Primary Color
          </label>
          <div className="flex items-center gap-4">
            <input
              type="color"
              value={settings.theme_color}
              onChange={(e) =>
                handleSettingChange("theme_color", e.target.value)
              }
              className="w-16 h-12 rounded-lg border border-border cursor-pointer"
            />
            <div className="flex flex-col">
              <span className="text-sm font-medium text-foreground">
                {settings.theme_color.toUpperCase()}
              </span>
              <button
                onClick={() => handleSettingChange("theme_color", "#00c951")}
                className="text-sm text-primary hover:text-primary/80 text-left cursor-pointer"
              >
                Reset to default
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-background p-2 rounded-lg grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-foreground/80 mb-1">
            Platform Logo
          </label>
          <div className="flex items-center gap-4">
            <div className="relative">
              {settings.logo_url ? (
                <img
                  src={settings.logo_url}
                  alt="Logo preview"
                  className="h-16 w-16 object-contain rounded-lg bg-card p-2"
                />
              ) : (
                <div className="h-16 w-16 rounded-lg bg-card flex items-center justify-center">
                  <Tool className="h-8 w-8 text-foreground/80" />
                </div>
              )}
            </div>
            <div className="flex flex-col gap-2">
              <label className="px-4 py-2 bg-card rounded-lg cursor-pointer hover:bg-card w-fit">
                <Upload className="h-5 w-5 text-secondary-foreground" />
                <input
                  type="file"
                  accept="image/png, image/svg+xml, image/jpeg"
                  onChange={(e) => handleFileUpload(e, "logo")}
                  className="hidden"
                />
              </label>
              <p className="text-sm text-foreground/70">
                Recommended: SVG or PNG (300x300px)
              </p>
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground/80 mb-1">
            Favicon
          </label>
          <div className="flex items-center gap-4">
            <div className="relative">
              {settings.favicon_url ? (
                <img
                  src={settings.favicon_url}
                  alt="Favicon preview"
                  className="h-12 w-12 object-contain rounded-lg bg-card p-2"
                />
              ) : (
                <div className="h-12 w-12 rounded-lg bg-card flex items-center justify-center">
                  <Tool className="h-6 w-6 text-foreground/80" />
                </div>
              )}
            </div>
            <div className="flex flex-col gap-2">
              <label className="px-4 py-2 bg-card rounded-lg cursor-pointer hover:bg-card w-fit">
                <Upload className="h-5 w-5 text-secondary-foreground" />
                <input
                  type="file"
                  accept="image/png, image/x-icon, image/svg+xml"
                  onChange={(e) => handleFileUpload(e, "favicon")}
                  className="hidden"
                />
              </label>
              <p className="text-sm text-foreground/70">
                Recommended: ICO or PNG (32x32px)
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-background p-2 rounded-lg">
        <h3 className="text-sm font-medium text-foreground mb-2">
          Live Preview
        </h3>
        <div className="flex items-center gap-4">
          <div className="flex-shrink-0">
            {settings.logo_url ? (
              <img
                src={settings.logo_url}
                alt="Logo preview"
                className="h-8 w-8 object-contain"
              />
            ) : (
              <div className="h-8 w-8 rounded bg-card flex items-center justify-center">
                <Tool className="h-4 w-4 text-foreground/80" />
              </div>
            )}
          </div>
          <div className="flex-1">
            <h2
              className="text-xl font-bold"
              style={{ color: settings.theme_color }}
            >
              {settings.platform_name}
            </h2>
            <p className="text-sm text-foreground/80">
              Platform preview text
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default CustomizationTab;
