import { motion } from "framer-motion";
import { PenTool as Tool, Upload } from "lucide-react";
import React from "react";
import { PlatformSettings } from "../../../hooks/Queries/useSettings";

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
      className="space-y-6"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Platform Name
          </label>
          <input
            type="text"
            value={settings.platform_name}
            onChange={(e) =>
              handleSettingChange("platform_name", e.target.value)
            }
            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            placeholder="Enter platform name..."
          />
          <p className="text-sm text-gray-500 mt-1">
            This name will appear throughout the platform
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Primary Color
          </label>
          <div className="flex items-center gap-4">
            <input
              type="color"
              value={settings.theme_color}
              onChange={(e) =>
                handleSettingChange("theme_color", e.target.value)
              }
              className="w-16 h-12 rounded-lg border border-gray-300 dark:border-gray-600 cursor-pointer"
            />
            <div className="flex flex-col">
              <span className="text-sm font-medium dark:text-white">
                {settings.theme_color.toUpperCase()}
              </span>
              <button
                onClick={() => handleSettingChange("theme_color", "#10B981")}
                className="text-sm text-green-500 hover:text-green-600 text-left"
              >
                Reset to default
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Platform Logo
          </label>
          <div className="flex items-center gap-4">
            <div className="relative">
              {settings.logo_url ? (
                <img
                  src={settings.logo_url}
                  alt="Logo preview"
                  className="h-16 w-16 object-contain rounded-lg bg-gray-100 dark:bg-gray-700 p-2"
                />
              ) : (
                <div className="h-16 w-16 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                  <Tool className="h-8 w-8 text-gray-400" />
                </div>
              )}
            </div>
            <div className="flex flex-col gap-2">
              <label className="px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600 w-fit">
                <Upload className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                <input
                  type="file"
                  accept="image/png, image/svg+xml, image/jpeg"
                  onChange={(e) => handleFileUpload(e, "logo")}
                  className="hidden"
                />
              </label>
              <p className="text-sm text-gray-500">
                Recommended: SVG or PNG (300x300px)
              </p>
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Favicon
          </label>
          <div className="flex items-center gap-4">
            <div className="relative">
              {settings.favicon_url ? (
                <img
                  src={settings.favicon_url}
                  alt="Favicon preview"
                  className="h-12 w-12 object-contain rounded-lg bg-gray-100 dark:bg-gray-700 p-2"
                />
              ) : (
                <div className="h-12 w-12 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                  <Tool className="h-6 w-6 text-gray-400" />
                </div>
              )}
            </div>
            <div className="flex flex-col gap-2">
              <label className="px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600 w-fit">
                <Upload className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                <input
                  type="file"
                  accept="image/png, image/x-icon, image/svg+xml"
                  onChange={(e) => handleFileUpload(e, "favicon")}
                  className="hidden"
                />
              </label>
              <p className="text-sm text-gray-500">
                Recommended: ICO or PNG (32x32px)
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
        <h3 className="text-sm font-medium dark:text-white mb-2">
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
              <div className="h-8 w-8 rounded bg-gray-200 dark:bg-gray-600 flex items-center justify-center">
                <Tool className="h-4 w-4 text-gray-400" />
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
            <p className="text-sm text-gray-500 dark:text-gray-300">
              Platform preview text
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default CustomizationTab;
