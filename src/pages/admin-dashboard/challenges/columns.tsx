import { IconMap } from "@/features/challenges/utils/progress";
import type { Challenge } from "@/shared/types/challenge";
import { Edit, Sparkles, Star, Trash2 } from "lucide-react";

export const challengeColumns = ({
  onEdit,
  onDelete,
  cellClassName,
}: {
  onEdit: (challenge: Challenge) => void;
  onDelete: (challengeId: string) => void;
  cellClassName?: string;
}) => [
  {
    accessorKey: "title",
    header: "Challenge",
    cell: ({ row }: { row: { original: Challenge } }) => {
      const c = row.original;
      return (
        <div className="max-w-[200px] overflow-hidden text-ellipsis whitespace-nowrap">
          <p className="font-medium text-foreground">{c.title}</p>
          <p className="text-sm text-muted-foreground truncate">
            {c.description}
          </p>
        </div>
      );
    },
  },
  {
    accessorKey: "type",
    header: "Type",
    cell: ({ row }: { row: { original: Challenge } }) => (
      <span className="capitalize text-foreground">{row.original.type}</span>
    ),
  },
  {
    accessorKey: "difficulty",
    header: "Difficulty",
    cell: ({ row }: { row: { original: Challenge } }) => {
      const diff = row.original.difficulty;
      const color =
        diff === "beginner"
          ? "badge-green"
          : diff === "intermediate"
          ? "badge-yellow"
          : "badge-red";
      return (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${color}`}>
          {diff}
        </span>
      );
    },
  },
  {
    accessorKey: "participants_count",
    header: "Participants",
    cell: ({ row }: { row: { original: Challenge } }) => {
      const participants = row.original.participants_count ?? 0;
      return <div className={cellClassName}>{participants || "-"}</div>;
    },
  },
  {
    accessorKey: "completion_rate",
    header: "Completion",
    cell: ({ row }: { row: { original: Challenge } }) => {
      const rate = Math.round(row.original.completion_rate ?? 0); // 👈 default 0
      return (
        <div className={cellClassName}>
          <div className="w-16 bg-card rounded-full h-2 mr-2">
            <div
              className="bg-primary h-2 rounded-full"
              style={{ width: `${rate}%` }}
            />
          </div>
          <span className="text-sm">{rate}%</span>
        </div>
      );
    },
  },

  {
    accessorKey: "points",
    header: "Points",
    cell: ({ row }: { row: { original: Challenge } }) => {
      const c = row.original;
      return (
        <div
          className={`${cellClassName} flex items-center gap-1 badge-yellow px-2 rounded-full border-2`}
        >
          <Sparkles className="w-6 h-6  animate-pulse" />
          <span className="font-black text-xs">
            {c.points}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "badge",
    header: "Badge",
    cell: ({ row }: { row: { original: Challenge } }) => {
      const c = row.original;
      const BadgeIconComponent = IconMap[c?.badge?.icon ?? "star"] || Star;
      return (
        <div className={cellClassName}>
          {c.badge ? (
            <span
              className="flex items-center w-fit gap-2 px-2 py-0.5 rounded-full text-xs font-bold border-2 shadow-md"
              style={{
                backgroundColor: `${c.badge?.color}20`,
                borderColor: c.badge?.color,
                color: c.badge?.color,
                transform: "translateZ(0)",
              }}
            >
              <BadgeIconComponent className="w-4 h-4" />
              <span>{c.badge?.name}</span>
            </span>
          ) : (
            <span>-</span>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "is_active",
    header: "Status",
    cell: ({ row }: { row: { original: Challenge } }) => {
      const active = row.original.is_active;
      return (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            active
              ? "bg-primary/10 text-primary"
              : "bg-destructive text-destructive-foreground"
          }`}
        >
          {active ? "Active" : "Inactive"}
        </span>
      );
    },
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }: { row: { original: Challenge } }) => {
      const challenge = row.original;
      return (
        <div className="flex space-x-2">
          <button
            onClick={() => onEdit(challenge)}
            className="p-2 hover:bg-card rounded-lg"
          >
            <Edit className="h-5 w-5" />
          </button>
          <button
            onClick={() => onDelete(challenge.id)}
            className="p-2 hover:bg-destructive/30 rounded-lg"
          >
            <Trash2 className="h-5 w-5 text-destructive" />
          </button>
        </div>
      );
    },
  },
];
