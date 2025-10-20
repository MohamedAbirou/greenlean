import type { ActivityLog } from "@/types/dashboard";
import { Edit, Trash2 } from "lucide-react";

export const activityColumns = ({
  onEdit,
  onDelete,
}: {
  onEdit: (activity: ActivityLog) => void;
  onDelete: (id: string) => void;
}) => [
  {
    accessorKey: "date",
    header: "Date",
    cell: ({ row }: { row: { original: ActivityLog } }) => <span>{row.original.activity_date}</span>,
  },
  {
    accessorKey: "type",
    header: "Type",
    cell: ({ row }: { row: { original: ActivityLog } }) => <span>{row.original.activity_type}</span>,
  },
  {
    accessorKey: "duration",
    header: "Duration",
    cell: ({ row }: { row: { original: ActivityLog } }) => <span>{row.original.duration_minutes}</span>,
  },
  {
    accessorKey: "calories",
    header: "Calories",
    cell: ({ row }: { row: { original: ActivityLog } }) => <span>{row.original.calories_burned}</span>,
  },
  {
    accessorKey: "steps",
    header: "Steps",
    cell: ({ row }: { row: { original: ActivityLog } }) => <span>{row.original.steps}</span>,
  },
  {
    accessorKey: "notes",
    header: "Notes",
    cell: ({ row }: { row: { original: ActivityLog } }) => <span>{row.original.notes}</span>,
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }: { row: { original: ActivityLog } }) => (
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
