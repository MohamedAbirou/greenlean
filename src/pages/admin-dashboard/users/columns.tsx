import type { AdminUser } from "@/features/admin/hooks/useUsers";
import { Button } from "@/shared/components/ui/button";

export const userColumns = ({
  openCancelModal,
  openPlanChangeModal,
}: {
  openCancelModal?: (subscriptionId: string) => void;
  openPlanChangeModal?: (subscriptionId: string) => void;
}) => [
  {
    accessorKey: "full_name",
    header: "Name",
    cell: ({ row }: { row: { original: AdminUser } }) => {
      const user = row.original;
      return (
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-full bg-primary flex items-center justify-center text-white font-semibold">
            {user.full_name?.[0]?.toUpperCase() || user.email[0].toUpperCase()}
          </div>
          <div>
            <p className="font-medium">{user.full_name}</p>
            <p className="text-sm text-muted-foreground">{user.email}</p>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "plan",
    header: "Plan",
    cell: ({ row }: { row: { original: AdminUser } }) => {
      return (
        <span className="badge-blue px-2 py-1 rounded-full text-xs font-medium">
          {row.original.plan}
        </span>
      );
    },
  },
  {
    accessorKey: "stripe_plan_nickname",
    header: "Plan Name",
    cell: ({ row }: { row: { original: AdminUser } }) => (
      <span className="text-sm font-medium">
        {row.original.stripe_plan_nickname || "-"}
      </span>
    ),
  },
  {
    accessorKey: "stripe_plan_amount",
    header: "Amount",
    cell: ({ row }: { row: { original: AdminUser } }) => {
      const a = row.original.stripe_plan_amount;
      const cur = row.original.stripe_plan_currency?.toUpperCase() || "USD";
      return a ? `${a} ${cur}` : "-";
    },
  },
  {
    accessorKey: "stripe_plan_interval",
    header: "Interval",
    cell: ({ row }: { row: { original: AdminUser } }) => (
      <span className="text-xs ">{row.original.stripe_plan_interval || "-"}</span>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }: { row: { original: AdminUser } }) => {
      const s = row.original.status;
      const color =
        s === "active" || s === "trialing"
          ? "bg-green-100 text-green-800"
          : s === "canceled"
          ? "bg-red-100 text-red-800"
          : "bg-blue-100 text-blue-800";
      return <span className={`px-2 py-1 rounded-full text-xs font-semibold ${color}`}>{s}</span>;
    },
  },
  {
    accessorKey: "stripe_customer_id",
    header: "Stripe Customer",
    cell: ({ row }: { row: { original: AdminUser } }) => {
      const id = row.original.stripe_customer_id;
      return id ? (
        <a
          href={`https://dashboard.stripe.com/customers/${id}`}
          target="_blank"
          rel="noopener noreferrer"
          className="underline text-primary"
        >
          {id.slice(0, 6) + "..."}
        </a>
      ) : (
        <span className="text-muted-foreground">—</span>
      );
    },
  },
  {
    accessorKey: "joined",
    header: "Joined",
    cell: ({ row }: { row: { original: AdminUser } }) => (
      <span className="text-sm">
        {row.original.joined ? new Date(row.original.joined).toLocaleDateString() : "—"}
      </span>
    ),
  },
  {
    accessorKey: "canceled_at",
    header: "Canceled",
    cell: ({ row }: { row: { original: AdminUser } }) => (
      <span className="text-sm">
        {row.original.canceled_at ? new Date(row.original.canceled_at).toLocaleDateString() : "—"}
      </span>
    ),
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }: { row: { original: AdminUser } }) => {
      const user = row.original;
      return (
        <div className="flex flex-wrap gap-2">
          <Button
            size="sm"
            variant="secondary"
            onClick={() => openCancelModal?.(user.subscription_id || "")}
            disabled={!user.subscription_id}
            title={user.subscription_id ? "Cancel subscription" : "No subscription"}
          >
            Cancel
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => openPlanChangeModal?.(user.subscription_id || "")}
            disabled={!user.subscription_id}
            title={user.subscription_id ? "Change Plan" : "No subscription"}
          >
            Change Plan
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() =>
              window.open(
                "https://dashboard.stripe.com/customers/" + user.stripe_customer_id,
                "_blank"
              )
            }
            disabled={!user.stripe_customer_id}
            title={user.stripe_customer_id ? "View in Stripe" : "No Stripe info"}
          >
            Stripe
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => window.open(`mailto:${user.email}`)}
            title={user.email ? `Email ${user.email}` : "No email"}
            disabled={!user.email}
          >
            Email
          </Button>
        </div>
      );
    },
  },
];
