import { useBadgesQuery } from "@/hooks/Queries/useBadges";
import type { Reward } from "@/hooks/Queries/useRewards";
import { queryKeys } from "@/lib/queryKeys";
import { supabase } from "@/lib/supabase";
import { createNotification } from "@/services/notificationService";
import type { Badge } from "@/types/challenge";
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
  const [selectedBadges, setSelectedBadges] = useState<Badge[]>([]);

  const queryClient = useQueryClient();
  const { data: badges = [] } = useBadgesQuery();

  useEffect(() => {
    if (reward?.badges) {
      setSelectedBadges(reward.badges);
    } else {
      setSelectedBadges([]);
    }
  }, [reward]);

  const updateRewardMutation = useMutation({
    mutationFn: async (payload: {
      points: number;
      badges: Badge[];
    }): Promise<Reward> => {
      const { points, badges } = payload;

      const { data: updatedReward, error } = await supabase
        .from("user_rewards")
        .update({ points, badges, updated_at: new Date().toISOString() })
        .eq("user_id", userId)
        .select(
          `
          *,
          user:profiles(username, full_name, email)`
        )
        .single();

      if (error) throw error;

      // Send notification to user
      if (updatedReward) {
        await createNotification({
          recipient_id: userId || "",
          sender_id: userId || "",
          type: "reward",
          entity_id: updatedReward.id,
          entity_type: "reward",
          message: `Your reward points and badges have been updated by an admin.`,
        });
      }
      return updatedReward;
    },

    onSuccess: (updatedReward) => {
      queryClient.setQueryData<Reward[]>(queryKeys.rewards, (old = []) => {
        const exists = old.some((r) => r.id === updatedReward.id);
        if (exists) {
          return old.map((r) =>
            r.id === updatedReward.id ? updatedReward : r
          );
        } else {
          return [...old, updatedReward]; // add if missing
        }
      });

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
          updateRewardMutation.mutate({ points, badges: selectedBadges });
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

        <div>
          <Label>Badges</Label>
          <div className="flex flex-wrap gap-2 mt-2">
            {badges.map((badge) => {
              const selected = selectedBadges.some((b) => b.id === badge.id);
              return (
                <button
                  key={badge.id}
                  type="button"
                  className={`px-3 py-1 rounded-full text-sm font-medium border ${
                    selected
                      ? "bg-primary text-white"
                      : "bg-card text-foreground"
                  }`}
                  onClick={() => {
                    if (selected) {
                      setSelectedBadges((prev) =>
                        prev.filter((b) => b.id !== badge.id)
                      );
                    } else {
                      setSelectedBadges((prev) => [...prev, badge]);
                    }
                  }}
                >
                  {badge.name}
                </button>
              );
            })}
          </div>
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
