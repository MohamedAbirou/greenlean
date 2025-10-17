import { useAuth } from "@/contexts/useAuth";
import { supabase } from "@/lib/supabase";
import type { ActivityFormData, ActivityLog, DashboardStats } from "@/types/dashboard";
import { logError } from "@/utils/errorLogger";
import { useCallback, useEffect, useMemo, useState } from "react";

export const useLogManager = () => {
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchLogs = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("user_activity_logs")
        .select("*")
        .eq("user_id", user.id)
        .order("activity_date", { ascending: false })
        .limit(30);

      if (data) setActivityLogs(data);

      if (error) {
        console.error("Error fetching activity logs:", error);
        try {
          await logError(
            "error",
            "frontend",
            "Failed to fetch activity logs",
            error.message,
            { userId: user.id }
          );
        } catch (logErr) {
          console.error("Failed to log error:", logErr);
        }
      }
    } catch (err) {
      console.error("Error fetching activity logs:", err);
      const errorMessage = err instanceof Error ? err.stack : String(err);
      try {
        await logError(
          "error",
          "frontend",
          "Exception while fetching activity logs",
          errorMessage,
          { userId: user.id }
        );
      } catch (logErr) {
        console.error("Failed to log error:", logErr);
      }
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const addLog = useCallback(
    async (formData: ActivityFormData) => {
      if (!user) return false;

      setSaving(true);
      setError(null);

      try {
        const { activity_type, duration_minutes, calories_burned, steps, notes } =
          formData;

        const { error } = await supabase.from("user_activity_logs").insert([
          {
            user_id: user.id,
            activity_type,
            duration_minutes: duration_minutes ? Number(duration_minutes) : null,
            calories_burned: calories_burned ? Number(calories_burned) : null,
            steps: steps ? Number(steps) : null,
            notes,
          },
        ]);

        if (error) {
          setError("Failed to log activity. Please try again.");
          try {
            await logError(
              "error",
              "frontend",
              "Failed to log activity",
              error.message,
              { userId: user.id, activityType: activity_type }
            );
          } catch (logErr) {
            console.error("Failed to log error:", logErr);
          }
          return false;
        }

        try {
          await logError(
            "info",
            "frontend",
            "Activity logged successfully",
            undefined,
            { userId: user.id, activityType: activity_type }
          );
        } catch (logErr) {
          console.error("Failed to log info:", logErr);
        }

        await fetchLogs();
        return true;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.stack : String(err);
        setError("Failed to log activity. Please try again.");
        try {
          await logError(
            "error",
            "frontend",
            "Exception while logging activity",
            errorMessage,
            { userId: user.id }
          );
        } catch (logErr) {
          console.error("Failed to log error:", logErr);
        }
        return false;
      } finally {
        setSaving(false);
      }
    },
    [user, fetchLogs]
  );

  const updateLog = useCallback(
    async (logId: string, formData: ActivityFormData) => {
      if (!user) return false;

      setSaving(true);
      setError(null);

      try {
        const { activity_type, duration_minutes, calories_burned, steps, notes } =
          formData;

        const { error } = await supabase
          .from("user_activity_logs")
          .update({
            activity_type,
            duration_minutes: duration_minutes ? Number(duration_minutes) : null,
            calories_burned: calories_burned ? Number(calories_burned) : null,
            steps: steps ? Number(steps) : null,
            notes,
          })
          .eq("id", logId)
          .eq("user_id", user.id);

        if (error) {
          setError("Failed to update activity. Please try again.");
          try {
            await logError(
              "error",
              "frontend",
              "Failed to update activity",
              error.message,
              { userId: user.id, activityId: logId }
            );
          } catch (logErr) {
            console.error("Failed to log error:", logErr);
          }
          return false;
        }

        try {
          await logError(
            "info",
            "frontend",
            "Activity updated successfully",
            undefined,
            { userId: user.id, activityId: logId }
          );
        } catch (logErr) {
          console.error("Failed to log info:", logErr);
        }

        await fetchLogs();
        return true;
      } catch (err) {
        setError("Failed to update activity. Please try again.");
        const errorMessage = err instanceof Error ? err.stack : String(err);
        try {
          await logError(
            "error",
            "frontend",
            "Exception while updating activity",
            errorMessage,
            { userId: user.id, activityId: logId }
          );
        } catch (logErr) {
          console.error("Failed to log error:", logErr);
        }
        return false;
      } finally {
        setSaving(false);
      }
    },
    [user, fetchLogs]
  );

  const deleteLog = useCallback(
    async (logId: string) => {
      if (!user) return false;

      setSaving(true);
      setError(null);

      try {
        const { error } = await supabase
          .from("user_activity_logs")
          .delete()
          .eq("id", logId)
          .eq("user_id", user.id);

        if (error) {
          setError("Failed to delete activity. Please try again.");
          try {
            await logError(
              "error",
              "frontend",
              "Failed to delete activity",
              error.message,
              { userId: user.id, activityId: logId }
            );
          } catch (logErr) {
            console.error("Failed to log error:", logErr);
          }
          return false;
        }

        try {
          await logError(
            "info",
            "frontend",
            "Activity deleted successfully",
            undefined,
            { userId: user.id, activityId: logId }
          );
        } catch (logErr) {
          console.error("Failed to log info:", logErr);
        }

        await fetchLogs();
        return true;
      } catch (err) {
        setError("Failed to delete activity. Please try again.");
        const errorMessage = err instanceof Error ? err.stack : String(err);
        try {
          await logError(
            "error",
            "frontend",
            "Exception while deleting activity",
            errorMessage,
            { userId: user.id, activityId: logId }
          );
        } catch (logErr) {
          console.error("Failed to log error:", logErr);
        }
        return false;
      } finally {
        setSaving(false);
      }
    },
    [user, fetchLogs]
  );

  const dashboardStats = useMemo<DashboardStats>(() => {
    const today = new Date().toISOString().slice(0, 10);
    const todaysLogs = activityLogs.filter((log) => log.activity_date === today);
    const totalCalories = todaysLogs.reduce(
      (sum, l) =>
        sum + (typeof l.calories_burned === "number" ? l.calories_burned : 0),
      0
    );
    const totalSteps = todaysLogs.reduce(
      (sum, l) => sum + (typeof l.steps === "number" ? l.steps : 0),
      0
    );
    const totalDuration = todaysLogs.reduce(
      (sum, l) =>
        sum + (typeof l.duration_minutes === "number" ? l.duration_minutes : 0),
      0
    );

    return {
      today,
      todaysLogs,
      totalCalories,
      totalSteps,
      totalDuration,
    };
  }, [activityLogs]);

  return {
    activityLogs,
    dashboardStats,
    loading,
    saving,
    error,
    addLog,
    updateLog,
    deleteLog,
    fetchLogs,
  };
};
