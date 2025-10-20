import type { Badge } from "@/types/challenge";
import { Edit, Trash2 } from "lucide-react";

export const badgeColumns = ({
  onEdit,
  onDelete,
}: {
  onEdit: (badge: Badge) => void;
  onDelete: (id: string) => void;
}) => [
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }: { row: { original: Badge } }) => <span>{row.original.name}</span>,
  },
  {
    accessorKey: "description",
    header: "Description",
    cell: ({ row }: { row: { original: Badge } }) => <span>{row.original.description}</span>,
  },
  {
    accessorKey: "icon",
    header: "Icon",
    cell: ({ row }: { row: { original: Badge } }) => <span>{row.original.icon}</span>,
  },
  {
    accessorKey: "color",
    header: "Color",
    cell: ({ row }: { row: { original: Badge } }) => (
      <span className="px-2 py-1 rounded" style={{ backgroundColor: row.original.color, color: "#fff" }}>
        {row.original.color}
      </span>
    ),
  },
  {
    accessorKey: "created_at",
    header: "Created",
    cell: ({ row }: { row: { original: Badge } }) => new Date(row.original.created_at).toLocaleDateString(),
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }: { row: { original: Badge } }) => (
      <div className="flex space-x-2">
        <button onClick={() => onEdit(row.original)} className="p-2 hover:bg-card rounded-lg">
          <Edit className="h-5 w-5" />
        </button>
        <button onClick={() => onDelete(row.original.id)} className="p-2 hover:bg-destructive/30 rounded-lg">
          <Trash2 className="h-5 w-5 text-destructive" />
        </button>
      </div>
    ),
  },
];
