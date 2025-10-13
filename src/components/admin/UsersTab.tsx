// UsersTab.tsx
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Edit, Loader, Search, Trash } from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { useCurrentUserQuery } from "../../hooks/Queries/useCurrentUserQuery";
import { User, useUsersQuery } from "../../hooks/Queries/useUsers";
import { queryKeys } from "../../lib/queryKeys";
import { ColorTheme } from "../../utils/colorUtils";
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
      if (!res.ok) throw new Error("Failed to delete user");
      return userId;
    },
    onSuccess: (userId) => {
      // ✅ Update cache locally (no need to refetch)
      queryClient.setQueryData<User[]>(queryKeys.users, (old = []) =>
        old.filter((u) => u.id !== userId)
      );
      toast.success("User deleted successfully");
    },
    onError: (err: Error) =>
      toast.error(err.message || "Failed to delete user."),
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
        <h2 className="text-2xl font-bold dark:text-white">User Management</h2>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-x-auto">
        <table className="min-w-[600px] w-full">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-medium dark:text-white">
                User
              </th>
              <th className="px-6 py-3 text-left text-sm font-medium dark:text-white">
                Status
              </th>
              <th className="px-6 py-3 text-left text-sm font-medium dark:text-white">
                Created
              </th>
              <th className="px-6 py-3 text-left text-sm font-medium dark:text-white">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {filteredUsers.map((user) => (
              <tr key={user.id}>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full bg-green-500 flex items-center justify-center text-white">
                      {user.username?.[0]?.toUpperCase() ||
                        user.email[0].toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium dark:text-white">
                        {user.full_name}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-300">
                        {user.email}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`px-2 py-1 rounded-full text-sm font-medium ${
                      user.is_admin
                        ? "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300"
                        : "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300"
                    }`}
                  >
                    {user.role === "super_admin"
                      ? "Super Admin"
                      : user.is_admin
                      ? "Admin"
                      : "User"}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm dark:text-white">
                  {new Date(user.created_at).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 flex gap-2">
                  <button
                    onClick={() => {
                      setSelectedUser(user);
                      setShowForm(true);
                    }}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                  >
                    <Edit className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                  </button>
                  {user.id !== currentUser?.id && (
                    <button
                      onClick={() => {
                        if (
                          !confirm("Are you sure you want to delete this user?")
                        )
                          return;
                        deleteUserMutation.mutate(user.id);
                      }}
                      className="p-2 hover:bg-red-100 dark:hover:bg-red-700/30 rounded-lg"
                    >
                      <Trash className="h-5 w-5 text-red-600 dark:text-red-400" />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showForm && selectedUser && (
        <UserForm
          user={selectedUser}
          onClose={() => {
            setShowForm(false);
            setSelectedUser(null);
          }}
        />
      )}
    </div>
  );
};

export default UsersTab;
