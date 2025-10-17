"use client"

import { DataTable } from "@/components/data-table/data-table"
import { userColumns } from "./columns"

export default function UsersTable({
  users,
  onEdit,
  onDelete,
  currentUser,
}: {
  users: any[]
  onEdit: (user: any) => void
  onDelete: (id: string) => void
  currentUser: any
}) {
  return (
    <DataTable
      columns={userColumns(onEdit, onDelete, currentUser?.id)}
      data={users}
    />
  )
}
