import { Edit, Trash } from "lucide-react";

export type User = {
  id: string;
  full_name: string;
  email: string;
  username: string;
  is_admin: boolean;
  role?: "super_admin" | "admin";
  created_at: string;
};

export const userColumns = ({
  currentUserId,
  onEdit,
  onDelete,
}: {
  currentUserId?: string;
  onEdit: (user: User) => void;
  onDelete: (userId: string) => void;
}) => [
  {
    accessorKey: "full_name",
    header: "Name",
    cell: ({ row }: { row: { original: User } }) => {
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
    accessorKey: "role",
    header: "Status",
    cell: ({ row }: { row: { original: User } }) => {
      const u = row.original;
      const isSuper = u.role === "super_admin";
      const isAdmin = u.is_admin;
      const badgeClass = isSuper
        ? "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300"
        : isAdmin
        ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300"
        : "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300";
      return (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${badgeClass}`}
        >
          {isSuper ? "Super Admin" : isAdmin ? "Admin" : "User"}
        </span>
      );
    },
  },
  {
    accessorKey: "created_at",
    header: "Created",
    cell: ({ row }: { row: { original: User } }) => (
      <span className="text-sm">
        {new Date(row.original.created_at).toLocaleDateString()}
      </span>
    ),
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }: { row: { original: User } }) => {
      const user = row.original;
      return (
        <div className="flex gap-2">
          <button
            onClick={() => onEdit(user)}
            className="p-2 hover:bg-card rounded-lg"
          >
            <Edit className="h-5 w-5 text-foreground" />
          </button>
          {user.id !== currentUserId && (
            <button
              onClick={() => onDelete(user.id)}
              className="p-2 hover:bg-destructive/30 rounded-lg"
            >
              <Trash className="h-5 w-5 text-destructive" />
            </button>
          )}
        </div>
      );
    },
  },
];
