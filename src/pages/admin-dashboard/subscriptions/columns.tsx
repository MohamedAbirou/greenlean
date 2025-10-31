import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import type { ColumnDef } from "@tanstack/react-table";
import { formatDistanceToNow } from "date-fns";
import { Clock, MoreHorizontal, Tag, XCircle } from "lucide-react";

interface StripeSubscriber {
  customer_id?: string;
  subscription_id?: string;
  email?: string;
  status?: string;
  created?: number;
  current_period_end?: number;
  canceled_at?: number;
  is_active?: boolean;
  plans?: Array<{
    price_id?: string;
    nickname?: string;
    product_name?: string;
    product_id?: string;
    amount?: number;
    currency?: string;
    interval?: string;
    quantity?: number;
  }>;
}

interface SubscriptionColumnsProps {
  onCancel: (subscription_id: string) => void;
  onApplyCoupon: (subscription_id: string) => void;
  onExtendTrial: (subscription_id: string) => void;
}

export const subscriptionColumns = ({
  onCancel,
  onApplyCoupon,
  onExtendTrial,
}: SubscriptionColumnsProps): ColumnDef<StripeSubscriber>[] => [
  {
    accessorKey: "email",
    header: "Customer",
    cell: ({ row }) => {
      const email = row.original.email;
      const customerId = row.original.customer_id;
      return (
        <div className="flex flex-col">
          <span className="font-medium">{email || "No email"}</span>
          <span className="text-xs text-muted-foreground font-mono">
            {customerId?.substring(0, 20)}...
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.original.status || "unknown";
      const variants: Record<string, string> = {
        active: "badge-green",
        trialing: "badge-blue",
        past_due: "badge-orange",
        canceled: "badge-gray",
        incomplete: "badge-yellow",
        incomplete_expired: "badge-red",
        unpaid: "badge-red",
        paused: "badge-purple",
      };

      return (
        <Badge className={variants[status] || "bg-gray"}>
          {status.charAt(0).toUpperCase() + status.slice(1).replace("_", " ")}
        </Badge>
      );
    },
  },
  {
    accessorKey: "plans",
    header: "Plan",
    cell: ({ row }) => {
      const plans = row.original.plans || [];
      if (plans.length === 0) {
        return <span className="text-sm text-muted-foreground">No plan</span>;
      }
      const plan = plans[0];
      return (
        <div className="flex flex-col">
          <span className="font-medium">{plan.product_name || "Unnamed Plan"}</span>
          <span className="text-xs text-muted-foreground">
            ${((plan.amount || 0) / 100).toFixed(2)}/{plan.interval || "month"}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "created",
    header: "Subscribed",
    cell: ({ row }) => {
      const created = row.original.created;
      if (!created) return <span className="text-sm text-muted-foreground">-</span>;
      const date = new Date(created * 1000);
      return (
        <div className="flex flex-col">
          <span className="text-sm">{formatDistanceToNow(date, { addSuffix: true })}</span>
          <span className="text-xs text-muted-foreground">{date.toLocaleDateString()}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "current_period_end",
    header: "Renewal Date",
    cell: ({ row }) => {
      const periodEnd = row.original.current_period_end;
      const status = row.original.status;

      if (status === "canceled") {
        return <span className="text-sm text-muted-foreground">Cancelled</span>;
      }

      if (!periodEnd) return <span className="text-sm text-muted-foreground">-</span>;
      const date = new Date(periodEnd * 1000);
      const isExpiringSoon = date.getTime() - Date.now() < 7 * 24 * 60 * 60 * 1000;

      return (
        <div className="flex flex-col">
          <span className={`text-sm ${isExpiringSoon ? "text-orange-600 font-medium" : ""}`}>
            {date.toLocaleDateString()}
          </span>
          <span className="text-xs text-muted-foreground">
            {formatDistanceToNow(date, { addSuffix: true })}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "canceled_at",
    header: "Cancelled",
    cell: ({ row }) => {
      const canceledAt = row.original.canceled_at;
      if (!canceledAt) return <span className="text-sm text-muted-foreground">-</span>;
      const date = new Date(canceledAt * 1000);
      return (
        <div className="flex flex-col">
          <span className="text-sm text-red-600">
            {formatDistanceToNow(date, { addSuffix: true })}
          </span>
          <span className="text-xs text-muted-foreground">{date.toLocaleDateString()}</span>
        </div>
      );
    },
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const subscription = row.original;
      const isActive = subscription.is_active;
      const hasSubscription = !!subscription.subscription_id;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>

            {hasSubscription && isActive && (
              <>
                <DropdownMenuItem onClick={() => onApplyCoupon(subscription.subscription_id!)}>
                  <Tag className="mr-2 h-4 w-4" />
                  Apply Coupon
                </DropdownMenuItem>

                {subscription.status === "trialing" && (
                  <DropdownMenuItem onClick={() => onExtendTrial(subscription.subscription_id!)}>
                    <Clock className="mr-2 h-4 w-4" />
                    Extend Trial
                  </DropdownMenuItem>
                )}

                <DropdownMenuSeparator />
              </>
            )}

            {/* <DropdownMenuItem
              onClick={() =>
                onResendInvoice(subscription.subscription_id || subscription.customer_id!)
              }
            >
              <Mail className="mr-2 h-4 w-4" />
              Resend Invoice
            </DropdownMenuItem> */}

            {hasSubscription && isActive && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => onCancel(subscription.subscription_id!)}
                  className="text-destructive"
                >
                  <XCircle className="mr-2 h-4 w-4" />
                  Cancel Subscription
                </DropdownMenuItem>
              </>
            )}

            {/* if no actions, show a message */}
            {(!hasSubscription || !isActive || subscription.status === "canceled") && (
              <DropdownMenuItem>
                <span className="text-sm text-muted-foreground">No actions available</span>
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
