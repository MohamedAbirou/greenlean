"use client";

import { DataTable } from "@/shared/components/data-table/data-table";
import type { Badge } from "@/shared/types/challenge";
import { badgeColumns } from "./columns";

export default function BadgesTable({
  badges,
  onEdit,
  onDelete
}: {
  badges: Badge[];
  onEdit: (badge: Badge) => void;
  onDelete: (badgeId: string) => void;
  cellClassName?: string;
}) {
  return (
    <DataTable
      columns={badgeColumns({onEdit, onDelete})}
      data={badges}
    />
  );
}
