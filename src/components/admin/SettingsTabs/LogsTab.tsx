import React from "react";
import type { ColorTheme } from "@/utils/colorUtils";

interface LogsTabProps {
  colorTheme: ColorTheme;
  setSuccess: React.Dispatch<React.SetStateAction<string | null>>;
}

const LogsTab: React.FC<LogsTabProps> = () => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">System Logs</h3>
      <p className="text-sm text-muted-foreground">
        View and manage system logs and audit trails.
      </p>
    </div>
  );
};

export default LogsTab;
