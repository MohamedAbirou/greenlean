"use client";

import { Button } from "@/shared/components/ui/button";
import type { Table } from "@tanstack/react-table";

interface DataTablePaginationProps<TData> {
  table: Table<TData>;
}

export function DataTablePagination<TData>({ table }: DataTablePaginationProps<TData>) {
  return (
    <div className="flex flex-col md:flex-row gap-2 items-center justify-between overflow-auto">
      <div className="text-sm text-foreground">
        Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()} •{" "}
        {table.getFilteredRowModel().rows.length} result(s)
      </div>

      <select
        className="border rounded px-2 py-1 text-sm bg-background"
        value={table.getState().pagination.pageSize}
        onChange={(e) => table.setPageSize(Number(e.target.value))}
      >
        {[5, 10, 20, 50].map((size) => (
          <option key={size} value={size} className="bg-card">
            Show {size}
          </option>
        ))}
      </select>
      <div className="flex items-center gap-2">
        <Button onClick={() => table.setPageIndex(0)} disabled={!table.getCanPreviousPage()}>
          « First
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          Next
        </Button>

        <Button
          onClick={() => table.setPageIndex(table.getPageCount() - 1)}
          disabled={!table.getCanNextPage()}
        >
          Last »
        </Button>
      </div>
    </div>
  );
}
