import { DataTable } from "@/components/data-table/data-table";
import { useChallengesQuery } from "@/hooks/Queries/useChallenges";
import { supabase } from "@/lib/supabase";
import { challengeColumns } from "@/pages/admin-dashboard/challenges/columns";
import { createNotification } from "@/services/notificationService";
import type { Challenge } from "@/types/challenge";
import type { ColorTheme } from "@/utils/colorUtils";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader, Plus } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { Button } from "../ui/button";
import { ConfirmDialog } from "../ui/modals/ConfirmDialog";
import ChallengeForm from "./ChallengeForm";

interface ChallengesTabProps {
  userId: string | undefined;
  colorTheme: ColorTheme;
}

const ChallengesTab: React.FC<ChallengesTabProps> = ({
  colorTheme,
  userId,
}) => {
  const [searchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState(searchTerm);
  const [showForm, setShowForm] = useState(false);
  const [editingChallenge, setEditingChallenge] = useState<Challenge | null>(
    null
  );
  const [deleteChallengeId, setDeleteChallengeId] = useState<string | null>(
    null
  );
  const [confirmOpen, setConfirmOpen] = useState(false);

  const queryClient = useQueryClient();
  const { data: challenges = [], isLoading } = useChallengesQuery(userId);
  const { data: badgesData = [] } = useQuery({
    queryKey: ["badges"],
    queryFn: async () => {
      const { data, error } = await supabase.from("badges").select("*");
      if (error) throw error;
      return data;
    },
  });

  // debounce search
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchTerm), 250);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  //* --- MUTATIONS ---
  const createMutation = useMutation({
    mutationFn: async (data: Partial<Challenge>) => {
      const { data: inserted, error } = await supabase
        .from("challenges")
        .insert([data])
        .select("*")
        .single();

      if (error) throw error;

      //* notify participants
      const { data: participants } = await supabase
        .from("challenge_participants")
        .select("user_id")
        .eq("challenge_id", inserted.id);

      if (participants?.length) {
        await Promise.all(
          participants.map((p) =>
            createNotification({
              recipient_id: p.user_id,
              sender_id: userId ?? "",
              type: "challenge",
              entity_id: inserted.id,
              entity_type: "challenge",
              message: `A new challenge "${inserted.title}" has been created.`,
            })
          )
        );
      }

      return inserted;
    },
    onSuccess: (inserted) => {
      queryClient.setQueryData<Challenge[]>(["challenges"], (old = []) => [
        ...old,
        inserted,
      ]);
      setShowForm(false);
      toast.success("Challenge created successfully!");
    },
    onError: (err) => toast.error(err.message || "Failed to create challenge"),
  });

  const updateMutation = useMutation({
    mutationFn: async (data: Partial<Challenge>) => {
      if (!editingChallenge?.id) throw new Error("No challenge selected");

      //* Fetch participants
      const { data: participants } = await supabase
        .from("challenge_participants")
        .select("*")
        .eq("challenge_id", editingChallenge.id);

      //* Update challenge
      const { error } = await supabase
        .from("challenges")
        .update(data)
        .eq("id", editingChallenge.id);

      if (error) throw error;

      //* Handle participants if target or points changed
      if (participants?.length) {
        await Promise.all(
          participants.map(async (p) => {
            const newTarget =
              data.requirements?.target ?? editingChallenge.requirements.target;
            const newPoints = data.points ?? editingChallenge.points;

            let completed = p.completed;
            let awardPoints = 0;

            //* Auto-complete if new target met
            if (!p.completed && p.progress.current >= newTarget) {
              completed = true;
              awardPoints = newPoints;

              await supabase
                .from("challenge_participants")
                .update({
                  completed,
                  completion_date: new Date().toISOString(),
                })
                .eq("challenge_id", editingChallenge.id)
                .eq("user_id", p.user_id);
            }

            //* Award points if completing now
            if (awardPoints > 0) {
              const { data: currentRewards } = await supabase
                .from("user_rewards")
                .select("points, badges")
                .eq("user_id", p.user_id)
                .maybeSingle();

              if (currentRewards) {
                await supabase
                  .from("user_rewards")
                  .update({ points: currentRewards.points + awardPoints })
                  .eq("user_id", p.user_id);
              }

              // Notify participant
              await createNotification({
                recipient_id: p.user_id,
                sender_id: userId ?? "",
                type: "challenge",
                entity_id: editingChallenge.id,
                entity_type: "challenge",
                message: `Your challenge "${editingChallenge.title}" progress has been updated and completed!`,
              });
            } else if (data.title || data.description || data.points) {
              // Notify participants for other changes
              await createNotification({
                recipient_id: p.user_id,
                sender_id: userId ?? "",
                type: "challenge",
                entity_id: editingChallenge.id,
                entity_type: "challenge",
                message: `The challenge "${editingChallenge.title}" has been updated.`,
              });
            }
          })
        );
      }

      return { id: editingChallenge.id, data };
    },
    onSuccess: ({ id, data }) => {
      queryClient.setQueryData<Challenge[]>(["challenges"], (old = []) =>
        old.map((c) => (c.id === id ? { ...c, ...data } : c))
      );
      toast.success("Challenge updated successfully!");
      setShowForm(false);
      setEditingChallenge(null);
    },
    onError: (err) => toast.error(err.message || "Failed to update challenge"),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { data: participants } = await supabase
        .from("challenge_participants")
        .select("user_id, completed")
        .eq("challenge_id", id);

      if (participants && participants.length > 0) {
        // Archive instead of deleting
        const { error } = await supabase
          .from("challenges")
          .update({ is_active: false })
          .eq("id", id);
        if (error) throw error;

        // Notify participants
        await Promise.all(
          participants.map((p) =>
            createNotification({
              recipient_id: p.user_id,
              sender_id: userId ?? "",
              type: "challenge",
              entity_id: id,
              entity_type: "challenge",
              message: `The challenge you participated in "${id}" has been archived.`,
            })
          )
        );

        return { archived: true };
      }

      // No participants → safe to delete
      const { error } = await supabase.from("challenges").delete().eq("id", id);
      if (error) throw error;

      return { archived: false };
    },
    onSuccess: (res) => {
      if (res.archived) {
        toast.success(
          "Challenge has participants, it was archived instead of deleted."
        );
      } else {
        queryClient.setQueryData<Challenge[]>(["challenges"], (old = []) =>
          old.filter((c) => c.id !== deleteChallengeId)
        );
        toast.success("Challenge deleted successfully!");
      }
    },
    onError: (err) => toast.error(err.message || "Failed to delete challenge"),
  });

  // --- FILTERED CHALLENGES ---
  const filteredChallenges = useMemo(() => {
    const s = debouncedSearch.toLowerCase();
    return challenges.filter(
      (c) =>
        c.title?.toLowerCase().includes(s) ||
        c.description?.toLowerCase().includes(s)
    );
  }, [challenges, debouncedSearch]);

  // --- LOADING STATE ---
  if (isLoading) {
    return (
      <div className="min-h-screen pt-24 pb-16 flex items-center justify-center">
        <Loader className={`h-8 w-8 animate-spin ${colorTheme.primaryText}`} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 justify-between items-center">
        <h2 className="text-2xl font-bold text-foreground">
          Challenge Management
        </h2>
        <Button
          onClick={() => setShowForm(true)}
          className={`w-full sm:w-fit ${colorTheme.primaryBg} text-white flex items-center`}
        >
          <Plus className="h-5 w-5 mr-2" />
          Create Challenge
        </Button>
      </div>

      {/* Table */}
      <div className="bg-background shadow-md overflow-x-auto">
        <DataTable
          columns={challengeColumns({
            onEdit: (challenge) => {
              setEditingChallenge(challenge);
              setShowForm(true);
            },
            cellClassName: "flex items-center justify-center w-1/2",
            onDelete: (challengeId) => {
              setDeleteChallengeId(challengeId);
              setConfirmOpen(true);
            },
          })}
          data={filteredChallenges}
          filterKey="title"
        />
        <ChallengeForm
          open={showForm}
          badges={badgesData}
          challenge={editingChallenge}
          onSubmit={
            editingChallenge
              ? (data) => updateMutation.mutate(data)
              : (data) => createMutation.mutate(data)
          }
          onOpenChange={(open) => {
            setShowForm(open);
            setEditingChallenge(null);
          }}
          colorTheme={colorTheme}
        />

        <ConfirmDialog
          open={confirmOpen}
          onOpenChange={(open) => {
            setConfirmOpen(open);
            if (!open) setDeleteChallengeId(null);
          }}
          title="Delete Challenge"
          description="Are you sure you want to delete this challenge? This action cannot be undone."
          confirmLabel="Delete"
          cancelLabel="Cancel"
          destructive
          loading={deleteChallengeId ? deleteMutation.isPending : false}
          onConfirm={() => {
            if (deleteChallengeId) {
              deleteMutation.mutate(deleteChallengeId);
              setConfirmOpen(false);
            }
          }}
        />
      </div>
    </div>
  );
};

export default ChallengesTab;
