// components/ui/modal-dialog.tsx
"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import * as React from "react";

interface ModalDialogProps {
  title?: string;
  description?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
  hideCloseButton?: boolean;
}

export function ModalDialog({
  title,
  description,
  open,
  onOpenChange,
  children,
  size = "md",
}: ModalDialogProps) {
  const sizeClasses = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-2xl",
    xl: "max-w-4xl",
  }[size];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          "bg-background border-border shadow-xl rounded-xl",
          "transition-all duration-300 ease-out",
          "max-h-[90vh] flex flex-col",
          "p-0",
          sizeClasses
        )}
      >
        {(title || description) && (
          <DialogHeader className="p-3 border-b sticky top-0 rounded-t-xl bg-background z-10">
            {title && (
              <DialogTitle className="text-xl font-semibold">
                {title}
              </DialogTitle>
            )}
            {description && (
              <DialogDescription className="text-card-foreground">
                {description}
              </DialogDescription>
            )}
          </DialogHeader>
        )}
        <div className="p-3 overflow-y-auto">{children}</div>
      </DialogContent>
    </Dialog>
  );
}
