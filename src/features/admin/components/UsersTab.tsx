// UsersTab.tsx
import { queryKeys } from "@/lib/queryKeys";
import { userColumns } from "@/pages/admin-dashboard/users/columns";
import { useCurrentUserQuery } from "@/shared/hooks/Queries/useCurrentUserQuery";
import { useUsersQuery } from "@/shared/hooks/Queries/useUsers";
import type { User } from "@/shared/types/user";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { DataTable } from "../../../shared/components/data-table/data-table";
import { ConfirmDialog } from "../../../shared/components/feedback/ConfirmDialog";
import UserForm from "./UserForm";

const UsersTab = () => {
  const [searchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState(searchTerm);
  const [showForm, setShowForm] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const queryClient = useQueryClient();
  const [deleteUserId, setDeleteUserId] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const { data: users = [], isLoading } = useUsersQuery();
  const { data: currentUser } = useCurrentUserQuery();

  const deleteUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      await import("@/features/admin").then((module) =>
        module.AdminService.deleteUser(userId, currentUser?.id ?? "")
      );
      return userId;
    },
    onSuccess: (userId) => {
      // ✅ Update cache locally (no need to refetch)
      queryClient.setQueryData<User[]>(queryKeys.users, (old = []) =>
        old.filter((u) => u.id !== userId)
      );
      toast.success("User deleted successfully");
    },
    onError: (err) => {
      toast.error(err?.message || "Failed to delete user!");
    },
  });

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchTerm), 250);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const filteredUsers = useMemo(() => {
    const s = debouncedSearch.toLowerCase();
    return users.filter(
      (u) =>
        u.username?.toLowerCase().includes(s) ||
        u.full_name?.toLowerCase().includes(s) ||
        u.email?.toLowerCase().includes(s)
    );
  }, [users, debouncedSearch]);

  if (isLoading) {
    return (
      <div className="min-h-screen pt-24 pb-16 flex items-center justify-center">
        <Loader className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-foreground">User Management</h2>
      </div>

      {/* Table */}
      <div className="bg-background shadow-md overflow-x-auto">
        <DataTable
          columns={userColumns({
            currentUserId: currentUser?.id,
            onEdit: (user) => {
              setSelectedUser(user);
              setShowForm(true);
            },
            onDelete: (userId) => {
              setDeleteUserId(userId);
              setConfirmOpen(true);
            },
          })}
          data={filteredUsers} // ✅ use filtered list
          filterKey="full_name"
        />

        <UserForm
          open={showForm}
          onOpenChange={(open) => {
            setShowForm(open);
            if (!open) setSelectedUser(null);
          }}
          user={selectedUser}
        />

        <ConfirmDialog
          open={confirmOpen}
          onOpenChange={(open) => {
            setConfirmOpen(open);
            if (!open) setDeleteUserId(null);
          }}
          title="Delete User"
          description="Are you sure you want to delete this user? This action cannot be undone."
          confirmLabel="Delete"
          cancelLabel="Cancel"
          destructive
          loading={deleteUserId ? deleteUserMutation.isPending : false}
          onConfirm={() => {
            if (deleteUserId) {
              deleteUserMutation.mutate(deleteUserId);
              setConfirmOpen(false);
            }
          }}
        />
      </div>
    </div>
  );
};

export default UsersTab;
