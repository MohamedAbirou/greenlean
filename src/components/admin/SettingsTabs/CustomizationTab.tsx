import React from "react";
import type { PlatformSettings } from "@/hooks/Queries/useSettings";

interface CustomizationTabProps {
  settings: PlatformSettings;
  handleSettingChange: (key: keyof PlatformSettings, value: unknown) => void;
  handleFileUpload?: (
    event: React.ChangeEvent<HTMLInputElement>,
    type: "logo" | "favicon"
  ) => Promise<void>;
}

const CustomizationTab: React.FC<CustomizationTabProps> = () => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Customization Settings</h3>
      <p className="text-sm text-muted-foreground">
        Configure platform appearance and branding.
      </p>
    </div>
  );
};

export default CustomizationTab;
