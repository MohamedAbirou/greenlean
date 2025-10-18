import type { ActivityFormData } from "@/types/dashboard";
import { ModalDialog } from "../modal-dialog";

interface ActivityModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  formData: ActivityFormData;
  setFormData: React.Dispatch<React.SetStateAction<ActivityFormData>>;
  onSubmit: (e: React.FormEvent) => void;
  loading: boolean;
  error: string | null;
  colorTheme: {
    primaryBg: string;
    primaryHover: string;
  };
}

const ActivityModal: React.FC<ActivityModalProps> = ({
  open,
  onOpenChange,
  title,
  formData,
  setFormData,
  onSubmit,
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
    <ModalDialog
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      size="md"
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="block text-foreground mb-1">Activity Type</label>
          <select
            className="w-full p-2 border rounded-lg bg-background text-foreground"
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
          <label className="block text-foreground mb-1">
            Duration (minutes)
          </label>
          <input
            type="number"
            className="w-full p-2 border rounded-lg bg-background text-foreground"
            value={formData.duration_minutes}
            onChange={(e) =>
              setFormData((f) => ({ ...f, duration_minutes: e.target.value }))
            }
            min={0}
          />
        </div>
        <div>
          <label className="block text-foreground mb-1">Calories Burned</label>
          <input
            type="number"
            className="w-full p-2 border rounded-lg bg-background text-foreground"
            value={formData.calories_burned}
            onChange={(e) =>
              setFormData((f) => ({ ...f, calories_burned: e.target.value }))
            }
            min={0}
          />
        </div>
        <div>
          <label className="block text-foreground mb-1">Steps</label>
          <input
            type="number"
            className="w-full p-2 border rounded-lg bg-background text-foreground"
            value={formData.steps}
            onChange={(e) =>
              setFormData((f) => ({ ...f, steps: e.target.value }))
            }
            min={0}
          />
        </div>
        <div>
          <label className="block text-foreground mb-1">Notes</label>
          <textarea
            className="w-full p-2 border rounded-lg bg-background text-foreground"
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
    </ModalDialog>
  );
};

export default ActivityModal;
