// FILE: PurchaseOrders.tsx
"use client";
import * as React from "react";
import { useSelector } from "react-redux";
import type { RootState } from "../../store";
import { useMemo, useState, useRef, useEffect, useCallback } from "react";
import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";

import {
  useNavigate,
  useMatch,
  useLocation,
  useParams,
} from "react-router-dom";

import { Link as LinkIcon, Building2, Mail, Phone } from "lucide-react";

import {
  mockVendors,
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
import { StatusBadge } from "./StatusBadge";
import { FetchPurchaseOrdersParams } from "../../store/purchaseOrders/purchaseOrders.types";

// --- Helper to deep compare arrays ---
function getChangedFields(
  original: NewPOFormType,
  current: NewPOFormType
): Partial<NewPOFormType> {
  const changes: Partial<NewPOFormType> = {};

  const keysToCompare: (keyof NewPOFormType)[] = [
    "poNumber",
    "vendorId",
    "dueDate",
    "notes",
    "extraCosts",
    "shippingAddressId",
    "billingAddressId",
    "sameShipBill",
    "vendorContactIds",
  ];

  for (const key of keysToCompare) {
    if (key === "vendorContactIds") {
      if (JSON.stringify(original[key]) !== JSON.stringify(current[key])) {
        // @ts-ignore
        changes[key] = current[key];
      }
    } else if (original[key] !== current[key]) {
      // @ts-ignore
      changes[key] = current[key];
    }
  }

  if (JSON.stringify(original.items) !== JSON.stringify(current.items)) {
    changes.items = current.items;
  }

  // @ts-ignore
  if (JSON.stringify(original.taxLines) !== JSON.stringify(current.taxLines)) {
    // @ts-ignore
    changes.taxLines = current.taxLines;
  }

  return changes;
}

/* ---------------------------- Purchase Orders UI -------------------------- */
export function PurchaseOrders() {
  const navigate = useNavigate();
  const location = useLocation();

  // --- Router State ---
  const isCreateRoute = useMatch("/purchase-orders/create");
  const editMatch = useMatch("/purchase-orders/:id/edit");
  const viewMatch = useMatch("/purchase-orders/:id");

  // Determine active ID from URL
  const routeId = editMatch?.params?.id || viewMatch?.params?.id;

  // Determine if Form Dialog should be open based on URL
  const isFormOpen = !!(isCreateRoute || editMatch);

  const [getPurchaseOrderData, setGetPurchaseOrderData] = useState<
    PurchaseOrder[]
  >([]);

  // Search State
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const [selectedPOId, setSelectedPOId] = useState<string | null>(null);
  const [approveModal, setApproveModal] = useState(false);

  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    const savedMode = localStorage.getItem("purchaseOrderViewMode");
    return (savedMode as ViewMode) || "panel";
  });

  const [selectedColumns, setSelectedColumns] = useState(allColumns);
  const [pageSize, setPageSize] = useState(25);
  const [showSettings, setShowSettings] = useState(false);
  const [showCommentBox, setShowCommentBox] = useState(false);
  const commentsRef = useRef<HTMLDivElement>(null);
  const topRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState("details");
  const [isLoading, setIsLoading] = useState(false);
  const [showDeleted, setShowDeleted] = useState(false);

  // ✅ FILTER PARAMETERS STATE
  const [filterParams, setFilterParams] = useState<FetchPurchaseOrdersParams>({
    page: 1,
    limit: 50,
  });

  useEffect(() => {
    if (viewMode === "table") {
      localStorage.setItem("purchaseOrderViewMode", "table");
    } else {
      localStorage.removeItem("purchaseOrderViewMode");
    }
  }, [viewMode]);

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
    // @ts-ignore
    taxLines: [],
    sameShipBill: true,
    shippingAddressId: "",
    shippingAddress: null,
    billingAddressId: "",
    billingAddress: null,
    dueDate: "",
    notes: "",
    extraCosts: 0,
    vendorContactIds: [],
    poNumber: "",
  };

  const [newPO, setNewPO] = useState<NewPOFormType>(initialPOState);

  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isSettingModalOpen, setIsSettingModalOpen] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [modalAction, setModalAction] = useState<
    "reject" | "approve" | "delete" | "fullfill" | "cancelled" | null
  >(null);
  const user = useSelector((state: RootState) => state.auth.user);
  const [showCustomPoInput, setShowCustomPoInput] = useState(false);

  // ✅ DEBOUNCE SEARCH
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // ✅ FETCH POs
  const fetchPurchaseOrder = React.useCallback(async () => {
    if (getPurchaseOrderData.length === 0) setIsLoading(true);

    let res: any;
    try {
      if (showDeleted) {
        res = await purchaseOrderService.fetchDeletePurchaseOrder();
      } else {
        const apiPayload = {
          ...filterParams,
          search: debouncedSearch || undefined,
        };
        res = await purchaseOrderService.fetchPurchaseOrders(apiPayload);
      }

      const data = Array.isArray(res) ? res : (res as any)?.data?.items || [];
      const sortedData = [...data].sort(
        (a: PurchaseOrder, b: PurchaseOrder) =>
          new Date(b.updatedAt).valueOf() - new Date(a.updatedAt).valueOf()
      );
      setGetPurchaseOrderData(sortedData);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [showDeleted, filterParams, debouncedSearch, getPurchaseOrderData.length]);

  useEffect(() => {
    fetchPurchaseOrder();
  }, [fetchPurchaseOrder]);

  // 👇 3. SYNC SELECTION & EDIT STATE WITH URL
  useEffect(() => {
    if (getPurchaseOrderData.length === 0) return;

    if (routeId) {
      // Avoid matching "create" keyword as an ID
      if (routeId === "create") return;

      const found = getPurchaseOrderData.find((p) => p.id === routeId);
      if (found) {
        setSelectedPOId(found.id);

        if (editMatch) {
          if (newPO.id !== found.id) {
            handleEditPO(found);
          }
        }
      }
    } else {
      if (viewMode === "panel") {
        if (!selectedPOId && getPurchaseOrderData.length > 0) {
          navigate(`/purchase-orders/${getPurchaseOrderData[0].id}`, {
            replace: true,
          });
        }
      } else {
        setSelectedPOId(null);
      }
    }
  }, [routeId, getPurchaseOrderData, viewMode, editMatch, newPO.id]);

  // ✅ HANDLER: Filter Change
  const handleFilterChange = useCallback(
    (newParams: Partial<FetchPurchaseOrdersParams>) => {
      setFilterParams((prev) => {
        const merged = { ...prev, ...newParams };
        if (JSON.stringify(prev) === JSON.stringify(merged)) return prev;
        return merged;
      });
    },
    []
  );

  const filteredPOs = getPurchaseOrderData;

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
            return acc + (price || unitCost * unitsOrdered);
          }, 0) ?? 0;

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

  const handleEditPO = (poToEdit: any) => {
    if (!poToEdit) return;

    // --- 1. Vendor Handling (Extract ID & Object) ---
    let extractedVendorId = "";
    let vendorObject = null;

    if (poToEdit.vendor) {
      if (typeof poToEdit.vendor === "object") {
        extractedVendorId = poToEdit.vendor.id;
        vendorObject = poToEdit.vendor; // Pura object store karein
      } else if (typeof poToEdit.vendor === "string") {
        extractedVendorId = poToEdit.vendor;
      }
    } else if (poToEdit.vendorId) {
      extractedVendorId = poToEdit.vendorId;
    }

    // --- 2. Contacts Handling (Sabse Important Fix) ---
    let mappedContactIds: string[] = [];
    let mappedContactsList: any[] = [];

    // Backend se contacts kisi bhi naam se aa sakte hain, sab check karo:
    const rawContacts =
      poToEdit.vendorContacts || // Option A: vendorContacts
      poToEdit.contacts || // Option B: contacts
      [];

    if (Array.isArray(rawContacts) && rawContacts.length > 0) {
      // IDs nikalo
      mappedContactIds = rawContacts.map((c: any) =>
        typeof c === "object" ? c.id : c
      );
      // Objects nikalo (UI ko dikhane ke liye)
      mappedContactsList = rawContacts.filter(
        (c: any) => typeof c === "object"
      );
    } else if (
      poToEdit.vendorContactIds &&
      Array.isArray(poToEdit.vendorContactIds)
    ) {
      // Fallback: Agar sirf IDs aaye hain
      mappedContactIds = poToEdit.vendorContactIds;
    }

    // --- 3. Tax Lines Mapping (Corrected for label/value) ---
    const mappedTaxLines = poToEdit.taxesAndCosts
      ? poToEdit.taxesAndCosts.map((t: any) => ({
          id: t.id || cryptoId(),
          label: t.taxLabel || t.label || "", // ✅ 'label' key ensure ki
          value: t.taxValue || t.value || 0, // ✅ 'value' key ensure ki
          type: t.taxCategory === "PERCENTAGE" ? "percentage" : "fixed",
          isTaxable: t.isTaxable,
        }))
      : [];

    // --- 4. Construct Form State ---
    const formPO: NewPOFormType = {
      id: poToEdit.id,
      poNumber: poToEdit.poNumber || "",

      // ✅ VENDOR: ID aur Object dono pass karein
      vendorId: extractedVendorId,
      // @ts-ignore
      vendor: vendorObject, // UI ko ye object chahiye turant naam dikhane ke liye

      // ✅ CONTACTS: IDs aur List dono pass karein
      vendorContactIds: mappedContactIds,
      // @ts-ignore
      initialVendorContacts: mappedContactsList, // Dropdown ko ye list chahiye

      // ✅ Legacy Fields (Backup)
      contactName: poToEdit.contactName || "",
      phoneOrMail: poToEdit.phoneOrMail || "",

      // ✅ Addresses
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

      // ✅ Dates & Notes
      dueDate: poToEdit.dueDate
        ? new Date(poToEdit.dueDate).toISOString().split("T")[0]
        : "",
      notes: poToEdit.notes || "",
      extraCosts: poToEdit.extraCosts || 0,

      // ✅ Items
      items:
        poToEdit.orderItems && poToEdit.orderItems.length > 0
          ? poToEdit.orderItems.map((item: any) => ({
              id: item.id || `temp_${Math.random().toString(36).substr(2, 9)}`,
              partId: item.part?.id || item.partId || null,
              itemName: item.itemName || item.part?.name || "",
              partNumber: item.partNumber || item.part?.partNumber || "",
              quantity: item.unitsOrdered || 0,
              unitCost: item.unitCost || 0,
            }))
          : [
              {
                ...initialPOState.items[0],
                id: `temp_${Math.random().toString(36).substr(2, 9)}`,
              },
            ],

      // ✅ Taxes
      // @ts-ignore
      taxLines: mappedTaxLines,
    };

    console.log("Edit Form State Set:", formPO); // Debugging ke liye check karein
    setNewPO(formPO);
    setOriginalPOForEdit(formPO);
    setIsEditingPO(true);
    setApiError(null);
    setAttachedFiles([]);
  };

  const formatTaxesForPayload = (taxLines: any[]) => {
    if (!taxLines || taxLines.length === 0) return undefined;
    return taxLines.map((tax) => ({
      taxLabel: tax.label,
      taxValue: Number(tax.value),
      taxCategory: tax.type === "percentage" ? "PERCENTAGE" : "DOLLAR",
      isTaxable: !!tax.isTaxable,
    }));
  };

  const handleCreatePurchaseOrder = async () => {
    setIsCreating(true);
    setApiError(null);

    try {
      const payload: any = {};

      if (showCustomPoInput === false) {
        const randomNumber = Math.floor(
          100000 + Math.random() * 900000
        ).toString();
        payload.poNumber = randomNumber;
      } else {
        payload.poNumber = newPO.poNumber || "";
      }

      if (newPO.vendorId) payload.vendorId = newPO.vendorId;
      payload.status = "pending";

      if (newPO.vendorContactIds && newPO.vendorContactIds.length > 0) {
        payload.vendorContactIds = newPO.vendorContactIds;
      }
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
        const response = await purchaseOrderService.createPurchaseOrder(
          payload
        );

        navigate("/purchase-orders");

        resetNewPO();
        fetchPurchaseOrder();
        toast.success("Purchase Order created!");

        if (response && response.id) {
          navigate(`/purchase-orders/${response.id}`);
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

  const handleUpdatePurchaseOrder = async () => {
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
      navigate(`/purchase-orders/${newPO.id}`);
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

      if (changedFormFields.vendorContactIds) {
        payload.vendorContactIds = changedFormFields.vendorContactIds;
      }

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

      if (changedFormFields.taxLines) {
        // @ts-ignore
        payload.taxesAndCosts = formatTaxesForPayload(
          changedFormFields.taxLines
        );
      }

      if (purchaseOrderService?.updatePurchaseOrder) {
        const response = await purchaseOrderService.updatePurchaseOrder(
          newPO.id,
          payload
        );

        toast.success("Purchase Order updated!");
        navigate(`/purchase-orders/${newPO.id}`);

        resetNewPO();
        fetchPurchaseOrder();
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

        navigate("/purchase-orders");
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
          // 👇 Navigate to Create Route
          navigate("/purchase-orders/create");
        },
        setShowSettings,
        setIsSettingModalOpen,
        setShowDeleted,
        handleFilterChange
      )}

      {viewMode === "table" ? (
        <div className="flex-1 min-h-0 overflow-auto p-2">
          <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
            <PurchaseOrdersTable
              orders={filteredPOs}
              columns={selectedColumns}
              pageSize={pageSize}
              isSettingModalOpen={isSettingModalOpen}
              setIsSettingModalOpen={setIsSettingModalOpen}
              fetchPurchaseOrders={fetchPurchaseOrder}
              showDeleted={showDeleted}
              setShowDeleted={setShowDeleted}
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
                        // 👇 Navigate to PO ID
                        onClick={() => navigate(`/purchase-orders/${po.id}`)}
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
                              {po.status === "completed" ? null : (
                                <>
                                  <div className="mt-1">
                                    {(() => {
                                      const today = new Date();
                                      const dueDate = new Date(
                                        po.dueDate || ""
                                      );

                                      // reset times for accurate comparison
                                      today.setHours(0, 0, 0, 0);
                                      dueDate.setHours(0, 0, 0, 0);

                                      if (po.dueDate && dueDate < today) {
                                        return (
                                          <span className="text-red-600 font-medium text-sm mt-1">
                                            Overdue
                                          </span>
                                        );
                                      } else if (
                                        po.dueDate &&
                                        dueDate.getTime() === today.getTime()
                                      ) {
                                        return (
                                          <span className="text-red-600 font-medium text-sm mt-1">
                                            Overdue
                                          </span>
                                        );
                                      } else {
                                        return null;
                                      }
                                    })()}
                                  </div>
                                </>
                              )}
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
                          // 👇 Navigate to Create Route
                          navigate("/purchase-orders/create");
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
                // StatusBadge={StatusBadge}
                showCommentBox={showCommentBox}
                setShowCommentBox={setShowCommentBox}
                // 👇 Navigate to Edit Route
                handleEditClick={() =>
                  navigate(`/purchase-orders/${selectedPO.id}/edit`)
                }
                fetchPurchaseOrder={fetchPurchaseOrder}
                restoreData="Restore"
                onClose={() => setModalAction(null)}
                showDeleted={showDeleted}
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
        // 👇 Controls open state via URL
        open={isFormOpen}
        onOpenChange={(isOpen) => {
          if (!isOpen) {
            resetNewPO();
            // 👇 FIX: Check creating state first to avoid infinite loop
            if (isCreateRoute) {
              navigate("/purchase-orders");
            } else if (routeId) {
              navigate(`/purchase-orders/${routeId}`);
            } else {
              navigate("/purchase-orders");
            }
          }
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
          resetNewPO();
          // 👇 FIX: Check creating state first to avoid infinite loop
          if (isCreateRoute) {
            navigate("/purchase-orders");
          } else if (routeId) {
            navigate(`/purchase-orders/${routeId}`);
          } else {
            navigate("/purchase-orders");
          }
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
        showCustomPoInput={showCustomPoInput}
        setShowCustomPoInput={setShowCustomPoInput}
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
