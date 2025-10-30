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
  X, // 'Reject' ke liye
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
import { formatDateOnly } from "../utils/Date"; // Path check karein
import { purchaseOrderService } from "../../store/purchaseOrders";
import toast from "react-hot-toast";

// =========================
// 🔹 TYPE DEFINITIONS
// =========================

interface OrderItem {
  id: string;
  itemName?: string; // Optional
  partNumber?: string;
  unitsOrdered: number;
  unitCost: number;
  price: number; // Price bhi hai
  part?: {
    // Part object bhi nested ho sakta hai
    id: string;
    name: string;
    partNumber?: string;
  };
}

interface Address {
  id: string;
  name?: string;
  street: string;
  city: string;
  stateProvince: string;
  ZIP: string;
  country: string;
}

interface PurchaseOrder {
  id: string;
  poNumber: string;
  status: "pending" | "approved" | "sent" | "cancelled";
  vendorId: string;
  vendor: {
    // Vendor object nested hai
    id: string;
    name: string;
  };
  shippingAddressId?: string;
  shippingAddress?: Address; // Address object
  billingAddressId?: string;
  billingAddress?: Address; // Address object
  orderItems?: OrderItem[];
  dueDate: string; // Date string
  notes?: string;
  extraCosts?: number;
  contactName?: string;
  phoneOrMail?: string;
}

interface PurchaseOrderDetailsProps {
  selectedPO: PurchaseOrder;
  updateState: (status: string) => void; // Sirf status update hota hai
  handleConfirm: (id: string) => void;
  setModalAction: (
    action: "reject" | "approve" | "delete" | "fullfill"
  ) => void; // Actions restrict kiye
  topRef: React.RefObject<HTMLDivElement>;
  commentsRef: React.RefObject<HTMLDivElement>;
  formatMoney: (amount: number) => string;
  addressToLine: (address: Address | null | undefined) => string; // Helper function type
  comment: string; // Comment string hai, array nahi (aapke PurchaseOrders.tsx ke hisaab se)
  showCommentBox: boolean;
  StatusBadge: () => void;
  handleSend: () => void;
  setApproveModal: () => void;
  setShowCommentBox: (show: boolean) => void;
  setComment: (comment: string) => void; // string
  handleEditClick: () => void; // <-- HAMARA NAYA PROP
  fetchPurchaseOrder: () => void;
}

const PurchaseOrderDetails: React.FC<PurchaseOrderDetailsProps> = ({
  selectedPO,
  updateState, // Yeh ab 'purchaseOrders.tsx' mein 'updateStatus' hai
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
  handleEditClick,
  setApproveModal,
  StatusBadge,
  fetchPurchaseOrder,
}) => {
  // Calculate totals
  const subtotal =
    selectedPO.orderItems?.reduce(
      (acc, it) => acc + (it.price || it.unitCost * it.unitsOrdered),
      0
    ) ?? 0;
  const total = subtotal + (selectedPO.extraCosts ?? 0);

  const handleApprove = async (id) => {
    await purchaseOrderService.approvePurchaseOrder(id);
    toast.success("Successfully Approved ");
    fetchPurchaseOrder();
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

            {/* --- EDIT BUTTON CLICK HANDLER --- */}
            <Button
              className="gap-2 bg-white cursor-pointer text-orange-600 border border-orange-600 hover:bg-orange-50"
              onClick={handleEditClick} // <-- YAHAN ADD KIYA
            >
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
                <DropdownMenuItem onClick={() => setModalAction("approve")}>
                  <Check className="h-4 w-4 mr-2" /> Mark as Approved
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => updateState("sent")}>
                  <Mail className="h-4 w-4 mr-2" /> Mark as Sent
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => updateState("cancelled")}>
                  <X className="h-4 w-4 mr-2" /> Cancel
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-red-600"
                  onClick={() => setModalAction("delete")}
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
                    {/* StatusBadge component use karein */}
                    <StatusBadge status={selectedPO.status} />
                  </span>
                </div>
                <div className="capitalize">
                  <div className="text-sm text-muted-foreground mb-1 ">
                    Due Date
                  </div>
                  <span className="capitalize text-sm font-medium">
                    {formatDateOnly(selectedPO.dueDate)}
                  </span>
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <div className="text-sm text-muted-foreground mb-1">Vendor</div>
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">
                  {selectedPO.vendor?.name || "-"}
                </span>
              </div>
            </Card>
          </div>

          {/* ORDER ITEMS */}
          <div>
            <h3 className="font-medium mb-3 mt-4">Order Items</h3>
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
                      <td className="p-3">
                        {it.itemName || it.part?.name || "-"}
                      </td>
                      <td className="p-3">
                        {it.partNumber || it.part?.partNumber || "-"}
                      </td>
                      <td className="p-3">{it.unitsOrdered}</td>
                      <td className="p-3">0</td>{" "}
                      {/* (Yeh value API se aani chahiye) */}
                      <td className="p-3">{formatMoney(it.unitCost)}</td>
                      <td className="p-3">
                        {formatMoney(it.price || it.unitCost * it.unitsOrdered)}
                      </td>
                    </tr>
                  ))}
                  <tr className="border-t">
                    <td colSpan={5} className="p-3 text-right font-medium">
                      Subtotal
                    </td>
                    <td className="p-3 font-medium">{formatMoney(subtotal)}</td>
                  </tr>
                  <tr className="border-t">
                    <td colSpan={5} className="p-3 text-right font-medium">
                      Taxes &amp; Costs
                    </td>
                    <td className="p-3 font-medium">
                      {formatMoney(selectedPO.extraCosts ?? 0)}
                    </td>
                  </tr>
                  <tr className="border-t bg-muted/30">
                    <td colSpan={5} className="p-3 text-right font-semibold">
                      Total
                    </td>
                    <td className="p-3 font-semibold">{formatMoney(total)}</td>
                  </tr>
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
                <div className="text-sm">
                  {/* addressToLine helper use karein */}
                  {addressToLine(selectedPO.shippingAddress)}
                </div>
              </div>
            </Card>
            <Card className="p-4">
              <div className="text-sm text-muted-foreground mb-2">
                Shipping Contact
              </div>
              <div className="flex items-start gap-2">
                <div className="text-sm">
                  {/* addressToLine helper use karein */}
                  {selectedPO.contactName}
                </div>
                <div className="text-sm">{selectedPO.phoneOrMail}</div>
              </div>
            </Card>
          </div>
          <div className="grid grid-cols-2 gap-6 mt-4">
            <Card className="p-4">
              <div className="text-sm text-muted-foreground mb-2">
                Billing Info
              </div>
              <div className="flex items-start gap-2">
                <Building2 className="h-4 w-4 text-muted-foreground mt-1" />
                <div className="text-sm">
                  {addressToLine(
                    selectedPO.billingAddress || selectedPO.shippingAddress
                  )}
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* COMMENTS */}
        <div ref={commentsRef}>
          <h3 className="font-medium mb-3">Comments &amp; History</h3>

          {/* TODO: Yahaan aapko comments ki list render karni chahiye */}
          <div className="border rounded-lg p-4 mb-4">
            <div className="text-sm text-muted-foreground mb-2">
              No Comments Found
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
      {selectedPO.status === "pending" ? (
        <>
          <div className="p-6 border-t flex justify-between flex-none bg-white">
            <Button
              onClick={() => setModalAction("reject")}
              className="gap-2 text-red-600 bg-white border border-red-600 rounded-md px-4 py-2 text-sm font-medium hover:bg-red-50 cursor-pointer"
            >
              <X className="h-4 w-4" />
              Reject
            </Button>
            <Button
              onClick={() => {
                setModalAction("approve");
                handleApprove(selectedPO.id);
              }}
              // onClick={() => handleConfirm(selectedPO.i)}
              className="gap-2 bg-orange-600 hover:bg-orange-700 text-white rounded-md px-4 py-2 text-sm font-medium cursor-pointer flex items-center"
            >
              <Check className="h-4 w-4" /> {/* 'Upload' ki jagah 'Check' */}
              Approve
            </Button>
          </div>
        </>
      ) : (
        <>
          <div className="p-6 border-t flex justify-end flex-none bg-white">
            <Button
              onClick={() => setModalAction("fullfill")} // 'fullfill' action
              className="gap-2 bg-orange-600 hover:bg-orange-700 text-white rounded-md px-4 py-2 text-sm font-medium cursor-pointer flex items-center"
            >
              <Upload className="h-4 w-4" />
              Fulfill
            </Button>
          </div>
        </>
      )}
    </div>
  );
};

export default PurchaseOrderDetails;
