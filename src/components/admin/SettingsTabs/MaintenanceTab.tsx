import { motion } from "framer-motion";
import React from "react";
import { PlatformSettings } from "../../../hooks/Queries/useSettings";

type HandleSettingChange = <K extends keyof PlatformSettings>(
  key: K,
  value: PlatformSettings[K]
) => void;

interface MaintenanceTabProps {
  settings: PlatformSettings;
  handleSettingChange: HandleSettingChange;
}

const MaintenanceTab: React.FC<MaintenanceTabProps> = ({
  settings,
  handleSettingChange,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
        <div>
          <p className="font-medium dark:text-white">Maintenance Mode</p>
          <p className="text-sm text-gray-500 dark:text-gray-300">
            Enable maintenance mode to restrict access
          </p>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={settings.maintenance_mode}
            onChange={(e) =>
              handleSettingChange("maintenance_mode", e.target.checked)
            }
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 dark:peer-focus:ring-green-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-green-600"></div>
        </label>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Maintenance Message
        </label>
        <textarea
          value={settings.maintenance_message || ""}
          onChange={(e) =>
            handleSettingChange("maintenance_message", e.target.value)
          }
          rows={3}
          className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-y max-h-40"
          placeholder="Enter maintenance message..."
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Start Time
          </label>
          <input
            type="datetime-local"
            value={settings.maintenance_start_time?.slice(0, 16) || ""}
            onChange={(e) =>
              handleSettingChange("maintenance_start_time", e.target.value)
            }
            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            End Time
          </label>
          <input
            type="datetime-local"
            value={settings.maintenance_end_time?.slice(0, 16) || ""}
            onChange={(e) =>
              handleSettingChange("maintenance_end_time", e.target.value)
            }
            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>
      </div>
    </motion.div>
  );
};

export default MaintenanceTab;
