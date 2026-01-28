import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  CalendarDays,
  Clock,
  Edit,
  MapPin,
  MessageSquare,
  MoreVertical,
  Wrench,
  Briefcase,
  LayoutGrid,
  ClipboardList,
  CheckCircle2,
  PauseCircle,
  X,
  Maximize2,
  Minimize2,
  RotateCw,
  Box,
  Trash2,
  Mail,
  Eye,
  Users,
  FileText
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
import { LinkedProcedurePreview } from "../../ToDoView/LinkedProcedurePreview";
import { procedureService } from "../../../../store/procedures/procedures.service";
import { WorkOrderAssetStatusModal } from "../../NewWorkOrderForm/WorkOrderAssetStatusModal";
import { assetService } from "../../../../store/assets/assets.service";

// --- HELPER FUNCTIONS ---

const getAvatarColor = (name: string) => {
  const colors = [
    'bg-red-100 text-red-700 border-red-200',
    'bg-green-100 text-green-700 border-green-200',
    'bg-blue-100 text-blue-700 border-blue-200',
    'bg-yellow-100 text-yellow-700 border-yellow-200',
    'bg-purple-100 text-purple-700 border-purple-200',
    'bg-pink-100 text-pink-700 border-pink-200',
    'bg-indigo-100 text-indigo-700 border-indigo-200',
    'bg-orange-100 text-orange-700 border-orange-200'
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
};

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
        className={navigate && linkGenerator ? "wo-modal-clickable-link" : ""}
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
  const navigate = useNavigate();
  const [fetchedProcedures, setFetchedProcedures] = useState<any[]>([]);

  useEffect(() => {
    if (!workOrder || !open) return;

    const fetchMissingProcedures = async () => {
      const needsFetch =
        workOrder.procedureIds?.length > 0 &&
        (!workOrder.procedures || workOrder.procedures.length === 0);

      if (needsFetch) {
        try {
          if (fetchedProcedures.length > 0 && fetchedProcedures[0].id === workOrder.procedureIds[0]) return;
          const promises = workOrder.procedureIds.map((id: string) => procedureService.fetchProcedureById(id));
          const results = await Promise.all(promises);
          setFetchedProcedures(results);
        } catch (err) {
          console.error("Failed to fetch linked procedures", err);
        }
      } else {
        setFetchedProcedures([]);
      }
    };

    fetchMissingProcedures();
  }, [workOrder, open]);


  const safeWorkOrder = useMemo(() => {
    if (!workOrder) return null;
    const wo = { ...workOrder };

    if (wo.procedures && wo.procedures.length > 0) return wo;
    if (fetchedProcedures.length > 0) {
      wo.procedures = fetchedProcedures;
      return wo;
    }

    if (wo.procedureIds && wo.procedureIds.length > 0) {
      wo.procedures = wo.procedureIds.map((id: string) => ({
        id,
        title: "View Procedure",
        name: "View Procedure"
      }));
    }
    return wo;
  }, [workOrder, fetchedProcedures]);

  if (!open || !safeWorkOrder) return null;

  const dispatch = useDispatch<AppDispatch>();
  const user = useSelector((state: any) => state.auth?.user);

  // --- STATE ---
  const [panel, setPanel] = useState("details");
  const [activeStatus, setActiveStatus] = useState(workOrder?.status || "open");
  const [isExpanded, setIsExpanded] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [isAssetStatusModalOpen, setIsAssetStatusModalOpen] = useState(false);
  const [pendingAssetStatus, setPendingAssetStatus] = useState<string>("");

  const [createdByName, setCreatedByName] = useState<string>("System");
  const [updatedByName, setUpdatedByName] = useState<string>("System");

  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Procedure Visibility
  const [isProcedureVisible, setIsProcedureVisible] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const procedureRef = useRef<HTMLDivElement>(null);
  const commentTextAreaRef = useRef<HTMLTextAreaElement>(null);

  const [comment, setComment] = useState("");
  const [attachment, setAttachment] = useState<File | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const hasProcedure = useMemo(() => {
    if (!workOrder) return false;
    const hasProceduresArray = Array.isArray(workOrder.procedures) && workOrder.procedures.length > 0;
    const hasProcedureIds = Array.isArray(workOrder.procedureIds) && workOrder.procedureIds.length > 0;
    return hasProceduresArray || hasProcedureIds;
  }, [workOrder]);

  // --- EFFECTS ---
  useEffect(() => {
    if (workOrder?.status) setActiveStatus(workOrder.status.toLowerCase());
  }, [workOrder, hasProcedure]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node) && buttonRef.current && !buttonRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const container = scrollContainerRef.current;
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

      const isVisibleByPosition = targetRect.top <= containerRect.bottom - 40;
      const isScrolledToBottom = Math.ceil(containerEl.scrollTop + containerEl.clientHeight) >= containerEl.scrollHeight - 20;

      const shouldBeVisible = isVisibleByPosition || isScrolledToBottom;

      if (shouldBeVisible !== isProcedureVisible) {
        setIsProcedureVisible(shouldBeVisible);
      }
    };

    if (container) {
      container.addEventListener("scroll", handleScroll);
      handleScroll();
    }

    return () => {
      if (container) container.removeEventListener("scroll", handleScroll);
    };
  }, [panel, hasProcedure, isProcedureVisible]);

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

  // Render Helpers
  const assigneesList = workOrder.assignees || [];
  if (assigneesList.length === 0 && workOrder.assignedTo) {
    assigneesList.push(workOrder.assignedTo);
  }
  const recurrenceParsed = parseRecurrenceRule(workOrder.recurrenceRule, workOrder.startDate, workOrder.dueDate);

  // Dynamic Width based on Mode
  const containerStyle = {
    maxWidth: isExpanded ? "95%" : "750px", // Fixed width even in edit mode to match detail view
    transition: "max-width 0.2s ease-in-out"
  };

  return (
    <div className="wo-modal-overlay" onClick={handleClose}>
      <div
        className="wo-modal-container"
        style={containerStyle}
        onClick={(e) => e.stopPropagation()}
      >

        {/* EDIT PANEL (Takes Full View) */}
        {panel === "edit" ? (
          <div className="h-full">
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
            {/* --- STANDARD DETAILS VIEW --- */}

            {/* 1. Header (Minimal White) */}
            <div className="wo-modal-header">
              <div>
                {/* Optional: Breadcrumbs or small label if needed, otherwise empty to push actions right */}
              </div>

              <div className="wo-modal-actions">
                <button onClick={() => setPanel("edit")} className="wo-modal-action-btn" title="Edit">
                  <Edit className="wo-icon-standard" />
                </button>
                <button onClick={handleDeleteClick} className="wo-modal-action-btn hover:text-red-500" title="Delete">
                  <Trash2 className="wo-icon-standard" />
                </button>
                <div className="relative">
                  <button
                    ref={buttonRef}
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="wo-modal-action-btn"
                  >
                    <MoreVertical className="wo-icon-standard" />
                  </button>
                  {isDropdownOpen && (
                    <div ref={dropdownRef} className="absolute z-50 bg-white border border-gray-200 rounded-lg shadow-lg w-48 mt-2 right-0">
                      <ul className="py-1 text-sm text-gray-700">
                        <li onClick={() => setPanel("parts")} className="px-4 py-2 hover:bg-gray-50 cursor-pointer">Manage Parts</li>
                        <li onClick={() => setPanel("time")} className="px-4 py-2 hover:bg-gray-50 cursor-pointer">Time Tracking</li>
                        <li onClick={() => setPanel("cost")} className="px-4 py-2 hover:bg-gray-50 cursor-pointer">Other Costs</li>
                        <li onClick={() => setIsExpanded(!isExpanded)} className="px-4 py-2 hover:bg-gray-50 cursor-pointer">{isExpanded ? "Collapse View" : "Expand View"}</li>
                      </ul>
                    </div>
                  )}
                </div>
                <button onClick={handleClose} className="wo-modal-action-btn" title="Close">
                  <X className="wo-icon-standard" />
                </button>
              </div>
            </div>

            {/* Scrollable Content */}
            <div className="wo-modal-scroll-content" ref={scrollContainerRef}>

              {/* 2. Title Section */}
              <div className="wo-modal-title-row mb-4">
                <div className={`wo-modal-status-indicator ${activeStatus === 'done' || activeStatus === 'completed' ? 'done' :
                  activeStatus === 'in_progress' ? 'bg-blue-500' :
                    activeStatus === 'on_hold' ? 'bg-orange-500' : 'bg-gray-400'
                  }`}></div>
                <h2 className="wo-modal-title">{workOrder.title}</h2>
              </div>

              {/* 3. Metadata (Due Date, Est Time) */}
              <div className="wo-modal-meta-row">
                <div>
                  <span className="wo-modal-meta-label">Due Date: </span>
                  <span className="wo-modal-meta-value">{workOrder.dueDate ? formatDate(workOrder.dueDate) : "—"}</span>
                </div>
                <div>
                  <span className="wo-modal-meta-label">Estimated time: </span>
                  <span className="wo-modal-meta-value">{formatDecimalHoursToDisplay(workOrder.estimatedTimeHours)}</span>
                </div>
              </div>

              {/* 4. Status Pills */}
              <div className="wo-modal-status-bar">
                <span className="wo-modal-status-label">Status:</span>
                <div className="wo-modal-status-pills-group">
                  {[
                    { key: "open", label: "Open" },
                    { key: "on_hold", label: "On hold" },
                    { key: "in_progress", label: "In Progress" },
                    { key: "done", label: "Done" }
                  ].map(status => (
                    <button
                      key={status.key}
                      onClick={() => handleStatusChange(status.key)}
                      className={`wo-modal-status-pill ${activeStatus === status.key ? "active" : ""}`}
                    >
                      {status.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 5. Assignee */}
              <div className="wo-modal-divider-yellow">
                <div className="wo-modal-assignee-grid">
                  {/* Header Icon (Col 1) */}
                  <div className="wo-modal-brand-icon">
                    <Users className="wo-icon-brand" fill="currentColor" />
                  </div>

                  {/* Header Content (Col 2) */}
                  <div className="flex justify-between items-center w-full">
                    <div className="wo-modal-section-title" style={{ gap: 0 }}>
                      Assigned
                    </div>
                    <div className="flex gap-3">
                      <MessageSquare className="wo-icon-brand" fill="#FAAD00" />
                      <Mail className="wo-icon-brand" fill="#FAAD00" />
                    </div>
                  </div>

                  {/* Assignees List (Flattened into Grid) */}
                  {assigneesList.length > 0 ? assigneesList.map((assignee: any) => (
                    <React.Fragment key={assignee.id}>
                      {/* Avatar (Col 1) */}
                      <div className="wo-modal-assignee-avatar-wrapper">
                        {assignee.avatar ? (
                          <img src={assignee.avatar} alt={assignee.fullName} className="wo-modal-assignee-avatar" />
                        ) : (
                          <div className={`wo-modal-assignee-avatar flex items-center justify-center text-xs font-bold border ${getAvatarColor(assignee.fullName || assignee.name || "U")}`}>
                            {(assignee.fullName?.[0] || assignee.name?.[0] || "U").toUpperCase()}
                          </div>
                        )}
                      </div>

                      {/* Name (Col 2) */}
                      <span className="wo-modal-assignee-name">{assignee.fullName || assignee.name}</span>
                    </React.Fragment>
                  )) : (
                    <>
                      {/* Empty State placeholders if needed, or just full width text */}
                      <div />
                      <div className="text-sm text-gray-400 italic">No assignees</div>
                    </>
                  )}
                </div>
              </div>

              {/* 6. Details Grid */}
              <div className="wo-modal-detail-grid">

                {/* Location */}
                {workOrder.location && (
                  <div className="wo-modal-detail-row">
                    <div className="wo-modal-brand-icon"><MapPin className="wo-icon-brand" /></div>
                    <div className="wo-modal-detail-label">Location</div>
                    <div className="wo-modal-detail-value">
                      {workOrder.location?.name || safeRender(workOrder.location) || "—"}
                    </div>
                  </div>
                )}

                {/* Asset */}
                {workOrder.assets && workOrder.assets.length > 0 && (
                  <div className="wo-modal-detail-row">
                    <div className="wo-modal-brand-icon"><Box className="wo-icon-brand" /></div>
                    <div className="wo-modal-detail-label">Asset</div>
                    <div className="wo-modal-detail-value text-right justify-end">
                      <>
                        <span className="truncate">{workOrder.assets[0].name}</span>
                        <span className="wo-modal-asset-badge">
                          {workOrder.assets[0].status || "Do Not Track"}
                        </span>
                      </>
                    </div>
                  </div>
                )}

                {/* Procedure */}
                {hasProcedure && (
                  <div className="wo-modal-detail-row">
                    <div className="wo-modal-brand-icon"><FileText className="wo-icon-brand" /></div>
                    <div className="wo-modal-detail-label">Procedure</div>
                    <div className="wo-modal-detail-value text-right justify-end">
                      {renderClickableList(safeWorkOrder.procedures, navigate, (id) => `/procedures/${id}`)}
                    </div>
                  </div>
                )}

                {/* Work Type */}
                {workOrder.workType && (
                  <div className="wo-modal-detail-row">
                    <div className="wo-modal-brand-icon"><Briefcase className="wo-icon-brand" /></div>
                    <div className="wo-modal-detail-label">Work type</div>
                    <div className="wo-modal-detail-value text-right justify-end text-green-600 font-medium">
                      {workOrder.workType}
                    </div>
                  </div>
                )}

                {/* Frequency */}
                {recurrenceParsed && (
                  <div className="wo-modal-detail-row">
                    <div className="wo-modal-brand-icon"><RotateCw className="wo-icon-brand" /></div>
                    <div className="wo-modal-detail-label">Frequency</div>
                    <div className="wo-modal-detail-value text-right justify-end">
                      {recurrenceParsed.short}
                    </div>
                  </div>
                )}

                {/* Vendor */}
                {workOrder.vendors && workOrder.vendors.length > 0 && (
                  <div className="wo-modal-detail-row">
                    <div className="wo-modal-brand-icon"><Briefcase className="wo-icon-brand" /></div>
                    <div className="wo-modal-detail-label">Vendor</div>
                    <div className="wo-modal-detail-value text-right justify-end">
                      {renderClickableList(workOrder.vendors, navigate, (id) => `/vendors/${id}`)}
                    </div>
                  </div>
                )}

                {/* Parts */}
                {workOrder.parts && workOrder.parts.length > 0 && (
                  <div className="wo-modal-detail-row">
                    <div className="wo-modal-brand-icon"><Wrench className="wo-icon-brand" /></div>
                    <div className="wo-modal-detail-label">Parts</div>
                    <div className="wo-modal-detail-value text-right justify-end">
                      {renderClickableList(workOrder.parts, navigate, (id) => `/inventory/${id}`)}
                    </div>
                  </div>
                )}

                {/* Categories */}
                {workOrder.categories && workOrder.categories.length > 0 && (
                  <div className="wo-modal-detail-row">
                    <div className="wo-modal-brand-icon"><LayoutGrid className="wo-icon-brand" /></div>
                    <div className="wo-modal-detail-label">Categories</div>
                    <div className="wo-modal-detail-value text-right justify-end">
                      {renderClickableList(workOrder.categories, navigate, (id) => `/categories/${id}`)}
                    </div>
                  </div>
                )}

              </div>

              {/* Sub-Panels Overlay */}
              {(panel === 'parts' || panel === 'time' || panel === 'cost') && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-[1px]">
                  <div className="bg-white rounded-lg shadow-xl w-full max-w-lg overflow-hidden max-h-[85vh]">
                    {panel === "parts" && <UpdatePartsPanel onCancel={() => setPanel("details")} workOrderId={workOrder?.id} selectedWorkOrder={workOrder} onSaveSuccess={() => { if (onRefreshWorkOrders) onRefreshWorkOrders(); setPanel("details"); }} />}
                    {panel === "time" && <TimeOverviewPanel onCancel={() => setPanel("details")} workOrderId={workOrder?.id} selectedWorkOrder={workOrder} onSaveSuccess={() => { if (onRefreshWorkOrders) onRefreshWorkOrders(); setPanel("details"); }} />}
                    {panel === "cost" && <OtherCostsPanel onCancel={() => setPanel("details")} workOrderId={workOrder?.id} selectedWorkOrder={workOrder} onSaveSuccess={() => { if (onRefreshWorkOrders) onRefreshWorkOrders(); setPanel("details"); }} />}
                  </div>


                </div>
              )}

              {/* 7. Time and Cost Tracking (New Section) */}
              <div className="border-t border-gray-100 mt-6 pt-6 relative">
                <h3 className="wo-modal-subtitle">Time and Cost Tracking</h3>

                {/* Cost Table */}
                <div className="bg-white rounded-lg">
                  {/* Header Row */}
                  <div className="wo-modal-cost-row header">
                    <span>Parts</span>
                    <span>Cost (₹)</span>
                  </div>

                  {/* Part Cost */}
                  <div className="wo-modal-cost-row">
                    <span>Part Cost</span>
                    <span>{Number(workOrder.aggregates?.totals?.parts || workOrder.partsCostTotal || 0).toLocaleString()}</span>
                  </div>

                  {/* Time */}
                  <div className="pt-3">
                    <span className="wo-modal-cost-subtitle">Time</span>
                    <div className="wo-modal-cost-row">
                      <span>Time Cost</span>
                      <span>{Number(workOrder.aggregates?.totals?.time || workOrder.timeCostTotal || 0).toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Other Cost */}
                  <div className="pt-3">
                    <span className="wo-modal-cost-subtitle">Other Cost</span>
                    <div className="wo-modal-cost-row">
                      <span>Total Other Cost</span>
                      <span>{Number(workOrder.aggregates?.totals?.other || workOrder.otherCostTotal || 0).toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Total */}
                  <div className="wo-modal-total-cost-row">
                    <span>Total Workorder Cost</span>
                    <span>{Number(workOrder.aggregates?.totals?.grand || workOrder.grandTotalCost || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                  </div>
                </div>

                {/* Common Divider */}
                <div className="wo-modal-divider" />
              </div>

              {/* 8. Procedure Inline Preview */}
              {hasProcedure && (
                <div ref={procedureRef}>
                  <LinkedProcedurePreview
                    selectedWorkOrder={{
                      ...workOrder,
                      procedures: safeWorkOrder.procedures
                    }}
                  />
                </div>
              )}

              {/* Metadata Section with Dividers */}
              <div className="wo-modal-divider" />
              <div className="wo-modal-metadata-text">
                <span>Created by {createdByName}, {formatDate(workOrder.createdAt, true)}</span>
                <span>Last Updated by {updatedByName}, {formatDate(workOrder.updatedAt, true)}</span>
              </div>
              <div className="wo-modal-divider" />

              {/* 8. Comments */}
              <div className="mb-20">
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

            </div>

            {/* 9. Floating Search/Procedure Button */}
            {hasProcedure && !isProcedureVisible && (
              <div className="wo-modal-procedure-btn-wrapper">
                <button onClick={handleViewProcedure} className="wo-modal-procedure-btn">
                  <Eye size={16} className="text-yellow-600" />
                  View Procedure
                </button>
              </div>
            )}

            {/* Asset Status Modal */}
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

          </>
        )}

      </div>
    </div>
  );
}