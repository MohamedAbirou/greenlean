// UsersTab.tsx
import { useAdminUsersTable } from "@/features/admin/hooks/useUsers";
import { userColumns } from "@/pages/admin-dashboard/users/columns";
import { DataTable } from "@/shared/components/data-table/data-table";
import { Button } from "@/shared/components/ui/button";
import { ModalDialog } from "@/shared/components/ui/modal-dialog";
import { Loader } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { AdminService } from "../api/adminService";

export default function UsersTab() {
  const { users, isLoading } = useAdminUsersTable();
  const [cancelTarget, setCancelTarget] = useState<string | null>(null);
  const [planChangeTarget, setPlanChangeTarget] = useState<string | null>(null);

  // Table admin actions
  const handleCancel = async () => {
    if (!cancelTarget) return;
    const res = await AdminService.cancelSubscription(cancelTarget);
    if (res.success) {
      toast.success("Subscription cancelled");
      setCancelTarget(null);
    } else {
      toast.error(res.error || "Failed");
    }
  };
  const handlePlanChange = async (new_price_id: string) => {
    if (!planChangeTarget) return;
    const res = await AdminService.changePlan(planChangeTarget, new_price_id);
    if (res.success) {
      toast.success("Plan changed");
      setPlanChangeTarget(null);
    } else {
      toast.error(res.error || "Failed");
    }
  };
  const plans = [
    { id: "price_FREE", label: "Free" },
    { id: "price_PRO", label: "Pro" },
  ];

  if (isLoading)
    return (
      <div className="min-h-screen pt-24 pb-16 flex items-center justify-center">
        <Loader className="h-8 w-8 animate-spin text-primary" />
      </div>
    );

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-foreground">User Management</h2>
      <div className="bg-background shadow-md overflow-x-auto">
        <DataTable
          columns={userColumns({
            openCancelModal: (subscription_id) => setCancelTarget(subscription_id),
            openPlanChangeModal: (subscription_id) => setPlanChangeTarget(subscription_id),
          })}
          data={users}
          filterKey="full_name"
        />
      </div>
      {/* Cancel Modal */}
      <ModalDialog
        open={!!cancelTarget}
        onOpenChange={(v) => v || setCancelTarget(null)}
        title="Cancel Subscription?"
      >
        <div className="p-4 text-center">
          <p>Really cancel this user's subscription? This will take effect immediately.</p>
          <div className="flex flex-row gap-4 justify-center mt-6">
            <Button variant="destructive" onClick={handleCancel}>
              Confirm Cancel
            </Button>
            <Button variant="secondary" onClick={() => setCancelTarget(null)}>
              Close
            </Button>
          </div>
        </div>
      </ModalDialog>
      {/* Plan Change Modal */}
      <ModalDialog
        open={!!planChangeTarget}
        onOpenChange={(v) => v || setPlanChangeTarget(null)}
        title="Change Plan?"
      >
        <div className="p-4">
          <p className="text-sm mb-3">Choose a new plan for this user:</p>
          <select
            className="border px-2 py-1 rounded w-full mb-4"
            onChange={(e) => handlePlanChange(e.target.value)}
            defaultValue=""
          >
            <option value="" disabled>
              Select a plan
            </option>
            {plans.map((p) => (
              <option key={p.id} value={p.id}>
                {p.label}
              </option>
            ))}
          </select>
          <Button variant="secondary" onClick={() => setPlanChangeTarget(null)}>
            Close
          </Button>
        </div>
      </ModalDialog>
    </div>
  );
}
