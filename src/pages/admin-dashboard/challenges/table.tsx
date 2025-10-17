"use client";

import { DataTable } from "@/components/data-table/data-table";
import type { Challenge } from "@/types/challenge";
import { challengeColumns } from "./columns";

export default function UsersTable({
  challenges,
  onEdit,
  onDelete,
  cellClassName
}: {
  challenges: Challenge[];
  onEdit: (challenge: Challenge) => void;
  onDelete: (challengeId: string) => void;
  cellClassName?: string;
}) {
  return (
    <DataTable
      columns={challengeColumns({onEdit, onDelete, cellClassName})}
      data={challenges}
    />
  );
}
