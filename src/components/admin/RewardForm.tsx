import type { Reward } from "@/hooks/Queries/useRewards";
import { queryKeys } from "@/lib/queryKeys";
import { supabase } from "@/lib/supabase";
import { createNotification } from "@/services/notificationService";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { ModalDialog } from "../ui/modal-dialog";

interface RewardFormProps {
  userId?: string;
  reward: Reward | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const RewardForm: React.FC<RewardFormProps> = ({
  userId,
  reward,
  open,
  onOpenChange,
}) => {
  const [points, setPoints] = useState(0);
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
          recipient_id: userId || "",
          sender_id: userId || "",
          type: "challenge",
          entity_id: data.id,
          entity_type: "challenge",
          message: `Your reward points have been updated by an admin.`,
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
      onOpenChange(false);
    },

    onError: (err: Error) => {
      console.error("Error updating reward:", err);
      toast.error(err?.message || "Update failed");
    },
  });

  return (
    <ModalDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Edit Rewards"
      size="md"
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          updateRewardMutation.mutate(points);
        }}
        className="space-y-4"
      >
        <div>
          <Label>Points</Label>
          <Input
            type="number"
            value={points}
            onChange={(e) => setPoints(parseInt(e.target.value))}
            min="0"
            required
          />
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button
            variant="outline"
            type="button"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={updateRewardMutation.isPending}>
            {updateRewardMutation.isPending ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </form>
    </ModalDialog>
  );
};

export default RewardForm;
