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
  User, // Added User icon for contact details
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
import { vendorService } from "../../store/vendors";

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

// NEW INTERFACE FOR FETCHED CONTACT DETAILS
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
    | "partially_fulfilled";
  vendorId: string;
  vendor: {
    id: string;
    name: string;
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
  // --- ADDED vendorContactIds TO PO INTERFACE ---
  vendorContactIds?: string[]; 
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
  StatusBadge: React.ComponentType<{ status: PurchaseOrder["status"] }>;
  setApproveModal: () => void;
  setShowCommentBox: (show: boolean) => void;
  setComment: (comment: string) => void;
  handleEditClick: () => void;
  fetchPurchaseOrder: () => void;
}

const PurchaseOrderDetails: React.FC<PurchaseOrderDetailsProps> = ({
  selectedPO,
  updateState,
  handleConfirm,
  setModalAction,
  topRef,
  formatMoney,
  addressToLine,
  commentsRef,
  showCommentBox,
  setShowCommentBox,
  handleEditClick,
  setApproveModal,
  StatusBadge,
  fetchPurchaseOrder,
}) => {
  const [fullFillModal, setFullFillModal] = React.useState(false);
  const [continueModal, setContinueModal] = React.useState(false);
  const [commentData, setCommentData] = React.useState([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [comment, setComment] = React.useState("");
  const [log, setLog] = React.useState([]);
  const modalRef = React.useRef<HTMLDivElement>(null);
  const user = useSelector((state: RootState) => state.auth.user);
  
  // --- NEW STATE: To store detailed contact objects ---
  const [contactDetails, setContactDetails] = React.useState<VendorContact[]>([]); 
  const [isLoadingContacts, setIsLoadingContacts] = React.useState(false);


  //  Change the status in Purchase Order to approve
  const handleApprove = async (id: string) => {
    try {
      await purchaseOrderService.approvePurchaseOrder(id);
      setModalAction("approve");
      toast.success("Successfully Approved ");
      fetchPurchaseOrder();
    } catch {
      toast.error("Failed to Approve");
    }
  };

  // Change the status to continue
  const handleContinue = async () => {
    try {
      await purchaseOrderService.completePurchaseOrder(selectedPO.id);
      setContinueModal(false);
      toast.success("Successfully Completed ");
      fetchPurchaseOrder();
    } catch {
      toast.error("Failed to Complete");
    }
  };

  // fetch Purchase Order Comment
  const fetchPurchaseOrderComments = async () => {
    try {
      setIsLoading(true);
      const res = await purchaseOrderService.FetchPurchaseOrderComment(
        selectedPO.id
      );
      setCommentData(res);
    } catch (err) {
      console.log(err);
    } finally {
      setIsLoading(false);
    }
  };
  // fetch Purchase order Log
  const fetchPurchaseOrderLog = async () => {
    try {
      setIsLoading(true);
      const res = await purchaseOrderService.FetchPurchaseOrderLog(
        selectedPO.id
      );
      setLog(res || []);
    } catch (err) {
      toast.error("Failed to fetch the Log");
    } finally {
      setIsLoading(false);
    }
  };
  
  // --- NEW: Function to fetch contact details by IDs ---
  // const fetchContactDetails = async (contactIds: string[]) => {
  //   if (contactIds.length === 0) {
  //     setContactDetails([]);
  //     return;
  //   }

  //   setIsLoadingContacts(true);
  //   try {
  //     // ASSUMPTION: vendorService has a function like fetchContactsByIds
  //     // If vendorService.fetchContactsByIds is not available, you would need
  //     // to loop through IDs and call a single fetch function.
      
  //     const details = await vendorService.fetchVendorContactData(selectedPO.vendor.id ,contactIds); 
  //     setContactDetails(details);
  //   } catch (error) {
  //     console.error("Failed to fetch contact details:", error);
  //     setContactDetails([]);
  //     toast.error("Failed to load contact details.");
  //   } finally {
  //     setIsLoadingContacts(false);
  //   }
  // };

  // delete Comment in purchase Order

  const handleDeleteComment = async (id: string) => {
    await purchaseOrderService.deletePurchaseOrderComment(id);
    fetchPurchaseOrderComments();
  };

  useEffect(() => {
    // Fetch comments and log when PO changes
    fetchPurchaseOrderComments();
    fetchPurchaseOrderLog();
    
    // --- NEW: Fetch contact details when PO or IDs change ---
    // fetchContactDetails(selectedPO.vendorContactIds || []);
  }, [selectedPO.id]);

  const subtotal =
    selectedPO.orderItems?.reduce((acc, item) => {
      const cost = Number(item.unitCost) || 0;
      const qty = Number(item.unitsOrdered) || 0;
      const itemTotal = item.price ? Number(item.price) : cost * qty;
      return acc + itemTotal;
    }, 0) || 0;

  const taxesAndCosts = selectedPO.taxesAndCosts || [];
  const extraCosts = Number(selectedPO.extraCosts) || 0;

  // Total tax & cost calculation
  const taxTotal = taxesAndCosts.reduce((acc, tax) => {
    if (tax.taxCategory === "PERCENTAGE") {
      return acc + (subtotal * Number(tax.taxValue || 0)) / 100;
    }
    return acc + Number(tax.taxValue || 0);
  }, 0);

  const total = subtotal + extraCosts + taxTotal;

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
      fetchPurchaseOrderComments();
      await fetchPurchaseOrder();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to add comment.");
    }
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
            <Button className="gap-2 border cursor-pointer border-orange-600 bg-white text-orange-600 hover:bg-orange-50">
              <Upload className="h-4 w-4" />
              Send to Vendor
            </Button>

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
                {(selectedPO.status === "approved" ||
                  selectedPO.status === "pending") && (
                  <DropdownMenuItem onClick={() => setModalAction("cancelled")}>
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
                              <span>{formatDateOnly(selectedPO.dueDate)}</span>
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
              </div>
            </Card>

            <Card className="p-4 rounded-lg">
              <div className="text-sm text-muted-foreground mb-1">Vendor</div>
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">
                  {selectedPO.vendor?.name || "-"}
                </span>
              </div>
            </Card>
          </div>

          {/* NEW CONTACTS SECTION */}
          {(isLoadingContacts || (contactDetails && contactDetails.length > 0)) && (
            <div>
                <h3 className="font-medium mb-3 mt-4">Contacts ({contactDetails.length})</h3>
                <div className="border rounded-lg p-4 space-y-3">
                    {isLoadingContacts ? (
                        <Loader />
                    ) : (
                        contactDetails.map((contact, index) => (
                            <div key={contact.id || index} className="flex items-start gap-4 p-2 border-b last:border-b-0">
                                {/* Initial Avatar */}
                                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-semibold text-sm shrink-0">
                                    {renderInitials(contact.fullName || contact.email || "?")}
                                </div>
                                
                                <div className="flex-1">
                                    <p className="font-medium text-sm">{contact.fullName || "Contact"}</p>
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
          <h3 className="font-medium mb-3">Comments &amp; History</h3>

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
                            <div className="flex justify-between text-xs  mb-1">
                              <div className="font-medium text-black capitalize ">{item.author?.name || "Unknown User"}</div>
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

          <Comment
            selectedPO={selectedPO}
            showCommentBox={showCommentBox}
            comment={comment}
            handleSend={handleSend}
            setShowCommentBox={setShowCommentBox}
            setComment={setComment}
            fetchPurchanseOrder={fetchPurchaseOrder}
          />

          <div>
            <div className="space-y-4">
              {isLoading ? (
                <Loader />
              ) : (
                <>
                  {[...log].reverse().map((item: any) => {
                    const formattedDate = new Date(
                      item.createdAt
                    ).toLocaleString();

                    // Choose display text (backend gives `responseLog`)
                    const message = item.responseLog || "No activity message";

                    // Optional: user display name
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

      {/* FOOTER BUTTONS (no changes) */}
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
          fetchPurchaseOrder={fetchPurchaseOrder}
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