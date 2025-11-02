import type { AdminUser } from "@/features/admin/hooks/useUsers";
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
import { CreditCard, Edit, MoreHorizontal, Trash2 } from "lucide-react";

interface UserColumnsProps {
  openCancelModal: (subscription_id: string) => void;
  openPlanChangeModal: (subscription_id: string) => void;
  onEdit: (user: AdminUser) => void;
  onDelete: (user: AdminUser) => void;
}

export const userColumns = ({
  openCancelModal,
  openPlanChangeModal,
  onEdit,
  onDelete,
}: UserColumnsProps): ColumnDef<AdminUser>[] => [
  {
    accessorKey: "full_name",
    header: "User",
    cell: ({ row }) => {
      const user = row.original;
      return (
        <div className="flex flex-col">
          <span className="font-medium">{user.full_name}</span>
          <span className="text-xs text-muted-foreground">{user.email}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "username",
    header: "Username",
    cell: ({ row }) => <span className="text-sm">@{row.original.username}</span>,
  },
  {
    accessorKey: "plan",
    header: "Plan",
    cell: ({ row }) => {
      const plan = row.original.plan[0]?.toUpperCase() + row.original.plan.slice(1);
      const nickname = row.original.stripe_plan_nickname;
      return (
        <div className="flex flex-col">
          <Badge className={plan === "Pro" ? "badge-purple" : "badge-yellow"}>
            {nickname || plan || "Free"}
          </Badge>
          {row.original.stripe_plan_amount && (
            <span className="text-xs text-muted-foreground mt-1">
              ${row.original.stripe_plan_amount}/{row.original.stripe_plan_interval}
            </span>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.original.status;
      const variants: Record<string, string> = {
        active: "badge-green",
        trialing: "badge-blue",
        past_due: "badge-orange",
        canceled: "badge-gray",
        free: "badge-yellow",
      };
      return (
        <Badge className={variants[status] || "badge-gray"}>
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </Badge>
      );
    },
  },
  {
    accessorKey: "is_admin",
    header: "Role",
    cell: ({ row }) => {
      return row.original.is_admin ? (
        // Show super admin badge in purple using badge-purple or admin badge in green if admin using badge-green based on row.original.role
        <span
          className={`${
            row.original.role === "super_admin" ? "badge-purple" : "badge-green"
          } px-2 py-1 rounded-full text-xs font-medium`}
        >
          {row.original.role === "super_admin" ? "Super Admin" : "Admin"}
        </span>
      ) : (
        <span className="badge-gray px-2 py-1 rounded-full text-xs font-medium">User</span>
      );
    },
  },
  {
    accessorKey: "joined",
    header: "Joined",
    cell: ({ row }) => {
      const date = row.original.joined;
      if (!date) return <span className="text-sm text-muted-foreground">-</span>;
      return (
        <div className="flex flex-col">
          <span className="text-sm">
            {formatDistanceToNow(new Date(date), { addSuffix: true })}
          </span>
          <span className="text-xs text-muted-foreground">
            {new Date(date).toLocaleDateString()}
          </span>
        </div>
      );
    },
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const user = row.original;
      const hasSubscription = user.subscription_id && user.status !== "free";

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
            <DropdownMenuItem onClick={() => onEdit(user)}>
              <Edit className="h-4 w-4" />
              Edit User
            </DropdownMenuItem>
            {hasSubscription && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => openPlanChangeModal(user.subscription_id!)}>
                  <CreditCard className="h-4 w-4" />
                  Change Plan
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => openCancelModal(user.subscription_id!)}
                  className="text-destructive"
                >
                  <CreditCard className="h-4 w-4" />
                  Cancel Subscription
                </DropdownMenuItem>
              </>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onDelete(user)} className="text-destructive">
              <Trash2 className=" h-4 w-4 text-destructive" />
              Delete User
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
