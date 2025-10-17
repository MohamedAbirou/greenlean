"use client";

import { Edit, Trash2 } from "lucide-react";

export type Challenge = {
  id: string;
  title: string;
  description: string;
  type: string;
  difficulty: string;
  participants_count: number;
  completion_rate: number;
  is_active: boolean;
};

export const challengeColumns = ({
  onEdit,
  onDelete,
  cellClassName
}: {
  onEdit: (challenge: any) => void;
  onDelete: (challengeId: string) => void;
  cellClassName?: string
}) => [
  {
    accessorKey: "title",
    header: "Challenge",
    cell: ({ row }) => {
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
    cell: ({ row }) => (
      <span className="capitalize text-foreground">{row.original.type}</span>
    ),
  },
  {
    accessorKey: "difficulty",
    header: "Difficulty",
    cell: ({ row }) => {
      const diff = row.original.difficulty;
      const color =
        diff === "beginner"
          ? "bg-green-100 text-green-800"
          : diff === "intermediate"
          ? "bg-yellow-100 text-yellow-800"
          : "bg-red-100 text-red-800";
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
    cell: ({ row }) => {
      const participants = row.original.participants_count ?? 0;
      return (
        <div className={cellClassName}>
          {participants || "-"}
        </div>
      );
    },
  },
  {
    accessorKey: "completion_rate",
    header: "Completion",
    cell: ({ row }) => {
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
    accessorKey: "is_active",
    header: "Status",
    cell: ({ row }) => {
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
    cell: ({ row }) => {
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
