"use client";

import { DataTable } from "@/shared/components/data-table/data-table";
import type { Challenge } from "@/shared/types/challenge";
import { challengeColumns } from "./columns";

export default function ChallengesTable({
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
