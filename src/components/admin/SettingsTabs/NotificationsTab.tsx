import { motion } from "framer-motion";
import React from "react";
import { PlatformSettings } from "../../../hooks/Queries/useSettings";

type HandleSettingChange = <K extends keyof PlatformSettings>(
  key: keyof PlatformSettings,
  value: PlatformSettings[K]
) => void;

interface NotificationsTabProps {
  settings: PlatformSettings;
  handleSettingChange: HandleSettingChange;
}

const NotificationsTab: React.FC<NotificationsTabProps> = ({
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
          <p className="font-medium dark:text-white">Email Notifications</p>
          <p className="text-sm text-gray-500 dark:text-gray-300">
            Enable email notifications for users
          </p>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={settings.email_notifications_enabled}
            onChange={(e) =>
              handleSettingChange(
                "email_notifications_enabled",
                e.target.checked
              )
            }
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 dark:peer-focus:ring-green-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-green-600"></div>
        </label>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Notification Frequency
        </label>
        <select
          value={settings.notification_frequency}
          onChange={(e) =>
            handleSettingChange("notification_frequency", e.target.value)
          }
          className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        >
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
          <option value="monthly">Monthly</option>
        </select>
      </div>
    </motion.div>
  );
};

export default NotificationsTab;
