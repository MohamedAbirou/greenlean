import { motion } from "framer-motion";
import React from "react";
import { PlatformSettings } from "../SettingsTab";

type HandleSettingChange = <K extends keyof PlatformSettings>(
  key: K,
  value: PlatformSettings[K]
) => void;

interface SecurityTabProps {
  settings: PlatformSettings;
  handleSettingChange: HandleSettingChange;
}

const SecurityTab: React.FC<SecurityTabProps> = ({
  settings,
  handleSettingChange
}) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
        <div>
          <p className="font-medium dark:text-white">
            Two-Factor Authentication
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-300">
            Require 2FA for admin accounts
          </p>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={settings.admin_2fa_required}
            onChange={(e) =>
              handleSettingChange("admin_2fa_required", e.target.checked)
            }
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 dark:peer-focus:ring-green-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-green-600"></div>
        </label>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Account Lockout Attempts
        </label>
        <input
          type="number"
          value={settings.account_lockout_attempts}
          onChange={(e) =>
            handleSettingChange(
              "account_lockout_attempts",
              parseInt(e.target.value)
            )
          }
          min="1"
          className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Session Timeout (minutes)
        </label>
        <input
          type="number"
          value={settings.session_timeout_minutes}
          onChange={(e) =>
            handleSettingChange(
              "session_timeout_minutes",
              parseInt(e.target.value)
            )
          }
          min="5"
          className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        />
      </div>
    </motion.div>
  );
};

export default SecurityTab;
