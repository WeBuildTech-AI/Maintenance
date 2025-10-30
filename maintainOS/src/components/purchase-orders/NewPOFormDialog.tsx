// FILE: NewPOFormDialog.tsx
// (Maan raha hoon ki aapke paas shadcn/ui components hain)

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../ui/dialog"; // Path adjust karein
import { Button } from "../ui/button"; // Path adjust karein
import { NewPOForm } from "./NewPOForm"; // Hamara form component
import { Loader2 } from "lucide-react";
import { type NewPOForm as NewPOFormType } from "./po.types"; // Types import karein

// NewPOFormDialog ke saare props define karein
interface NewPOFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  newPO: NewPOFormType;
  setNewPO: React.Dispatch<React.SetStateAction<NewPOFormType>>;
  newPOSubtotal: number;
  newPOTotal: number;
  addNewPOItemRow: () => void;
  removePOItemRow: (id: string) => void;
  updateItemField: (id: string, field: any, value: any) => void;
  onCancel: () => void;
  handleCreatePurchaseOrder: () => Promise<void>; // Yeh hamara dynamic 'onSubmit' function hai
  isCreating: boolean; // Loading state
  apiError: string | null;
  attachedFiles: File[];
  fileInputRef: React.RefObject<HTMLInputElement>;
  handleFileAttachClick: () => void;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  removeAttachedFile: (fileName: string) => void;
  isEditing: boolean; // <-- HAMARA NAYA PROP
}

export function NewPOFormDialog(props: NewPOFormDialogProps) {
  const {
    open,
    onOpenChange,
    newPO,
    setNewPO,
    newPOSubtotal,
    newPOTotal,
    addNewPOItemRow,
    removePOItemRow,
    updateItemField,
    onCancel,
    handleCreatePurchaseOrder, // Yeh 'onSubmit' hai
    isCreating,
    apiError,
    attachedFiles,
    fileInputRef,
    handleFileAttachClick,
    handleFileChange,
    removeAttachedFile,
    isEditing, // <-- Naya prop
  } = props;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
   <DialogContent
        className="sm:max-w-4xl w-[92vw] max-h-[85vh] p-0 flex flex-col bg-card text-card-foreground"
        style={{ width: "min(92vw, 56rem)", maxHeight: "85vh", padding: 0 }}
      >
        <DialogHeader className="p-6 pb-4">
          <DialogTitle>
            {/* --- 1. DYNAMIC TITLE --- */}
            {isEditing ? "Update Purchase Order" : "New Purchase Order"}
          </DialogTitle>
        </DialogHeader>

        {/* Scrollable Form Area */}
        {/* 'NewPOForm' ko saare props pass karein */}
        <NewPOForm
          newPO={newPO}
          setNewPO={setNewPO}
          newPOSubtotal={newPOSubtotal}
          newPOTotal={newPOTotal}
          addNewPOItemRow={addNewPOItemRow}
          removePOItemRow={removePOItemRow}
          updateItemField={updateItemField}
          isCreating={isCreating}
          apiError={apiError} // Pass apiError to form
          attachedFiles={attachedFiles}
          fileInputRef={fileInputRef}
          handleFileAttachClick={handleFileAttachClick}
          handleFileChange={handleFileChange}
          removeAttachedFile={removeAttachedFile}
        />
        
        {/* Sticky Footer */}
        <DialogFooter className="flex-shrink-0 p-4 border-t bg-muted/50">
          <div className="w-full flex justify-end items-center">
            <div className="flex gap-2">
              <Button
                variant="ghost"
                onClick={onCancel}
                disabled={isCreating}
              >
                Cancel
              </Button>
              <Button
                className="bg-orange-600 hover:bg-orange-700"
                onClick={handleCreatePurchaseOrder} // Yeh 'create' ya 'update' call karega
                disabled={isCreating}
              >
                {isCreating ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : null}

                {/* --- 2. DYNAMIC BUTTON TEXT --- */}
                {isCreating
                  ? isEditing
                    ? "Updating..."
                    : "Creating..."
                  : isEditing
                  ? "Update Purchase Order"
                  : "Create Purchase Order"}
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}


// "use client";

// import * as React from "react";
// import {
//   Dialog,
//   DialogClose,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
// } from "../ui/dialog";
// import { Button } from "../ui/button";
// import { Plus, X } from "lucide-react";
// import { NewPOForm } from "./NewPOForm";
// import type { NewPOFormProps } from "./po.types";

// type NewPOFormDialogProps = NewPOFormProps & {
//   open: boolean;
//   onOpenChange: (open: boolean) => void;
//   /** If you want the button inside this component */
//   showTrigger?: boolean;
//   triggerLabel?: string;
// };

// export function NewPOFormDialog({
//   open,
//   onOpenChange,
//   showTrigger = false,
//   triggerLabel = "New Purchase Order",
//   ...formProps
// }: NewPOFormDialogProps) {
//   return (
//     <Dialog open={open} onOpenChange={onOpenChange}>
//       <DialogContent
//         className="sm:max-w-4xl w-[92vw] max-h-[85vh] p-0 flex flex-col bg-card text-card-foreground"
//         style={{ width: "min(92vw, 56rem)", maxHeight: "85vh", padding: 0 }}
//       >
//         <DialogHeader className="border-b p-6">
//           <DialogTitle>New Purchase Order</DialogTitle>
//           {/* <DialogClose onClick={formProps.onCancel}></DialogClose> */}
//         </DialogHeader>

//         <div className="flex-1 overflow-y-auto p-6">
//           <NewPOForm {...formProps} />
//         </div>

//         <div className="flex justify-end gap-3 border-t p-6">
//           <Button variant="ghost" onClick={formProps.onCancel}>
//             Cancel
//           </Button>
//           <Button
//             className="gap-2 bg-orange-600 hover:bg-orange-700"
//             onClick={formProps.handleCreatePurchaseOrder}
//             disabled={
//               !formProps.newPO.vendorId ||
//               formProps.newPO.items.every((item) => !item.itemName)
//             }
//           >
//             <Plus className="h-4 w-4" />
//             Create Purchase Order
//           </Button>
//         </div>
//       </DialogContent>
//     </Dialog>
//   );
// }
