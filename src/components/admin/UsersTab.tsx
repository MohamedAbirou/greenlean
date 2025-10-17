// UsersTab.tsx
import { useCurrentUserQuery } from "@/hooks/Queries/useCurrentUserQuery";
import { useUsersQuery, type User } from "@/hooks/Queries/useUsers";
import { queryKeys } from "@/lib/queryKeys";
import { userColumns } from "@/pages/admin-dashboard/users/columns";
import type { ColorTheme } from "@/utils/colorUtils";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader, Search } from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { DataTable } from "../data-table/data-table";
import UserForm from "./UserForm";

interface UserTabProps {
  colorTheme: ColorTheme;
}

const UsersTab: React.FC<UserTabProps> = ({ colorTheme }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState(searchTerm);
  const [showForm, setShowForm] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const queryClient = useQueryClient();

  const { data: users = [], isLoading } = useUsersQuery();
  const { data: currentUser } = useCurrentUserQuery();

  const deleteUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/delete-user`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({
            target_user: userId,
            caller_id: currentUser?.id,
          }),
        }
      );

      const data = await res.json(); // parse JSON body

      if (!res.ok) throw new Error(data?.error || "Failed to delete user!");

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
        <Loader className={`h-8 w-8 animate-spin ${colorTheme.primaryText}`} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-foreground">User Management</h2>
        <div className="relative">
          <Search
            size={20}
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-foreground/80"
          />
          <input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 border border-border rounded-lg bg-input text-foreground"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-background rounded-xl shadow-md overflow-x-auto">
        <DataTable
          columns={userColumns({
            currentUserId: currentUser?.id,
            onEdit: (user) => {
              setSelectedUser(user);
              setShowForm(true);
            },
            onDelete: (userId) => deleteUserMutation.mutate(userId),
          })}
          data={filteredUsers} // ✅ use filtered list
          filterKey="email"
        />

        <UserForm
          open={showForm}
          onOpenChange={(open) => {
            setShowForm(open);
            if (!open) setSelectedUser(null);
          }}
          user={selectedUser}
        />
      </div>
    </div>
  );
};

export default UsersTab;
