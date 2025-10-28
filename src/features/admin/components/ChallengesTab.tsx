import { AdminService } from "@/features/admin";
import { supabase } from "@/lib/supabase/client";
import { challengeColumns } from "@/pages/admin-dashboard/challenges/columns";
import { createNotification } from "@/services/notificationService";
import { DataTable } from "@/shared/components/data-table/data-table";
import { useBadgesQuery } from "@/shared/hooks/Queries/useBadges";
import { useChallengesQuery } from "@/shared/hooks/Queries/useChallenges";
import type { Challenge } from "@/shared/types/challenge";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader, Plus } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { ConfirmDialog } from "../../../shared/components/feedback/ConfirmDialog";
import { Button } from "../../../shared/components/ui/button";
import ChallengeForm from "./ChallengeForm";

interface ChallengesTabProps {
  userId: string | undefined;
}

const ChallengesTab: React.FC<ChallengesTabProps> = ({
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
  const { data: challenges = [], isLoading, refetch: refetchChallenges } = useChallengesQuery(userId);
  const { data: badges = [] } = useBadgesQuery();

  // debounce search
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchTerm), 250);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  //* --- MUTATIONS ---
  const createMutation = useMutation({
    mutationFn: async (data: Partial<Challenge>) => {
      return AdminService.createChallenge(data, userId ?? "");
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
      await AdminService.updateChallenge(editingChallenge.id, data);

      // (Optional) you can return the updated data if you like
      return { editingChallenge, data };
    },

    onSuccess: async ({ editingChallenge, data }) => {
      // Update local React Query cache so UI reflects changes
      queryClient.setQueryData<Challenge[]>(["challenges"], (old = []) =>
        old.map((c) => (c.id === editingChallenge.id ? { ...c, ...data } : c))
      );

      // Optionally: fetch participants if you want to send notifications
      const { data: participants, error: fetchErr } = await supabase
        .from("challenge_participants")
        .select("user_id, challenge_id")
        .eq("challenge_id", editingChallenge.id);

      if (fetchErr)
        console.warn(
          "Couldn't fetch participants for notifications:",
          fetchErr
        );

      // 🔔 Notify participants (frontend side — transaction already done)
      if (participants?.length) {
        for (const p of participants) {
          await createNotification({
            recipient_id: p.user_id,
            sender_id: userId ?? "",
            type: "challenge",
            entity_id: editingChallenge.id,
            entity_type: "challenge",
            message: `The challenge "${
              data.title ?? editingChallenge.title
            }" has been updated.`,
          });
        }
      }

      toast.success("Challenge updated successfully!");
      setShowForm(false);
      setEditingChallenge(null);
      refetchChallenges()
    },

    onError: (err) => {
      console.error(err);
      toast.error(err.message || "Failed to update challenge");
    },
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
        <Loader className="h-8 w-8 animate-spin text-primary" />
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
          className="w-full sm:w-fit bg-primary text-white flex items-center"
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
          badges={badges}
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
