import { motion } from "framer-motion";
import { Activity, Check, Edit, Flame, Trash2, X } from "lucide-react";
import React, { useState } from "react";
import { Line } from "react-chartjs-2";
import { ActivityLog, ActivityFormData, DashboardStats } from "../../types/dashboard";

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
      <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
        Track Your Progress
      </h2>
      <div className="text-center py-6">
        <p className="text-gray-600 dark:text-gray-300 mb-4">
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
        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 flex flex-col items-center">
          <Flame className="h-6 w-6 text-red-500 mb-2" />
          <span className="text-gray-600 dark:text-gray-300">
            Calories Burned
          </span>
          <span className="text-2xl font-bold text-gray-800 dark:text-white">
            {totalCalories} kcal
          </span>
        </div>
        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 flex flex-col items-center">
          <Activity className="h-6 w-6 text-purple-500 mb-2" />
          <span className="text-gray-600 dark:text-gray-300">Steps</span>
          <span className="text-2xl font-bold text-gray-800 dark:text-white">
            {totalSteps}
          </span>
        </div>
        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 flex flex-col items-center">
          <Check className="h-6 w-6 text-green-500 mb-2" />
          <span className="text-gray-600 dark:text-gray-300">Duration</span>
          <span className="text-2xl font-bold text-gray-800 dark:text-white">
            {totalDuration} min
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
          <h4 className="font-semibold mb-2 text-gray-800 dark:text-white">
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
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
          <h4 className="font-semibold mb-2 text-gray-800 dark:text-white">
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
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
          <h4 className="font-semibold mb-2 text-gray-800 dark:text-white">
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
        <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
          Recent Activity Logs
        </h3>
        {activityLogs.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400">
            No activity logs yet.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead>
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                    Date
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                    Type
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                    Duration
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                    Calories
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                    Steps
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                    Notes
                  </th>
                  <th className="px-4 py-2"></th>
                </tr>
              </thead>
              <tbody>
                {activityLogs.map((log) => (
                  <tr key={log.id} className="bg-white dark:bg-gray-800">
                    <td className="px-4 py-2 text-sm text-gray-700 dark:text-gray-200">
                      {log.activity_date}
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-700 dark:text-gray-200">
                      {log.activity_type}
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-700 dark:text-gray-200">
                      {log.duration_minutes || "-"}
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-700 dark:text-gray-200">
                      {log.calories_burned || "-"}
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-700 dark:text-gray-200">
                      {log.steps || "-"}
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-700 dark:text-gray-200">
                      {log.notes || "-"}
                    </td>
                    <td className="px-4 py-2 flex gap-2">
                      <button
                        onClick={() => openEditModal(log)}
                        className="text-blue-500 hover:text-blue-700"
                      >
                        <Edit className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => setDeleteLogId(log.id)}
                        className="text-red-500 hover:text-red-700"
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
        <DeleteConfirmationModal
          onConfirm={handleDelete}
          onClose={() => setDeleteLogId(null)}
          loading={saving}
          error={error}
        />
      )}
    </motion.div>
  );
};

interface ActivityModalProps {
  title: string;
  formData: ActivityFormData;
  setFormData: React.Dispatch<React.SetStateAction<ActivityFormData>>;
  onSubmit: (e: React.FormEvent) => void;
  onClose: () => void;
  loading: boolean;
  error: string | null;
  colorTheme: {
    primaryBg: string;
    primaryHover: string;
  };
}

const ActivityModal: React.FC<ActivityModalProps> = ({
  title,
  formData,
  setFormData,
  onSubmit,
  onClose,
  loading,
  error,
  colorTheme,
}) => {
  const activityTypes = [
    "Workout",
    "Steps",
    "Cardio",
    "Yoga",
    "Swimming",
    "Cycling",
    "Running",
    "Walking",
    "Meditation",
    "Other",
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-8 w-full max-w-md relative">
        <button
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
          onClick={onClose}
        >
          <X className="h-6 w-6" />
        </button>
        <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-6">
          {title}
        </h2>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-700 dark:text-gray-200 mb-1">
              Activity Type
            </label>
            <select
              className="w-full p-2 border rounded-lg bg-white dark:bg-gray-800 dark:text-white"
              value={formData.activity_type}
              onChange={(e) =>
                setFormData((f) => ({ ...f, activity_type: e.target.value }))
              }
              required
            >
              {activityTypes.map((type) => (
                <option key={type}>{type}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-gray-700 dark:text-gray-200 mb-1">
              Duration (minutes)
            </label>
            <input
              type="number"
              className="w-full p-2 border rounded-lg bg-white dark:bg-gray-800 dark:text-white"
              value={formData.duration_minutes}
              onChange={(e) =>
                setFormData((f) => ({ ...f, duration_minutes: e.target.value }))
              }
              min={0}
            />
          </div>
          <div>
            <label className="block text-gray-700 dark:text-gray-200 mb-1">
              Calories Burned
            </label>
            <input
              type="number"
              className="w-full p-2 border rounded-lg bg-white dark:bg-gray-800 dark:text-white"
              value={formData.calories_burned}
              onChange={(e) =>
                setFormData((f) => ({ ...f, calories_burned: e.target.value }))
              }
              min={0}
            />
          </div>
          <div>
            <label className="block text-gray-700 dark:text-gray-200 mb-1">
              Steps
            </label>
            <input
              type="number"
              className="w-full p-2 border rounded-lg bg-white dark:bg-gray-800 dark:text-white"
              value={formData.steps}
              onChange={(e) =>
                setFormData((f) => ({ ...f, steps: e.target.value }))
              }
              min={0}
            />
          </div>
          <div>
            <label className="block text-gray-700 dark:text-gray-200 mb-1">
              Notes
            </label>
            <textarea
              className="w-full p-2 border rounded-lg bg-white dark:bg-gray-800 dark:text-white"
              value={formData.notes}
              onChange={(e) =>
                setFormData((f) => ({ ...f, notes: e.target.value }))
              }
              rows={2}
            />
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button
            type="submit"
            className={`w-full py-2 ${colorTheme.primaryBg} hover:${colorTheme.primaryHover} text-white font-semibold rounded-lg transition-colors`}
            disabled={loading}
          >
            {loading ? "Saving..." : "Save Activity"}
          </button>
        </form>
      </div>
    </div>
  );
};

interface DeleteConfirmationModalProps {
  onConfirm: () => void;
  onClose: () => void;
  loading: boolean;
  error: string | null;
}

const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({
  onConfirm,
  onClose,
  loading,
  error,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-8 w-full max-w-sm relative">
        <button
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
          onClick={onClose}
        >
          <X className="h-6 w-6" />
        </button>
        <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-6">
          Delete Activity
        </h2>
        <p className="mb-6 text-gray-700 dark:text-gray-300">
          Are you sure you want to delete this activity log?
        </p>
        {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
        <div className="flex gap-4">
          <button
            className="flex-1 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded-lg"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </button>
          <button
            className="flex-1 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg"
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
};
