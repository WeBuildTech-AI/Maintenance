import React from "react";
import {
  Building2,
  Check,
  Edit,
  LinkIcon,
  Mail,
  MoreHorizontal,
  Trash2,
  Upload,
} from "lucide-react";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Card } from "../ui/card";
import Comment from "../ui/comment";

// =========================
// 🔹 TYPE DEFINITIONS
// =========================

interface OrderItem {
  id: string;
  itemName: string;
  partNumber?: string;
  unitsOrdered: number;
  unitCost: number;
}

interface PurchaseOrder {
  id: string;
  poNumber: string;
  status: "pending" | "approved" | "sent" | "cancelled";
  vendorId: string;
  shippingAddressId?: string;
  billingAddressId?: string;
  orderItems?: OrderItem[];
}

interface PurchaseOrderDetailsProps {
  selectedPO: PurchaseOrder;
  updateState: (key: string, value: any) => void;
  handleConfirm: (id: string) => void;
  setModalAction: (action: string) => void;
  topRef: React.RefObject<HTMLDivElement>;
  commentsRef: React.RefObject<HTMLDivElement>;
  formatMoney: (amount: number) => string;
  addressToLine: (id: string) => string;
  comment: string[];
  showCommentBox: boolean;
  handleSend: () => void;
  setShowCommentBox: (show: boolean) => void;
  setComment: (comment: string[]) => void;
}

// =========================
// 🔸 MAIN COMPONENT
// =========================

const PurchaseOrderDetails: React.FC<PurchaseOrderDetailsProps> = ({
  selectedPO,
  updateState,
  handleConfirm,
  setModalAction,
  topRef,
  formatMoney,
  addressToLine,
  commentsRef,
  comment,
  showCommentBox,
  handleSend,
  setShowCommentBox,
  setComment,
}) => {
  // 🧩 Helper: Update PO status
  const updateStatus = (status: string) => {
    updateState("status", status);
  };

  return (
    <div className="h-full flex flex-col min-h-0">
      {/* HEADER */}
      <div className="p-3 border-b border-border flex-shrink-0">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-medium">
              Purchase Order #{selectedPO.poNumber}
            </h1>
            <LinkIcon className="h-4 w-4 text-orange-600" />
          </div>

          {/* HEADER ACTIONS */}
          <div className="flex items-center gap-2">
            <Button className="gap-2 border cursor-pointer border-orange-600 bg-white text-orange-600 hover:bg-orange-50">
              <Upload className="h-4 w-4" />
              Send to Vendor
            </Button>
            <Button className="gap-2 bg-white cursor-pointer text-orange-600 border border-orange-600 hover:bg-orange-50">
              <Edit className="h-4 w-4" />
              Edit
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => updateStatus("approved")}>
                  <Check className="h-4 w-4 mr-2" /> Mark as Approved
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => updateStatus("sent")}>
                  <Mail className="h-4 w-4 mr-2" /> Mark as Sent
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => updateStatus("cancelled")}>
                  <Trash2 className="h-4 w-4 mr-2" /> Cancel
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    handleConfirm(selectedPO.id);
                    setModalAction("delete");
                  }}
                >
                  <Trash2 className="h-4 w-4 mr-2" /> Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* CONTENT */}
      <div className="flex-1 overflow-y-auto min-h-0 p-6 space-y-8 z-50 ">
        <div ref={topRef}>
          {/* STATUS + VENDOR */}
          <div className="grid grid-cols-2 gap-6">
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div className="capitalize">
                  <div className="text-sm text-muted-foreground mb-1 ">
                    Status
                  </div>
                  <span className="capitalize text-sm font-medium">
                    {selectedPO.status}
                  </span>
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <div className="text-sm text-muted-foreground mb-1">Vendor</div>
              <div className="flex items-center gap-2">
                <span>{selectedPO.vendorId}</span>
              </div>
            </Card>
          </div>

          {/* ORDER ITEMS */}
          <div>
            <h3 className="font-medium mb-3">Order Items</h3>
            <div className="overflow-x-auto border rounded-lg">
              <table className="w-full text-sm">
                <thead className="bg-muted/50">
                  <tr className="text-left">
                    <th className="p-3">Item Name</th>
                    <th className="p-3">Part Number</th>
                    <th className="p-3">Units Ordered</th>
                    <th className="p-3">Units Received</th>
                    <th className="p-3">Unit Cost</th>
                    <th className="p-3">Cost of Units Ordered</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedPO.orderItems?.map((it) => (
                    <tr key={it.id} className="border-t">
                      <td className="p-3">{it.itemName}</td>
                      <td className="p-3">{it.partNumber || "-"}</td>
                      <td className="p-3">{it.unitsOrdered}</td>
                      <td className="p-3">0</td>
                      <td className="p-3">{formatMoney(it.unitCost)}</td>
                      <td className="p-3">
                        {formatMoney(it.unitCost * it.unitsOrdered)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* ADDRESSES */}
          <div className="grid grid-cols-2 gap-6 mt-4">
            <Card className="p-4">
              <div className="text-sm text-muted-foreground mb-2">
                Shipping Info
              </div>
              <div className="flex items-start gap-2">
                <Building2 className="h-4 w-4 text-muted-foreground mt-1" />
                <div>{addressToLine(selectedPO.shippingAddressId || "")}</div>
              </div>
            </Card>
            <Card className="p-4">
              <div className="text-sm text-muted-foreground mb-2">
                Billing Info
              </div>
              <div className="flex items-start gap-2">
                <Building2 className="h-4 w-4 text-muted-foreground mt-1" />
                <div>{addressToLine(selectedPO.billingAddressId || "")}</div>
              </div>
            </Card>
          </div>
        </div>

        {/* COMMENTS */}
        <div ref={commentsRef}>
          <h3 className="font-medium mb-3">Comments &amp; History</h3>
          <div className="border rounded-lg p-4">
            <div className="text-sm text-muted-foreground mb-2">
              {comment.length === 0 ? "No Comments Found" : ""}
            </div>
          </div>

          <Comment
            showCommentBox={showCommentBox}
            comment={comment}
            handleSend={handleSend}
            setShowCommentBox={setShowCommentBox}
            setComment={setComment}
          />
        </div>
      </div>

      {/* FOOTER */}
      <div className="p-6 border-t flex justify-between flex-none bg-white">
        {selectedPO.status === "pending" ? (
          <>
            <Button
              onClick={() => setModalAction("reject")}
              className="gap-2 text-red-600 bg-white border border-red-600 rounded-md px-4 py-2 text-sm font-medium hover:bg-red-50 cursor-pointer"
            >
              Reject
            </Button>
            <Button
              onClick={() => setModalAction("approve")}
              className="gap-2 bg-orange-600 hover:bg-orange-700 text-white rounded-md px-4 py-2 text-sm font-medium cursor-pointer flex items-center"
            >
              <Upload className="h-4 w-4" />
              Approve
            </Button>
          </>
        ) : (
          <>
          
          </>
        )}
      </div>
    </div>
  );
};

export default PurchaseOrderDetails;
