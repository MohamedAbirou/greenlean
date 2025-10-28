// components/ui/modals/ConfirmDialog.tsx
"use client"

import { ModalDialog } from "@/shared/components/ui/modal-dialog"
import * as React from "react"
import { Button } from "../ui/button"

interface ConfirmDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title?: string
  description?: string
  confirmLabel?: string
  cancelLabel?: string
  onConfirm: () => void
  loading?: boolean
  error?: string | null
  destructive?: boolean
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  open,
  onOpenChange,
  title = "Confirm Action",
  description = "Are you sure you want to proceed?",
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  onConfirm,
  loading = false,
  error = null,
  destructive = false,
}) => {
  return (
    <ModalDialog
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      description={description}
      size="sm"
    >
      <div className="space-y-4">
        {error && <p className="text-destructive text-sm">{error}</p>}

        <div className="flex gap-3">
          <Button
            onClick={() => onOpenChange(false)}
            disabled={loading}
            className="flex-1"
            variant="secondary"
          >
            {cancelLabel}
          </Button>

          <Button
            onClick={onConfirm}
            disabled={loading}
            className={`flex-1 transition-colors ${
              destructive
                ? "bg-destructive hover:bg-destructive/80"
                : "bg-primary hover:bg-primary/80"
            }`}
          >
            {loading ? "Processing..." : confirmLabel}
          </Button>
        </div>
      </div>
    </ModalDialog>
  )
}
