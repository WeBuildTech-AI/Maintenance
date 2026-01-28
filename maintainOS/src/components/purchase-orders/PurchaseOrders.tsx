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

import {
  Link as LinkIcon,
  Building2,
  Mail,
  Phone,
  FileText,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Check, // ✅ Added Check import
} from "lucide-react";

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
import { formatINR } from "../utils/dollar_rupee_convert";

// --- Helper: Format PO status for UI ---
const formatStatus = (status?: string) => {
  if (!status) return "N/A";

  return status
    .toLowerCase()        // partially_fulfilled
    .replace(/_/g, " ")   // partially fulfilled
    .replace(/\b\w/g, (c) => c.toUpperCase()); // Partially Fulfilled
};
// map for sortby
const getSortLabel = (type: string, order: "asc" | "desc") => {
  if (type === "Creation Date") {
    return order === "asc" ? "Oldest First" : "Newest First";
  }
  if (type === "Last Updated") {
    return order === "asc" ? "Least Recent First" : "Most Recent First";
  }
  if (type === "Name") {
    return order === "asc" ? "Ascending Order" : "Descending Order";
  }
  return order === "asc" ? "Ascending Order" : "Descending Order";
};


// --- Helper Function: Detect Changes ---

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
    "contactName",
    "phoneOrMail",
  ];


  for (const key of keysToCompare) {
    if (key === "vendorContactIds") {
      // @ts-ignore
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

  // ✅ Sorting State
  const [sortType, setSortType] = useState("Creation Date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [shouldSelectFirst, setShouldSelectFirst] = useState(false); // Added for auto-selection logic

  // ✅ Sort Dropdown State (Updated Logic)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [openSection, setOpenSection] = useState<string | null>(null);
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0 });
  const headerRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

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

  // Handle outside click for sort dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node) &&
        headerRef.current &&
        !headerRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };
    if (isDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isDropdownOpen]);

  // Handler to toggle dropdown and calculate position
  const toggleDropdown = () => {
    if (!isDropdownOpen && headerRef.current) {
      const rect = headerRef.current.getBoundingClientRect();
      setDropdownPos({
        top: rect.bottom,
        left: rect.left + rect.width / 2,
      });
    }
    setIsDropdownOpen((prev) => !prev);
  };

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

  // ✅ FETCH & SORT POs
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

      let data = Array.isArray(res) ? res : (res as any)?.data?.items || [];

      // ✅ Apply Sorting Logic
      data = [...data].sort((a: any, b: any) => {
        let valA, valB;

        if (sortType === "Creation Date") {
          valA = new Date(a.createdAt).getTime();
          valB = new Date(b.createdAt).getTime();
        } else if (sortType === "Last Updated") {
          valA = new Date(a.updatedAt).getTime();
          valB = new Date(b.updatedAt).getTime();
        } else if (sortType === "Name") {
          valA = (a.vendor?.name || "").toLowerCase();
          valB = (b.vendor?.name || "").toLowerCase();
          if (valA < valB) return sortOrder === "asc" ? -1 : 1;
          if (valA > valB) return sortOrder === "asc" ? 1 : -1;
          return 0;
        }

        // For dates/numbers
        if (typeof valA === "number" && typeof valB === "number") {
          return sortOrder === "asc" ? valA - valB : valB - valA;
        }
        return 0;
      });

      setGetPurchaseOrderData(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [
    showDeleted,
    filterParams,
    debouncedSearch,
    sortType, // ✅ Added dependency
    sortOrder, // ✅ Added dependency
  ]);

  useEffect(() => {
    fetchPurchaseOrder();
  }, [fetchPurchaseOrder]);

  // 👇 3. SYNC SELECTION & EDIT STATE WITH URL
  useEffect(() => {
    if (getPurchaseOrderData.length === 0) return;

    // Auto-select logic
    if (viewMode === "panel") {
      if (shouldSelectFirst) {
        navigate(`/purchase-orders/${getPurchaseOrderData[0].id}`, { replace: true });
        setShouldSelectFirst(false);
        return;
      } else if (!routeId && !isCreateRoute) {
        navigate(`/purchase-orders/${getPurchaseOrderData[0].id}`, {
          replace: true,
        });
        return;
      }
    }

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
      // If not create route and no routeId, and not auto-selecting, verify selection state
      if (viewMode === "panel" && !selectedPOId && !isCreateRoute) {
        // handled above
      } else if (viewMode !== 'panel') {
        setSelectedPOId(null);
      }
    }
  }, [routeId, getPurchaseOrderData, editMatch, newPO.id, shouldSelectFirst, viewMode, isCreateRoute]);


  // ✅ CRITICAL FIX: FORCE RESET STATE ON /create ROUTE
  useEffect(() => {
    if (isCreateRoute) {
      setNewPO(initialPOState);
      setOriginalPOForEdit(null);
      setIsEditingPO(false); // Force Create Mode
      setApiError(null);
      setAttachedFiles([]);
    }
  }, [isCreateRoute]);


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
        label: t.taxLabel || t.label || "", //  'label' key ensure ki
        value: t.taxValue || t.value || 0, //  'value' key ensure ki
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

  // ✅ OPTIMISTIC UPDATE HELPERS
  const handlePOCreate = (newPO: PurchaseOrder) => {
    setGetPurchaseOrderData((prev) => [newPO, ...prev]);
    setSelectedPOId(newPO.id);
  };

  const handlePOUpdate = (updatedPO: PurchaseOrder) => {
    setGetPurchaseOrderData((prev) =>
      prev.map((po) => (po.id === updatedPO.id ? updatedPO : po))
    );
    setSelectedPOId(updatedPO.id);
  };

  // ✅ NEW HANDLER: Direct Clone & Save
  const handleDirectCopyPurchaseOrder = async (poToCopy: any) => {
    if (!poToCopy) return;
    setIsLoading(true);

    try {
      // 1. Construct Payload directly from the existing PO object
      const payload: any = {
        poNumber: `Copy ${poToCopy.poNumber}`, // Appends " copy"
        status: "pending", // Reset status to pending for new copies
        vendorId: poToCopy.vendorId || poToCopy.vendor?.id,
      };

      // Map optional fields
      if (poToCopy.dueDate) payload.dueDate = poToCopy.dueDate;
      if (poToCopy.notes) payload.notes = poToCopy.notes;
      if (poToCopy.extraCosts) payload.extraCosts = Number(poToCopy.extraCosts);
      if (poToCopy.contactName) payload.contactName = poToCopy.contactName;
      if (poToCopy.phoneOrMail) payload.phoneOrMail = poToCopy.phoneOrMail;

      // Map Contacts
      const contactIds =
        poToCopy.vendorContactIds ||
        (poToCopy.contacts ? poToCopy.contacts.map((c: any) => c.id) : []);
      if (contactIds.length > 0) {
        payload.vendorContactIds = contactIds;
      }

      // Map Addresses
      if (poToCopy.shippingAddressId || poToCopy.shippingAddress?.id) {
        payload.shippingAddressId =
          poToCopy.shippingAddressId || poToCopy.shippingAddress?.id;
      }
      if (poToCopy.billingAddressId || poToCopy.billingAddress?.id) {
        payload.billingAddressId =
          poToCopy.billingAddressId || poToCopy.billingAddress?.id;
      }

      // Map Items
      if (poToCopy.orderItems && poToCopy.orderItems.length > 0) {
        payload.orderItems = poToCopy.orderItems.map((item: any) => ({
          partId: item.partId || item.part?.id,
          itemName: item.itemName,
          partNumber: item.partNumber,
          unitsOrdered: Number(item.unitsOrdered),
          unitCost: Number(item.unitCost),
          price:
            Number(item.price) ||
            Number(item.unitsOrdered) * Number(item.unitCost),
        }));
      }

      // Map Taxes
      if (poToCopy.taxesAndCosts && poToCopy.taxesAndCosts.length > 0) {
        payload.taxesAndCosts = poToCopy.taxesAndCosts.map((tax: any) => ({
          taxLabel: tax.taxLabel || tax.label,
          taxValue: Number(tax.taxValue || tax.value),
          taxCategory: tax.taxCategory || "DOLLAR", // Default fallback
          isTaxable: !!tax.isTaxable,
        }));
      }

      // 2. Hit the POST API immediately
      const response = await purchaseOrderService.createPurchaseOrder(payload);

      toast.success("Purchase Order copied successfully!");

      // 3. Optimistic Update (No Re-fetch)
      // await fetchPurchaseOrder(); // ❌ Removed
      if (response && response.id) {
        handlePOCreate(response as any); // ✅ Optimistic Update
        navigate(`/purchase-orders/${response.id}`);
      }
    } catch (error: any) {
      console.error("Error copying PO:", error);
      toast.error(error.message || "Failed to copy Purchase Order.");
    } finally {
      setIsLoading(false);
    }
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

  // 🔴🔴🔴 FIXED: CREATE HANDLER (NO VALIDATION) 🔴🔴🔴
  const handleCreatePurchaseOrder = async () => {
    // ⚠️ Validation Removed as Requested by User

    // 2. Start Loading
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

        toast.success("Purchase Order created!");

        // await fetchPurchaseOrder(); // ❌ Removed

        // ✅ Optimistic Update
        resetNewPO();
        if (response && response.id) {
          handlePOCreate(response as any);
          navigate(`/purchase-orders/${response.id}`);
        } else {
          // Fallback if no ID is returned (unlikely)
          navigate("/purchase-orders");
        }

      } else {
        setApiError("Client Error: Service not initialized.");
      }
    } catch (error: any) {
      console.error("Error creating PO:", error);
      setApiError(error.message || "Failed to create PO.");
      toast.error("Failed to create Purchase Order.");
    } finally {
      // 3. Stop Loading (Crucial to re-enable button)
      setIsCreating(false);
    }
  };

  // 🔴🔴🔴 FIXED: UPDATE HANDLER 🔴🔴🔴
  const handleUpdatePurchaseOrder = async () => {
    // ⚠️ Basic Validation Only for ID
    if (!newPO.id) {
      toast.error("Error: Purchase Order ID not found.");
      return;
    }

    if (!originalPOForEdit) {
      toast.error("Error: Original data not found. Please try again.");
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

        // await fetchPurchaseOrder(); // ❌ Removed

        // ✅ Optimistic Update
        resetNewPO();
        if (response) {
          handlePOUpdate(response as any);
          navigate(`/purchase-orders/${newPO.id}`);
        }

      } else {
        setApiError("Client Error: Update service not initialized.");
      }
    } catch (error: any) {
      console.error("Error updating PO:", error);
      setApiError(error.message || "Failed to update PO.");
      toast.error("Failed to update Purchase Order.");
    } finally {
      setIsCreating(false);
    }
  };

  const handleCloseModal = () => {
    if (!isLoading) {
      setModalAction(null);
    }
  };

  const handlePODelete = (id: string) => {
    setGetPurchaseOrderData((prev) => prev.filter((po) => po.id !== id));
    if (selectedPOId === id) {
      setSelectedPOId(null);
      navigate("/purchase-orders");
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
        // ✅ Optimistic Update
        setGetPurchaseOrderData((s) =>
          s.map((po) => (po.id === id ? { ...po, status: "rejected" } : po))
        );
      } else if (modalAction === "approve") {
        await purchaseOrderService.approvePurchaseOrder(id);
        toast.success("Successfully Approved ");
        // ✅ Optimistic Update
        setGetPurchaseOrderData((s) =>
          s.map((po) => (po.id === id ? { ...po, status: "approved" } : po))
        );
      } else if (modalAction === "delete") {
        await purchaseOrderService.deletePurchaseOrder(id);
        toast.success("Deleted Successfully");

        // ✅ Optimistic Update
        handlePODelete(id);
        // navigate("/purchase-orders"); // Already handled in handlePODelete
      } else if (modalAction === "cancelled") {
        await purchaseOrderService.cancelPurchaseOrder(id);
        toast.success("Cancelled Successfully");
        // ✅ Optimistic Update
        setGetPurchaseOrderData((s) =>
          s.map((po) => (po.id === id ? { ...po, status: "cancelled" } : po))
        );
      }
      // fetchPurchaseOrder(); // ❌ Removed
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
      {/* ✅ Wrapped in relative z-50 to fix dropdown overlap issue */}
      <div className="relative z-50">
        <POHeaderComponent
          viewMode={viewMode}
          setViewMode={setViewMode}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          setIsCreatingForm={() => {
            // Force Reset when button clicked from Header
            resetNewPO();
            setIsCreating(false);
            navigate("/purchase-orders/create");
          }}
          setShowSettings={setShowSettings}
          setIsSettingModalOpen={setIsSettingModalOpen}
          setShowDeleted={setShowDeleted}
          onFilterChange={handleFilterChange}
          // 👇 Sorting Props passed down
          sortType={sortType}
          setSortType={setSortType}
          sortOrder={sortOrder}
          setSortOrder={setSortOrder}
        />
      </div>

      {viewMode === "table" ? (
        <div className="flex-1 min-h-0 overflow-auto p-2">
          <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
            <PurchaseOrdersTable
              orders={filteredPOs} // This data is now sorted in fetchPurchaseOrder
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

            {/* ✅ Updated List Header with Styled Sort Dropdown (FIXED) */}
            <div
              ref={headerRef}
              className="flex items-center justify-between px-5 py-3 border-b bg-white ml-3 relative z-40"
            >
              <div className="flex items-center gap-2 text-sm text-gray-700 font-medium">
                <span>Sort By:</span>
                <button
                  onClick={toggleDropdown}
                  className="flex items-center gap-1 text-sm text-blue-600 font-semibold focus:outline-none"
                >
                  {sortType} :{" "}
                  {getSortLabel(sortType, sortOrder)}
                  {isDropdownOpen ? (
                    <ChevronUp className="w-4 h-4 text-blue-600" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-blue-600" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto min-h-0 bg-white p-3 space-y-2">
              {isLoading && filteredPOs.length === 0 ? (
                <Loader />
              ) : (
                <>
                  {filteredPOs?.map((po) => {
                    const isSelected = selectedPOId === po.id;
                    const vendorName = po.vendor?.name || "Unknown Vendor";
                    const initials = vendorName
                      .split(" ")
                      .map((n: string) => n[0])
                      .join("")
                      .slice(0, 2)
                      .toUpperCase();
                    const totalCost = totals[po.id] ?? 0;

                    // Overdue Logic
                    let isOverdue = false;
                    if (po.dueDate && po.status !== "completed") {
                      const today = new Date();
                      const due = new Date(po.dueDate);
                      today.setHours(0, 0, 0, 0);
                      due.setHours(0, 0, 0, 0);
                      isOverdue = due < today;
                    }

                    // Status Color Logic
                    let statusColor =
                      "bg-gray-50 text-gray-700 border-gray-200";
                    const s = po.status?.toLowerCase();
                    if (s === "approved")
                      statusColor =
                        "bg-green-50 text-green-700 border-green-200";
                    else if (s === "rejected")
                      statusColor = "bg-red-50 text-red-700 border-red-200";
                    else if (s === "completed")
                      statusColor = "bg-blue-50 text-blue-700 border-blue-200";
                    else
                      statusColor =
                        "bg-yellow-50 text-yellow-700 border-yellow-200"; // Pending

                    return (
                      <div
                        key={po.id}
                        onClick={() => navigate(`/purchase-orders/${po.id}`)}
                        //  INLINE Yellow Theme Styling
                        className={`cursor-pointer border rounded-lg p-4 mb-3 transition-all duration-200 hover:shadow-md ${isSelected
                          ? "border-yellow-400 bg-yellow-50 ring-1 ring-yellow-400"
                          : "border-gray-200 bg-white hover:border-yellow-200"
                          }`}
                      >
                        {/* List Item Content */}
                        <div className="flex items-start gap-4">
                          {/* Icon/Avatar Wrapper */}
                          <div
                            className={`h-10 w-10 flex-shrink-0 flex items-center justify-center rounded-full border overflow-hidden ${isSelected
                              ? "bg-white border-yellow-200 text-yellow-600"
                              : "bg-gray-50 border-gray-100 text-gray-500"
                              }`}
                          >
                            <span className="text-xs font-bold">
                              {initials}
                            </span>
                          </div>

                          {/* Content Column */}
                          <div className="flex-1 min-w-0">
                            {/* Row 1: Title + Status Badge */}
                            <div className="flex justify-between items-start gap-2">
                              <h3 className="text-sm font-semibold text-gray-900 truncate leading-tight">
                                PO #{po.poNumber || "---"}
                              </h3>

                              <span className={`flex-shrink-0 inline-flex items-center text-xs px-2 py-0.5 rounded text-[10px] font-medium border ${statusColor}`}>
                                {formatStatus(po.status)}
                              </span>
                            </div>
                            {/* Format backend status for better UI readability */}


                            {/* Row 2: Vendor Name */}
                            <div className="flex items-center gap-1.5 mt-2 text-xs text-gray-500">
                              <Building2
                                size={12}
                                className="flex-shrink-0 text-gray-400"
                              />
                              <span className="truncate capitalize">
                                {vendorName}
                              </span>
                            </div>

                            {/* Row 3: Footer (Cost + Overdue) */}
                            <div
                              className={`mt-2 pt-2 border-t border-dashed flex items-center justify-between text-xs ${isSelected
                                ? "border-yellow-200"
                                : "border-gray-100"
                                }`}
                            >
                              <div className="flex mt-1 items-center gap-1 font-medium text-gray-700">
                                <span className="text-gray-400">₹</span>
                                {formatINR(totalCost).replace("₹", "")}
                              </div>

                              {isOverdue && (
                                <div className="flex items-center gap-1 text-red-600 font-semibold">
                                  <AlertCircle size={12} />
                                  <span>Overdue</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {filteredPOs.length === 0 && (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 mx-auto mb-4 bg-muted rounded-lg flex items-center justify-center">
                        <FileText className="w-8 h-8 text-muted-foreground/30" />
                      </div>
                      <p className="text-muted-foreground mb-2">
                        No purchase orders found
                      </p>
                      <Button
                        variant="link"
                        className="text-orange-600 p-0 hover:text-orange-700"
                        onClick={() => {
                          resetNewPO();
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
                // 👇 Handle Copy Click (Direct API Call)
                handleCopyClick={() =>
                  handleDirectCopyPurchaseOrder(selectedPO)
                }
                fetchPurchaseOrder={fetchPurchaseOrder}
                restoreData="Restore"
                onClose={() => setModalAction(null)}
                showDeleted={showDeleted}
                showCommentSection={true}
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

      {/* --- ✅ NEW SORT DROPDOWN (Fixed & Portal-like behavior) --- */}
      {isDropdownOpen && (
        <div
          ref={modalRef}
          className="fixed z-[99] text-sm rounded-md border border-gray-200 bg-white shadow-lg animate-fade-in p-2"
          style={{
            top: dropdownPos.top,
            left: dropdownPos.left,
            transform: "translateX(-50%)",
            width: "300px",
            maxWidth: "90vw",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex flex-col divide-y divide-gray-100">
            {[
              {
                label: "Creation Date",
                options: ["Newest First", "Oldest First"],
              },
              {
                label: "Last Updated",
                options: ["Most Recent First", "Least Recent First"],
              },
              {
                label: "Name",
                options: ["Ascending Order", "Descending Order"],
              },
            ].map((section) => (
              <div key={section.label} className="flex flex-col mt-1 mb-1">
                <button
                  onClick={() =>
                    setOpenSection(
                      openSection === section.label ? null : section.label
                    )
                  }
                  className={`flex items-center justify-between w-full px-4 py-3 text-sm transition-all rounded-md ${sortType === section.label
                    ? "text-orange-600 font-medium bg-gray-50"
                    : "text-gray-800 hover:bg-gray-50"
                    }`}
                >
                  <span>{section.label}</span>
                  {openSection === section.label ? (
                    <ChevronUp className="w-3.5 h-3.5 text-gray-400" />
                  ) : (
                    <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
                  )}
                </button>

                {openSection === section.label && (
                  <div className="flex flex-col bg-gray-50 border-t border-gray-100 py-1">
                    {section.options.map((opt) => {
                      const isAsc =
                        opt.includes("Asc") ||
                        opt.includes("Oldest") ||
                        opt.includes("Least");
                      const currentOrder = isAsc ? "asc" : "desc";
                      const isSelected =
                        sortType === section.label &&
                        sortOrder === currentOrder;

                      return (
                        <button
                          key={opt}
                          onClick={() => {
                            setSortType(section.label);
                            setSortOrder(currentOrder);
                            setShouldSelectFirst(true); // ✅ Trigger auto-select
                            setIsDropdownOpen(false);
                          }}
                          className={`flex items-center justify-between px-6 py-2 text-left text-sm transition rounded-md ${isSelected
                            ? "text-blue-600 bg-blue-50 font-medium"
                            : "text-gray-700 hover:text-blue-500 hover:bg-white"
                            }`}
                        >
                          {opt}
                          {isSelected && (
                            <Check className="w-3.5 h-3.5 text-blue-500" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modals */}
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
        // 👇 CRITICAL: Explicitly pass isEditing state
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