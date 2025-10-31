import { supabase } from "@/lib/supabase/client";
import { badgeColumns } from "@/pages/admin-dashboard/badges/columns";
import { useBadgesQuery } from "@/shared/hooks/Queries/useBadges";
import type { Badge } from "@/shared/types/challenge";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { DataTable } from "../../../shared/components/data-table/data-table";
import { ConfirmDialog } from "../../../shared/components/feedback/ConfirmDialog";
import { Button } from "../../../shared/components/ui/button";
import BadgeForm from "./BadgeForm";

const BadgesTab = () => {
  const [showForm, setShowForm] = useState(false);
  const [editingBadge, setEditingBadge] = useState<Badge | null>(null);
  const [deleteBadgeId, setDeleteBadgeId] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const queryClient = useQueryClient();

  const { data: badges = [], isLoading } = useBadgesQuery();

  //* --- MUTATIONS ---  
  const createMutation = useMutation({
    mutationFn: async (data: Partial<Badge>) => {
      const { data: inserted, error } = await supabase
        .from("badges")
        .insert([data])
        .select("*")
        .single();
      if (error) throw error;
      return inserted;
    },
    onSuccess: (inserted) => {
      queryClient.setQueryData<Badge[]>(["badges"], (old = []) => [...old, inserted]);
      setShowForm(false);
      toast.success("Badge created successfully!");
    },
    onError: (err) => toast.error(err.message || "Failed to create badge"),
  });

  const updateMutation = useMutation({
    mutationFn: async (data: Partial<Badge>) => {
      if (!editingBadge?.id) throw new Error("No badge selected");
      const { error } = await supabase.from("badges").update(data).eq("id", editingBadge.id);
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData<Badge[]>(["badges"], (old = []) =>
        old.map((b) => (b.id === editingBadge?.id ? { ...b, ...data } : b))
      );
      setEditingBadge(null);
      setShowForm(false);
      toast.success("Badge updated successfully!");
    },
    onError: (err) => toast.error(err.message || "Failed to update badge"),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("badges").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.setQueryData<Badge[]>(["badges"], (old = []) =>
        old.filter((b) => b.id !== deleteBadgeId)
      );
      toast.success("Badge deleted successfully!");
      setDeleteBadgeId(null);
    },
    onError: (err) => toast.error(err.message || "Failed to delete badge"),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 justify-between items-center">
        <h2 className="text-2xl font-bold">Badge Management</h2>
        <Button onClick={() => setShowForm(true)} className="w-full sm:w-fit flex items-center">
          <Plus className="mr-2" /> Create Badge
        </Button>
      </div>

      <DataTable
        columns={badgeColumns({
          onEdit: (badge) => {
            setEditingBadge(badge);
            setShowForm(true);
          },
          onDelete: (id) => {
            setDeleteBadgeId(id);
            setConfirmOpen(true);
          },
        })}
        data={badges}
        filterKey="name"
      />

      <BadgeForm
        open={showForm}
        badge={editingBadge}
        onOpenChange={(open) => {
          setShowForm(open);
          setEditingBadge(null);
        }}
        onSubmit={(data) =>
          editingBadge ? updateMutation.mutate(data) : createMutation.mutate(data)
        }
      />

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={(open) => {
          setConfirmOpen(open);
          if (!open) setDeleteBadgeId(null);
        }}
        title="Delete Badge"
        description="Are you sure you want to delete this badge? This action cannot be undone."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        destructive
        loading={deleteBadgeId ? deleteMutation.isPending : false}
        onConfirm={() => {
          if (deleteBadgeId) deleteMutation.mutate(deleteBadgeId);
          setConfirmOpen(false);
        }}
      />
    </div>
  );
};

export default BadgesTab;
