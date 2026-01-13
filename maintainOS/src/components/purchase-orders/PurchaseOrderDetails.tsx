import React, { useEffect, useState } from "react";
import {
  Building2,
  Check,
  CopyPlusIcon,
  Edit,
  LinkIcon,
  Mail,
  MoreHorizontal,
  PhoneCallIcon,
  Trash2,
  Upload,
  X,
  User,
  CopyIcon,
  Settings,
  FileText,
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
import { formatDateOnly } from "../utils/Date";
import { purchaseOrderService } from "../../store/purchaseOrders";
import toast from "react-hot-toast";
import PurchaseStockUI from "./PurchaseStockUI";
import ContinueModal from "./ContinueModal";
import { Tooltip } from "../ui/tooltip";
import Loader from "../Loader/Loader";
import type { RootState } from "../../store";
import { useSelector } from "react-redux";
import { renderInitials } from "../utils/renderInitials";
import { addressToLine, formatMoney } from "./helpers"; // ✅ Global INR helper
import { StatusBadge } from "./StatusBadge";
import { useNavigate } from "react-router-dom";
import ReceiptModal from "./ReceiptModal";

// --- Interfaces ---
interface OrderItem {
  id: string;
  itemName?: string;
  partNumber?: string;
  unitsOrdered: number;
  unitsReceived: number;
  unitsRemaining?: number;
  unitCost: number;
  price: number;
  part?: {
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

interface TaxItems {
  id: string;
  taxLabel: string;
  taxValue: string;
  taxCategory: "PERCENTAGE" | "FIXED";
  isTaxable?: boolean;
  purchaseOrderId?: string;
}

interface VendorContact {
  id: string;
  fullName: string;
  role?: string;
  email?: string;
  phoneNumber?: string;
}

interface PurchaseOrder {
  id: string;
  poNumber: string;
  status:
    | "pending"
    | "approved"
    | "sent"
    | "cancelled"
    | "fulfilled"
    | "partially_fulfilled"
    | "completed";
  vendorId: string;
  vendor: {
    id: string;
    name: string;
    contacts?: VendorContact[];
  };
  shippingAddressId?: string;
  shippingAddress?: Address;
  billingAddressId?: string;
  billingAddress?: Address;
  orderItems?: OrderItem[];
  dueDate: string;
  notes?: string;
  extraCosts?: number;
  contactName?: string;
  phoneOrMail?: string;
  taxesAndCosts?: TaxItems[];
  vendorContactIds?: string[];
  contacts: VendorContact[];
  amounts?: {
    subtotal: number;
    grandTotal: number;
  };
}

interface PurchaseOrderDetailsProps {
  selectedPO: any;
  updateState: (status: string) => void;
  handleConfirm: (id: string) => void;
  setModalAction: (
    action: "reject" | "approve" | "delete" | "fullfill" | "cancelled"
  ) => void;
  topRef: React.RefObject<HTMLDivElement>;
  commentsRef: React.RefObject<HTMLDivElement>;
  formatMoney: (amount: number) => string;
  addressToLine: (address: any) => string;
  comment?: string;
  showCommentBox: boolean;
  setApproveModal: () => void;
  setShowCommentBox: (show: boolean) => void;
  setComment: (comment: string) => void;
  handleEditClick: () => void;
  handleCopyClick: () => void;
  fetchPurchaseOrder: () => void;
  restoreData: String;
  onClose: () => void;
  showDeleted: boolean;
  showCommentSection: boolean;
}

const PurchaseOrderDetails: React.FC<PurchaseOrderDetailsProps> = ({
  selectedPO,
  updateState,
  setModalAction,
  topRef,
  commentsRef,
  showCommentBox,
  setShowCommentBox,
  handleEditClick,
  handleCopyClick,
  setApproveModal,
  fetchPurchaseOrder,
  restoreData,
  onClose,
  showDeleted,
  showCommentSection,
}) => {
  const navigate = useNavigate();
  const [fullFillModal, setFullFillModal] = React.useState(false);
  const [continueModal, setContinueModal] = React.useState(false);
  const [commentData, setCommentData] = React.useState([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [comment, setComment] = React.useState("");
  const [log, setLog] = React.useState([]);
  const modalRef = React.useRef<HTMLDivElement>(null);
  const user = useSelector((state: RootState) => state.auth.user);

  const [contactDetails, setContactDetails] = React.useState<any[]>([]);
  const [isLoadingContacts, setIsLoadingContacts] = React.useState(false);
  
  // ✅ Receipt State
  const [receiptHistory, setReceiptHistory] = useState<any[]>([]);
  const [selectedReceipt, setSelectedReceipt] = useState<any>(null);

  // --- FETCH FUNCTIONS ---
  const fetchPurchaseOrderLog = async () => {
    if (!selectedPO?.id) return;
    try {
      const res = await purchaseOrderService.fetchPurchaseOrderLog(selectedPO.id);
      if (Array.isArray(res)) {
        setLog(res);
      } else if ((res as any)?.data) {
        setLog((res as any).data);
      } else if ((res as any)?.purchaseOrderLogs) {
         setLog((res as any).purchaseOrderLogs);
      } else {
        setLog([]);
      }
    } catch (err) {
      console.error("Failed to fetch logs:", err);
    }
  };

  const fetchPurchaseOrderComments = async () => {
    try {
      const res = await purchaseOrderService.FetchPurchaseOrderComment(
        selectedPO.id
      );
      setCommentData(res);
    } catch (err) {
      console.log(err);
    }
  };

  const fetchReceipts = async () => {
    if (!selectedPO?.id) return;
    try {
      const data = await purchaseOrderService.fetchPurchaseOrderReceipts(selectedPO.id);
      if (data && Array.isArray(data.receipts)) {
        setReceiptHistory(data.receipts);
      } else if (Array.isArray(data)) {
        setReceiptHistory(data);
      } else {
        setReceiptHistory([]);
      }
    } catch (err) {
      console.error("Failed to fetch receipts", err);
    }
  };

  const refreshAllData = async () => {
    await Promise.all([
      fetchPurchaseOrder(),
      fetchPurchaseOrderLog(),
      fetchPurchaseOrderComments(),
      fetchReceipts(),
    ]);
  };

  useEffect(() => {
    fetchPurchaseOrderComments();
    fetchPurchaseOrderLog();
    fetchReceipts();
  }, [selectedPO.id, selectedPO.status]);

  // --- HANDLERS ---
  const handleApprove = async (id: string) => {
    try {
      await purchaseOrderService.approvePurchaseOrder(id);
      setModalAction("approve");
      toast.success("Successfully Approved");
      refreshAllData();
    } catch {
      toast.error("Failed to Approve");
    }
  };

  const handleContinue = async () => {
    try {
      await purchaseOrderService.completePurchaseOrder(selectedPO.id);
      setContinueModal(false);
      toast.success("Successfully Completed");
      refreshAllData();
    } catch {
      toast.error("Failed to Complete");
    }
  };

  const handleDeleteComment = async (id: string) => {
    await purchaseOrderService.deletePurchaseOrderComment(id);
    fetchPurchaseOrderComments();
    fetchPurchaseOrderLog();
  };

  const handleSend = async () => {
    if (!comment.trim()) {
      toast.error("Please write a comment first.");
      return;
    }
    const poId = selectedPO?.id;
    if (!poId) {
      toast.error("Purchase Order ID is missing.");
      return;
    }
    try {
      const payload = { message: comment };
      await purchaseOrderService.createPurchaseOrderComment(poId, payload);
      toast.success("Comment added successfully!");
      setComment("");
      setShowCommentBox(false);
      refreshAllData();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to add comment.");
    }
  };

  const handleRestorePurchaseOrderData = async (id: any) => {
    try {
      await purchaseOrderService.restorePurchaseOrderData(id);
      fetchPurchaseOrder();
      onClose();
      toast.success("Successfully Restored the Purchase Order");
    } catch (err) {
      toast.error("Failed to restore the Purchase order Data");
    }
  };

  // ✅ UPDATED: Inject matching PO Item data into Receipt Data
  const handleViewReceipt = (receipt: any) => {
    // Find the original item in the main PO to get total Ordered/Received counts
    const originalItem = selectedPO.orderItems?.find(
        (oi: any) => oi.partId === receipt.partId || oi.itemName === receipt.itemName
    );

    const formattedData = {
        date: receipt.receivedAt,
        notes: receipt.notes,
        items: [{
            itemName: receipt.itemName,
            partNumber: originalItem?.partNumber || "", // Get from PO Item
            receivedQty: receipt.unitsReceived, // Qty in THIS receipt
            unitCost: receipt.unitCost,
            lineTotal: receipt.lineTotal,
            
            // ✅ Inject Missing Data for Modal
            unitsOrdered: originalItem?.unitsOrdered || 0,
            totalUnitsReceived: originalItem?.unitsReceived || 0 // Cumulative
        }]
    };
    setSelectedReceipt(formattedData);
  };

  // --- CALCULATIONS ---
  const subtotal =
    selectedPO.amounts?.subtotal || 
    selectedPO.orderItems?.reduce((acc: number, item: any) => {
      const cost = Number(item.unitCost) || 0;
      const qty = Number(item.unitsOrdered) || 0;
      const itemTotal = item.price ? Number(item.price) : cost * qty;
      return acc + itemTotal;
    }, 0) || 0;

  const taxesAndCosts = selectedPO.taxesAndCosts || [];
  const extraCosts = Number(selectedPO.extraCosts) || 0;

  const taxTotal = taxesAndCosts.reduce((acc: number, tax: any) => {
    if (tax.taxCategory === "PERCENTAGE") {
      return acc + (subtotal * Number(tax.taxValue || 0)) / 100;
    }
    return acc + Number(tax.taxValue || 0);
  }, 0);

  const total = selectedPO.amounts?.grandTotal || (subtotal + extraCosts + taxTotal);

  // Real Received Items (from PO)
  const receivedItems = selectedPO.orderItems?.filter((item: any) => item.unitsReceived > 0) || [];
  const receivedTotal = receivedItems.reduce(
    (acc: number, item: any) => acc + item.unitsReceived * item.unitCost,
    0
  );

  return (
    <div className="h-full flex flex-col min-h-0">
      {/* HEADER */}
      <div className="p-3 border-b border-border flex-shrink-0">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-medium">
              Purchase Order #{selectedPO.poNumber}
            </h1>
            <Tooltip text="Copy Link">
              <LinkIcon
                onClick={() => {
                  const url = `${window.location.origin}/purchase-orders/${selectedPO?.id}`;
                  navigator.clipboard.writeText(url);
                  toast.success("Purchase Order link copied!");
                }}
                className="h-4 w-4 text-orange-600 cursor-pointer"
              />
            </Tooltip>
          </div>

          <div className="flex items-center gap-2">
            <Button
              className="gap-2 bg-white cursor-pointer text-orange-600 border border-orange-600 hover:bg-orange-50"
              onClick={handleEditClick}
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
              {!showDeleted && (
                <DropdownMenuContent align="end">
                  {selectedPO.status === "pending" && (
                    <DropdownMenuItem
                      onClick={() => handleApprove(selectedPO.id)}
                    >
                      <Check className="h-4 w-4 mr-2" /> Mark as Approved
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem
                    onClick={() => {
                      const url = `${window.location.origin}/purchase-orders/${selectedPO?.id}`;
                      navigator.clipboard.writeText(url);
                      toast.success("Purchase Order link copied!");
                    }}
                  >
                    <CopyPlusIcon className="h-4 w-4 mr-2" /> Copy Link
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleCopyClick}>
                    <CopyIcon className="h-4 w-4 mr-2" /> Copy Purchase Order
                  </DropdownMenuItem>
                  {(selectedPO.status === "approved" ||
                    selectedPO.status === "pending") && (
                    <DropdownMenuItem
                      onClick={() => setModalAction("cancelled")}
                    >
                      <X className="h-4 w-4 mr-2" /> Cancel
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem
                    className="text-red-600"
                    onClick={() => setModalAction("delete")}
                  >
                    <Trash2 className="h-4 w-4 mr-2" /> Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              )}
              {showDeleted && (
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    className="text-red-600"
                    onClick={() =>
                      handleRestorePurchaseOrderData(selectedPO?.id)
                    }
                  >
                    Restore
                  </DropdownMenuItem>
                </DropdownMenuContent>
              )}
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* CONTENT */}
      <div className="flex-1 overflow-y-auto min-h-0 p-6 space-y-8  ">
        <div ref={topRef}>
          {/* STATUS + VENDOR */}
          <div className="grid grid-cols-2 gap-6">
            <Card className="p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="capitalize">
                  <div className="text-sm text-muted-foreground mb-1 ">
                    Status
                  </div>
                  <StatusBadge status={selectedPO.status} />
                </div>
                {selectedPO.status === "completed" ? null : (
                  <>
                    {selectedPO.dueDate && (
                      <div className="capitalize">
                        <div className="text-sm text-muted-foreground mb-1">
                          Due Date
                        </div>
                        {(() => {
                          const dueDate = new Date(selectedPO?.dueDate);
                          const today = new Date();
                          today.setHours(0, 0, 0, 0);
                          const isOverdue = dueDate < today;
                          return (
                            <span
                              className={`capitalize text-sm font-medium ${
                                isOverdue ? "text-red-600 font-semibold" : ""
                              }`}
                            >
                              {isOverdue ? (
                                <div className="">
                                  <span>
                                    {formatDateOnly(selectedPO.dueDate)}
                                  </span>
                                  <p>Overdue</p>
                                </div>
                              ) : (
                                formatDateOnly(selectedPO.dueDate)
                              )}
                            </span>
                          );
                        })()}
                      </div>
                    )}
                  </>
                )}
              </div>
            </Card>
          </div>
          <div>
            <Card className="p-3 rounded-lg mt-4">
              <div className="text-sm text-muted-foreground mb-1">Vendor</div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                  <span
                    className="font-medium cursor-pointer hover-text "
                    onClick={() =>
                      navigate(`/vendors/${selectedPO.vendor?.id}`)
                    }
                  >
                    {selectedPO.vendor?.name || "-"}
                  </span>
                </div>
                <div className="w-64">
                  {selectedPO.vendor?.contacts &&
                    selectedPO.vendor.contacts.length > 0 && (
                      <>
                        <div className="p-3  rounded-lg bg-gray-50 mb-2">
                          <div className="font-medium">
                            Name :- {selectedPO.vendor.contacts[0]?.fullName}
                          </div>
                          <div
                            className="text-sm text-oa-600 cursor-pointer"
                            onClick={() => {
                              const email =
                                selectedPO.vendor.contacts[0]?.email;
                              if (email)
                                window.location.href = `mailto:${email}`;
                            }}
                          >
                            Email :-{" "}
                            <span className="text-orange-600">
                              {selectedPO.vendor.contacts[0]?.email}
                            </span>
                          </div>
                          <div className="text-sm text-gray-600">
                            Phone :-
                            <span className="text-orange-600">
                              {selectedPO.vendor.contacts[0]?.phoneNumber}
                            </span>
                          </div>
                        </div>
                      </>
                    )}
                </div>
              </div>
            </Card>
          </div>

          {/* ORDER ITEMS - ✅ ADDED REMAINING COLUMN */}
          {selectedPO.orderItems && (
            <div>
              <h3 className="font-medium mb-3 mt-4">Order Items</h3>
              <div className="overflow-x-auto border rounded-lg">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50">
                    <tr className="text-left">
                      <th className="p-3">Item Name</th>
                      <th className="p-3">Part Number</th>
                      <th className="p-3 text-center">Ordered</th>
                      <th className="p-3 text-center">Received</th>
                      {/* ✅ Remaining Column */}
                      <th className="p-3 text-center">Remaining</th>
                      <th className="p-3 text-right">Unit Cost</th>
                      <th className="p-3 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedPO.orderItems?.map((it: any) => (
                      <tr key={it.id} className="border-t">
                        <td className="p-3">
                          {it.itemName || it.part?.name || "-"}
                        </td>
                        <td className="p-3">
                          {it.partNumber || it.part?.partNumber || "-"}
                        </td>
                        <td className="p-3 text-center">{it.unitsOrdered}</td>
                        <td className="p-3 text-center text-green-600 font-medium">
                          {it.unitsReceived || 0}
                        </td>
                        {/* ✅ Calculation Logic for Remaining */}
                        <td className="p-3 text-center text-orange-600 font-medium">
                          {it.unitsRemaining ?? (it.unitsOrdered - (it.unitsReceived || 0))}
                        </td>
                        <td className="p-3 text-right">
                          {formatMoney(it.unitCost)}
                        </td>
                        <td className="p-3 text-right">
                          {formatMoney(
                            it.price
                              ? Number(it.price)
                              : Number(it.unitCost) * Number(it.unitsOrdered)
                          )}
                        </td>
                      </tr>
                    ))}

                    {/* Subtotal */}
                    <tr className="border-t">
                      <td colSpan={6} className="p-3 text-right font-medium">
                        Subtotal
                      </td>
                      <td className="p-3 text-right font-medium">
                        {formatMoney(subtotal)}
                      </td>
                    </tr>

                    {/* Taxes and Costs */}
                    {taxesAndCosts?.length > 0 &&
                      taxesAndCosts.map((tax: any) => (
                        <tr key={tax.id} className="border-t">
                          <td
                            colSpan={6}
                            className="p-3 text-right font-medium capitalize"
                          >
                            {tax.taxLabel}{" "}
                            {tax.taxCategory === "PERCENTAGE"
                              ? `(${tax.taxValue}%)`
                              : ""}
                          </td>
                          <td className="p-3 font-medium text-right">
                            {tax.taxCategory === "PERCENTAGE"
                              ? formatMoney(
                                  (subtotal * Number(tax.taxValue || 0)) / 100
                                )
                              : formatMoney(Number(tax.taxValue || 0))}
                          </td>
                        </tr>
                      ))}

                    {/* Extra Costs */}
                    {extraCosts > 0 && (
                      <tr className="border-t">
                        <td colSpan={6} className="p-3 text-right font-medium">
                          Extra Costs
                        </td>
                        <td className="p-3 font-medium text-right">
                          {formatMoney(extraCosts)}
                        </td>
                      </tr>
                    )}

                    {/* Total */}
                    <tr className="border-t bg-muted/30">
                      <td colSpan={6} className="p-3 text-right font-semibold">
                        Total
                      </td>
                      <td className="p-3 font-semibold text-right">
                        {formatMoney(total)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* RECEIVED COST BREAKDOWN */}
          {receivedItems.length > 0 && (
            <div className="mt-8">
              <h3 className="font-medium mb-3 mt-4">Received Cost Breakdown</h3>
              <div className="overflow-x-auto border rounded-lg">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50">
                    <tr className="text-left">
                      <th className="p-3">Item Name</th>
                      <th className="p-3 text-right">Received</th>
                      <th className="p-3 text-right">Unit Cost</th>
                      <th className="p-3 text-right">Total Cost</th>
                    </tr>
                  </thead>
                  <tbody>
                    {receivedItems.map((item: any) => {
                      const totalCost = item.unitsReceived * item.unitCost;
                      return (
                        <tr key={item.id} className="border-t">
                          <td className="p-3">
                            <div className="flex items-center gap-3">
                              <div className="h-8 w-8 flex-shrink-0 flex items-center justify-center rounded border border-gray-200 bg-white">
                                <Settings className="h-4 w-4 text-gray-400" />
                              </div>
                              <div className="flex flex-col">
                                <span className="font-semibold text-gray-900">
                                  {item.itemName || item.part?.name}
                                </span>
                                <span className="text-xs text-gray-500">
                                  {item.partNumber || item.part?.partNumber}
                                </span>
                              </div>
                            </div>
                          </td>
                          <td className="p-3 text-right">{item.unitsReceived}</td>
                          <td className="p-3 text-right">
                            {formatMoney(item.unitCost)}
                          </td>
                          <td className="p-3 text-right font-semibold">
                            {formatMoney(totalCost)}
                          </td>
                        </tr>
                      );
                    })}

                    {/* Subtotal */}
                    <tr className="border-t">
                      <td colSpan={3} className="p-3 text-right font-medium">
                        Subtotal
                      </td>
                      <td className="p-3 text-right font-medium">
                        {formatMoney(receivedTotal)}
                      </td>
                    </tr>

                    {/* Total */}
                    <tr className="border-t bg-muted/30">
                      <td colSpan={3} className="p-3 text-right font-semibold">
                        Total received cost
                      </td>
                      <td className="p-3 font-semibold text-right">
                        {formatMoney(receivedTotal)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* RECEIPT SUMMARY SECTION */}
          <div className="mt-8">
            <h3 className="font-medium mb-3 mt-4 text-gray-900">
              Receipt Summary
            </h3>
            {receiptHistory.length === 0 ? (
                <p className="text-sm text-gray-500 italic">No receipts found.</p>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                {receiptHistory.map((receipt, index) => {
                    const total = receipt.lineTotal || 0;

                    return (
                    <div
                        key={receipt.receiptId || index}
                        onClick={() => handleViewReceipt(receipt)}
                        className="border border-gray-200 rounded-lg p-4 cursor-pointer hover:border-orange-300 hover:shadow-sm transition-all bg-white group"
                    >
                        <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-orange-50 flex items-center justify-center text-orange-600 group-hover:bg-orange-100 transition-colors">
                            <FileText size={20} />
                            </div>
                            <div>
                            <div className="font-medium text-gray-900">
                                Receipt #{index + 1}
                            </div>
                            <div className="text-xs text-gray-500">
                                {receipt.receivedAt ? new Date(receipt.receivedAt).toLocaleDateString() : "-"}
                            </div>
                            <div className="text-xs text-gray-400 mt-0.5">
                                {receipt.itemName} ({receipt.unitsReceived} units)
                            </div>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="text-sm font-semibold text-gray-900">
                            {formatMoney(total)}
                            </div>
                            <div className="text-xs text-green-600 font-medium">
                            View Receipt
                            </div>
                        </div>
                        </div>
                    </div>
                    );
                })}
                </div>
            )}
          </div>

          {/* ADDRESSES */}
          <div className="grid grid-cols-2 gap-6 mt-4">
            <Card className="p-4 rounded-lg">
              <div className="text-sm text-muted-foreground mb-2">
                Shipping Info
              </div>
              <div className="flex items-start gap-2">
                <Building2 className="h-4 w-4 text-muted-foreground mt-1" />
                <div className="text-sm">
                  {addressToLine(selectedPO.shippingAddress)}
                </div>
              </div>
            </Card>

            {(selectedPO.contactName || selectedPO.phoneOrMail) && (
              <Card className="p-4 rounded-lg">
                <div className="text-sm text-muted-foreground mb-2">
                  Shipping Contact (Legacy)
                </div>
                <div className="flex items-start gap-2">
                  <div className="text-sm">{selectedPO.contactName}</div>
                  <div className="text-sm flex items-center gap-1">
                    <PhoneCallIcon size={12} />
                    {selectedPO.phoneOrMail}
                  </div>
                </div>
              </Card>
            )}
          </div>

          <div className="grid grid-cols-2 gap-6 mt-4">
            <Card className="p-4 rounded-lg">
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

        {/* COMMENTS & HISTORY */}
        <div ref={commentsRef}>
          {/* Comments Section */}
          <h3 className="font-medium mb-3">Comments</h3>
          <div className="border rounded-lg p-4 mb-4 max-h-64 overflow-y-auto">
            {isLoading ? (
              <Loader />
            ) : (
              <>
                {commentData?.length === 0 ? (
                  <div className="text-sm text-muted-foreground mb-2">
                    No Comments Found
                  </div>
                ) : (
                  <div className="space-y-4">
                    {[...commentData].reverse().map((item: any) => {
                      const initials = item?.author?.name
                        ? item.author.name.split(" ").map((n:string) => n[0]).join("").slice(0,2).toUpperCase()
                        : "?";
                      const formattedDate = new Date(item.createdAt).toLocaleString();

                      return (
                        <div key={item.id} className="flex items-start gap-3 border-b pb-3 last:border-b-0 group relative">
                          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-orange-100 text-orange-700 font-semibold">
                            {initials}
                          </div>
                          <div className="flex-1">
                            <div className="flex justify-between text-xs mb-1">
                              <div className="font-medium text-black capitalize ">
                                {item.author?.name || "Unknown User"}
                              </div>
                              <div className="flex justify-center itme-center">
                                <span className="mr-2">{formattedDate}</span>
                                <button onClick={() => handleDeleteComment(item.id)} className="text-red-600">
                                  <Trash2 className="w-4 h-4 pt-3" />
                                </button>
                              </div>
                            </div>
                            <p className="text-sm text-gray-800">{item.message}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </>
            )}
          </div>

          {showCommentSection !== false && (
            <Comment
              selectedPO={selectedPO}
              showCommentBox={showCommentBox}
              comment={comment}
              handleSend={handleSend}
              setShowCommentBox={setShowCommentBox}
              setComment={setComment}
              fetchPurchanseOrder={fetchPurchaseOrder}
            />
          )}

          {/* History Section */}
          <div>
            <h3 className="font-medium mb-3">History</h3>
            <div className="space-y-4 border rounded p-4 mb-4 mr-1 max-h-64 overflow-y-auto">
              {isLoading ? (
                <Loader />
              ) : (
                <>
                  {log.length === 0 ? <p className="text-sm text-gray-500">No history found</p> : 
                  [...log].reverse().map((item: any) => {
                    const formattedDate = new Date(item.createdAt).toLocaleString();
                    const message = item.responseLog || "No activity message";
                    const authorName = user?.fullName || "Unknown User";

                    return (
                      <div key={item.id} className="flex items-start gap-3 pb-1 last:border-b-0">
                        <div className="flex items-center justify-center mt-1 capitalize font-medium w-8 h-8 rounded-full bg-orange-100 text-orange-700 font-semibold">
                          {renderInitials(user?.fullName || "")}
                        </div>
                        <div className="flex-1">
                          <div className="flex gap-4 capitalize text-xs text-muted-foreground mb-1">
                            <span>{authorName}</span>
                            <span>{formattedDate}</span>
                          </div>
                          <p className="text-sm text-gray-800">{message}</p>
                        </div>
                      </div>
                    );
                  })}
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* FOOTER BUTTONS */}
      {selectedPO.status === "pending" && (
        <div className="p-6 border-t flex justify-between flex-none bg-white">
          <Button
            onClick={() => setModalAction("reject")}
            className="gap-2 text-red-600 bg-white border border-red-600 rounded-md px-4 py-2 text-sm font-medium hover:bg-red-50 cursor-pointer"
          >
            <X className="h-4 w-4" />
            Reject
          </Button>
          <Button
            onClick={() => handleApprove(selectedPO.id)}
            className="gap-2 bg-orange-600 hover:bg-orange-700 text-white rounded-md px-4 py-2 text-sm font-medium cursor-pointer flex items-center"
          >
            <Check className="h-4 w-4" />
            Approve
          </Button>
        </div>
      )}

      {selectedPO.status === "approved" && (
        <div className="p-6 border-t flex justify-end flex-none bg-white">
          <Button
            onClick={() => setFullFillModal(true)}
            className="gap-2 bg-orange-600 hover:bg-orange-700 text-white rounded-md px-4 py-2 text-sm font-medium cursor-pointer flex items-center"
          >
            <Upload className="h-4 w-4" />
            Fulfill
          </Button>
        </div>
      )}

      {selectedPO.status === "partially_fulfilled" && (
        <div className="p-6 border-t flex justify-end flex-none bg-white gap-4">
          <Button
            onClick={() => setFullFillModal(true)}
            className="gap-2 bg-orange-600 hover:bg-orange-700 text-white rounded-md px-4 py-2 text-sm font-medium cursor-pointer flex items-center"
          >
            <Upload className="h-4 w-4" />
            Fulfill
          </Button>
          <Button
            onClick={() => setContinueModal(true)}
            className="gap-2 bg-orange-600 hover:bg-orange-700 text-white rounded-md px-4 py-2 text-sm font-medium cursor-pointer flex items-center"
          >
            <Check className="h-4 w-4" />
            Continue
          </Button>
        </div>
      )}

      {fullFillModal && (
        <PurchaseStockUI
          setFullFillModal={setFullFillModal}
          selectedPO={selectedPO}
          fetchPurchaseOrder={refreshAllData}
        />
      )}

      {continueModal && (
        <ContinueModal
          onClose={() => setContinueModal(false)}
          onConfirm={handleContinue}
          modalRef={modalRef}
        />
      )}

      {/* ✅ RECEIPT MODAL INTEGRATION */}
      <ReceiptModal
        isOpen={!!selectedReceipt}
        onClose={() => setSelectedReceipt(null)}
        receiptData={selectedReceipt}
        poNumber={selectedPO.poNumber}
      />
    </div>
  );
};

export default PurchaseOrderDetails;