"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Plus } from "lucide-react";
import { NewPOForm } from "./NewPOForm";
import type { NewPOFormProps } from "./po.types";

type NewPOFormDialogProps = NewPOFormProps & {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** If you want the button inside this component */
  showTrigger?: boolean;
  triggerLabel?: string;
};

export function NewPOFormDialog({
  open,
  onOpenChange,
  showTrigger = false,
  triggerLabel = "New Purchase Order",
  ...formProps
}: NewPOFormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {showTrigger && (
        <Button
          className="gap-2 bg-blue-600 hover:bg-blue-700"
          onClick={() => onOpenChange(true)}
        >
          <Plus className="h-4 w-4" />
          {triggerLabel}
        </Button>
      )}

      <DialogContent className="sm:max-w-4xl w-[92vw] max-h-[85vh] p-0 overflow-hidden bg-card text-card-foreground">
        {/* <DialogHeader className="border-b p-6">
          <DialogTitle>New Purchase Order</DialogTitle>
        </DialogHeader> */}

        <div className="h-[70vh] overflow-y-auto">
          <NewPOForm {...formProps} />
          {/* If you still want to test quickly: */}
              {/* <div className="p-6">Temporary Form</div> */}
        </div>
      </DialogContent>
    </Dialog>
  );
}
