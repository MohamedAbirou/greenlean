import { useMutation, useQueryClient } from "@tanstack/react-query";
import { X } from "lucide-react";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { queryKeys } from "../../lib/queryKeys";
import { supabase } from "../../lib/supabase";
import { } from "../../utils/adminBootstrap";

interface User {
  id: string;
  username: string;
  full_name: string;
  email: string;
  is_admin: boolean;
}

interface UserFormProps {
  user?: User;
  onClose: () => void;
}

const UserForm: React.FC<UserFormProps> = ({ user, onClose }) => {
  const [formData, setFormData] = useState({
    username: "",
    full_name: "",
    is_admin: false,
  });
  const [error, setError] = useState<string | null>(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username,
        full_name: user.full_name,
        is_admin: user.is_admin,
      });
    }
  }, [user]);

  const updateUserMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      // everything that was in your handleSubmit is moved here
      if (!user) throw new Error("Target user not found");

      const {
        data: { user: currentUser },
        error: authErr,
      } = await supabase.auth.getUser();
      if (authErr || !currentUser) throw new Error("Unauthorized");

      const { data: currentAdmin, error: roleErr } = await supabase
        .from("admin_users")
        .select("role")
        .eq("id", currentUser.id)
        .maybeSingle();
      if (roleErr) throw roleErr;

      const currentRole = currentAdmin?.role ?? "user";
      const updates: Partial<User> = {};

      if (data.username !== user.username) updates.username = data.username;
      if (data.full_name !== user.full_name) updates.full_name = data.full_name;

      // ✅ Update profile data if needed
      if (Object.keys(updates).length > 0) {
        const { error } = await supabase
          .from("profiles")
          .update(updates)
          .eq("id", user.id);
        if (error) throw error;
      }

      // ✅ Handle role change securely
      if (data.is_admin !== user.is_admin) {
        if (currentRole !== "super_admin")
          throw new Error("Only the Super Admin can modify admin roles.");

        const { data: targetAdmin } = await supabase
          .from("admin_users")
          .select("role")
          .eq("id", user.id)
          .maybeSingle();

        if (data.is_admin) {
          const { error } = await supabase.rpc("add_admin", {
            user_uuid: user.id,
            role: "admin",
          });
          if (error) throw error;
        } else {
          if (targetAdmin?.role === "super_admin")
            throw new Error("Cannot remove Super Admin privileges.");

          const { error } = await supabase
            .from("admin_users")
            .delete()
            .eq("id", user.id);
          if (error) throw error;
        }
      }

      return {
        ...user,
        ...updates,
        is_admin: data.is_admin,
      };
    },

    onSuccess: (updatedUser) => {
      // ✅ Update cache instead of refetching
      queryClient.setQueryData<User[]>(queryKeys.users, (old = []) =>
        old.map((u) => (u.id === updatedUser.id ? updatedUser : u))
      );

      toast.success("User updated successfully");
      onClose();
    },

    onError: (err: Error) => {
      console.error("Error updating user:", err);
      toast.error(err?.message || "Update failed");
      setError(err?.message || "Update failed");
    },
  });

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold dark:text-white">Edit User</h2>
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

        <form onSubmit={(e) => {
          e.preventDefault()
          updateUserMutation.mutate(formData)
        }} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Username
            </label>
            <input
              type="text"
              value={formData.username}
              onChange={(e) =>
                setFormData({ ...formData, username: e.target.value })
              }
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Full Name
            </label>
            <input
              type="text"
              value={formData.full_name}
              onChange={(e) =>
                setFormData({ ...formData, full_name: e.target.value })
              }
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              required
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              checked={formData.is_admin}
              onChange={(e) =>
                setFormData({ ...formData, is_admin: e.target.checked })
              }
              className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
            />
            <label className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
              Admin Access
            </label>
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
              disabled={updateUserMutation.isPending}
              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
            >
              {updateUserMutation.isPending ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserForm;
