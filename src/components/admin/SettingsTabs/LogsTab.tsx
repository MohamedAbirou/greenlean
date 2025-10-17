import { supabase } from "@/lib/supabase";
import type { ColorTheme } from "@/utils/colorUtils";
import { logFrontendError, logInfo } from "@/utils/errorLogger";
import { motion } from "framer-motion";
import { Eye, Loader, Trash2 } from "lucide-react";
import { useState } from "react";

interface Log {
  id: string;
  level: "error" | "warning" | "info" | "debug" | string;
  message: string;
  source: string;
  created_at: string;
}

interface LogsTabProps {
  colorTheme: ColorTheme;
  setSuccess: React.Dispatch<React.SetStateAction<string | null>>;
}

const LogsTab: React.FC<LogsTabProps> = ({ colorTheme, setSuccess }) => {
  const [logs, setLogs] = useState<Log[]>([]);
  const [logsLoading, setLogsLoading] = useState(false);

  const fetchLogs = async () => {
    setLogsLoading(true);
    try {
      const { data, error } = await supabase
        .from("admin_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);

      if (error) {
        await logFrontendError("Failed to fetch admin logs", error.message);
      } else {
        setLogs(data || []);
        await logInfo("frontend", "Admin logs fetched successfully");
      }
    } catch (err) {
      await logFrontendError(
        "Exception while fetching admin logs",
        err instanceof Error ? err : String(err)
      );
    } finally {
      setLogsLoading(false);
    }
  };

  const clearLogs = async () => {
    if (!confirm("Are you sure you want to clear all logs?")) {
      return;
    }

    try {
      const { error } = await supabase
        .from("admin_logs")
        .delete()
        .neq("id", "00000000-0000-0000-0000-000000000000");

      if (error) {
        await logFrontendError("Failed to clear admin logs", error.message);
      } else {
        setLogs([]);
        setSuccess("All logs cleared successfully");
        await logInfo("frontend", "Admin logs cleared successfully");
      }
    } catch (err) {
      await logFrontendError(
        "Exception while clearing admin logs",
        err instanceof Error ? err : String(err)
      );
    }
  };

  return (
    <motion.div animate={{ opacity: 1 }}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-foreground/80">System Logs</h3>
        <button
          onClick={fetchLogs}
          className={`px-4 py-2 ${colorTheme.primaryBg} text-white rounded-lg hover:${colorTheme.primaryHover} transition-colors flex items-center cursor-pointer`}
          disabled={logsLoading}
        >
          {logsLoading ? (
            <Loader className="h-4 w-4 animate-spin" />
          ) : (
            <Eye className="h-4 w-4" />
          )}
          <span className="ml-2">Refresh</span>
        </button>
        <button
          onClick={clearLogs}
          className="px-4 py-2 bg-destructive hover:bg-destructive/80 text-white transition-colors flex items-center rounded-lg cursor-pointer"
        >
          <Trash2 className="h-4 w-4" />
          <span className="ml-2">Clear All</span>
        </button>
      </div>

      <div className="bg-background font-mono text-sm p-4 rounded-lg h-96 overflow-auto">
        <div className="space-y-2">
          {logs.length === 0 ? (
            <p className="text-foreground/80">No logs available</p>
          ) : (
            logs.map((log) => {
              // Determine color based on log level
              let levelColor = "";
              switch (log.level.toLowerCase()) {
                case "error":
                  levelColor = "text-red-500";
                  break;
                case "warning":
                  levelColor = "text-yellow-400";
                  break;
                case "info":
                  levelColor = "text-blue-400";
                  break;
                case "debug":
                  levelColor = "text-gray-400";
                  break;
                default:
                  levelColor = "text-green-400"; // fallback
              }

              return (
                <div key={log.id} className="border-b border-border py-1">
                  <p className={`${levelColor}`}>
                    <span className="font-semibold">[{log.level}]</span>{" "}
                    {log.message}
                  </p>
                  <p className="text-xs text-foreground/60">
                    {new Date(log.created_at).toLocaleString()} — {log.source}
                  </p>
                </div>
              );
            })
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default LogsTab;
