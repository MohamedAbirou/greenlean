"use client";

import { useAdminUsersTable } from "@/features/admin/hooks/useUsers";
import { DataTable } from "@/shared/components/data-table/data-table";
import { Loader } from "lucide-react";
import { userColumns } from "./columns";

export default function UsersTable() {
  const { users, isLoading } = useAdminUsersTable();
  if (isLoading) {
    return (
      <div className="min-h-screen pt-24 pb-16 flex items-center justify-center">
        <Loader className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  return (
    <DataTable
      columns={userColumns({})}
      data={users}
      filterKey="email"
    />
  );
}
