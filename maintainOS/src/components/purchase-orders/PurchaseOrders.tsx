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
import Loader from "../Loader/Loader";

// --- Helper to deep compare arrays ---
function getChangedFields(
  original: NewPOFormType,
  current: NewPOFormType
): Partial<NewPOFormType> {
  const changes: Partial<NewPOFormType> = {};

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

  // Items array check
  if (JSON.stringify(original.items) !== JSON.stringify(current.items)) {
    changes.items = current.items;
  }

  // --- CHANGE 1: Check for Tax Lines changes ---
  // @ts-ignore - assuming taxLines exists on your type now
  if (JSON.stringify(original.taxLines) !== JSON.stringify(current.taxLines)) {
    // @ts-ignore
    changes.taxLines = current.taxLines;
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
  const commentsRef = useRef<HTMLDivElement>(null);
  const topRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState("details");
  const [isLoading, setIsLoading] = useState(false);

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

  const [isEditingPO, setIsEditingPO] = useState(false);
  const [originalPOForEdit, setOriginalPOForEdit] =
    useState<NewPOFormType | null>(null);

  // --- CHANGE 2: Initialize taxLines in State ---
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
    // @ts-ignore - Assuming interface updated
    taxLines: [],
    sameShipBill: true,
    shippingAddressId: "",
    shippingAddress: null,
    billingAddressId: "",
    billingAddress: null,
    dueDate: "",
    notes: "",
    extraCosts: 0, // (Legacy field, keep if needed, or remove if fully replaced)
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
      setIsLoading(true);
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
    } finally {
      setIsLoading(false);
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
        // Calculate Items Total
        const totalItemsCost =
          po.orderItems?.reduce((acc, it) => {
            const price = Number(it.price) || 0;
            const unitCost = Number(it.unitCost) || 0;
            const unitsOrdered = Number(it.unitsOrdered) || 0;
            return acc + (price || unitCost * unitsOrdered);
          }, 0) ?? 0;

        // Note: If you want the total in the list to include taxes,
        // you would need to sum up po.taxesAndCosts here too.

        return [po.id, totalItemsCost];
      })
    );
  }, [getPurchaseOrderData]);

  /* ------------------------------- Handlers ------------------------------- */

  const resetNewPO = () => {
    setNewPO(initialPOState);
    setAttachedFiles([]);
    setApiError(null);
    setIsEditingPO(false);
    setOriginalPOForEdit(null);
  };

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
  // Only using extraCosts for legacy support, main calculation logic is in NewPOForm now
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

  // --- CHANGE 3: Handle Edit (Map Backend -> Frontend) ---
  const handleEditPO = (poToEdit: any) => {
    // Type 'any' or update PurchaseOrder type
    if (!poToEdit) return;

    console.log("Editing PO:", poToEdit);
    const mappedTaxLines = poToEdit.taxesAndCosts
      ? poToEdit.taxesAndCosts.map((t: any) => ({
          id: cryptoId(), // Generate temp ID for React keys
          label: t.taxLabel,
          value: t.taxValue,
          // Convert "PERCENT" -> "percentage", "FIXED" -> "fixed"
          type: t.taxCategory === "PERCENT" ? "PERCENTAGE" : "DOLLAR",
          isTaxable: t.isTaxable,
        }))
      : [];

    const formPO: NewPOFormType = {
      id: poToEdit.id,
      poNumber: poToEdit.poNumber || "",
      vendorId: poToEdit.vendor?.id || poToEdit.vendorId || "",
      items:
        poToEdit.orderItems && poToEdit.orderItems.length > 0
          ? poToEdit.orderItems.map((item: any) => ({
              id: item.id ? item.id : `temp_${crypto.randomUUID()}`,
              partId: item.part?.id || item.partId || null,
              itemName: item.itemName || item.part?.name || "",
              partNumber: item.partNumber || item.part?.partNumber || "",
              quantity: item.unitsOrdered || 0,
              unitCost: item.unitCost || 0,
            }))
          : [{ ...initialPOState.items[0], id: `temp_${crypto.randomUUID()}` }],

      // @ts-ignore
      taxLines: mappedTaxLines,

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

  // --- Helper to format Taxes for Backend ---
  const formatTaxesForPayload = (taxLines: any[]) => {
    if (!taxLines || taxLines.length === 0) return undefined;
    return taxLines.map((tax) => ({
      taxLabel: tax.label,
      taxValue: Number(tax.value),
      // Frontend "percentage" -> Backend "PERCENT"
      // Frontend "fixed" -> Backend "FIXED" (Assuming default if not percent)
      taxCategory: tax.type === "percentage" ? "PERCENTAGE" : "DOLLAR",
      isTaxable: !!tax.isTaxable,
    }));
  };

  // --- Create Handler ---
  const handleCreatePurchaseOrder = async () => {
    console.log("Create button CLICKED!");
    setIsCreating(true);
    setApiError(null);

    try {
      const payload: any = {};

      if (newPO.poNumber) payload.poNumber = newPO.poNumber;
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

      // --- CHANGE 4: Map Frontend taxLines to Backend taxesAndCosts ---
      // @ts-ignore
      const taxesPayload = formatTaxesForPayload(newPO.taxLines);
      if (taxesPayload) {
        payload.taxesAndCosts = taxesPayload;
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
        setApiError("Client Error: Service not initialized.");
      }
    } catch (error: any) {
      console.error("Error creating PO:", error);
      setApiError(error.message || "Failed to create PO.");
    } finally {
      setIsCreating(false);
    }
  };

  // --- Update Handler ---
  const handleUpdatePurchaseOrder = async () => {
    console.log("Update button CLICKED!");
    if (!newPO.id) {
      setApiError("Error: Purchase Order ID not found.");
      return;
    }

    if (!originalPOForEdit) {
      setApiError("Error: Original data not found. Please try again.");
      return;
    }

    const changedFormFields = getChangedFields(originalPOForEdit, newPO);

    if (Object.keys(changedFormFields).length === 0) {
      toast.success("No changes detected.");
      setCreatingPO(false);
      resetNewPO();
      return;
    }

    setIsCreating(true);
    setApiError(null);

    try {
      const payload: any = {};

      if (changedFormFields.poNumber !== undefined)
        payload.poNumber = changedFormFields.poNumber;
      if (changedFormFields.vendorId !== undefined)
        payload.vendorId = changedFormFields.vendorId;
      if (changedFormFields.contactName !== undefined)
        payload.contactName = changedFormFields.contactName;
      if (changedFormFields.phoneOrMail !== undefined)
        payload.phoneOrMail = changedFormFields.phoneOrMail;
      if (changedFormFields.dueDate !== undefined)
        payload.dueDate = changedFormFields.dueDate;
      if (changedFormFields.notes !== undefined)
        payload.notes = changedFormFields.notes;
      if (changedFormFields.extraCosts !== undefined)
        payload.extraCosts = Number(changedFormFields.extraCosts);
      if (changedFormFields.shippingAddressId !== undefined)
        payload.shippingAddressId = changedFormFields.shippingAddressId;
      if (changedFormFields.billingAddressId !== undefined)
        payload.billingAddressId = changedFormFields.billingAddressId;

      if (changedFormFields.items) {
        payload.orderItems = changedFormFields.items
          .filter((item) => item.itemName && item.itemName.trim() !== "")
          .map((item) => ({
            partId: item.partId,
            itemName: item.itemName,
            partNumber: item.partNumber,
            unitsOrdered: Number(item.quantity),
            unitCost: Number(item.unitCost),
            price: (Number(item.quantity) || 0) * (Number(item.unitCost) || 0),
          }));
      }

      // --- CHANGE 5: Handle Tax Updates ---
      // @ts-ignore
      if (changedFormFields.taxLines) {
        // @ts-ignore
        payload.taxesAndCosts = formatTaxesForPayload(
          changedFormFields.taxLines
        );
      }

      if (purchaseOrderService?.updatePurchaseOrder) {
        console.log("Update Payload (ID: " + newPO.id + "):", payload);

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
        setApiError("Client Error: Update service not initialized.");
      }
    } catch (error: any) {
      console.error("Error updating PO:", error);
      setApiError(error.message || "Failed to update PO.");
    } finally {
      setIsCreating(false);
    }
  };

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
      } else if (modalAction === "cancelled") {
        await purchaseOrderService.cancelPurchaseOrder(id);
        toast.success("Cancelled Successfully");
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
    cancelled: {
      title: "Cancelled Confirmation",
      message: "Are you sure you want to Cancel this?",
      confirmButtonText: "Cancel",
      variant: "warning" as const,
    },
  };

  /* --------------------------------- UI ---------------------------------- */
  return (
    <div className="flex flex-col h-full min-h-0">
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
        <div className="flex-1 min-h-0 overflow-auto p-2">
          <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
            <PurchaseOrdersTable
              orders={filteredPOs}
              columns={selectedColumns}
              pageSize={pageSize}
            />
          </div>
        </div>
      ) : (
        <div className="flex flex-1 min-h-0">
          {/* Left List */}
          <div className="w-96 mr-2 ml-3 mb-2 border border-border flex flex-col min-h-0">
            <div className="p-4 border-b border-border flex-shrink-0">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  All Purchase Orders: {filteredPOs.length}
                </span>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto min-h-0 ">
              {isLoading && filteredPOs.length === 0 ? (
                <Loader />
              ) : (
                <>
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
                                <span className="font-medium ">
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
                </>
              )}
            </div>
          </div>

          {/* Right Details */}
          <div className="flex-1 bg-card mr-3 ml-2 mb-2 border border-border min-h-0 flex flex-col border-border">
            {selectedPO ? (
              <PurchaseOrderDetails
                selectedPO={selectedPO}
                updateState={updateStatus}
                handleConfirm={() => handleConfirm(selectedPO?.id)}
                setModalAction={setModalAction}
                setApproveModal={setApproveModal}
                topRef={topRef}
                formatMoney={formatMoney}
                addressToLine={addressToLine}
                commentsRef={commentsRef}
                StatusBadge={StatusBadge}
                showCommentBox={showCommentBox}
                setShowCommentBox={setShowCommentBox}
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
          isEditingPO ? handleUpdatePurchaseOrder : handleCreatePurchaseOrder
        }
        isCreating={isCreating}
        apiError={apiError}
        attachedFiles={attachedFiles}
        fileInputRef={fileInputRef}
        handleFileAttachClick={handleFileAttachClick}
        handleFileChange={handleFileChange}
        removeAttachedFile={removeAttachedFile}
      />

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
        isOpen={modalAction !== null}
        onClose={handleCloseModal}
        handleConfirm={() => handleConfirm(selectedPO?.id)}
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

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    pending: "bg-orange-50 text-orange-700 border-orange-200",
    approved: "bg-green-50 text-green-700 border-green-200",
    partially_fulfilled: "bg-blue-50 text-blue-700 border-blue-200",
    received: "bg-emerald-50 text-emerald-700 border-emerald-200",
    cancelled: "bg-red-50 text-red-700 border-red-200",
    Draft: "bg-gray-50 text-gray-700 border-gray-200",
    completed: "bg-orange-50 text-orange-600 border-orange-600",
  };
  const className = map[status] || map["Draft"];
  return (
    <Badge variant="outline" className={`capitalize ${className}`}>
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
