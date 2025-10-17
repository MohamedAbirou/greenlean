import { DataTable } from "@/components/data-table/data-table";
import { useChallengesQuery } from "@/hooks/Queries/useChallenges";
import { supabase } from "@/lib/supabase";
import { challengeColumns } from "@/pages/admin-dashboard/challenges/columns";
import { createNotification } from "@/services/notificationService";
import type { Challenge } from "@/types/challenge";
import type { ColorTheme } from "@/utils/colorUtils";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader, Plus } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import ChallengeForm from "./ChallengeForm";

interface ChallengesTabProps {
  userId: string | undefined;
  colorTheme: ColorTheme;
}

const ChallengesTab: React.FC<ChallengesTabProps> = ({
  colorTheme,
  userId,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState(searchTerm);
  const [showForm, setShowForm] = useState(false);
  const [editingChallenge, setEditingChallenge] = useState<Challenge | null>(
    null
  );
  setSearchTerm("");

  const queryClient = useQueryClient();
  const { data: challenges = [], isLoading } = useChallengesQuery();

  // debounce search
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchTerm), 250);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // --- MUTATIONS ---
  const createMutation = useMutation({
    mutationFn: async (data: Partial<Challenge>) => {
      const { data: inserted, error } = await supabase
        .from("challenges")
        .insert([data])
        .select("*")
        .single();

      if (error) throw error;

      // notify participants
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

      const { error } = await supabase
        .from("challenges")
        .update(data)
        .eq("id", editingChallenge.id);

      if (error) throw error;

      // notify participants
      const { data: participants } = await supabase
        .from("challenge_participants")
        .select("user_id")
        .eq("challenge_id", editingChallenge.id);

      if (participants?.length) {
        await Promise.all(
          participants.map((p) =>
            createNotification({
              recipient_id: p.user_id,
              sender_id: userId ?? "",
              type: "challenge",
              entity_id: editingChallenge.id,
              entity_type: "challenge",
              message: `The challenge "${editingChallenge.title}" has been updated.`,
            })
          )
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
        .select("user_id")
        .eq("challenge_id", id);

      const { error } = await supabase.from("challenges").delete().eq("id", id);
      if (error) throw error;

      if (participants?.length) {
        await Promise.all(
          participants.map((p) =>
            createNotification({
              recipient_id: p.user_id,
              sender_id: userId ?? "",
              type: "challenge",
              entity_id: id,
              entity_type: "challenge",
              message: `A challenge you participated in has been deleted.`,
            })
          )
        );
      }

      return id;
    },
    onSuccess: (id) => {
      queryClient.setQueryData<Challenge[]>(["challenges"], (old = []) =>
        old.filter((c) => c.id !== id)
      );
      toast.success("Challenge deleted successfully!");
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
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-foreground">
          Challenge Management
        </h2>
        <button
          onClick={() => setShowForm(true)}
          className={`px-4 py-2 ${colorTheme.primaryBg} text-white rounded-lg flex items-center`}
        >
          <Plus className="h-5 w-5 mr-2" />
          Create Challenge
        </button>
      </div>

      {/* Table */}
      <div className="bg-background rounded-xl shadow-md overflow-x-auto">
        <DataTable
          columns={challengeColumns({
            onEdit: (challenge) => {
              setEditingChallenge(challenge);
              setShowForm(true);
            },
            cellClassName: "flex items-center justify-center w-1/2",
            onDelete: (id) => deleteMutation.mutate(id),
          })}
          data={filteredChallenges}
          filterKey="title"
        />
        <ChallengeForm
          open={showForm}
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
      </div>
    </div>
  );
};

export default ChallengesTab;
