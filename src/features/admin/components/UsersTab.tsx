import { useAdminUsersTable } from "@/features/admin/hooks/useUsers";
import { useAuth } from "@/features/auth";
import { queryKeys } from "@/lib/queryKeys";
import { userColumns } from "@/pages/admin-dashboard/users/columns";
import { DataTable } from "@/shared/components/data-table/data-table";
import { Button } from "@/shared/components/ui/button";
import { ModalDialog } from "@/shared/components/ui/modal-dialog";
import type { User } from "@/shared/types/user";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Download } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { AdminService } from "../api/adminService";
import UserForm from "../components/UserForm";

export default function UsersTab() {
  const { users, isLoading } = useAdminUsersTable();
  const { user: currentUser } = useAuth();
  const queryClient = useQueryClient();

  // State management
  const [cancelTarget, setCancelTarget] = useState<string | null>(null);
  const [planChangeTarget, setPlanChangeTarget] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null);
  const [editTarget, setEditTarget] = useState<User | null>(null);
  const [showUserForm, setShowUserForm] = useState(false);

  // Delete user mutation
  const deleteUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      await AdminService.deleteUser(userId, currentUser?.id || "");
    },
    onSuccess: () => {
      toast.success("User deleted successfully");
      setDeleteTarget(null);
      queryClient.invalidateQueries({ queryKey: queryKeys.users });
    },
    onError: (err: Error) => {
      toast.error(err?.message || "Failed to delete user!");
    },
  });

  // Cancel subscription handler
  const handleCancelSubscription = async () => {
    if (!cancelTarget) return;
    try {
      const res = await AdminService.cancelSubscription(currentUser?.id || "", cancelTarget);
      if (res.success) {
        toast.success("Subscription cancelled successfully");
        queryClient.invalidateQueries({ queryKey: queryKeys.users });
        setCancelTarget(null);
      } else {
        toast.error(res.error || "Failed to cancel subscription");
      }
    } catch (error) {
      toast.error("An error occurred while cancelling subscription");
    }
  };

  // Plan change handler
  const handlePlanChange = async (new_price_id: string) => {
    if (!planChangeTarget || !new_price_id) return;
    try {
      const res = await AdminService.changePlan(planChangeTarget, new_price_id);
      if (res.success) {
        toast.success("Plan changed successfully");
        queryClient.invalidateQueries({ queryKey: queryKeys.users });
        setPlanChangeTarget(null);
      } else {
        toast.error(res.error || "Failed to change plan");
      }
    } catch (error) {
      toast.error("An error occurred while changing plan");
    }
  };

  // Export users to CSV
  const handleExportCSV = async () => {
    try {
      const csv = await AdminService.exportToCSV("users");
      const blob = new Blob([csv], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `users-export-${new Date().toISOString().split("T")[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      toast.success("Users exported successfully");
    } catch (error) {
      toast.error("Failed to export users");
    }
  };

  const plans = [
    { id: "price_FREE", label: "Free" },
    { id: "price_PRO", label: "Pro" },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-foreground">User Management</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Manage users, subscriptions, and permissions
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExportCSV}>
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-card p-4 rounded-lg border">
          <p className="text-sm text-muted-foreground">Total Users</p>
          <p className="text-2xl font-bold">{users.length}</p>
        </div>
        <div className="bg-card p-4 rounded-lg border">
          <p className="text-sm text-muted-foreground">Active Subscriptions</p>
          <p className="text-2xl font-bold">{users.filter((u) => u.status === "active").length}</p>
        </div>
        <div className="bg-card p-4 rounded-lg border">
          <p className="text-sm text-muted-foreground">Free Users</p>
          <p className="text-2xl font-bold">
            {users.filter((u) => u.plan === "free" || !u.plan).length}
          </p>
        </div>
        <div className="bg-card p-4 rounded-lg border">
          <p className="text-sm text-muted-foreground">Admin Users</p>
          <p className="text-2xl font-bold">{users.filter((u) => u.is_admin).length}</p>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-card shadow-md overflow-x-auto rounded-lg border">
        <DataTable
          columns={userColumns({
            openCancelModal: (subscription_id) => setCancelTarget(subscription_id),
            openPlanChangeModal: (subscription_id) => setPlanChangeTarget(subscription_id),
            onEdit: (user: User) => {
              setEditTarget(user);
              setShowUserForm(true);
            },
            onDelete: (user: User) => setDeleteTarget(user),
          })}
          data={users}
          filterKey="full_name"
        />
      </div>

      {/* User Form Modal (Edit) */}
      <UserForm
        user={editTarget}
        open={showUserForm}
        onOpenChange={(open) => {
          setShowUserForm(open);
          if (!open) setEditTarget(null);
        }}
      />

      {/* Delete Confirmation Modal */}
      <ModalDialog
        open={!!deleteTarget}
        onOpenChange={(v) => !v && setDeleteTarget(null)}
        title="Delete User"
        description="This action cannot be undone."
      >
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Are you sure you want to delete{" "}
            <span className="font-semibold">{deleteTarget?.full_name}</span>? This will permanently
            remove all their data.
          </p>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => deleteTarget && deleteUserMutation.mutate(deleteTarget.id)}
              disabled={deleteUserMutation.isPending}
            >
              {deleteUserMutation.isPending ? "Deleting..." : "Delete User"}
            </Button>
          </div>
        </div>
      </ModalDialog>

      {/* Cancel Subscription Modal */}
      <ModalDialog
        open={!!cancelTarget}
        onOpenChange={(v) => !v && setCancelTarget(null)}
        title="Cancel Subscription"
      >
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Are you sure you want to cancel this subscription? This will take effect immediately and
            the user will lose access to premium features.
          </p>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setCancelTarget(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleCancelSubscription}>
              Confirm Cancellation
            </Button>
          </div>
        </div>
      </ModalDialog>

      {/* Plan Change Modal */}
      <ModalDialog
        open={!!planChangeTarget}
        onOpenChange={(v) => !v && setPlanChangeTarget(null)}
        title="Change Subscription Plan"
      >
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground mb-3">
            Select a new plan for this user. Changes will take effect on the next billing cycle.
          </p>
          <div className="space-y-2">
            {plans.map((plan) => (
              <Button
                key={plan.id}
                variant="outline"
                className="w-full justify-start"
                onClick={() => handlePlanChange(plan.id)}
              >
                {plan.label}
              </Button>
            ))}
          </div>
          <div className="flex justify-end">
            <Button variant="outline" onClick={() => setPlanChangeTarget(null)}>
              Cancel
            </Button>
          </div>
        </div>
      </ModalDialog>
    </div>
  );
}
