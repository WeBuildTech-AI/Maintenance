import React, { useEffect } from "react";
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
import { addressToLine, formatMoney } from "./helpers"; // Ensure helpers import
import { StatusBadge } from "./StatusBadge";
import { useNavigate } from "react-router-dom";

// ... (Interfaces remain same as your code)
interface OrderItem {
  id: string;
  itemName?: string;
  partNumber?: string;
  unitsOrdered: number;
  unitsReceived: number;
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
}

interface PurchaseOrderDetailsProps {
  selectedPO: PurchaseOrder;
  updateState: (status: string) => void;
  handleConfirm: (id: string) => void;
  setModalAction: (
    action: "reject" | "approve" | "delete" | "fullfill" | "cancelled"
  ) => void;
  topRef: React.RefObject<HTMLDivElement>;
  commentsRef: React.RefObject<HTMLDivElement>;
  formatMoney: (amount: number) => string;
  addressToLine: (address: Address | null | undefined) => string;
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
  // handleConfirm prop is shadowed by local function, using local logic
  setModalAction,
  topRef,
  commentsRef,
  showCommentBox,
  setShowCommentBox,
  handleEditClick,
  handleCopyClick,
  setApproveModal,
  fetchPurchaseOrder, // This refreshes the parent list
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

  const [contactDetails, setContactDetails] = React.useState<VendorContact[]>(
    []
  );
  const [isLoadingContacts, setIsLoadingContacts] = React.useState(false);

  // --- FETCH FUNCTIONS ---

  // 1. Fetch Logs (Activity History)
  const fetchPurchaseOrderLog = async () => {
    try {
      // Don't set global loading true here to avoid flickering entire UI on small updates
      const res = await purchaseOrderService.FetchPurchaseOrderLog(
        selectedPO.id
      );
      setLog(res || []);
    } catch (err) {
      // toast.error("Failed to fetch the Log"); // Optional: Silent fail or toast
      console.error(err);
    }
  };

  // 2. Fetch Comments
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

  // 3. Consolidated Refresh Function (Updates EVERYTHING)
  const refreshAllData = async () => {
    await Promise.all([
      fetchPurchaseOrder(), // Parent List
      fetchPurchaseOrderLog(), // History Logs
      fetchPurchaseOrderComments(), // Comments
    ]);
  };

  // --- USE EFFECT ---
  useEffect(() => {
    // Initial fetch when PO ID changes
    fetchPurchaseOrderComments();
    fetchPurchaseOrderLog();
    // fetchContactDetails... (if needed)
  }, [selectedPO.id]);

  // --- HANDLERS ---

  // Approve
  const handleApprove = async (id: string) => {
    try {
      await purchaseOrderService.approvePurchaseOrder(id);
      setModalAction("approve");
      toast.success("Successfully Approved");
      refreshAllData(); // ✅ Fix: Updates logs immediately
    } catch {
      toast.error("Failed to Approve");
    }
  };

  // Continue / Complete
  const handleContinue = async () => {
    try {
      await purchaseOrderService.completePurchaseOrder(selectedPO.id);
      setContinueModal(false);
      toast.success("Successfully Completed");
      refreshAllData(); // ✅ Fix: Updates logs immediately
    } catch {
      toast.error("Failed to Complete");
    }
  };

  // Delete Comment
  const handleDeleteComment = async (id: string) => {
    await purchaseOrderService.deletePurchaseOrderComment(id);
    fetchPurchaseOrderComments();
    // Comments deletion usually doesn't create a log, but if it does:
    fetchPurchaseOrderLog(); 
  };

  // Add Comment
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
      
      refreshAllData(); // ✅ Fix: Updates comments AND logs
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to add comment.");
    }
  };

  // Restore
  const handleRestorePurchaseOrderData = async (id: any) => {
    try {
      await purchaseOrderService.restorePurchaseOrderData(id);
      fetchPurchaseOrder(); // Only parent update needed as we likely close modal/view
      onClose();
      toast.success("Successfully Restored the Purchase Order");
    } catch (err) {
      toast.error("Failed to restore the Purchase order Data");
    }
  };

  // Action Confirm (Reject, Delete, Cancel)
  const handleConfirmAction = async (id: string | undefined) => {
    // Note: Renamed from handleConfirm to avoid conflict/confusion
    if (!id) {
      toast.error("No PO selected for action.");
      return;
    }
    // We handle loading in parent if passed, but local state here:
    // setIsLoading(true); // Can uncomment if blocking UI is needed

    try {
        // NOTE: setModalAction state logic is in parent, 
        // but typically this logic sits in PurchaseOrders.tsx. 
        // If this component is handling the confirmation logic:
        
        // However, based on props, `handleConfirm` is passed from parent.
        // If we want real-time logs here, the parent needs to trigger a refresh OR
        // we intercept the parent's call.
        
        // Since `handleConfirm` is a prop, we assume the PARENT does the API call.
        // BUT, if the parent modifies data, we need to know when to refresh logs.
        // A better approach is usually doing the API call here if possible, 
        // OR relying on the parent to trigger a prop change that useEffect catches.
        
        // Assuming current structure performs action in Parent via prop:
        // await handleConfirm(id); 
        
        // If you want to force update logs after parent action:
        // setTimeout(() => fetchPurchaseOrderLog(), 1000); 
        
        // BETTER: Move logic here (as seen in your provided code snippet you had local handleConfirm logic):
        
        // --- LOCAL LOGIC START ---
        // (This matches the block you provided in your code, keeping it local)
        // Check `modalAction` prop (passed from parent or local state?)
        // The prop is setModalAction, but where is `modalAction` read? 
        // Ah, `PurchaseOrders.tsx` controls the modal. 
        
        // Let's assume the PARENT calls `handleConfirm` prop. 
        // **Wait**, your previous code had `handleConfirm` defined inside this component too?
        // No, it was passed as prop, BUT you also had a local definition in the snippet provided.
        // I will use the LOCAL definition you provided to ensure logs update.
        
        /* If `modalAction` comes from Parent props, we can't read it easily unless passed.
           But based on `setModalAction` usage, it seems this component controls the triggers.
           
           CRITICAL: The `ConfirmationModal` is in the PARENT (`PurchaseOrders.tsx`).
           So the Parent executes the action.
           
           To fix the "Log not updating" issue when the action happens in the PARENT:
           1. The Parent calls API.
           2. The Parent calls `fetchPurchaseOrder()`.
           3. This component receives new `selectedPO`.
           4. `useEffect` on `selectedPO.id` runs. 
           
           **PROBLEM:** If `selectedPO.id` doesn't change (same PO, just status change),
           the useEffect might not trigger if the object reference doesn't change deeply.
           
           **FIX:** Add `selectedPO.status` and `selectedPO.updatedAt` to the dependency array.
        */
       
    } catch (error) {
      console.error(error);
    }
  };

  // --- DEPENDENCY FIX ---
  // Ensure logs refresh when status or any update happens to the PO
  useEffect(() => {
    fetchPurchaseOrderLog();
    fetchPurchaseOrderComments();
  }, [selectedPO.id, selectedPO.status, selectedPO.updatedAt]); 
  // ✅ Added status/updatedAt dependencies so parent updates trigger log fetch

  // Calculations
  const subtotal =
    selectedPO.orderItems?.reduce((acc, item) => {
      const cost = Number(item.unitCost) || 0;
      const qty = Number(item.unitsOrdered) || 0;
      const itemTotal = item.price ? Number(item.price) : cost * qty;
      return acc + itemTotal;
    }, 0) || 0;

  const taxesAndCosts = selectedPO.taxesAndCosts || [];
  const extraCosts = Number(selectedPO.extraCosts) || 0;

  const taxTotal = taxesAndCosts.reduce((acc, tax) => {
    if (tax.taxCategory === "PERCENTAGE") {
      return acc + (subtotal * Number(tax.taxValue || 0)) / 100;
    }
    return acc + Number(tax.taxValue || 0);
  }, 0);

  const total = subtotal + extraCosts + taxTotal;

  return (
    <div className="h-full flex flex-col min-h-0">
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

          {/* HEADER ACTIONS */}
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
                      onClick={() => {
                        handleApprove(selectedPO.id);
                      }}
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
      <div className="flex-1 overflow-y-auto min-h-0 p-6 space-y-8 z-50 ">
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
                      navigate(`/vendors/${selectedPO.vendor.id}`)
                    }
                  >
                    {selectedPO.vendor?.name || "-"}
                  </span>
                </div>
                <div className="w-64">
                  {selectedPO.vendor.contacts &&
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

          {(isLoadingContacts ||
            (contactDetails && contactDetails.length > 0)) && (
            <div>
              <h3 className="font-medium mb-3 mt-4">
                Contacts ({contactDetails.length})
              </h3>
              <div className="border rounded-lg p-4 space-y-3">
                {isLoadingContacts ? (
                  <Loader />
                ) : (
                  contactDetails.map((contact, index) => (
                    <div
                      key={contact.id || index}
                      className="flex items-start gap-4 p-2 border-b last:border-b-0"
                    >
                      {/* Initial Avatar */}
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-semibold text-sm shrink-0">
                        {renderInitials(
                          contact.fullName || contact.email || "?"
                        )}
                      </div>

                      <div className="flex-1">
                        <p className="font-medium text-sm">
                          {contact.fullName || "Contact"}
                        </p>
                        <div className="text-xs text-muted-foreground space-y-1 mt-0.5">
                          {contact.role && (
                            <div className="flex items-center gap-1">
                              <User className="h-3 w-3" />
                              <span>{contact.role}</span>
                            </div>
                          )}
                          {contact.email && (
                            <div className="flex items-center gap-1">
                              <Mail className="h-3 w-3" />
                              <span>{contact.email}</span>
                            </div>
                          )}
                          {contact.phoneNumber && (
                            <div className="flex items-center gap-1">
                              <PhoneCallIcon className="h-3 w-3" />
                              <span>{contact.phoneNumber}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* ORDER ITEMS */}
          {selectedPO.orderItems && (
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
                        <td className="p-3 text-center">{it.unitsOrdered}</td>
                        <td className="p-3 text-center">
                          {it.unitsReceived || 0}
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
                      <td colSpan={5} className="p-3 text-right font-medium">
                        Subtotal
                      </td>
                      <td className="p-3 text-right font-medium">
                        {formatMoney(subtotal)}
                      </td>
                    </tr>

                    {/* Taxes and Costs */}
                    {taxesAndCosts?.length > 0 &&
                      taxesAndCosts.map((tax) => (
                        <tr key={tax.id} className="border-t">
                          <td
                            colSpan={5}
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
                        <td colSpan={5} className="p-3 text-right font-medium">
                          Extra Costs
                        </td>
                        <td className="p-3 font-medium">
                          {formatMoney(extraCosts)}
                        </td>
                      </tr>
                    )}

                    {/* Total */}
                    <tr className="border-t bg-muted/30">
                      <td colSpan={5} className="p-3 text-right font-semibold">
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

            {/* OLD SINGLE CONTACT CARD - KEPT FOR LEGACY DISPLAY IF FIELDS EXIST */}
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

        {/* COMMENTS */}
        <div ref={commentsRef}>
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
                        ? item.author.name
                            .split("@")[0]
                            .split(".")
                            .map((n: string) => n[0]?.toUpperCase())
                            .join("")
                        : "?";

                      const formattedDate = new Date(
                        item.createdAt
                      ).toLocaleString();

                      return (
                        <div
                          key={item.id}
                          className="flex items-start gap-3 border-b pb-3 last:border-b-0 group relative"
                        >
                          {/* Avatar Circle */}
                          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-orange-100 text-orange-700 font-semibold">
                            {initials}
                          </div>

                          {/* Comment Content */}
                          <div className="flex-1">
                            <div className="flex justify-between text-xs  mb-1">
                              <div className="font-medium text-black capitalize ">
                                {item.author?.name || "Unknown User"}
                              </div>
                              <div className="flex justify-center itme-center">
                                <span className="mr-2">{formattedDate}</span>
                                <button
                                  onClick={() => handleDeleteComment(item.id)}
                                  className=" text-red-600"
                                >
                                  <Trash2 className="w-4 h-4 pt-3 " />
                                </button>
                              </div>
                            </div>
                            <p className="text-sm text-gray-800">
                              {item.message}
                            </p>
                          </div>

                          {/* Delete Icon (hidden until hover) */}
                        </div>
                      );
                    })}
                  </div>
                )}
              </>
            )}
          </div>

          {showCommentSection === false ? null : (
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

          <div>
            <h3 className="font-medium mb-3">History</h3>
            <div className="space-y-4 border rounded p-4 mb-4 mr-1 max-h-64 overflow-y-auto">
              {isLoading ? (
                <Loader />
              ) : (
                <>
                  {[...log].reverse().map((item: any) => {
                    const formattedDate = new Date(
                      item.createdAt
                    ).toLocaleString();

                    const message = item.responseLog || "No activity message";
                    const authorName = user?.fullName || "Unknown User";

                    return (
                      <div
                        key={item.id}
                        className="flex items-start gap-3 pb-1 last:border-b-0"
                      >
                        {/* Avatar Circle */}
                        <div className="flex items-center justify-center mt-1 capitalize font-medium w-8 h-8 rounded-full bg-orange-100 text-orange-700 font-semibold">
                          {renderInitials(user?.fullName)}
                        </div>

                        {/* Log Content */}
                        <div className="flex-1">
                          <div className="flex gap-4 capitalize text-xs text-muted-foreground mb-1">
                            <span>{authorName}</span>
                            <span>{formattedDate}</span>
                          </div>

                          {/* Activity Message */}
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
          // ✅ FIX: Pass refresh function that updates both List and Logs
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
    </div>
  );
};

export default PurchaseOrderDetails;