import React from "react";
import type { PlatformSettings } from "@/hooks/Queries/useSettings";

interface MaintenanceTabProps {
  settings: PlatformSettings;
  handleSettingChange: (key: keyof PlatformSettings, value: unknown) => void;
}

const MaintenanceTab: React.FC<MaintenanceTabProps> = () => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Maintenance</h3>
      <p className="text-sm text-muted-foreground">
        System maintenance and diagnostic tools.
      </p>
    </div>
  );
};

export default MaintenanceTab;
