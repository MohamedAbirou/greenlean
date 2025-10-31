import { useAllSubscribers, useSaasMetrics } from "@/features/admin/hooks/useSaasMetrics";
import { subscriptionColumns } from "@/pages/admin-dashboard/subscriptions/columns";
import { DataTable } from "@/shared/components/data-table/data-table";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { ModalDialog } from "@/shared/components/ui/modal-dialog";
import { useQueryClient } from "@tanstack/react-query";
import { AlertCircle, DollarSign, Download, TrendingUp, Users } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { AdminService } from "../api/adminService";

export default function SubscriptionsTab({ currentUserId }: { currentUserId: string }) {
  const { data: metrics, isLoading: isLoadingMetrics } = useSaasMetrics();
  const { data: subscribersData, isLoading: isLoadingSubs } = useAllSubscribers();
  const queryClient = useQueryClient();

  // State management
  const [cancelTarget, setCancelTarget] = useState<string | null>(null);
  const [resendInvoiceTarget, setResendInvoiceTarget] = useState<string | null>(null);
  const [couponTarget, setCouponTarget] = useState<string | null>(null);
  const [couponCode, setCouponCode] = useState("");
  const [trialTarget, setTrialTarget] = useState<string | null>(null);
  const [trialDays, setTrialDays] = useState(30);

  const subscribers = subscribersData?.subscribers || [];

  // Cancel subscription
  const handleCancelSubscription = async () => {
    if (!cancelTarget) return;
    try {
      const res = await AdminService.cancelSubscription(currentUserId, cancelTarget);
      if (res.success) {
        toast.success("Subscription cancelled successfully");
        queryClient.invalidateQueries({ queryKey: ["subscribers"] });
        queryClient.invalidateQueries({ queryKey: ["saas-metrics"] });
        setCancelTarget(null);
      } else {
        toast.error(res.error || "Failed to cancel subscription");
      }
    } catch (error) {
      toast.error("An error occurred while cancelling subscription");
    }
  };

  // Resend invoice
  const handleResendInvoice = async () => {
    if (!resendInvoiceTarget) return;
    try {
      const res = await AdminService.resendInvoice(resendInvoiceTarget);
      if (res.success) {
        toast.success("Invoice resent successfully");
        setResendInvoiceTarget(null);
      } else {
        toast.error(res.error || "Failed to resend invoice");
      }
    } catch (error) {
      toast.error("An error occurred while resending invoice");
    }
  };

  // Apply coupon
  const handleApplyCoupon = async () => {
    if (!couponTarget || !couponCode) {
      toast.error("Please enter a coupon code");
      return;
    }
    try {
      const res = await AdminService.applyCoupon(couponTarget, couponCode);
      if (res.success) {
        toast.success("Coupon applied successfully");
        queryClient.invalidateQueries({ queryKey: ["subscribers"] });
        setCouponTarget(null);
        setCouponCode("");
      } else {
        toast.error(res.error || "Failed to apply coupon");
      }
    } catch (error) {
      toast.error("An error occurred while applying coupon");
    }
  };

  // Extend trial
  const handleExtendTrial = async () => {
    if (!trialTarget || !trialDays) {
      toast.error("Please enter number of days");
      return;
    }
    try {
      const trialEnd = Math.floor(Date.now() / 1000) + trialDays * 24 * 60 * 60;
      const res = await AdminService.extendTrial(trialTarget, trialEnd);
      if (res.success) {
        toast.success(`Trial extended by ${trialDays} days`);
        queryClient.invalidateQueries({ queryKey: ["subscribers"] });
        setTrialTarget(null);
        setTrialDays(30);
      } else {
        toast.error(res.error || "Failed to extend trial");
      }
    } catch (error) {
      toast.error("An error occurred while extending trial");
    }
  };

  // Export subscriptions to CSV
  const handleExportCSV = async () => {
    try {
      const csv = await AdminService.exportToCSV("subscriptions");
      const blob = new Blob([csv], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `subscriptions-export-${new Date().toISOString().split("T")[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      toast.success("Subscriptions exported successfully");
    } catch (error) {
      toast.error("Failed to export subscriptions");
    }
  };

  if (isLoadingMetrics || isLoadingSubs) {
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
          <h2 className="text-2xl font-bold text-foreground">Subscription Management</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Monitor and manage user subscriptions
          </p>
        </div>
        <Button variant="outline" onClick={handleExportCSV}>
          <Download className="h-4 w-4 mr-2" />
          Export CSV
        </Button>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-card p-6 rounded-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">MRR</p>
              <p className="text-2xl font-bold">${metrics?.mrr?.toFixed(2) || "0.00"}</p>
            </div>
            <DollarSign className="h-8 w-8 text-green-500" />
          </div>
        </div>
        <div className="bg-card p-6 rounded-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Active Subscribers</p>
              <p className="text-2xl font-bold">{metrics?.activeSubscribers || 0}</p>
            </div>
            <Users className="h-8 w-8 text-blue-500" />
          </div>
        </div>
        <div className="bg-card p-6 rounded-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">This Month</p>
              <p className="text-2xl font-bold">
                ${metrics?.earningsThisMonth?.toFixed(2) || "0.00"}
              </p>
            </div>
            <TrendingUp className="h-8 w-8 text-purple-500" />
          </div>
        </div>
        <div className="bg-card p-6 rounded-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Churned This Month</p>
              <p className="text-2xl font-bold">{metrics?.churnedThisMonth || 0}</p>
            </div>
            <AlertCircle className="h-8 w-8 text-red-500" />
          </div>
        </div>
      </div>

      {/* Revenue Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-card p-6 rounded-sm border">
          <h3 className="text-lg font-semibold mb-4">Revenue Overview</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total Earnings</span>
              <span className="font-semibold">${metrics?.totalEarnings?.toFixed(2) || "0.00"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Last 30 Days</span>
              <span className="font-semibold">
                ${metrics?.earningsLast30Days?.toFixed(2) || "0.00"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">This Month</span>
              <span className="font-semibold">
                ${metrics?.earningsThisMonth?.toFixed(2) || "0.00"}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-card p-6 rounded-sm border">
          <h3 className="text-lg font-semibold mb-4">Subscriber Growth</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total Subscribers</span>
              <span className="font-semibold">{metrics?.totalSubscribers || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Active</span>
              <span className="font-semibold text-green-600">
                {metrics?.activeSubscribers || 0}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">New This Month</span>
              <span className="font-semibold text-blue-600">{metrics?.newSubsThisMonth || 0}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Subscriptions Table */}
      <div className="bg-card shadow-md overflow-x-auto rounded-sm border">
        <DataTable
          columns={subscriptionColumns({
            onCancel: (subscription_id) => setCancelTarget(subscription_id),
            onResendInvoice: (invoice_id) => setResendInvoiceTarget(invoice_id),
            onApplyCoupon: (subscription_id) => setCouponTarget(subscription_id),
            onExtendTrial: (subscription_id) => setTrialTarget(subscription_id),
          })}
          data={subscribers}
          filterKey="email"
        />
      </div>

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

      {/* Resend Invoice Modal */}
      <ModalDialog
        open={!!resendInvoiceTarget}
        onOpenChange={(v) => !v && setResendInvoiceTarget(null)}
        title="Resend Invoice"
      >
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            This will resend the latest invoice to the customer's email address.
          </p>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setResendInvoiceTarget(null)}>
              Cancel
            </Button>
            <Button onClick={handleResendInvoice}>Resend Invoice</Button>
          </div>
        </div>
      </ModalDialog>

      {/* Apply Coupon Modal */}
      <ModalDialog
        open={!!couponTarget}
        onOpenChange={(v) => {
          if (!v) {
            setCouponTarget(null);
            setCouponCode("");
          }
        }}
        title="Apply Coupon"
      >
        <div className="space-y-4">
          <div>
            <Label htmlFor="coupon">Coupon Code</Label>
            <Input
              id="coupon"
              placeholder="Enter coupon code"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value)}
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setCouponTarget(null);
                setCouponCode("");
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleApplyCoupon}>Apply Coupon</Button>
          </div>
        </div>
      </ModalDialog>

      {/* Extend Trial Modal */}
      <ModalDialog
        open={!!trialTarget}
        onOpenChange={(v) => {
          if (!v) {
            setTrialTarget(null);
            setTrialDays(30);
          }
        }}
        title="Extend Trial Period"
      >
        <div className="space-y-4">
          <div>
            <Label htmlFor="days">Number of Days</Label>
            <Input
              id="days"
              type="number"
              placeholder="30"
              value={trialDays}
              onChange={(e) => setTrialDays(parseInt(e.target.value) || 30)}
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setTrialTarget(null);
                setTrialDays(30);
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleExtendTrial}>Extend Trial</Button>
          </div>
        </div>
      </ModalDialog>
    </div>
  );
}
