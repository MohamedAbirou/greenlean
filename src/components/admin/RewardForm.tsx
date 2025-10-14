import { useMutation, useQueryClient } from "@tanstack/react-query";
import { X } from "lucide-react";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Reward } from "../../hooks/Queries/useRewards";
import { queryKeys } from "../../lib/queryKeys";
import { supabase } from "../../lib/supabase";
import { createNotification } from "../../services/notificationService";

interface RewardFormProps {
  userId: string;
  reward?: Reward;
  onClose: () => void;
}

const RewardForm: React.FC<RewardFormProps> = ({ userId, reward, onClose }) => {
  const [points, setPoints] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (reward) {
      setPoints(reward.points);
    }
  }, [reward]);

  const updateRewardMutation = useMutation({
    mutationFn: async (newPoints: number): Promise<Reward> => {
      const { data, error } = await supabase
        .from("user_rewards")
        .update({ points: newPoints })
        .eq("user_id", userId)
        .select("*, user:profiles(username, full_name, email)")
        .single();

      if (error) throw error;
      // Send notification to user
      if (data) {
        await createNotification({
          recipient_id: userId,
          sender_id: userId,
          type: "challenge",
          entity_id: data.id,
          entity_type: "challenge",
          message: `Your reward points have been updated by an admin.`
        });
      }
      return data;
    },

    onSuccess: (updatedReward) => {
      queryClient.setQueryData<Reward[]>(queryKeys.rewards, (old = []) =>
        old.map((r) =>
          r.user_id === updatedReward.user_id ? updatedReward : r
        )
      );

      toast.success("Reward updated successfully");
      onClose();
    },

    onError: (err: Error) => {
      console.error("Error updating reward:", err);
      toast.error(err?.message || "Update failed");
      setError(err?.message || "Update failed");
    },
  });

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold dark:text-white">Edit Rewards</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 rounded-lg">
            {error}
          </div>
        )}

        <form
          onSubmit={(e) => {
            e.preventDefault();
            updateRewardMutation.mutate(points);
          }}
          className="space-y-4"
        >
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Points
            </label>
            <input
              type="number"
              value={points}
              onChange={(e) => setPoints(parseInt(e.target.value))}
              min="0"
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              required
            />
          </div>

          <div className="flex justify-end space-x-4 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={updateRewardMutation.isPending}
              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
            >
              {updateRewardMutation.isPending ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RewardForm;
