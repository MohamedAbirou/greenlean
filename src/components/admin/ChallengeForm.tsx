import { X } from "lucide-react";
import React, { useEffect, useState } from "react";
import { ColorTheme } from "../../utils/colorUtils";

interface ChallengeRequirements {
  activity?: string;
  target: number;
  weekly_sessions?: number;
}

interface Challenge {
  id: string;
  title: string;
  description: string;
  type: "daily" | "weekly" | "streak" | "goal";
  difficulty: "beginner" | "intermediate" | "advanced";
  points: number;
  requirements: ChallengeRequirements;
  start_date: string;
  end_date: string;
  is_active: boolean;
}

interface ChallengeFormProps {
  challenge?: Challenge | null;
  onSubmit: (data: Partial<Challenge>) => void;
  onClose: () => void;
  colorTheme: ColorTheme;
}

const ChallengeForm: React.FC<ChallengeFormProps> = ({
  challenge,
  onSubmit,
  onClose,
  colorTheme
}) => {
  const [requirementsJson, setRequirementsJson] = useState("");
  const [jsonError, setJsonError] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<Challenge>>({
    title: "",
    description: "",
    type: "daily",
    difficulty: "beginner",
    points: 0,
    requirements: {
      target: 0,
    },
    start_date: new Date().toISOString().split("T")[0],
    end_date: new Date().toISOString().split("T")[0],
    is_active: true,
  });

  useEffect(() => {
    if (challenge) {
      setFormData({
        ...challenge,
        start_date: new Date(challenge.start_date).toISOString().split("T")[0],
        end_date: new Date(challenge.end_date).toISOString().split("T")[0],
      });
      // Initialize the JSON textarea with pretty-printed JSON
      setRequirementsJson(JSON.stringify(challenge.requirements, null, 2));
    } else {
      // Initialize with default empty requirements
      setRequirementsJson(JSON.stringify({ target: 0 }, null, 2));
    }
  }, [challenge]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleRequirementsChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    const rawValue = e.target.value;
    setRequirementsJson(rawValue);

    try {
      const parsed = JSON.parse(rawValue);
      setFormData((prev) => ({
        ...prev,
        requirements: parsed,
      }));
      setJsonError(null);
    } catch (error) {
      setJsonError("Invalid JSON format");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const payload: Partial<Challenge> = {
      title: formData.title,
      description: formData.description,
      type: formData.type,
      difficulty: formData.difficulty,
      points: formData.points,
      requirements: formData.requirements,
      start_date: formData.start_date,
      end_date: formData.end_date,
      is_active: formData.is_active,
    };

    onSubmit(payload);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold dark:text-white">
            {challenge ? "Edit Challenge" : "Create Challenge"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Title
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Type
              </label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                required
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="streak">Streak</option>
                <option value="goal">Goal</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Difficulty
              </label>
              <select
                name="difficulty"
                value={formData.difficulty}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                required
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Points
              </label>
              <input
                type="number"
                name="points"
                value={formData.points}
                onChange={handleChange}
                min="0"
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Target
              </label>
              <input
                type="number"
                name="target"
                value={challenge?.requirements?.target}
                disabled
                min="0"
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Requirements (JSON)
            </label>
            <textarea
              name="requirements"
              value={requirementsJson}
              onChange={handleRequirementsChange}
              rows={8}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-mono text-sm"
              placeholder={`Example:\n{\n  "activity": "cardio",\n  "target": 3,\n  "weekly_sessions": 3\n}`}
            />
            {jsonError && (
              <p className="text-red-500 text-sm mt-1">{jsonError}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Start Date
              </label>
              <input
                type="date"
                name="start_date"
                value={formData.start_date}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                End Date
              </label>
              <input
                type="date"
                name="end_date"
                value={formData.end_date}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                required
              />
            </div>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              name="is_active"
              checked={formData.is_active}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  is_active: e.target.checked,
                }))
              }
              className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
            />
            <label className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
              Active Challenge
            </label>
          </div>

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`px-4 py-2 ${colorTheme.primaryBg} text-white rounded-lg hover:${colorTheme.primaryBg}`}
            >
              {challenge ? "Update Challenge" : "Create Challenge"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChallengeForm;
