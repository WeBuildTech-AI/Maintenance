import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  CalendarDays,
  Clock,
  Edit,
  Factory,
  MapPin,
  MessageSquare,
  MoreHorizontal,
  Users,
  Wrench,
  Briefcase,
  Layers,
  ClipboardList,
  Gauge,
  CheckCircle2,
  PauseCircle,
  UserCircle2,
  X,
  Maximize2,
  Minimize2,
  ArrowLeft,
  Copy,
  View, // For Procedure Button
  Repeat
} from "lucide-react";

import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import type { AppDispatch } from "../../../../store";
import {
  deleteWorkOrder,
  patchWorkOrderComplete,
  updateWorkOrder,
  updateWorkOrderStatus,
} from "../../../../store/workOrders/workOrders.thunks";

import { workOrderService } from "../../../../store/workOrders";

// Import Panels & Components
import TimeOverviewPanel from "../../panels/TimeOverviewPanel";
import OtherCostsPanel from "../../panels/OtherCostsPanel";
import UpdatePartsPanel from "../../panels/UpdatePartsPanel";
import { CommentsSection } from "../../ToDoView/CommentsSection";
import { NewWorkOrderForm } from "../../NewWorkOrderForm/NewWorkOrderFrom";
import { LinkedProcedurePreview } from "../../ToDoView/LinkedProcedurePreview"; // Ensure this path is correct
import { procedureService } from "../../../../store/procedures/procedures.service"; // Import Service
import { DynamicSelect } from "../../NewWorkOrderForm/DynamicSelect";
import { WorkOrderAssetStatusModal } from "../../NewWorkOrderForm/WorkOrderAssetStatusModal";
import { assetService } from "../../../../store/assets/assets.service";

// --- HELPER FUNCTIONS ---

const safeRender = (value: any) => {
  if (!value) return null;
  if (typeof value === "string" || typeof value === "number") return value;
  if (typeof value === "object") {
    return value.name || value.title || value.fullName || value.label || "—";
  }
  return "—";
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
  }).format(amount);
};

const formatDurationDetailed = (totalMinutes: number) => {
  if (!totalMinutes) return "0h 0m 00s";
  const hours = Math.floor(totalMinutes / 60);
  const minutes = Math.floor(totalMinutes % 60);
  const seconds = 0;
  return `${hours}h ${minutes}m ${seconds.toString().padStart(2, "0")}s`;
};

const formatDecimalHoursToDisplay = (hours: any) => {
  if (hours === undefined || hours === null || hours === "") return "N/A";
  const num = Number(hours);
  if (isNaN(num)) return "N/A";
  
  const h = Math.floor(num);
  const m = Math.round((num - h) * 60);
  
  if (h === 0 && m === 0) return "0h 0m";
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
};

const formatDate = (dateString: string | undefined, includeTime = false) => {
    if (!dateString) return "—";
    const date = new Date(dateString);
    if (includeTime) {
        return date.toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true });
    }
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

// ✅ UPDATED: Render List with Navigation Support
const renderClickableList = (
  items: any[], 
  navigate?: any, 
  linkGenerator?: (id: string) => string, 
  key = "name"
) => {
  if (!items || !Array.isArray(items) || items.length === 0) return "—";
  return items.map((item, i) => (
    <span key={item.id || i}>
      <span 
        onClick={(e) => {
          if (navigate && linkGenerator && item.id) {
             e.preventDefault();
             e.stopPropagation();
             navigate(linkGenerator(item.id));
          }
        }}
        className={navigate && linkGenerator ? "text-blue-600 hover:underline cursor-pointer" : ""}
      >
        {item[key] || item.name || item.title || item.fullName || "View Item"}
      </span>
      {i < items.length - 1 && ", "}
    </span>
  ));
};

function parseRecurrenceRule(raw: any, startDateIso?: string, dueDateIso?: string) {
  if (!raw) return null;
  let rule: any = raw;
  try { if (typeof raw === "string") rule = JSON.parse(raw); } catch (e) { rule = raw; }
  if (!rule || !rule.type) return null;
  
  const type = String(rule.type).toLowerCase();
  if (type.includes("daily")) return { title: "Repeats daily.", short: "Daily" };
  if (type.includes("weekly")) return { title: "Repeats weekly.", short: "Weekly" };
  if (type.includes("monthly")) return { title: "Repeats monthly.", short: "Monthly" };
  if (type.includes("yearly")) return { title: "Repeats yearly.", short: "Yearly" };
  
  return { title: "Repeats based on schedule.", short: "Custom" };
}

// --- MAIN COMPONENT ---

export default function WorkOrderDetailModal({
  open,
  onClose,
  workOrder,
  onRefreshWorkOrders,
}: any) {
  // ✅ DEBUG LOG 1: Props
  console.log("🚀 MODAL RENDERED. Props Received:", { 
    isOpen: open, 
    workOrderId: workOrder?.id,
    workOrderTitle: workOrder?.title 
  });
  
  const navigate = useNavigate();
  const [fetchedProcedures, setFetchedProcedures] = useState<any[]>([]); // Store fetched procedures

  // ✅ EFFECT: Fetch Procedures if IDs exist but bodies don't
  useEffect(() => {
    if (!workOrder || !open) return;
    
    const fetchMissingProcedures = async () => {
      // Check if we have IDs but no matching detailed objects
      // OR if the detailed objects are just placeholders (didn't have titles)
      const needsFetch = 
        workOrder.procedureIds?.length > 0 && 
        (!workOrder.procedures || workOrder.procedures.length === 0);

      if (needsFetch) {
        try {
          // Avoid refetching if we already have them for this WO
          if (fetchedProcedures.length > 0 && fetchedProcedures[0].id === workOrder.procedureIds[0]) return;
          
          const promises = workOrder.procedureIds.map((id: string) => procedureService.fetchProcedureById(id));
          const results = await Promise.all(promises);
          setFetchedProcedures(results);
        } catch (err) {
          console.error("Failed to fetch linked procedures", err);
        }
      } else {
         setFetchedProcedures([]); // Reset if not needed
      }
    };

    fetchMissingProcedures();
  }, [workOrder, open]);


  // ✅ POLYFILL: Ensure procedures are visible even if only IDs exist
  const safeWorkOrder = useMemo(() => {
    if (!workOrder) return null;
    const wo = { ...workOrder };

    // 1. Use existing procedures if valid
    if (wo.procedures && wo.procedures.length > 0) {
        return wo;
    }
    
    // 2. Use Fetched Procedures if available
    if (fetchedProcedures.length > 0) {
        wo.procedures = fetchedProcedures;
        return wo;
    }

    // 3. Fallback: Polyfill procedures if missing but IDs exist
    if (wo.procedureIds && wo.procedureIds.length > 0) {
      wo.procedures = wo.procedureIds.map((id: string) => ({
        id,
        title: "View Procedure", // Placeholder until fetch completes
        name: "View Procedure" 
      }));
    }
    return wo;
  }, [workOrder, fetchedProcedures]);

  if (!open || !safeWorkOrder) return null; // Use safeWorkOrder for early return check

  if (!open || !workOrder) return null;

  const dispatch = useDispatch<AppDispatch>();

  const user = useSelector((state: any) => state.auth?.user);

  // --- STATE ---
  const [panel, setPanel] = useState("details"); 
  const [activeStatus, setActiveStatus] = useState(workOrder?.status || "open");
  const [isExpanded, setIsExpanded] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
  // ✅ Asset Status Live Update State
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [isAssetStatusModalOpen, setIsAssetStatusModalOpen] = useState(false);
  const [pendingAssetStatus, setPendingAssetStatus] = useState<string>("");
  
  // User Names & Refs
  const [createdByName, setCreatedByName] = useState<string>("System");
  const [updatedByName, setUpdatedByName] = useState<string>("System");

  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  
  // --- SCROLL & PROCEDURE VISIBILITY REFS ---
  const [isProcedureVisible, setIsProcedureVisible] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const procedureRef = useRef<HTMLDivElement>(null);
  const commentTextAreaRef = useRef<HTMLTextAreaElement>(null);
  
  // Comments State
  const [comment, setComment] = useState("");
  const [attachment, setAttachment] = useState<File | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  // ✅ CHECK FOR PROCEDURES (More Robust)
  const hasProcedure = useMemo(() => {
      if (!workOrder) return false;
      const hasProceduresArray = Array.isArray(workOrder.procedures) && workOrder.procedures.length > 0;
      const hasProcedureIds = Array.isArray(workOrder.procedureIds) && workOrder.procedureIds.length > 0;
      return hasProceduresArray || hasProcedureIds;
  }, [workOrder]);

  // --- EFFECTS ---

  // 1. Sync prop workOrder to local status & Log Data
  useEffect(() => {
    // ✅ DEBUG LOG 2: Data
    console.log("📦 FULL WORK ORDER DATA:", workOrder);
    console.log("📝 Has Procedure?", hasProcedure);

    if (workOrder?.status) setActiveStatus(workOrder.status.toLowerCase());
  }, [workOrder, hasProcedure]);

  // 2. Click outside dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node) && buttonRef.current && !buttonRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // 3. Scroll Listener for Floating Procedure Button
  useEffect(() => {
    const container = scrollContainerRef.current;
    
    // Safety check - if no procedure, ensure false
    if (!hasProcedure) {
      if (isProcedureVisible) setIsProcedureVisible(false);
      return;
    }

    const handleScroll = () => {
      const containerEl = scrollContainerRef.current;
      const targetEl = procedureRef.current;
      
      if (!containerEl || !targetEl) return;

      const containerRect = containerEl.getBoundingClientRect();
      const targetRect = targetEl.getBoundingClientRect();

      // Check 1: Is the top of the procedure section visible?
      // Use a smaller offset (40px) to make it trigger closer to actual visibility
      const isVisibleByPosition = targetRect.top <= containerRect.bottom - 40;
      
      // Check 2: Are we scrolled to the very bottom?
      // This handles cases where the content fits or is short, preventing position check from failing
      const isScrolledToBottom = Math.ceil(containerEl.scrollTop + containerEl.clientHeight) >= containerEl.scrollHeight - 20;

      const shouldBeVisible = isVisibleByPosition || isScrolledToBottom;

      if (shouldBeVisible !== isProcedureVisible) {
        setIsProcedureVisible(shouldBeVisible);
      }
    };

    if (container) {
       container.addEventListener("scroll", handleScroll);
       // Initial check
       handleScroll();
    }
    
    return () => {
       if (container) container.removeEventListener("scroll", handleScroll);
    };
  }, [panel, hasProcedure, isProcedureVisible]);

  // 4. Fetch User Names
  useEffect(() => {
    const fetchName = async (userId: string | undefined, setFn: (s: string) => void) => {
      if (!userId) { setFn("System"); return; }
      const assigneesList = workOrder?.assignees || [];
      const inAssignees = assigneesList.find((a: any) => a.id === userId);
      if (inAssignees) { setFn(inAssignees.fullName || inAssignees.name); return; }
      try {
        const userData = await workOrderService.fetchUserById(userId);
        setFn(userData.fullName || "Unknown");
      } catch (error) { setFn("Unknown"); }
    };

    if (workOrder) {
        fetchName(workOrder.createdBy, setCreatedByName);
        fetchName(workOrder.updatedBy, setUpdatedByName);
    }
  }, [workOrder]);

  // 5. Financials Calculation
  const financials = useMemo(() => {
    if (!workOrder) return { partsCost: 0, timeCost: 0, otherCost: 0, totalCost: 0, totalMinutes: 0 };

    const parts = workOrder.partUsages || [];
    const partsCost = parts.reduce((sum: number, p: any) => sum + (Number(p.totalCost) || Number(p.unitCost) * Number(p.quantity) || 0), 0);

    const timeEntries = workOrder.timeEntries || [];
    const totalMinutes = timeEntries.reduce((acc: number, t: any) => acc + (Number(t.minutes) || 0) + (Number(t.hours) || 0) * 60, 0);
    const timeCost = timeEntries.reduce((sum: number, t: any) => {
      const duration = (Number(t.hours) || 0) + (Number(t.minutes) || 0) / 60;
      return sum + duration * (Number(t.hourlyRate) || 0);
    }, 0);

    const otherCosts = workOrder.otherCosts || [];
    const otherCost = otherCosts.reduce((sum: number, c: any) => sum + (Number(c.amount || c.cost) || 0), 0);

    return { partsCost, timeCost, otherCost, totalCost: partsCost + timeCost + otherCost, totalMinutes };
  }, [workOrder]);


  // --- HANDLERS ---

  const handleScrollToComments = () => {
    if (commentTextAreaRef.current) {
      commentTextAreaRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
      setTimeout(() => commentTextAreaRef.current?.focus(), 300);
    }
  };

  const handleViewProcedure = () => {
    if (procedureRef.current) {
      procedureRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    if (activeStatus === newStatus) return;
    const prevStatus = activeStatus;
    setActiveStatus(newStatus);

    if (!user?.id) { toast.error("User not authenticated"); setActiveStatus(prevStatus); return; }

    try {
      if (newStatus === "done" || newStatus === "completed") {
        await dispatch(patchWorkOrderComplete(workOrder.id)).unwrap();
        toast.success("Work order completed");
      } else if (["in_progress", "on_hold", "open"].includes(newStatus)) {
        await dispatch(updateWorkOrderStatus({ id: workOrder.id, authorId: user.id, status: newStatus })).unwrap();
        toast.success(`Status updated to ${newStatus.replace("_", " ")}`);
      } else {
        await dispatch(updateWorkOrder({ id: workOrder.id, authorId: user.id, data: { status: newStatus as any } })).unwrap();
        toast.success(`Status updated`);
      }
      if (onRefreshWorkOrders) onRefreshWorkOrders();
    } catch (error: any) {
      console.error("Status update failed", error);
      toast.error("Failed to update status");
      setActiveStatus(prevStatus);
    }
  };

  const handleDeleteClick = async () => {
    setIsDropdownOpen(false);
    if (window.confirm("Are you sure you want to delete this work order?")) {
      try {
        await dispatch(deleteWorkOrder(workOrder.id)).unwrap();
        onRefreshWorkOrders?.();
        handleClose();
        toast.success("Work order deleted");
      } catch (error) {
        console.error("Failed to delete work order:", error);
        toast.error("Failed to delete work order");
      }
    }
  };

  const handleClose = () => {
    setPanel("details");
    onClose();
  };

  const handleAssetStatusSelect = (val: string | string[]) => {
      const status = val as string;
      setPendingAssetStatus(status);
      setIsAssetStatusModalOpen(true);
  };

  const handleConfirmAssetStatus = async (data: any) => {
      if (!workOrder.assets || workOrder.assets.length === 0) return;
      const assetId = workOrder.assets[0].id;

      try {
          await assetService.updateAssetStatus(assetId, {
              status: data.status,
              notes: data.notes,
              since: data.since,
              to: data.to,
              downtimeType: data.downtimeType
          });
          toast.success("Asset status updated successfully");
          if (onRefreshWorkOrders) onRefreshWorkOrders();
          setIsAssetStatusModalOpen(false);
      } catch (err) {
          console.error("Failed to update asset status", err);
          toast.error("Failed to update asset status");
      }
  };

  // Prepare data for rendering
  const assigneesList = workOrder.assignees || [];
  if (assigneesList.length === 0 && workOrder.assignedTo) {
    assigneesList.push(workOrder.assignedTo);
  }
  const recurrenceParsed = parseRecurrenceRule(workOrder.recurrenceRule, workOrder.startDate, workOrder.dueDate);
  const originTitle = workOrder?.title || null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 3000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "rgba(0,0,0,0.45)",
      }}
      onClick={handleClose}
    >
      <div
        style={{
          background: "white",
          width: isExpanded ? "95%" : "900px",
          height: "90vh",
          overflow: "hidden",
          borderRadius: "14px",
          padding: 0,
          position: "relative",
          boxShadow: "0 25px 40px rgba(0,0,0,0.25)",
          display: "flex",
          flexDirection: "column",
          transition: "width 0.3s ease-in-out",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-blue-600 text-white px-6 py-4 grid grid-cols-3 items-center flex-shrink-0 z-10">
          <div className="flex justify-start items-center gap-4">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-white p-1 rounded-lg hover:bg-white/20 transition"
            >
              {isExpanded ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
            </button>
            {panel === "edit" && (
              <button
                onClick={() => setPanel("details")}
                className="text-white p-1 rounded-lg hover:bg-white/20 transition flex items-center gap-1 text-sm"
              >
                <ArrowLeft size={20} /> Back
              </button>
            )}
          </div>
          <div className="text-sm font-medium text-center truncate">
            {panel === "edit" ? (
              <span className="font-bold text-base">Edit Work Order</span>
            ) : (
              <>
                Created on{" "}
                <span className="font-bold">
                  {workOrder.createdAt
                    ? new Date(workOrder.createdAt).toLocaleDateString("en-US")
                    : "N/A"}
                </span>
              </>
            )}
          </div>
          <div className="flex justify-end">
            <button
              onClick={handleClose}
              className="text-white p-1 rounded-lg hover:bg-white/20 transition"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Sub-Header (Title & Actions) - Only show if not editing */}
        {panel === "details" && (
          <div className="p-6 border-b bg-white flex-shrink-0 z-10">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold text-gray-900 truncate max-w-[400px]">
                {workOrder.title}
              </h2>

              <div className="flex items-center gap-2 relative">
                <button
                  onClick={handleScrollToComments}
                  className="bg-white rounded-md px-4 py-2 border border-blue-500 text-blue-600 flex items-center gap-2 cursor-pointer hover:bg-blue-50 font-medium"
                >
                  <MessageSquare size={18} /> Comments
                </button>

                {hasProcedure && isProcedureVisible ? (
                  <button
                    onClick={() => handleStatusChange("done")}
                    className="bg-green-600 rounded-md px-4 py-2 border border-green-600  flex items-center gap-2 cursor-pointer hover:bg-green-700 font-medium shadow-sm animate-in fade-in zoom-in duration-200"
                  >
                    <CheckCircle2 size={18} /> Mark as Done
                  </button>
                ) : (
                  <button
                    onClick={() => setPanel("edit")}
                    className="bg-white rounded-md px-4 py-2 border border-blue-500 text-blue-600 flex items-center gap-2 cursor-pointer hover:bg-blue-50 font-medium"
                  >
                    <Edit size={18} /> Edit
                  </button>
                )}

                <div className="relative">
                  <button
                    ref={buttonRef}
                    onClick={() => setIsDropdownOpen((p) => !p)}
                    className="inline-flex items-center rounded p-2 hover:bg-muted relative"
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </button>
                  {isDropdownOpen && (
                    <div ref={dropdownRef} className="absolute z-50 bg-white border border-gray-200 rounded-lg shadow-lg w-56 mt-2" style={{ right: 0, top: "40px" }}>
                        <ul className="text-sm text-gray-700">
                            <li onClick={handleDeleteClick} className="px-4 py-2 text-red-600 hover:bg-red-50 cursor-pointer border-t">Delete</li>
                        </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="mt-2.5 flex gap-4 text-sm text-gray-500 pb-2">
              <span className="flex items-center gap-1">
                <Repeat size={14} /> {safeRender(workOrder.priority)}
              </span>
              <span className="flex items-center gap-1">
                <CalendarDays size={14} /> Due by{" "}
                {workOrder.dueDate ? formatDate(workOrder.dueDate) : "—"}
              </span>
            </div>
          </div>
        )}

        {/* SCROLLABLE BODY */}
        <div
          ref={scrollContainerRef}
          className="overflow-y-auto relative bg-gray-50 flex-1"
        >
            {/* 1. EDIT PANEL */}
            {panel === "edit" ? (
                <div className="bg-white min-h-full">
                    <NewWorkOrderForm
                        isEditMode={true}
                        existingWorkOrder={workOrder}
                        editId={workOrder.id}
                        onCancel={() => setPanel("details")}
                        onCreate={() => {
                            onRefreshWorkOrders?.();
                            setPanel("details");
                        }}
                    />
                </div>
            ) : (
            <>
                {/* 2. SUB-PANELS (Parts, Time, Cost) */}
                {panel === "parts" && (
                    <UpdatePartsPanel 
                        onCancel={() => setPanel("details")} 
                        workOrderId={workOrder?.id} 
                        selectedWorkOrder={workOrder} 
                        onSaveSuccess={() => { if (onRefreshWorkOrders) onRefreshWorkOrders(); setPanel("details"); }} 
                    />
                )}
                {panel === "time" && (
                    <TimeOverviewPanel 
                        onCancel={() => setPanel("details")} 
                        workOrderId={workOrder?.id} 
                        selectedWorkOrder={workOrder} 
                        onSaveSuccess={() => { if (onRefreshWorkOrders) onRefreshWorkOrders(); setPanel("details"); }} 
                    />
                )}
                {panel === "cost" && (
                    <OtherCostsPanel 
                        onCancel={() => setPanel("details")} 
                        workOrderId={workOrder?.id} 
                        selectedWorkOrder={workOrder} 
                        onSaveSuccess={() => { if (onRefreshWorkOrders) onRefreshWorkOrders(); setPanel("details"); }} 
                    />
                )}

                {/* 3. MAIN DETAILS VIEW */}
                {panel === "details" && (
                    <div className="p-6 space-y-6 bg-white min-h-full">
                        {/* Status Buttons */}
                        <div>
                            <h3 className="text-sm font-medium mb-2 text-gray-700">Status</h3>
                            <div className="flex items-start justify-between gap-6 border rounded-lg p-4 bg-white sm:flex-row flex-col">
                                <div className="flex gap-4">
                                {[
                                    { key: "open", label: "Open", Icon: MessageSquare },
                                    { key: "on_hold", label: "On hold", Icon: PauseCircle },
                                    { key: "in_progress", label: "In Progress", Icon: Clock },
                                    { key: "done", label: "Done", Icon: CheckCircle2 }
                                ].map(({ key, label, Icon }) => {
                                    const active = (activeStatus || "open") === key;
                                    return (
                                    <button
                                        key={key}
                                        type="button"
                                        onClick={() => handleStatusChange(key)}
                                        className={`h-16 w-20 rounded-lg border shadow-md inline-flex flex-col items-center justify-center gap-2 transition-all outline-none ${
                                        active ? "bg-orange-600 text-white border-orange-600" : "bg-orange-50 text-sidebar-foreground border-gray-200 hover:bg-orange-100"
                                        }`}
                                    >
                                        <Icon className="h-4 w-4" />
                                        <span className="text-xs font-medium leading-none text-center px-2 truncate">{label}</span>
                                    </button>
                                    );
                                })}
                                </div>
                            </div>
                        </div>

                        {/* Info Grid */}
                        <div className="flex p-6 justify-between gap-6 border-t pt-6">
                            <div><h3 className="text-sm font-medium mb-2 text-gray-700">Due Date</h3><p className="text-sm text-gray-500">{formatDate(workOrder.dueDate)}</p></div>
                            <div><h3 className="text-sm font-medium mb-2 text-gray-700">Priority</h3><p className="text-sm text-gray-500">{workOrder.priority || "N/A"}</p></div>
                            <div><h3 className="text-sm font-medium mb-2 text-gray-700">Work Order ID</h3><p className="text-sm text-gray-500">{workOrder.id || "N/A"}</p></div>
                        </div>

                        {/* Assigned To */}
                        <div className="border-t pt-6">
                            <h3 className="text-sm font-medium mb-2 text-gray-700">Assigned To</h3>
                            <div className="flex flex-wrap gap-3">
                                {assigneesList.length > 0 ? assigneesList.map((assignee: any, index: number) => (
                                <div key={index} className="flex items-center gap-2 bg-gray-50 px-2 py-1 rounded-full border border-gray-100">
                                    <div className="h-6 w-6 rounded-full overflow-hidden bg-gray-200 border border-gray-300 flex items-center justify-center text-xs font-semibold text-gray-600">
                                    {(assignee.fullName || assignee.name || "U").charAt(0).toUpperCase()}
                                    </div>
                                    <span className="text-sm text-gray-800">{assignee.fullName || assignee.name || "Unknown"}</span>
                                </div>
                                )) : <span className="text-sm text-gray-500">Unassigned</span>}
                            </div>
                        </div>

                        {/* Description */}
                        <div className="border-t pt-6">
                            <h3 className="text-sm font-medium mb-2 text-gray-700">Description</h3>
                            <p className="text-sm text-gray-500">{workOrder?.description || "No description provided."}</p>
                        </div>

                        {/* Details Grid (Clickable) */}
                        <div className="border-t pt-6 grid grid-cols-2 gap-6">
                            <div><h3 className="text-sm font-medium mb-2 text-gray-700">Assets</h3><div className="flex items-start gap-2"><Factory className="h-4 w-4 text-gray-400 mt-0.5" /><span className="text-sm">{renderClickableList(workOrder.assets, navigate, (id) => `/assets?assetId=${id}`)}</span></div></div>
                            
                            {/* ✅ Asset Status Fields (Live Update) */}
                            {(workOrder.assetStatus || (workOrder.assets && workOrder.assets.length > 0)) && (
                                <div>
                                    <h3 className="text-sm font-medium mb-2 text-gray-700">Asset Status</h3>
                                    {workOrder.assets && workOrder.assets.length > 0 ? (
                                        <div className="w-[200px]">
                                            <DynamicSelect
                                                name="asset-status-details"
                                                placeholder="Select status..."
                                                options={[
                                                    { id: "online", name: "Online", color: "#22c55e" },
                                                    { id: "offline", name: "Offline", color: "#ef4444" },
                                                    { id: "doNotTrack", name: "Do Not Track", color: "#EAB308" }
                                                ]}
                                                loading={false}
                                                // Prioritize asset's actual status, fallback to workOrder snapshot
                                                value={((workOrder.assets[0].status || workOrder.assetStatus) || "online").toLowerCase() === "do not track" ? "doNotTrack" : ((workOrder.assets[0].status || workOrder.assetStatus) || "online").toLowerCase()}
                                                onSelect={handleAssetStatusSelect}
                                                onFetch={() => {}} 
                                                activeDropdown={activeDropdown}
                                                setActiveDropdown={setActiveDropdown}
                                                className="w-full"
                                                dropdownStyle={{ zIndex: 9999 }} // Ensure it pops out correctly in modal
                                            />
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-2">
                                            <div className={`h-2.5 w-2.5 rounded-full ${
                                                (workOrder.assetStatus || "online").toLowerCase() === 'offline' ? 'bg-red-500' :
                                                (workOrder.assetStatus || "online").toLowerCase() === 'online' ? 'bg-green-500' : 'bg-gray-400'
                                            }`} />
                                            <span className="text-sm text-gray-900 capitalize">{safeRender(workOrder.assetStatus || "—")}</span>
                                        </div>
                                    )}
                                </div>
                            )}

                            {workOrder.assetDowntimeType && (
                                <div><h3 className="text-sm font-medium mb-2 text-gray-700">Downtime Type</h3><p className="text-sm text-gray-500 capitalize">{workOrder.assetDowntimeType}</p></div>
                            )}
                             {workOrder.assetStatusSince && (
                                <div><h3 className="text-sm font-medium mb-2 text-gray-700">Since</h3><p className="text-sm text-gray-500">{formatDate(workOrder.assetStatusSince, true)}</p></div>
                            )}
                            {workOrder.assetStatusTo && (
                                <div><h3 className="text-sm font-medium mb-2 text-gray-700">Estimated Up</h3><p className="text-sm text-gray-500">{formatDate(workOrder.assetStatusTo, true)}</p></div>
                            )}
                            {workOrder.assetStatusNotes && (
                                <div className="col-span-2"><h3 className="text-sm font-medium mb-2 text-gray-700">Status Notes</h3><p className="text-sm text-gray-500">{workOrder.assetStatusNotes}</p></div>
                            )}

                            <div><h3 className="text-sm font-medium mb-2 text-gray-700">Location</h3><div className="flex items-center gap-2"><MapPin className="h-4 w-4 text-gray-400" /><span className="text-sm"><span onClick={(e) => { e.preventDefault(); e.stopPropagation(); if (workOrder.location?.id) navigate(`/locations/${workOrder.location.id}`); }} className={workOrder.location?.id ? "text-blue-600 hover:underline cursor-pointer" : ""}>{workOrder.location?.name || workOrder.location || "N/A"}</span></span></div></div>
                            <div><h3 className="text-sm font-medium mb-2 text-gray-700">Estimated Time</h3><div className="flex items-center gap-2"><Clock className="h-4 w-4 text-gray-400" /><span className="text-sm text-gray-900">{formatDecimalHoursToDisplay(workOrder.estimatedTimeHours)}</span></div></div>
                            <div><h3 className="text-sm font-medium mb-2 text-gray-700">Work Type</h3><div className="flex items-center gap-2"><CalendarDays className="h-4 w-4 text-gray-400" /><span className="text-sm text-gray-900">{workOrder.workType || "N/A"}</span></div></div>
                            <div><h3 className="text-sm font-medium mb-2 text-gray-700">Teams</h3><div className="flex items-start gap-2"><Users className="h-4 w-4 text-gray-400 mt-0.5" /><span className="text-sm">{renderClickableList(workOrder.teams, navigate, (id) => `/teams/${id}`)}</span></div></div>
                            <div><h3 className="text-sm font-medium mb-2 text-gray-700">Vendors</h3><div className="flex items-start gap-2"><Briefcase className="h-4 w-4 text-gray-400 mt-0.5" /><span className="text-sm">{renderClickableList(workOrder.vendors, navigate, (id) => `/vendors/${id}`)}</span></div></div>
                            <div><h3 className="text-sm font-medium mb-2 text-gray-700">Parts</h3><div className="flex items-start gap-2"><Wrench className="h-4 w-4 text-gray-400 mt-0.5" /><span className="text-sm">{renderClickableList(workOrder.parts, navigate, (id) => `/inventory/${id}`)}</span></div></div>
                            <div><h3 className="text-sm font-medium mb-2 text-gray-700">Categories</h3><div className="flex items-start gap-2"><Layers className="h-4 w-4 text-gray-400 mt-0.5" /><span className="text-sm">{renderClickableList(workOrder.categories, navigate, (id) => `/categories/${id}`)}</span></div></div>
                            <div><h3 className="text-sm font-medium mb-2 text-gray-700">Procedures</h3><div className="flex items-start gap-2"><ClipboardList className="h-4 w-4 text-gray-400 mt-0.5" /><span className="text-sm">{renderClickableList(safeWorkOrder.procedures, navigate, (id) => `/library/${id}`, "title")}</span></div></div>
                            {workOrder.meters && workOrder.meters.length > 0 && (
                                <div><h3 className="text-sm font-medium mb-2 text-gray-700">Meters</h3><div className="flex items-start gap-2"><Gauge className="h-4 w-4 text-gray-400 mt-0.5" /><span className="text-sm">{workOrder.meters.map((meter: any, i: number) => (<span key={meter.id || i}><span onClick={(e) => { e.preventDefault(); e.stopPropagation(); navigate(`/meters?meterId=${meter.id}`); }} className="text-blue-600 hover:underline cursor-pointer">{meter.name || "Unknown Meter"}</span>{i < workOrder.meters.length - 1 && ", "}</span>))}</span></div></div>
                            )}
                        </div>

                        {/* Schedule */}
                        <div className="border-t pt-6">
                            <h3 className="text-sm font-medium mb-2 text-gray-700">Schedule conditions</h3>
                            <div className="flex items-start gap-3">
                                <div style={{ minWidth: 24 }}><CalendarDays className="h-4 w-4 text-gray-400" /></div>
                                <div className="flex-1">
                                <div className="text-sm text-gray-800 mb-2">{recurrenceParsed ? recurrenceParsed.title : "Does not repeat"}</div>
                                {originTitle && <div className="text-sm mt-1"><span className="text-gray-500">Created from </span><span className="text-blue-600 underline">{originTitle}</span></div>}
                                </div>
                            </div>
                        </div>

                        {/* Time & Cost Section */}
                        <div className="border-t pt-6">
                            <h3 className="text-lg font-bold text-gray-900 mb-6">Time & Cost Tracking</h3>
                            
                            {/* Parts Table */}
                            <div className="mb-6">
                                <div className="flex justify-between items-center mb-3">
                                <h4 className="text-sm font-semibold text-gray-900">Parts <span className="text-gray-500 font-normal">({workOrder.partUsages?.length || 0})</span></h4>
                                <button onClick={() => setPanel("parts")} className="text-sm text-blue-600 font-medium hover:underline">Add / Edit</button>
                                </div>
                                <div className="border border-gray-200 rounded-md overflow-hidden">
                                    <table className="w-full text-left text-sm">
                                        <thead className="bg-gray-50 border-b border-gray-200">
                                            <tr><th className="px-4 py-2 font-medium text-gray-500 text-xs">Part</th><th className="px-4 py-2 font-medium text-gray-500 text-xs">Location</th><th className="px-4 py-2 font-medium text-gray-500 text-xs text-right">Qty</th><th className="px-4 py-2 font-medium text-gray-500 text-xs text-right">Cost</th></tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {workOrder.partUsages?.length === 0 ? <tr><td colSpan={4} className="px-4 py-4 text-center text-gray-400 italic">No parts added</td></tr> : 
                                            workOrder.partUsages?.map((p: any, i: number) => (
                                                <tr key={i} className="bg-white">
                                                    <td className="px-4 py-3 text-gray-900 font-medium">{p.part?.name || "Unknown"}</td>
                                                    <td className="px-4 py-3 text-gray-600">{p.location?.name || "—"}</td>
                                                    <td className="px-4 py-3 text-gray-900 text-right">{p.quantity}</td>
                                                    <td className="px-4 py-3 text-gray-900 text-right">{formatCurrency(Number(p.unitCost) || 0)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                        <tfoot className="bg-white border-t border-gray-200">
                                            <tr><td colSpan={3} className="px-4 py-3 font-medium text-gray-900">Parts Cost</td><td className="px-4 py-3 font-medium text-gray-900 text-right">{formatCurrency(financials.partsCost)}</td></tr>
                                        </tfoot>
                                    </table>
                                </div>
                            </div>

                            {/* Time Section */}
                            <div className="mb-6">
                                <div className="flex justify-between items-center mb-2">
                                <h4 className="text-sm font-semibold text-gray-900">Time</h4>
                                <button onClick={() => setPanel("time")} className="text-sm text-blue-600 font-medium hover:underline">Add Time</button>
                                </div>
                                <div className="flex justify-between items-center py-2 ">
                                    <span className="text-sm text-gray-900">Total Duration</span>
                                    <button onClick={() => setPanel("time")} className="text-sm font-medium text-gray-900 hover:text-blue-600 hover:underline">
                                    {formatDurationDetailed(financials.totalMinutes)}
                                    </button>
                                </div>
                                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                                    <span className="text-sm text-gray-900">Time Cost</span>
                                    <span className="text-sm font-medium text-gray-900">{formatCurrency(financials.timeCost)}</span>
                                </div>
                            </div>

                            {/* Other Costs */}
                            <div className="mb-6">
                                <div className="flex justify-between items-center mb-2"><h4 className="text-sm font-semibold text-gray-900">Other Costs</h4><button onClick={() => setPanel("cost")} className="text-sm text-blue-600 font-medium hover:underline">Add Other Cost</button></div>
                                <div className="flex justify-between items-center py-2 border-b border-gray-100"><span className="text-sm text-gray-900">Other Costs Total</span><span className="text-sm font-medium text-gray-900">{formatCurrency(financials.otherCost)}</span></div>
                            </div>
                            
                            <div className="bg-gray-50 rounded-lg p-4 flex justify-between items-center mt-4 border border-gray-200">
                                <span className="text-sm font-semibold text-gray-900">Total Work Order Cost</span><span className="text-lg font-bold text-gray-900">{formatCurrency(financials.totalCost)}</span>
                            </div>
                        </div>

                        {/* ✅ PROCEDURE PREVIEW (Now visible even if array is empty but ID exists) */}
                        {hasProcedure && (
                            <div className="border-t pt-6" ref={procedureRef}>
                                <h3 className="text-lg font-bold text-gray-900 mb-4">Procedure</h3>
                                <LinkedProcedurePreview 
                                  selectedWorkOrder={{
                                    ...workOrder,
                                    procedures: safeWorkOrder.procedures 
                                  }}
                                />
                            </div>
                        )}

                        {/* ✅ Asset Status Update Modal */}
                        {isAssetStatusModalOpen && (
                            <WorkOrderAssetStatusModal 
                                initialStatus={pendingAssetStatus || 'online'}
                                initialNotes={workOrder.assetStatusNotes}
                                initialDowntimeType={workOrder.assetDowntimeType}
                                initialSince={workOrder.assetStatusSince}
                                initialTo={workOrder.assetStatusTo}
                                onClose={() => setIsAssetStatusModalOpen(false)}
                                onSubmit={handleConfirmAssetStatus}
                            />
                        )}

                        {/* LOGS (Created By / Updated By) */}
                        <div className="border-t p-6">
                            <div className="space-y-3">
                                <div className="flex items-center gap-1 text-sm text-gray-500"><UserCircle2 className="w-4 h-4 text-yellow-500" /><span>Created {createdByName ? `by ${createdByName}` : ""}</span><span>{formatDate(workOrder.createdAt, true)}</span></div>
                                <div className="flex items-center gap-1 text-sm text-gray-500"><UserCircle2 className="w-4 h-4 text-yellow-500" /><span>Last Updated {updatedByName ? `by ${updatedByName}` : ""}</span><span>{formatDate(workOrder.updatedAt, true)}</span></div>
                            </div>
                        </div>

                        {/* COMMENTS SECTION */}
                        <div className="border-t pt-6">
                            <CommentsSection
                                ref={commentTextAreaRef}
                                comment={comment}
                                setComment={setComment}
                                attachment={attachment}
                                setAttachment={setAttachment}
                                fileRef={fileRef as React.RefObject<HTMLInputElement>}
                                selectedWorkOrder={workOrder}
                            />
                        </div>

                        {/* Extra padding for scroll */}
                        <div className="h-24 flex-shrink-0 bg-white"></div>
                    </div>
                )}
            </>
            )}
        </div>

        {/* FLOATING PROCEDURE BUTTON */}
        {panel === "details" &&
          hasProcedure &&
          !isProcedureVisible && (
            <div
              style={{
                position: "absolute",
                bottom: "24px",
                left: "50%",
                transform: "translateX(-50%)",
                zIndex: 10,
              }}
            >
              <button
                onClick={handleViewProcedure}
                className="flex items-center gap-2 bg-white text-blue-600 border-2 border-yellow-400 hover:bg-blue-50 px-6 py-2 rounded-full shadow-lg font-medium whitespace-nowrap transition-all duration-300 ease-in-out"
              >
                <View size={18} className="text-blue-500" />
                View Procedure
              </button>
            </div>
          )}
      </div>
    </div>
  );
}