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
// --- FIX 1: Corrected import path ---
import PurchaseOrdersTable from "./POTableView"; // Was "./POTableView"
import SettingsModal from "./SettingsModal";
import { NewPOFormDialog } from "./NewPOFormDialog";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { POHeaderComponent } from "./POHeader";
import { purchaseOrderService } from "../../store/purchaseOrders";
import ConfirmationModal from "./ConfirmationModal";
import toast from "react-hot-toast";
import PurchaseOrderDetails from "./PurchaseOrderDetails";

// ... (getChangedFields function remains the same) ...
function getChangedFields(
  original: NewPOFormType,
  current: NewPOFormType
): Partial<NewPOFormType> {
  const changes: Partial<NewPOFormType> = {};

  // Simple fields ko check karein
  const keysToCompare: (keyof NewPOFormType)[] = [
    "poNumber",
    "vendorId",
    "contactName",
    "phoneOrMail",
    "dueDate",
    "notes",
    "extraCosts",
    "shippingAddressId",
    "billingAddressId",
    "sameShipBill",
  ];

  for (const key of keysToCompare) {
    if (original[key] !== current[key]) {
      // @ts-ignore
      changes[key] = current[key];
    }
  }

  // Items array ko check karein (deep compare)
  if (JSON.stringify(original.items) !== JSON.stringify(current.items)) {
    changes.items = current.items;
  }

  return changes;
}

/* ---------------------------- Purchase Orders UI -------------------------- */
export function PurchaseOrders() {
  const [getPurchaseOrderData, setGetPurchaseOrderData] = useState<
    PurchaseOrder[]
  >([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPOId, setSelectedPOId] = useState<string | null>(null);
  const [approveModal, setApproveModal] = useState(false);
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

  // ... (scrollToTop, scrollToComments, handleSend functions same rahenge) ...
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
      setShowCommentBox(false);
    }
  };

  const [isEditingPO, setIsEditingPO] = useState(false);

  // --- NEW STATE ---
  // Original PO state ko store karega jab edit mode shuru hota hai
  const [originalPOForEdit, setOriginalPOForEdit] =
    useState<NewPOFormType | null>(null);

  const initialPOState: NewPOFormType = {
    id: null,
    vendorId: "",
    items: [
      {
        id: cryptoId(),
        partId: null,
        itemName: "",
        partNumber: "",
        quantity: 0,
        unitCost: 0,
      },
    ],
    sameShipBill: true,
    shippingAddressId: "",
    shippingAddress: null,
    billingAddressId: "",
    billingAddress: null,
    dueDate: "",
    notes: "",
    extraCosts: 0,
    contactName: "",
    phoneOrMail: "",
    poNumber: "",
  };

  const [newPO, setNewPO] = useState<NewPOFormType>(initialPOState);

  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [modalAction, setModalAction] = useState<
    "reject" | "approve" | "delete" | null
  >(null);
  const user = useSelector((state: RootState) => state.auth.user);

  const fetchPurchaseOrder = async () => {
    try {
      const res = await purchaseOrderService.fetchPurchaseOrders();
      const sortedData = [...res].sort(
        (a: PurchaseOrder, b: PurchaseOrder) =>
          new Date(b.updatedAt).valueOf() - new Date(a.updatedAt).valueOf()
      );
      setGetPurchaseOrderData(sortedData);

      if (!selectedPOId && sortedData.length > 0) {
        setSelectedPOId(sortedData[0].id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchPurchaseOrder();
  }, []);

  const filteredPOs = useMemo(
    () =>
      getPurchaseOrderData.filter((po) => {
        const vendor = po.vendor?.name ?? "";
        const q = searchQuery.toLowerCase();
        return (
          (po.poNumber && po.poNumber.toLowerCase().includes(q)) ||
          vendor.toLowerCase().includes(q) ||
          po.status.toLowerCase().includes(q)
        );
      }),
    [getPurchaseOrderData, searchQuery]
  );

  const selectedPO = useMemo(
    () => getPurchaseOrderData.find((po) => po.id === selectedPOId) || null,
    [getPurchaseOrderData, selectedPOId]
  );

  const totals = useMemo(() => {
    return Object.fromEntries(
      getPurchaseOrderData.map((po) => {
        const totalItemsCost =
          po.orderItems?.reduce((acc, it) => {
            const price = Number(it.price) || 0;
            const unitCost = Number(it.unitCost) || 0;
            const unitsOrdered = Number(it.unitsOrdered) || 0;

            // Use price if available, otherwise calculate cost * units
            return acc + (price || unitCost * unitsOrdered);
          }, 0) ?? 0;

        return [po.id, totalItemsCost];
      })
    );
  }, [getPurchaseOrderData]);

  // --- REMOVED pagedOrders ---
  // const pagedOrders = useMemo(
  //   () => filteredPOs.slice(0, pageSize),
  //   [filteredPOs, pageSize]
  // );
  // This was incorrect as PurchaseOrdersTable does its own pagination.

  /* ------------------------------- Handlers ------------------------------- */

  // --- UPDATED: resetNewPO function ---
  const resetNewPO = () => {
    setNewPO(initialPOState);
    setAttachedFiles([]);
    setApiError(null);
    setIsEditingPO(false);
    setOriginalPOForEdit(null); // <-- NEW: Original state ko clear karein
  };

  // ... (addNewPOItemRow, removePOItemRow, updateItemField, etc. same rahenge) ...
  const addNewPOItemRow = () =>
    setNewPO((s) => ({
      ...s,
      items: [
        ...s.items,
        {
          id: cryptoId(),
          partId: null,
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
    value: string | number | null
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
    setGetPurchaseOrderData((s) =>
      s.map((po) => (po.id === selectedPO.id ? { ...po, status } : po))
    );
  };

  const handleSaveSettings = (cols: typeof allColumns, size: number) => {
    setSelectedColumns(cols);
    setPageSize(size);
  };

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

  // --- UPDATED: Edit PO Handler ---
  const handleEditPO = (poToEdit: PurchaseOrder) => {
    if (!poToEdit) return;

    console.log("Editing PO:", poToEdit);

    const formPO: NewPOFormType = {
      id: poToEdit.id,
      poNumber: poToEdit.poNumber || "",
      vendorId: poToEdit.vendor?.id || poToEdit.vendorId || "",
      items:
        poToEdit.orderItems && poToEdit.orderItems.length > 0
          ? poToEdit.orderItems.map((item) => ({
              id: item.id ? item.id : `temp_${crypto.randomUUID()}`,
              partId: item.part?.id || item.partId || null,
              itemName: item.itemName || item.part?.name || "",
              partNumber: item.partNumber || item.part?.partNumber || "",
              quantity: item.unitsOrdered || 0,
              unitCost: item.unitCost || 0,
            }))
          : [{ ...initialPOState.items[0], id: `temp_${crypto.randomUUID()}` }],

      shippingAddressId:
        poToEdit.shippingAddress?.id || poToEdit.shippingAddressId || "",
      shippingAddress: poToEdit.shippingAddress || null,

      billingAddressId:
        poToEdit.billingAddress?.id || poToEdit.billingAddressId || "",
      billingAddress: poToEdit.billingAddress || null,

      sameShipBill: !!(
        poToEdit.shippingAddressId &&
        poToEdit.shippingAddressId === poToEdit.billingAddressId &&
        poToEdit.shippingAddressId !== null
      ),

      dueDate: poToEdit.dueDate
        ? new Date(poToEdit.dueDate).toISOString().split("T")[0]
        : "",

      notes: poToEdit.notes || "",
      extraCosts: poToEdit.extraCosts || 0,
      contactName: poToEdit.contactName || "",
      phoneOrMail: poToEdit.phoneOrMail || "",
    };

    setNewPO(formPO);
    setOriginalPOForEdit(formPO);
    setIsEditingPO(true);
    setApiError(null);
    setAttachedFiles([]);
    setCreatingPO(true);
  };

  // --- (handleCreatePurchaseOrder function same rahega) ---
  const handleCreatePurchaseOrder = async () => {
    console.log("Create button CLICKED! (from PurchaseOrders.tsx)");
    setIsCreating(true);
    setApiError(null);

    try {
      const payload: any = {}; // Poora payload banayein

      if (newPO.poNumber) payload.poNumber = newPO.poNumber;
      // if (user?.organizationId) payload.organizationId = user.organizationId;
      if (newPO.vendorId) payload.vendorId = newPO.vendorId;
      payload.status = "pending";

      if (newPO.contactName) payload.contactName = newPO.contactName;
      if (newPO.phoneOrMail) payload.phoneOrMail = newPO.phoneOrMail;
      if (newPO.dueDate) payload.dueDate = newPO.dueDate;
      if (newPO.notes) payload.notes = newPO.notes;
      if (newPO.extraCosts) payload.extraCosts = Number(newPO.extraCosts);

      const formattedOrderItems = newPO.items
        .filter((item) => item.itemName && item.itemName.trim() !== "")
        .map((item) => {
          const calculatedPrice =
            (Number(item.quantity) || 0) * (Number(item.unitCost) || 0);

          return {
            partId: item.partId,
            itemName: item.itemName,
            partNumber: item.partNumber,
            unitsOrdered: Number(item.quantity),
            unitCost: Number(item.unitCost),
            price: calculatedPrice,
          };
        });

      if (formattedOrderItems.length > 0) {
        payload.orderItems = formattedOrderItems;
      }

      if (newPO.shippingAddressId) {
        payload.shippingAddressId = newPO.shippingAddressId;
      }
      if (newPO.billingAddressId) {
        payload.billingAddressId = newPO.billingAddressId;
      }

      if (purchaseOrderService?.createPurchaseOrder) {
        console.log("Create Payload:", payload);
        const response = await purchaseOrderService.createPurchaseOrder(
          payload
        );
        console.log("Successfully created PO:", response);

        setCreatingPO(false);
        resetNewPO();
        fetchPurchaseOrder();
        toast.success("Purchase Order created!");

        if (response && response.id) {
          setSelectedPOId(response.id);
        }
      } else {
        console.error(
          "purchaseOrderService ya createPurchaseOrder function nahi mila!"
        );
        setApiError("Client Error: Service not initialized.");
      }
    } catch (error: any) {
      console.error("Error creating PO:", error);
      setApiError(error.message || "Failed to create PO.");
    } finally {
      setIsCreating(false);
    }
  };

  // --- UPDATED: Update PO Handler ---
  const handleUpdatePurchaseOrder = async () => {
    console.log("Update button CLICKED!");
    if (!newPO.id) {
      setApiError("Error: Purchase Order ID nahi mila.");
      return;
    }

    // --- NEW: Original state ko check karein
    if (!originalPOForEdit) {
      setApiError("Error: Original data not found. Please try again.");
      return;
    }

    // --- NEW: Sirf changed fields haasil karein
    const changedFormFields = getChangedFields(originalPOForEdit, newPO);

    // --- NEW: Agar koi change nahi hai, to API call na karein
    if (Object.keys(changedFormFields).length === 0) {
      toast.success("No changes detected.");
      setCreatingPO(false);
      resetNewPO();
      return;
    }

    setIsCreating(true);
    setApiError(null);

    try {
      // --- NEW: Payload sirf changed fields se banayein ---
      const payload: any = {};

      // Har changed field ko payload mein add karein
      if (changedFormFields.poNumber !== undefined) {
        payload.poNumber = changedFormFields.poNumber;
      }
      if (changedFormFields.vendorId !== undefined) {
        payload.vendorId = changedFormFields.vendorId;
      }
      if (changedFormFields.contactName !== undefined) {
        payload.contactName = changedFormFields.contactName;
      }
      if (changedFormFields.phoneOrMail !== undefined) {
        payload.phoneOrMail = changedFormFields.phoneOrMail;
      }
      if (changedFormFields.dueDate !== undefined) {
        payload.dueDate = changedFormFields.dueDate;
      }
      if (changedFormFields.notes !== undefined) {
        payload.notes = changedFormFields.notes;
      }
      if (changedFormFields.extraCosts !== undefined) {
        payload.extraCosts = Number(changedFormFields.extraCosts);
      }
      if (changedFormFields.shippingAddressId !== undefined) {
        payload.shippingAddressId = changedFormFields.shippingAddressId;
      }
      if (changedFormFields.billingAddressId !== undefined) {
        payload.billingAddressId = changedFormFields.billingAddressId;
      }

      // Agar 'sameShipBill' change hua hai, to billingAddressId ko accordingly set karein
      // (Yeh logic 'getChangedFields' mein 'billingAddressId' ke through already handle ho jaana chahiye)

      // Agar items change hue hain, to unhein transform karein
      if (changedFormFields.items) {
        payload.orderItems = changedFormFields.items
          .filter((item) => item.itemName && item.itemName.trim() !== "")
          .map((item) => ({
            // id: item.id && !item.id.startsWith("temp_") ? item.id : undefined,
            partId: item.partId,
            itemName: item.itemName,
            partNumber: item.partNumber,
            unitsOrdered: Number(item.quantity),
            unitCost: Number(item.unitCost),
            price: (Number(item.quantity) || 0) * (Number(item.unitCost) || 0),
          }));
      }

      if (purchaseOrderService?.updatePurchaseOrder) {
        console.log("Update Payload (ID: " + newPO.id + "):", payload); // <-- Ab yeh payload chhota hoga

        const response = await purchaseOrderService.updatePurchaseOrder(
          newPO.id,
          payload
        );
        console.log("Successfully updated PO:", response);

        toast.success("Purchase Order updated!");

        setCreatingPO(false);
        resetNewPO();
        fetchPurchaseOrder();
        setSelectedPOId(newPO.id);
      } else {
        console.error(
          "purchaseOrderService.updatePurchaseOrder function nahi mila!"
        );
        setApiError("Client Error: Update service not initialized.");
      }
    } catch (error: any) {
      console.error("Error updating PO:", error);
      setApiError(error.message || "Failed to update PO.");
    } finally {
      setIsCreating(false);
    }
  };

  // ... (Modal confirmation logic same rahega) ...
  const [isLoading, setIsLoading] = useState(false);
  const handleCloseModal = () => {
    if (!isLoading) {
      setModalAction(null);
    }
  };
  const handleConfirm = async (id: string | undefined) => {
    if (!id) {
      toast.error("No PO selected for action.");
      return;
    }

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
        setSelectedPOId(null);
      }
      fetchPurchaseOrder();
    } catch (error) {
      console.error("Action failed:", error);
      toast.error("Action failed!");
    } finally {
      setIsLoading(false);
      setModalAction(null);
    }
  };
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
      message: `You have approved Purchase Order successfully! What do you want to do next`,
      confirmButtonText: "Approve",
      variant: "warning" as const,
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
        () => {
          resetNewPO();
          setCreatingPO(true);
        },
        setShowSettings
      )}

      {viewMode === "table" ? (
        // ... (Table View same hai) ...
        <div className="flex-1 min-h-0 overflow-auto p-2">
          <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
            <PurchaseOrdersTable
              // --- FIX 2: Pass the full filtered list ---
              orders={filteredPOs} // Was pagedOrders
              columns={selectedColumns}
              pageSize={pageSize}
            />
          </div>
        </div>
      ) : (
        <div className="flex flex-1 min-h-0">
          {/* Left List */}
          <div className="w-96 mr-2 ml-3 mb-2 border border-border flex flex-col min-h-0">
            {/* List Aggregator */}
            <div className="p-4 border-b border-border flex-shrink-0">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  All Purchase Orders: {filteredPOs.length}
                </span>
              </div>
            </div>

            {/* PO List */}
            <div className="flex-1 overflow-y-auto min-h-0 ">
              {filteredPOs?.map((po) => {
                return (
                  <Card
                    key={po.id}
                    className={`cursor-pointer transition-colors rounded-none border-x-0 border-t-0 ${
                      selectedPOId === po.id
                        ? "border-l-4 border-l-orange-600 bg-orange-50/50 bg-muted/50"
                        : "hover:bg-muted/50  border-l-4 border-l-transparent"
                    }`}
                    onClick={() => setSelectedPOId(po.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-4">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback>
                              {po.vendor?.name
                                ?.split(" ")
                                .map((n) => n[0])
                                .join("") || "V"}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <span className="font-medium">
                              Purchase Order #{po.poNumber || "-"}
                            </span>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Building2 className="h-3 w-3" />
                              <span>{po.vendor?.name || "-"}</span>
                            </div>
                            <div className="text-sm text-muted-foreground">
                              Total Cost: {formatMoney(totals[po.id] ?? 0)}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="mt-2 capitalize">
                            <StatusBadge status={po.status as POStatus} />
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
                    onClick={() => {
                      resetNewPO();
                      setCreatingPO(true);
                    }}
                  >
                    Create your first Purchase Order
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Right Details */}
          <div className="flex-1 bg-card mr-3 ml-2 mb-2 border border-border min-h-0 flex flex-col border-border">
            {/* --- CLEANUP: Simplified conditional check --- */}
            {selectedPO ? (
              <PurchaseOrderDetails
                selectedPO={selectedPO} // <-- Sahi prop pass ho raha hai
                updateState={updateStatus}
                handleConfirm={() => handleConfirm(selectedPO?.id)}
                setModalAction={setModalAction}
                setApproveModal={setApproveModal}
                topRef={topRef}
                formatMoney={formatMoney}
                addressToLine={addressToLine}
                commentsRef={commentsRef}
                StatusBadge={StatusBadge}
                comment={comment}
                showCommentBox={showCommentBox}
                handleSend={handleSend}
                setShowCommentBox={setShowCommentBox}
                setComment={setComment}
                handleEditClick={() => handleEditPO(selectedPO)}
                fetchPurchaseOrder={fetchPurchaseOrder}
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

      {/* New Purchase Order Modal */}
      <NewPOFormDialog
        open={creatingPO}
        onOpenChange={(isOpen) => {
          if (!isOpen) {
            resetNewPO();
          }
          setCreatingPO(isOpen);
        }}
        newPO={newPO}
        setNewPO={setNewPO}
        newPOSubtotal={newPOSubtotal}
        newPOTotal={newPOTotal}
        addNewPOItemRow={addNewPOItemRow}
        removePOItemRow={removePOItemRow}
        updateItemField={updateItemField}
        isEditing={isEditingPO}
        onCancel={() => {
          setCreatingPO(false);
          resetNewPO();
        }}
        handleCreatePurchaseOrder={
          isEditingPO ? handleUpdatePurchaseOrder : handleCreatePurchaseOrder // <-- Dynamic function
        }
        isCreating={isCreating}
        apiError={apiError}
        attachedFiles={attachedFiles}
        fileInputRef={fileInputRef}
        handleFileAttachClick={handleFileAttachClick}
        handleFileChange={handleFileChange}
        removeAttachedFile={removeAttachedFile}
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

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={modalAction !== null}
        onClose={handleCloseModal}
        handleConfirm={() => handleConfirm(selectedPO?.id)} // <-- ID yahaan pass karein
        isLoading={isLoading}
        selectedPO={selectedPO}
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

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    pending: "bg-orange-50 text-orange-700 border-orange-200",
    approved: "bg-green-50 text-green-700 border-green-200",
    sent: "bg-blue-50 text-blue-700 border-blue-200",
    received: "bg-emerald-50 text-emerald-700 border-emerald-200",
    cancelled: "bg-red-50 text-red-700 border-red-200",
    Draft: "bg-gray-50 text-gray-700 border-gray-200",
  };
  const className = map[status] || map["Draft"];
  return (
    <Badge variant="outline" className={`capitalize ${className}`}>
      {status}
    </Badge>
  );
}

// ... (VendorPill function same rahega) ...
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
