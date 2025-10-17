import type { ActivityFormData, ActivityLog, DashboardStats } from "@/types/dashboard";
import { motion } from "framer-motion";
import { Activity, Check, Edit, Flame, Trash2 } from "lucide-react";
import React, { useState } from "react";
import { Line } from "react-chartjs-2";
import ActivityModal from "../ui/modals/ActivityModal";
import DeleteModal from "../ui/modals/DeleteModal";

interface ProgressSectionProps {
  activityLogs: ActivityLog[];
  dashboardStats: DashboardStats;
  onAddLog: (formData: ActivityFormData) => Promise<boolean>;
  onUpdateLog: (logId: string, formData: ActivityFormData) => Promise<boolean>;
  onDeleteLog: (logId: string) => Promise<boolean>;
  saving: boolean;
  error: string | null;
  colorTheme: {
    primaryBg: string;
    primaryHover: string;
  };
}

export const ProgressSection: React.FC<ProgressSectionProps> = ({
  activityLogs,
  dashboardStats,
  onAddLog,
  onUpdateLog,
  onDeleteLog,
  saving,
  error,
  colorTheme,
}) => {
  const [showLogModal, setShowLogModal] = useState(false);
  const [editLog, setEditLog] = useState<ActivityLog | null>(null);
  const [deleteLogId, setDeleteLogId] = useState<string | null>(null);

  const [logForm, setLogForm] = useState<ActivityFormData>({
    activity_type: "Workout",
    duration_minutes: "",
    calories_burned: "",
    steps: "",
    notes: "",
  });

  const [editForm, setEditForm] = useState<ActivityFormData>({
    activity_type: "Workout",
    duration_minutes: "",
    calories_burned: "",
    steps: "",
    notes: "",
  });

  const { totalCalories, totalSteps, totalDuration } = dashboardStats;

  const handleLogSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await onAddLog(logForm);
    if (success) {
      setShowLogModal(false);
      setLogForm({
        activity_type: "Workout",
        duration_minutes: "",
        calories_burned: "",
        steps: "",
        notes: "",
      });
    }
  };

  const openEditModal = (log: ActivityLog) => {
    setEditLog(log);
    setEditForm({
      activity_type: log.activity_type,
      duration_minutes: log.duration_minutes?.toString() || "",
      calories_burned: log.calories_burned?.toString() || "",
      steps: log.steps?.toString() || "",
      notes: log.notes || "",
    });
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editLog) return;
    const success = await onUpdateLog(editLog.id, editForm);
    if (success) {
      setEditLog(null);
    }
  };

  const handleDelete = async () => {
    if (!deleteLogId) return;
    const success = await onDeleteLog(deleteLogId);
    if (success) {
      setDeleteLogId(null);
    }
  };

  const chartLabels = Array.from(
    new Set(activityLogs.map((l) => l.activity_date))
  )
    .reverse()
    .slice(-14);

  const chartData = (field: keyof ActivityLog) => ({
    labels: chartLabels,
    datasets: [
      {
        label:
          field === "calories_burned"
            ? "Calories"
            : field === "steps"
            ? "Steps"
            : "Duration (min)",
        data: chartLabels.map((date) => {
          return activityLogs
            .filter((l) => l.activity_date === date)
            .reduce((sum, l) => sum + Number(l[field] || 0), 0);
        }),
        fill: false,
        borderColor:
          field === "calories_burned"
            ? "#ef4444"
            : field === "steps"
            ? "#8b5cf6"
            : "#22c55e",
        backgroundColor:
          field === "calories_burned"
            ? "#fee2e2"
            : field === "steps"
            ? "#ede9fe"
            : "#bbf7d0",
        tension: 0.3,
      },
    ],
  });

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <h2 className="text-2xl font-bold text-foreground mb-6">
        Track Your Progress
      </h2>
      <div className="text-center py-6">
        <p className="text-foreground/80 mb-4">
          Log your daily activities to visualize your journey!
        </p>
        <button
          className={`px-6 py-3 ${colorTheme.primaryBg} hover:${colorTheme.primaryHover} text-white font-medium rounded-full transition-colors`}
          onClick={() => setShowLogModal(true)}
        >
          Log Today's Activities
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-background rounded-lg p-4 flex flex-col items-center">
          <Flame className="h-6 w-6 text-red-500 mb-2" />
          <span className="text-foreground/80">
            Calories Burned
          </span>
          <span className="text-2xl font-bold text-foreground">
            {totalCalories} kcal
          </span>
        </div>
        <div className="bg-background rounded-lg p-4 flex flex-col items-center">
          <Activity className="h-6 w-6 text-purple-500 mb-2" />
          <span className="text-foreground/80">Steps</span>
          <span className="text-2xl font-bold text-foreground">
            {totalSteps}
          </span>
        </div>
        <div className="bg-background rounded-lg p-4 flex flex-col items-center">
          <Check className="h-6 w-6 text-green-500 mb-2" />
          <span className="text-foreground/80">Duration</span>
          <span className="text-2xl font-bold text-foreground">
            {totalDuration} min
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-background rounded-lg p-4">
          <h4 className="font-semibold mb-2 text-foreground">
            Calories Burned
          </h4>
          <Line
            data={chartData("calories_burned")}
            options={{
              plugins: { legend: { display: false } },
              scales: { y: { beginAtZero: true } },
            }}
          />
        </div>
        <div className="bg-background rounded-lg p-4">
          <h4 className="font-semibold mb-2 text-foreground">
            Steps
          </h4>
          <Line
            data={chartData("steps")}
            options={{
              plugins: { legend: { display: false } },
              scales: { y: { beginAtZero: true } },
            }}
          />
        </div>
        <div className="bg-background rounded-lg p-4">
          <h4 className="font-semibold mb-2 text-foreground">
            Duration (min)
          </h4>
          <Line
            data={chartData("duration_minutes")}
            options={{
              plugins: { legend: { display: false } },
              scales: { y: { beginAtZero: true } },
            }}
          />
        </div>
      </div>

      <div className="mb-8">
        <h3 className="text-xl font-semibold text-foreground mb-4">
          Recent Activity Logs
        </h3>
        {activityLogs.length === 0 ? (
          <p className="text-foreground/60">
            No activity logs yet.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-card">
              <thead>
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-foreground/80 uppercase">
                    Date
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-foreground/80 uppercase">
                    Type
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-foreground/80 uppercase">
                    Duration
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-foreground/80 uppercase">
                    Calories
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-foreground/80 uppercase">
                    Steps
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-foreground/80 uppercase">
                    Notes
                  </th>
                  <th className="px-4 py-2"></th>
                </tr>
              </thead>
              <tbody>
                {activityLogs.map((log) => (
                  <tr key={log.id} className="bg-background">
                    <td className="px-4 truncate py-2 text-sm text-foreground">
                      {log.activity_date}
                    </td>
                    <td className="px-4 py-2 text-sm text-foreground">
                      {log.activity_type}
                    </td>
                    <td className="px-4 py-2 text-sm text-foreground">
                      {log.duration_minutes || "-"}
                    </td>
                    <td className="px-4 py-2 text-sm text-foreground">
                      {log.calories_burned || "-"}
                    </td>
                    <td className="px-4 py-2 text-sm text-foreground">
                      {log.steps || "-"}
                    </td>
                    <td className="px-4 py-2 text-sm text-foreground truncate">
                      {log.notes || "-"}
                    </td>
                    <td className="flex px-4 py-2 gap-2">
                      <button
                        onClick={() => openEditModal(log)}
                        className="text-blue-500 hover:text-blue-700 cursor-pointer"
                      >
                        <Edit className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => setDeleteLogId(log.id)}
                        className="text-red-500 hover:text-red-700 cursor-pointer"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showLogModal && (
        <ActivityModal
          title="Log Today's Activity"
          formData={logForm}
          setFormData={setLogForm}
          onSubmit={handleLogSubmit}
          onClose={() => setShowLogModal(false)}
          loading={saving}
          error={error}
          colorTheme={colorTheme}
        />
      )}

      {editLog && (
        <ActivityModal
          title="Edit Activity"
          formData={editForm}
          setFormData={setEditForm}
          onSubmit={handleEditSubmit}
          onClose={() => setEditLog(null)}
          loading={saving}
          error={error}
          colorTheme={colorTheme}
        />
      )}

      {deleteLogId && (
        <DeleteModal
          onConfirm={handleDelete}
          onClose={() => setDeleteLogId(null)}
          loading={saving}
          error={error}
        />
      )}
    </motion.div>
  );
};