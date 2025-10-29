"use client";
import * as React from "react";
import { useSelector } from "react-redux";
import type { RootState } from "../../store";
import { useMemo, useState, useRef, useEffect } from "react";
import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";

import { Link as LinkIcon, Building2, Mail, Phone } from "lucide-react";

import {
  mockPOsSeed,
  mockVendors,
  type Address,
  type POItem,
  type POStatus,
  type PurchaseOrder,
  type ViewMode,
  type NewPOForm as NewPOFormType,
  allColumns,
} from "./po.types";
import { addressToLine, cryptoId, formatMoney } from "./helpers";
import PurchaseOrdersTable from "./POTableView";
import SettingsModal from "./SettingsModal";
import { NewPOFormDialog } from "./NewPOFormDialog";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { POHeaderComponent } from "./POHeader";
import { purchaseOrderService } from "../../store/purchaseOrders";
import ConfirmationModal from "./ConfirmationModal";
import toast from "react-hot-toast";
import PurchaseOrderDetails from "./PurchaseOrderDetails";

/* ---------------------------- Purchase Orders UI -------------------------- */
export function PurchaseOrders() {
  const [getPurchaseOrderData, setGetPurchaseOrderData] = useState([]);
  const [purchaseOrders, setPurchaseOrders] =
    useState<PurchaseOrder[]>(getPurchaseOrderData);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPOId, setSelectedPOId] = useState<string | null>(
    purchaseOrders[0]?.id ?? null
  );

  const [creatingPO, setCreatingPO] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("panel");
  const [selectedColumns, setSelectedColumns] = useState(allColumns);
  const [pageSize, setPageSize] = useState(25);
  const [showSettings, setShowSettings] = useState(false);
  const [showCommentBox, setShowCommentBox] = useState(false);
  const [comment, setComment] = useState("");
  const commentsRef = useRef<HTMLDivElement>(null);
  const topRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState("details");

  const scrollToTop = () => {
    if (topRef.current) {
      topRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
      setActiveTab("details");
    }
  };

  const scrollToComments = () => {
    if (commentsRef.current) {
      commentsRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
      setActiveTab("comments");
    }
  };

  const handleSend = () => {
    if (comment.trim()) {
      console.log("Comment sent:", comment);
      setComment("");
      setShowCommentBox(false); // close after send (optional)
    }
  };

  // const [showNewPOModal, setShowNewPOModal] = useState(false);

  const initialPOState: NewPOFormType = {
    vendorId: "",
    items: [
      {
        partId: null,
        itemName: "",
        partNumber: "",
        quantity: 0,
        unitCost: 0,
      },
    ],
    shippingAddress: {
      line1: "",
      city: "",
      state: "",
      postalCode: "",
      country: "IN",
    },
    billingAddress: {
      line1: "",
      city: "",
      state: "",
      postalCode: "",
      country: "IN",
    },
    sameShipBill: true,
    shippingAddressId: "",
    billingAddressId: "",
    dueDate: "",
    notes: "",
    extraCosts: 0,
    contactName: "",
    phoneOrMail: "",
    poNumber: "", // Added poNumber to initial state
  };

  // New PO Form state
  const [newPO, setNewPO] = useState<NewPOFormType>(initialPOState);

  // --- API & FILE STATE (Moved from NewPOForm) ---
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [modalAction, setModalAction] = useState<
    "reject" | "approve" | "delete" | null
  >(null);

  // --- Get User from Redux (Moved from NewPOForm) ---
  const user = useSelector((state: RootState) => state.auth.user);

  const fetchPurchaseOrder = async () => {
    // setLoading(true);
    try {
      const res = await purchaseOrderService.fetchPurchaseOrders();
      const sortedData = [...res].sort(
        (a, b) =>
          new Date(b.updatedAt).valueOf() - new Date(a.updatedAt).valueOf()
      );
      setGetPurchaseOrderData(sortedData);
    } catch (err) {
      console.error(err);
    } finally {
      // setLoading(false);s
    }
  };

  useEffect(() => {
    fetchPurchaseOrder();
  }, []);

  const filteredPOs = getPurchaseOrderData.filter((po) => {
    const vendor = mockVendors.find((v) => v.id === po.vendorId)?.name ?? "";
    const q = searchQuery.toLowerCase();
    return (
      // po.number.toLowerCase().includes(q) ||
      vendor.toLowerCase().includes(q) || po.status.toLowerCase().includes(q)
    );
  });

  const selectedPO =
    getPurchaseOrderData.find((po) => po.id === selectedPOId) || null;

  const totals = useMemo(() => {
    return Object.fromEntries(
      purchaseOrders.map((po) => [
        po.id,
        po.items.reduce((acc, it) => acc + it.quantity * it.unitCost, 0) +
          (po.extraCosts ?? 0),
      ])
    );
  }, [purchaseOrders]);

  // Apply pagination (just slicing for demo)
  const pagedOrders = mockPOsSeed.slice(0, pageSize);

  /* ------------------------------- Handlers ------------------------------- */
  const resetNewPO = () => {
    setNewPO(initialPOState);
    setAttachedFiles([]);
    setApiError(null);
  };

  const addNewPOItemRow = () =>
    setNewPO((s) => ({
      ...s,
      items: [
        ...s.items,
        {
          id: cryptoId(),
          itemName: "",
          partNumber: "",
          quantity: 0,
          unitCost: 0,
        },
      ],
    }));

  const removePOItemRow = (id: string) =>
    setNewPO((s) => ({ ...s, items: s.items.filter((i) => i.id !== id) }));

  const updateItemField = (
    id: string,
    field: keyof POItem,
    value: string | number
  ) =>
    setNewPO((s) => ({
      ...s,
      items: s.items.map((i) => (i.id === id ? { ...i, [field]: value } : i)),
    }));

  const newPOSubtotal = newPO.items.reduce(
    (acc, it) => acc + (Number(it.quantity) || 0) * (Number(it.unitCost) || 0),
    0
  );
  const newPOTotal = newPOSubtotal + (Number(newPO.extraCosts) || 0);

  const updateStatus = (status: POStatus) => {
    if (!selectedPO) return;
    setPurchaseOrders((s) =>
      s.map((po) => (po.id === selectedPO.id ? { ...po, status } : po))
    );
  };

  const handleSaveSettings = (cols: typeof allColumns, size: number) => {
    setSelectedColumns(cols);
    setPageSize(size);
  };

  // --- FILE HANDLERS (Moved from NewPOForm) ---
  const handleFileAttachClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setAttachedFiles((prevFiles) => [
        ...prevFiles,
        ...Array.from(e.target.files as FileList),
      ]);
    }
  };

  const removeAttachedFile = (fileName: string) => {
    setAttachedFiles((prevFiles) =>
      prevFiles.filter((file) => file.name !== fileName)
    );
  };

  // --- Helper Function (Moved from NewPOForm) ---
  const isAddressEmpty = (addr: { [key: string]: string }) => {
    if (!addr || typeof addr !== "object") return true;
    return Object.values(addr).every((value) => value === "");
  };

  // --- MAIN API SUBMIT FUNCTION (Moved from NewPOForm) ---

  const handleCreatePurchaseOrder = async () => {
    console.log("Create button CLICKED! (from PurchaseOrders.tsx)");
    setIsCreating(true);
    setApiError(null);

    try {
      // --- 1. Prepare the plain JSON object ---
      const payload: any = {};

      // Simple fields
      if (newPO.poNumber) payload.poNumber = newPO.poNumber;
      if (user?.organizationId) payload.organizationId = user.organizationId;
      if (newPO.vendorId) payload.vendorId = newPO.vendorId;
      payload.status = "pending"; // default

      if (newPO.contactName) payload.contactName = newPO.contactName;
      if (newPO.phoneOrMail) payload.phoneOrMail = newPO.phoneOrMail;
      if (newPO.dueDate) payload.dueDate = newPO.dueDate;
      if (newPO.notes) payload.notes = newPO.notes;

      // Number fields
      // if (typeof newPO.extraCosts === "number") {
      //   // <-- Ise uncomment kar diya
      //   payload.extraCosts = newPO.extraCosts;
      // }

      // Boolean
      // payload.sameShipBill = newPO.sameShipBill;

      // --- BADLAV YAHAN HAI ---
      // Nested Arrays / Objects
      // Pehle filter karein (taaki khaali rows na jaayein)
      // Fir map karein (taaki backend format mein badal jaayein)
      const formattedOrderItems = newPO.items
        .filter((item) => item.itemName && item.itemName.trim() !== "")
        .map((item) => {
          // Har item ke liye price calculate karein
          const calculatedPrice =
            (Number(item.quantity) || 0) * (Number(item.unitCost) || 0);

          return {
            partId: item.partId, // Yeh 'NewPOForm' se aa raha hai
            partNumber: item.partNumber, // Yeh bhi auto-fill ho raha hai
            unitsOrdered: Number(item.quantity), // 'quantity' -> 'unitsOrdered'
            unitCost: Number(item.unitCost),
            price: calculatedPrice, // 'price' ko calculate kiya
          };
        });

      if (formattedOrderItems.length > 0) {
        payload.orderItems = formattedOrderItems;
      }
      // --- BADLAV KHATAM ---

      if (newPO.shippingAddressId) {
        payload.shippingAddressId = newPO.shippingAddressId; // <-- YEH SIRF ID BHEJEGA
      }
      if (newPO.sameShipBill === false) {
        if (newPO.billingAddressId) {
          payload.billingAddressId = newPO.billingAddressId; // <-- YEH SIRF ID BHEJEGA
        }
      }
      // Files
      // if (attachedFiles.length > 0) {
      //   payload.attachments = await Promise.all(
      //     attachedFiles.map((file) => fileToBase64(file))
      //   );
      // }

      // --- 2. API call ---
      if (purchaseOrderService?.createPurchaseOrder) {
        console.log("Payload:", payload);
        const response = await purchaseOrderService.createPurchaseOrder(
          payload
        );
        console.log("Successfully created PO:", response);

        // Success actions
        setCreatingPO(false);
        resetNewPO();
        fetchPurchaseOrder();
      } else {
        console.error(
          "purchaseOrderService ya createPurchaseOrder function nahi mila!"
        );
        setApiError("Client Error: Service not initialized.");
        setIsCreating(false);
      }
    } catch (error: any) {
      console.error("Error creating PO:", error);
      setApiError(error.message);
      setIsCreating(false);
    }
  };

  const [isLoading, setIsLoading] = useState(false);

  // Modal band karne ka function
  const handleCloseModal = () => {
    if (!isLoading) {
      setModalAction(null);
    }
  };

  // 'Confirm' button dabane par yeh function chalega
  const handleConfirm = async (id) => {
    setIsLoading(true);
    try {
      if (modalAction === "reject") {
        await purchaseOrderService.rejectPurchaseOrder(id);
        toast.success("Successfully Rejected ");
      } else if (modalAction === "approve") {
        await purchaseOrderService.approvePurchaseOrder(id);
        toast.success("Successfully Approved ");
      } else if (modalAction === "delete") {
        await purchaseOrderService.deletePurchaseOrder(id);
        toast.success("Deleted Successfully");
      }
      fetchPurchaseOrder();
    } catch (error) {
      console.error("Action failed:", error);
    } finally {
      setIsLoading(false);
      setModalAction(null);
    }
  };

  // Modal ke liye dynamic content
  const modalContent = {
    reject: {
      title: "Reject Confirmation",
      message:
        "If you confirm, this Purchase Order will be rejected. Do you want to proceed?",
      confirmButtonText: "Reject",
      variant: "danger" as const,
    },
    approve: {
      title: "Approve Confirmation",
      message: "Are you sure you want to approve this?",
      confirmButtonText: "Approve",
      variant: "warning" as const, // Ya "success" agar green chahiye
    },
    delete: {
      title: "Delete Confirmation",
      message: "Are you sure you want to Delete this?",
      confirmButtonText: "Delete",
      variant: "warning" as const,
    },
  };
  /* --------------------------------- UI ---------------------------------- */
  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Header */}
      {POHeaderComponent(
        viewMode,
        setViewMode,
        searchQuery,
        setSearchQuery,
        setCreatingPO,
        setShowSettings
      )}

      {viewMode === "table" ? (
        <div className="flex-1 min-h-0 overflow-auto p-2">
          <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
            <PurchaseOrdersTable
              orders={pagedOrders}
              columns={selectedColumns}
              pageSize={pageSize}
            />
          </div>
        </div>
      ) : (
        <div className="flex flex-1 min-h-0">
          {/* Left List */}
          <div className="w-96 mr-2 ml-3 mb-2 border border-border flex flex-col min-h-0">
            {/* List Aggregator + Select button*/}
            <div className="p-4 border-b border-border flex-shrink-0">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  All Purchase Orders: {filteredPOs.length}
                </span>
              </div>
            </div>

            {/* PO List */}
            <div className="flex-1 overflow-y-auto min-h-0 ">
              {/* <div className="space-y-3"> */}
              {filteredPOs?.map((po) => {
                // const vendor =
                //    mockVendors.find((v) => v.id === po.vendorId)?.name ?? "-";
                return (
                  <Card
                    key={po.id}
                    className={`cursor-pointer transition-colors ${
                      selectedPOId === po.id
                        ? "border-primary bg-primary/5"
                        : "hover:bg-muted/50"
                    }`}
                    onClick={() => setSelectedPOId(po.id)} // Yahaan `id` ki jagah `po.id` aayega
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-4">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback>
                              {/* {po.vendorId
                                .split(" ")
                                .map((n) => n[0])
                                .join("")} */}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <span className="font-medium">
                              Purchase Order #{po.poNumber || "-"}
                            </span>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Building2 className="h-3 w-3" />
                              <span>{po.vendorId || "-"}</span>
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {/* Total Cost: {formatMoney(totals[po.orderItems.price] ?? 0)} */}
                              {/* {po.orderItems.price} */}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="mt-2 capitalize">
                            <StatusBadge status={po.status} />
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}

              {filteredPOs.length === 0 && (
                <div className="text-center py-8">
                  <div className="w-16 h-16 mx-auto mb-4 bg-muted rounded-lg flex items-center justify-center">
                    <div className="w-8 h-8 border-2 border-muted-foreground/30 rounded border-dashed" />
                  </div>
                  <p className="text-muted-foreground mb-2">
                    No purchase orders found
                  </p>
                  <Button
                    variant="link"
                    className="text-primary p-0"
                    onClick={() => setCreatingPO(true)}
                  >
                    Create your first Purchase Order
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Right Details */}
          <div className="flex-1 bg-card mr-3 ml-2 mb-2 border border-border min-h-0 flex flex-col border-border">
            {selectedPO ? (
              // <div className="h-full flex flex-col min-h-0">
              //   {/* Header */}
              //   <div className="p-3 border-b border-border flex-shrink-0">
              //     <div className="flex items-center justify-between mb-6">
              //       <div className="flex items-center gap-2">
              //         <h1 className="text-xl font-medium">
              //           Purcharse Order #{selectedPO.poNumber}
              //         </h1>
              //         <LinkIcon className="h-4 w-4 text-orange-600" />
              //       </div>
              //       <div className="flex items-center gap-2">
              //         <Button className="gap-2 border cursor-pointer border-orange-600 bg-white text-orange-600 hover:bg-orange-50">
              //           <Upload className="h-4 w-4" />
              //           Send to Vendor
              //         </Button>
              //         <Button className="gap-2 bg-white cursor-pointer text-orange-600 border border-orange-600 hover:bg-orange-50">
              //           <Edit className="h-4 w-4" />
              //           Edit
              //         </Button>
              //         <DropdownMenu>
              //           <DropdownMenuTrigger asChild>
              //             <Button variant="ghost" size="sm">
              //               <MoreHorizontal className="h-4 w-4" />
              //             </Button>
              //           </DropdownMenuTrigger>
              //           <DropdownMenuContent align="end">
              //             <DropdownMenuItem
              //               onClick={() => updateStatus("Approved")}
              //             >
              //               <Check className="h-4 w-4 mr-2" /> Mark as Approved
              //             </DropdownMenuItem>
              //             <DropdownMenuItem
              //               onClick={() => updateStatus("Sent")}
              //             >
              //               <Mail className="h-4 w-4 mr-2" /> Mark as Sent
              //             </DropdownMenuItem>
              //             <DropdownMenuItem
              //               onClick={() => updateStatus("Cancelled")}
              //             >
              //               <Trash2 className="h-4 w-4 mr-2" /> Cancel
              //             </DropdownMenuItem>
              //             <DropdownMenuItem
              //               onClick={() => {
              //                 handleConfirm(selectedPO.id);
              //                 setModalAction("delete");
              //               }}
              //             >
              //               <Trash2 className="h-4 w-4 mr-2" /> Delete
              //             </DropdownMenuItem>
              //           </DropdownMenuContent>
              //         </DropdownMenu>
              //       </div>
              //     </div>
              //   </div>

              //   {/* Content */}
              //   <div className="flex-1 overflow-y-auto min-h-0 p-6 space-y-8 z-50 ">
              //     <div ref={topRef}>
              //       <div className="grid grid-cols-2 gap-6">
              //         <Card className="p-4">
              //           <div className="flex items-center justify-between">
              //             <div className="capitalize">
              //               <div className="text-sm text-muted-foreground mb-1 ">
              //                 Status
              //               </div>
              //               <StatusBadge status={selectedPO.status} />
              //             </div>
              //             <div>
              //               <div className="text-sm text-muted-foreground mb-1">
              //                 Due Date
              //               </div>
              //               {/* <div className="font-medium">
              //                 {selectedPO.dueDate
              //                   ? new Date(
              //                       selectedPO.dueDate
              //                     ).toLocaleDateString()
              //                   : "-"}
              //               </div> */}
              //             </div>
              //           </div>
              //         </Card>

              //         <Card className="p-4">
              //           <div className="text-sm text-muted-foreground mb-1">
              //             Vendor
              //           </div>
              //           <div className="flex items-center gap-2">
              //             <VendorPill vendorId={selectedPO.vendorId} />
              //           </div>
              //         </Card>
              //       </div>

              //       <div>
              //         <h3 className="font-medium mb-3">Order Items</h3>
              //         <div className="overflow-x-auto border rounded-lg">
              //           <table className="w-full text-sm">
              //             <thead className="bg-muted/50">
              //               <tr className="text-left">
              //                 <th className="p-3">Item Name</th>
              //                 <th className="p-3">Part Number</th>
              //                 <th className="p-3">Units Ordered</th>
              //                 <th className="p-3">Units Received</th>
              //                 <th className="p-3">Unit Cost</th>
              //                 <th className="p-3">Cost of Units Ordered</th>
              //               </tr>
              //             </thead>
              //             <tbody>
              //               {selectedPO.orderItems?.map((it) => (
              //                 <tr key={it.id} className="border-t">
              //                   <td className="p-3">{it.itemName}</td>
              //                   <td className="p-3">{it.partNumber || "-"}</td>
              //                   <td className="p-3">{it.unitsOrdered}</td>
              //                   <td className="p-3">0</td>
              //                   <td className="p-3">
              //                     {formatMoney(it.unitCost)}
              //                   </td>
              //                   <td className="p-3">
              //                     {formatMoney(it.unitCost * it.unitsOrdered)}
              //                   </td>
              //                 </tr>
              //               ))}
              //               <tr className="border-t">
              //                 <td
              //                   colSpan={5}
              //                   className="p-3 text-right font-medium"
              //                 >
              //                   Subtotal
              //                 </td>
              //                 <td className="p-3">
              //                   {/* {formatMoney(
              //                     selectedPO.it.reduce(
              //                       (a, i) => a + i.unitCost * i.unitsOrdered,
              //                       0
              //                     )
              //                   )} */}
              //                 </td>
              //               </tr>
              //               <tr className="border-t">
              //                 <td
              //                   colSpan={5}
              //                   className="p-3 text-right font-medium"
              //                 >
              //                   Taxes &amp; Costs
              //                 </td>
              //                 {/* <td className="p-3">
              //                   {formatMoney(selectedPO.extraCosts ?? 0)}
              //                 </td> */}
              //               </tr>
              //               <tr className="border-t bg-muted/30">
              //                 <td
              //                   colSpan={5}
              //                   className="p-3 text-right font-semibold"
              //                 >
              //                   Total
              //                 </td>
              //                 <td className="p-3 font-semibold">
              //                   {/* {formatMoney(
              //                     selectedPO.items.reduce(
              //                       (a, i) => a + i.unitCost * i.quantity,
              //                       0
              //                     ) + (selectedPO.extraCosts ?? 0)
              //                   )} */}
              //                 </td>
              //               </tr>
              //             </tbody>
              //           </table>
              //         </div>
              //       </div>

              //       <div className="grid grid-cols-2 gap-6 mt-4">
              //         <Card className="p-4">
              //           <div className="text-sm text-muted-foreground mb-2">
              //             Shipping Info
              //           </div>
              //           <div className="flex items-start gap-2">
              //             <Building2 className="h-4 w-4 text-muted-foreground mt-1" />
              //             <div>
              //               {addressToLine(selectedPO.shippingAddressId || "")}
              //             </div>
              //           </div>
              //         </Card>
              //         <Card className="p-4">
              //           <div className="text-sm text-muted-foreground mb-2">
              //             Billing Info
              //           </div>
              //           <div className="flex items-start gap-2">
              //             <Building2 className="h-4 w-4 text-muted-foreground mt-1" />
              //             <div>
              //               {addressToLine(selectedPO.billingAddressId || "")}
              //             </div>
              //           </div>
              //         </Card>
              //       </div>
              //     </div>

              //     <div ref={commentsRef}>
              //       <div>
              //         <h3 className="font-medium mb-3">
              //           Comments &amp; History
              //         </h3>
              //         <div className="border rounded-lg p-4">
              //           <div className="text-sm text-muted-foreground mb-2">
              //             {comment.length === 0 ? "No Comments Found" : ""}
              //           </div>
              //         </div>
              //       </div>
              //     </div>
              //     <div>
              //       <Comment
              //         showCommentBox={showCommentBox}
              //         comment={comment}
              //         handleSend={handleSend}
              //         setShowCommentBox={setShowCommentBox}
              //         setComment={setComment}
              //       />
              //     </div>
              //   </div>

              //   {/* Footer (fixed at bottom of right pane) */}
              //   <div className="p-6 border-t flex justify-between flex-none bg-white">
              //     {selectedPO.status === "pending" ? (
              //       <>
              //         <Button
              //           onClick={() => setModalAction("reject")}
              //           className="gap-2 text-red-600 bg-white border border-red-600 rounded-md px-4 py-2 text-sm font-medium hover:bg-red-50 cursor-pointer"
              //         >
              //           Reject
              //         </Button>
              //         <Button
              //           onClick={() => setModalAction("approve")}
              //           className="gap-2 bg-orange-600 hover:bg-orange-700 text-white rounded-md px-4 py-2 text-sm font-medium cursor-pointer flex items-center"
              //         >
              //           <Upload className="h-4 w-4" />
              //           Approve
              //         </Button>
              //       </>
              //     ) : (
              //       <>
              //         {/* Empty but keeps height + spacing same */}
              //         <Button
              //           onClick={() => setModalAction("approve")}
              //           className="gap-2 bg-orange-600 hover:bg-orange-700 text-white rounded-md px-4 py-2 text-sm font-medium cursor-pointer flex items-center"
              //         >
              //           <Upload className="h-4 w-4" />
              //           Approve
              //         </Button>
              //         <div></div>
              //       </>
              //     )}
              //   </div>
              // </div>
              <PurchaseOrderDetails
                selectedPO={selectedPO}
                updateState={updateStatus}
                handleConfirm={handleConfirm}
                setModalAction={setModalAction}
                topRef={topRef}
                formatMoney={formatMoney}
                addressToLine={addressToLine}
                commentsRef={commentsRef}
                comment={comment}
                showCommentBox={showCommentBox}
                handleSend={handleSend}
                setShowCommentBox={setShowCommentBox}
                setComment={setComment}
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 bg-muted rounded-lg flex items-center justify-center">
                    <div className="w-8 h-8 border-2 border-muted-foreground/30 rounded border-dashed"></div>
                  </div>
                  <p className="text-muted-foreground mb-2">
                    Select a purchase order to view details
                  </p>
                  <p className="text-sm text-muted-foreground">
                    or create a new one to get started
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* New Purchase Order Modal (custom lightweight) */}
      <NewPOFormDialog
        open={creatingPO}
        onOpenChange={setCreatingPO}
        newPO={newPO}
        setNewPO={setNewPO}
        newPOSubtotal={newPOSubtotal}
        newPOTotal={newPOTotal}
        addNewPOItemRow={addNewPOItemRow}
        removePOItemRow={removePOItemRow}
        updateItemField={updateItemField}
        // --- UPDATED & NEW PROPS ---
        onCancel={() => {
          setCreatingPO(false);
          resetNewPO();
        }}
        handleCreatePurchaseOrder={handleCreatePurchaseOrder} // Naya API function
        isCreating={isCreating} // State pass kiya
        apiError={apiError} // State pass kiya
        attachedFiles={attachedFiles} // State pass kiya
        fileInputRef={fileInputRef} // Ref pass kiya
        handleFileAttachClick={handleFileAttachClick} // Function pass kiya
        handleFileChange={handleFileChange} // Function pass kiya
        removeAttachedFile={removeAttachedFile} // Function pass kiya
      />

      {/* Settings Modal */}
      {showSettings && (
        <SettingsModal
          allColumns={allColumns}
          selectedColumns={selectedColumns}
          onClose={() => setShowSettings(false)}
          onSave={handleSaveSettings}
          initialPageSize={pageSize}
        />
      )}

      <ConfirmationModal
        isOpen={modalAction !== null} // Jab modalAction null nahi hoga, tab modal dikhega
        onClose={handleCloseModal}
        // onConfirm={handleConfirm}
        handleConfirm={handleConfirm}
        isLoading={isLoading}
        selectedPO={selectedPO}
        // Neeche ka content dynamically set ho raha hai
        title={modalAction ? modalContent[modalAction].title : ""}
        message={modalAction ? modalContent[modalAction].message : ""}
        confirmButtonText={
          modalAction ? modalContent[modalAction].confirmButtonText : ""
        }
        confirmButtonVariant={
          modalAction ? modalContent[modalAction].variant : "warning"
        }
      />
    </div>
  );
}

/* --------------------------------- Bits ---------------------------------- */
function StatusBadge({ status }: { status: POStatus }) {
  const map: Record<POStatus, string> = {
    Draft: "bg-gray-50 text-gray-700 border-gray-200",
    Approved: "bg-green-50 text-green-700 border-green-200",
    Sent: "bg-orange-50 text-orange-700 border-orange-200",
    Received: "bg-emerald-50 text-emerald-700 border-emerald-200",
    Cancelled: "bg-red-50 text-red-700 border-red-200",
  };
  return (
    <Badge variant="outline" className={map[status]}>
      {status}
    </Badge>
  );
}

function VendorPill({ vendorId }: { vendorId: string }) {
  const vendor = mockVendors.find((v) => v.id === vendorId);
  if (!vendor) return <span>-</span>;
  return (
    <div className="inline-flex items-center gap-2">
      <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-700">
        {vendor.name.slice(0, 1)}
      </div>
      <div className="leading-tight">
        <div className="font-medium">{vendor.name}</div>
        <div className="text-xs text-muted-foreground flex items-center gap-2">
          {vendor.email && (
            <span className="inline-flex items-center gap-1">
              <Mail className="h-3 w-3" />
              {vendor.email}
            </span>
          )}
        </div>
        <div className="text-xs text-muted-foreground flex items-center gap-2">
          {vendor.phone && (
            <span className="inline-flex items-center gap-1">
              <Phone className="h-3 w-3" />
              {vendor.phone}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
