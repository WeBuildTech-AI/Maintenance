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

      <DialogContent
        className="sm:max-w-4xl w-[92vw] max-h-[85vh] p-0 flex flex-col bg-card text-card-foreground"
        style={{ width: "min(92vw, 56rem)", maxHeight: "85vh", padding: 0 }}
      >
        <DialogHeader className="border-b p-6">
          <DialogTitle>New Purchase Order</DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-6">
          <NewPOForm {...formProps} />
        </div>

        <div className="flex justify-end gap-3 border-t p-6">
          <Button variant="ghost" onClick={formProps.onCancel}>
            Cancel
          </Button>
          <Button
            className="gap-2 bg-blue-600 hover:bg-blue-700"
            onClick={formProps.createPurchaseOrder}
            disabled={
              !formProps.newPO.vendorId ||
              formProps.newPO.items.every((item) => !item.itemName)
            }
          >
            <Plus className="h-4 w-4" />
            Create Purchase Order
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
