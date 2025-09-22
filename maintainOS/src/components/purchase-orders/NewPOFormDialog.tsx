"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Plus } from "lucide-react";
import { NewPOForm } from "./NewPOForm";
import type { NewPOFormProps } from "./po.types";

type NewPOFormDialogProps = NewPOFormProps & {
  triggerLabel?: string;
};

export function NewPOFormDialog({ triggerLabel = "New Purchase Order", ...formProps }: NewPOFormDialogProps) {
  return (
    <Dialog>
      {/* Trigger button */}
      <DialogTrigger asChild>
        <Button className="gap-2 bg-blue-600 hover:bg-blue-700">
          <Plus className="h-4 w-4" />
          {triggerLabel}
        </Button>
      </DialogTrigger>

      {/* Modal Content */}
      <DialogContent className="max-w-4xl w-full p-0 overflow-hidden">
        <DialogHeader className="border-b p-6">
          <DialogTitle>New Purchase Order</DialogTitle>
        </DialogHeader>

        {/* Body = your existing form */}
        <div className="h-[80vh] overflow-y-auto">
          <NewPOForm {...formProps} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
