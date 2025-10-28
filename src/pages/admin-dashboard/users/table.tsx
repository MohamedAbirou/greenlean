"use client";

import { DataTable } from "@/shared/components/data-table/data-table";
import { userColumns, type User } from "./columns";

export default function UsersTable({
  users,
  onEdit,
  onDelete,
  currentUser,
}: {
  users: User[];
  onEdit: (user: User) => void;
  onDelete: (id: string) => void;
  currentUser: User;
}) {
  return (
    <DataTable
      columns={userColumns({
        onEdit,
        onDelete,
        currentUserId: currentUser?.id,
      })}
      data={users}
    />
  );
}
