import { queryKeys } from "@/lib/queryKeys";
import { supabase } from "@/lib/supabase";
import { createNotification } from "@/services/notificationService";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Button } from "../ui/button";
import { Checkbox } from "../ui/checkbox";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { ModalDialog } from "../ui/modal-dialog";

interface User {
  id: string
  username: string
  full_name: string
  email: string
  is_admin: boolean
}

interface UserFormProps {
  user: User | null;
  open: boolean
  onOpenChange: (open: boolean) => void
}

const UserForm: React.FC<UserFormProps> = ({ user, open, onOpenChange }) => {
  const [formData, setFormData] = useState({
    username: "",
    full_name: "",
    is_admin: false,
  });
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
      // Fetch target role first
      const { data: targetAdmin } = await supabase
        .from("admin_users")
        .select("role")
        .eq("id", user.id)
        .maybeSingle();

      if (
        targetAdmin?.role === "super_admin" &&
        currentRole !== "super_admin"
      ) {
        throw new Error("Only the Super Admin can edit a Super Admin.");
      }

      const updates: Partial<User> = {};

      // Only update fields if allowed
      if (
        currentRole === "super_admin" ||
        targetAdmin?.role !== "super_admin"
      ) {
        if (data.username !== user.username) updates.username = data.username;
        if (data.full_name !== user.full_name)
          updates.full_name = data.full_name;
      }

      // ✅ Update profile data if needed
      let profileChanged = false;
      if (Object.keys(updates).length > 0) {
        const { error } = await supabase
          .from("profiles")
          .update(updates)
          .eq("id", user.id);
        if (error) throw error;
        profileChanged = true;
      }

      // ✅ Handle role change securely
      let roleChanged = false;
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
        roleChanged = true;
      }

      // Notifications for updates
      if (profileChanged) {
        await createNotification({
          recipient_id: user.id,
          sender_id: currentUser.id,
          type: "profile_changes",
          entity_id: user.id,
          entity_type: "profile_changes",
          message: `Your profile information has been updated by a super admin.`,
        });
      }
      if (roleChanged) {
        await createNotification({
          recipient_id: user.id,
          sender_id: currentUser.id,
          type: "role_change",
          entity_id: user.id,
          entity_type: "role_change",
          message: `Your administrative privileges have been updated by a super admin.`,
        });
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
      onOpenChange(false);
    },

    onError: (err: Error) => {
      toast.error(err?.message || "Update failed");
    },
  });

  return (
    <ModalDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Edit User"
      description="Modify user information and roles."
      size="md"
    >
      <form
        onSubmit={(e) => {
          e.preventDefault()
          updateUserMutation.mutate(formData)
        }}
        className="space-y-4"
      >
        <div>
          <Label>Username</Label>
          <Input
            value={formData.username}
            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
            placeholder="Enter username"
            required
          />
        </div>

        <div>
          <Label>Full Name</Label>
          <Input
            value={formData.full_name}
            onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
            placeholder="Enter full name"
            required
          />
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="admin"
            checked={formData.is_admin}
            onCheckedChange={(checked) =>
              setFormData({ ...formData, is_admin: !!checked })
            }
          />
          <Label htmlFor="admin">Admin Access</Label>
        </div>

        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            type="button"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={updateUserMutation.isPending}>
            {updateUserMutation.isPending ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </form>
    </ModalDialog>
  );
};

export default UserForm;
