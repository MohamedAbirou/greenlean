import { activityColumns } from "@/pages/admin-dashboard/activities/columns";
import type {
  ActivityFormData,
  ActivityLog,
  DashboardStats,
} from "@/types/dashboard";
import { motion } from "framer-motion";
import { Activity, Check, Flame } from "lucide-react";
import React, { useState } from "react";
import { Line } from "react-chartjs-2";
import { DataTable } from "../data-table/data-table";
import ActivityModal from "../ui/modals/ActivityModal";
import { ConfirmDialog } from "../ui/modals/ConfirmDialog";

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
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

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
      setShowAddModal(false);
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
          onClick={() => setShowAddModal(true)}
        >
          Log Today's Activities
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-background rounded-lg p-4 flex flex-col items-center">
          <Flame className="h-6 w-6 text-red-500 mb-2" />
          <span className="text-foreground/80">Calories Burned</span>
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
          <h4 className="font-semibold mb-2 text-foreground">Steps</h4>
          <Line
            data={chartData("steps")}
            options={{
              plugins: { legend: { display: false } },
              scales: { y: { beginAtZero: true } },
            }}
          />
        </div>
        <div className="bg-background rounded-lg p-4">
          <h4 className="font-semibold mb-2 text-foreground">Duration (min)</h4>
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
          <p className="text-foreground/60">No activity logs yet.</p>
        ) : (
          <DataTable
            columns={activityColumns({
              onEdit: (activity) => {
                openEditModal(activity);
              },
              onDelete: (id) => {
                setDeleteLogId(id);
              },
            })}
            data={activityLogs}
            filterKey="type"
          />
        )}
      </div>

      <ActivityModal
        open={showAddModal}
        onOpenChange={setShowAddModal}
        title="Log Today's Activity"
        formData={logForm}
        setFormData={setLogForm}
        onSubmit={handleLogSubmit}
        loading={saving}
        error={error}
        colorTheme={colorTheme}
      />

      <ActivityModal
        open={showEditModal}
        onOpenChange={setShowEditModal}
        title="Edit Activity"
        formData={editForm}
        setFormData={setEditForm}
        onSubmit={handleEditSubmit}
        loading={saving}
        error={error}
        colorTheme={colorTheme}
      />

      <ConfirmDialog
        open={!!deleteLogId}
        onOpenChange={(open) => {
          if (!open) setDeleteLogId(null);
        }}
        title="Delete Activity"
        description="Are you sure you want to delete this activity log?"
        confirmLabel="Delete"
        cancelLabel="Cancel"
        onConfirm={handleDelete}
        loading={saving}
        error={error}
        destructive
      />
    </motion.div>
  );
};
